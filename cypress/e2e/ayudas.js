// Ayudas compartidas por los specs (no es un spec: no termina en .cy.js).
// Todo Supabase se simula con cy.intercept; nunca se toca la base real.

// Mismo formato que usa la app para los precios
export const pesos = (valor) => `$ ${Number(valor).toLocaleString('es-AR')}`

// Usuario y perfil de prueba (datos inventados)
export const USUARIO = { id: '00000000-0000-4000-8000-000000000001', email: 'cliente@prueba.test' }
export const PERFIL = { nombre: 'Ana Prueba', rol: 'cliente' }

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers':
    'authorization, apikey, content-type, x-client-info, prefer, accept, accept-profile, content-profile',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'content-type': 'application/json',
}

// Responde con JSON (acepta null para simular una respuesta vacía)
export function responder(req, cuerpo, estado = 200) {
  req.reply({ statusCode: estado, headers: CORS, body: JSON.stringify(cuerpo) })
}

// Fábrica de productos de ejemplo
let contador = 0
export function producto(datos = {}) {
  contador += 1
  return {
    id: `10000000-0000-4000-8000-${String(contador).padStart(12, '0')}`,
    nombre: `Producto ${contador}`,
    descripcion: 'Descripción de prueba',
    info_nutricional: null,
    precio: 1000,
    stock: 5,
    unidad_venta: 'unidad',
    sin_tacc: false,
    vegano: false,
    sin_lactosa: false,
    categoria_id: null,
    imagen_path: null,
    publicado: true,
    ...datos,
  }
}

// Token con forma de JWT (solo para que supabase-js lo acepte; no vale nada)
function tokenFalso() {
  const base64url = (obj) =>
    btoa(JSON.stringify(obj)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
  const payload = {
    sub: USUARIO.id,
    aud: 'authenticated',
    role: 'authenticated',
    email: USUARIO.email,
    exp: Math.floor(Date.now() / 1000) + 3600,
  }
  return `${base64url({ alg: 'HS256', typ: 'JWT' })}.${base64url(payload)}.firma-falsa`
}

export function usuarioAuth(extra = {}) {
  return {
    id: USUARIO.id,
    aud: 'authenticated',
    role: 'authenticated',
    email: USUARIO.email,
    app_metadata: {},
    user_metadata: { nombre: PERFIL.nombre },
    identities: [{ id: USUARIO.id, provider: 'email' }],
    created_at: '2026-01-01T00:00:00Z',
    ...extra,
  }
}

// Debe llamarse primero: lo que no tenga un intercept propio responde 500 y queda
// contado en @noPrevisto (ningún request llega a la base real).
export function bloquearSupabase() {
  cy.intercept(
    { url: /\.supabase\.co|\/(rest|auth|functions|storage)\/v1\// },
    (req) => responder(req, { message: 'Request de Supabase no previsto en el test' }, 500)
  ).as('noPrevisto')
}

// Para usar en afterEach: confirma que no se coló ningún request sin simular
export function verificarSinNoPrevistos() {
  cy.get('@noPrevisto.all').should('have.length', 0)
}

// Catálogo: lista de productos (o uno solo si piden por id) y categorías
export function simularCatalogo(productos, categorias = []) {
  cy.intercept({ method: 'GET', pathname: '/rest/v1/categorias' }, (req) =>
    responder(req, categorias)
  )
  cy.intercept({ method: 'GET', pathname: '/rest/v1/productos' }, (req) => {
    const id = new URL(req.url).searchParams.get('id')
    if (id) {
      responder(req, productos.find((p) => `eq.${p.id}` === id) ?? null)
    } else {
      responder(req, productos)
    }
  }).as('productos')
}

// Zonas de cobertura: costos por código postal; los demás códigos no tienen zona (null)
export function simularZonas(costos = { 1754: 1500 }) {
  cy.intercept({ method: 'GET', pathname: '/rest/v1/zonas_cobertura' }, (req) => {
    const cp = (new URL(req.url).searchParams.get('codigo_postal') ?? '').replace('eq.', '')
    responder(req, cp in costos ? { costo_envio: costos[cp] } : null)
  })
}

// Login simulado: token de contraseña y perfil
export function simularSesion() {
  cy.intercept({ method: 'POST', pathname: '/auth/v1/token' }, (req) =>
    responder(req, {
      access_token: tokenFalso(),
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'refresh-falso',
      user: usuarioAuth(),
    })
  )
  cy.intercept({ method: 'GET', pathname: '/rest/v1/perfiles' }, (req) => responder(req, PERFIL))
}

// Prepara todo lo necesario para una pantalla con catálogo y sesión posible
export function prepararTienda({ productos, categorias = [] }) {
  bloquearSupabase()
  simularCatalogo(productos, categorias)
  simularSesion()
}

// Entra por la pantalla de ingreso (sin salir del router, para no perder el carrito).
// La contraseña es aleatoria: el intercept acepta cualquiera.
export function ingresarPorUI() {
  cy.contains('a', 'Cuenta').click()
  cy.get('#correo').type(USUARIO.email)
  cy.get('#contrasenia').type(`x${Cypress._.random(1e9)}`, { log: false })
  cy.contains('button', 'Entrar').click()
  cy.contains('button', 'Salir').should('be.visible')
}

// Primera unidad: "Agregar". Si ya está en el carrito, el + de la tarjeta.
export function agregarDesdeCatalogo(nombre) {
  cy.contains('.tarjeta', nombre).then(($tarjeta) => {
    const sumar = $tarjeta.find(`button[aria-label="Sumar una unidad de ${nombre}"]`)
    if (sumar.length) {
      cy.wrap(sumar).click()
    } else {
      cy.wrap($tarjeta).contains('button', 'Agregar').click()
    }
  })
}

// El contador va en la insignia, no en el texto "Carrito (n)".
export function verCarrito(cantidad) {
  cy.get('a.header-carrito').find('.cuenta').should('have.text', String(cantidad))
}

// Va al carrito con el link del Header (no recarga la página)
export function irAlCarrito() {
  cy.get('a.header-carrito').click()
}
