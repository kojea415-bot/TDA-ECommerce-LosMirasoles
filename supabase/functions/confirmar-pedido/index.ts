import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Checkout endpoint. The browser sends the cart and a simulated payment result.
// Prices, stock and shipping cost are read in Postgres, inside one transaction.
// The receipt is sent afterwards; a mail failure does not roll the order back.
// GMAIL_USER and GMAIL_APP_PASSWORD come from the function secrets, not from this file.

const LOCAL_PICKUP = "Dietética Los Mirasoles, San Justo, La Matanza";
const SMTP_HOST = "smtp.gmail.com";
const SMTP_PORT = 587;
const SMTP_TIMEOUT_MS = 10_000;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type OrderItem = {
  productoId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
};

type Order = {
  id: number;
  estado: string;
  items: OrderItem[];
  total: number;
  modalidad: string;
  costoEnvio: number;
  direccionLocal?: string;
  mail_ok?: boolean;
};

type CheckoutResult = {
  status: number;
  error?: string;
  producto?: string;
  pedido?: Order;
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

function bearer(header: string | null): string | null {
  if (!header) return null;
  const value = header.trim();
  if (!value) return null;
  return value.toLowerCase().startsWith("bearer ") ? value : `Bearer ${value}`;
}

function asText(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function itemsForRpc(items: unknown): unknown {
  if (!Array.isArray(items)) return null;
  return items.map((item) => {
    if (!item || typeof item !== "object") return item;
    const row = item as Record<string, unknown>;
    return { productoId: row.productoId, cantidad: row.cantidad };
  });
}

async function userId(authHeader: string): Promise<string | null> {
  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !anonKey) return null;

  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { Authorization: authHeader, apikey: anonKey },
  });
  if (!response.ok) return null;
  const body = await response.json();
  return typeof body?.id === "string" ? body.id : null;
}

async function callCheckout(payload: Record<string, unknown>): Promise<CheckoutResult> {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) {
    throw new Error("Missing Supabase service configuration");
  }

  const response = await fetch(`${url}/rest/v1/rpc/confirmar_pedido`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  if (!response.ok) {
    console.error("checkout rpc failed", response.status);
    throw new Error("Checkout transaction failed");
  }
  return JSON.parse(text) as CheckoutResult;
}

async function markMailSent(orderId: number): Promise<boolean> {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey || !Number.isInteger(orderId)) return false;

  const response = await fetch(`${url}/rest/v1/pedidos?id=eq.${orderId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ mail_ok: true }),
  });
  return response.ok;
}

function money(value: number): string {
  return `$ ${Number(value).toFixed(2)}`;
}

function receipt(order: Order): string {
  const lines = order.items.map((item) =>
    `- ${item.nombre} x ${item.cantidad} — ${money(item.precioUnitario)}`
  );
  const delivery = order.modalidad === "retiro" ? "Retiro en el local" : "Envío a domicilio";
  const address = order.direccionLocal ? `\nDirección del local: ${order.direccionLocal}` : "";
  return [
    `Pedido ${order.id}`,
    `Modalidad: ${delivery}${address}`,
    "",
    "Ítems:",
    ...lines,
    "",
    `Total: ${money(order.total)}`,
  ].join("\n");
}

class Smtp {
  #conn: Deno.Conn;
  #reader: ReadableStreamDefaultReader<Uint8Array>;
  #writer: WritableStreamDefaultWriter<Uint8Array>;
  #pending = "";

  constructor(conn: Deno.Conn) {
    this.#conn = conn;
    this.#reader = conn.readable.getReader();
    this.#writer = conn.writable.getWriter();
  }

  async #line(): Promise<string> {
    const decoder = new TextDecoder();
    while (!this.#pending.includes("\n")) {
      const { value, done } = await this.#reader.read();
      if (done) throw new Error("SMTP connection closed");
      this.#pending += decoder.decode(value, { stream: true });
    }
    const end = this.#pending.indexOf("\n");
    const line = this.#pending.slice(0, end).replace(/\r$/, "");
    this.#pending = this.#pending.slice(end + 1);
    return line;
  }

  async reply(): Promise<number> {
    let line = await this.#line();
    const code = Number(line.slice(0, 3));
    while (line.length >= 4 && line[3] === "-") {
      line = await this.#line();
    }
    if (!Number.isInteger(code)) throw new Error("Invalid SMTP reply");
    return code;
  }

  async command(value: string): Promise<number> {
    await this.#writer.write(new TextEncoder().encode(value));
    return await this.reply();
  }

  // STARTTLS on port 587. Locks are released so the handshake can own the socket.
  async startTls(): Promise<void> {
    this.#reader.releaseLock();
    this.#writer.releaseLock();
    const tls = await Deno.startTls(this.#conn, { hostname: SMTP_HOST });
    this.#conn = tls;
    this.#reader = tls.readable.getReader();
    this.#writer = tls.writable.getWriter();
    this.#pending = "";
  }

  close(): void {
    try {
      this.#conn.close();
    } catch {
      // The timeout path may already have closed the socket.
    }
  }
}

function dotStuff(body: string): string {
  return body
    .replace(/\r?\n/g, "\r\n")
    .split("\r\n")
    .map((line) => (line.startsWith(".") ? `.${line}` : line))
    .join("\r\n");
}

async function deliver(smtp: Smtp, from: string, to: string, subject: string, body: string): Promise<void> {
  if (await smtp.reply() !== 220) throw new Error("SMTP greeting rejected");
  if (await smtp.command("EHLO losmirasoles\r\n") !== 250) throw new Error("SMTP EHLO rejected");
  if (await smtp.command("STARTTLS\r\n") !== 220) throw new Error("SMTP STARTTLS rejected");
  await smtp.startTls();
  if (await smtp.command("EHLO losmirasoles\r\n") !== 250) throw new Error("SMTP EHLO after TLS rejected");
  if (await smtp.command("AUTH LOGIN\r\n") !== 334) throw new Error("SMTP AUTH rejected");
  if (await smtp.command(`${btoa(from)}\r\n`) !== 334) throw new Error("SMTP user rejected");
  const password = (Deno.env.get("GMAIL_APP_PASSWORD") ?? "").replace(/\s+/g, "");
  if (await smtp.command(`${btoa(password)}\r\n`) !== 235) throw new Error("SMTP password rejected");
  if (await smtp.command(`MAIL FROM:<${from}>\r\n`) !== 250) throw new Error("SMTP MAIL FROM rejected");
  if (await smtp.command(`RCPT TO:<${to}>\r\n`) !== 250) throw new Error("SMTP RCPT TO rejected");
  if (await smtp.command("DATA\r\n") !== 354) throw new Error("SMTP DATA rejected");

  const message = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "",
    dotStuff(body),
    "",
  ].join("\r\n");
  if (await smtp.command(`${message}\r\n.\r\n`) !== 250) throw new Error("SMTP message rejected");
  await smtp.command("QUIT\r\n").catch(() => undefined);
}

async function sendReceipt(order: Order, to: string): Promise<void> {
  const from = (Deno.env.get("GMAIL_USER") ?? "").trim();
  const conn = await Deno.connect({ hostname: SMTP_HOST, port: SMTP_PORT });
  const smtp = new Smtp(conn);
  let timer: number | undefined;
  try {
    await Promise.race([
      deliver(smtp, from, to, `Pedido ${order.id}`, receipt(order)),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          smtp.close();
          reject(new Error("SMTP timeout"));
        }, SMTP_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
    smtp.close();
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }
  if (req.method !== "POST") {
    return json(405, { error: "Método no permitido" });
  }

  const authHeader = bearer(req.headers.get("Authorization"));
  if (!authHeader) return json(401, { error: "Se requiere sesión" });

  const perfilId = await userId(authHeader);
  if (!perfilId) return json(401, { error: "Se requiere sesión" });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json(422, { error: "Falta un dato obligatorio" });
  }

  const entrega = (body.entrega ?? {}) as Record<string, unknown>;
  const contacto = (body.contacto ?? {}) as Record<string, unknown>;
  const items = itemsForRpc(body.items);
  if (!items) return json(422, { error: "Falta un dato obligatorio" });

  let result: CheckoutResult;
  try {
    result = await callCheckout({
      p_perfil_id: perfilId,
      p_items: items,
      p_modalidad: asText(entrega.modalidad),
      p_domicilio: asText(entrega.domicilio),
      p_codigo_postal: asText(entrega.codigoPostal),
      p_nombre: asText(contacto.nombre),
      p_telefono: asText(contacto.telefono),
      p_correo: asText(contacto.correo),
      p_resultado: asText(body.resultadoCobro),
    });
  } catch {
    return json(500, { error: "No se pudo confirmar el pedido" });
  }

  if (result.status === 422) {
    return json(422, { error: "Falta un dato obligatorio" });
  }
  if (result.status === 409) {
    return json(409, { producto: result.producto });
  }
  if (result.status === 200) {
    return json(200, { pedido: null });
  }
  if (result.status !== 201 || !result.pedido) {
    return json(500, { error: "No se pudo confirmar el pedido" });
  }

  const order = result.pedido;
  if (!order.direccionLocal && order.modalidad === "retiro") {
    order.direccionLocal = LOCAL_PICKUP;
  }

  let mailOk = false;
  const gmailUser = (Deno.env.get("GMAIL_USER") ?? "").trim();
  const gmailPassword = (Deno.env.get("GMAIL_APP_PASSWORD") ?? "").trim();
  if (gmailUser && gmailPassword && contacto.correo) {
    try {
      await sendReceipt(order, String(contacto.correo).trim());
      mailOk = await markMailSent(order.id);
    } catch (error) {
      console.error("receipt mail failed", error instanceof Error ? error.message : "unknown");
      mailOk = false;
    }
  }

  return json(201, { ...order, mail_ok: mailOk });
});
