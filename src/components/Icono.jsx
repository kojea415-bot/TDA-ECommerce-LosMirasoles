// Small line icons. Decorative: the visible label stays in the markup.
function Icono({ nombre, tamano = 16 }) {
  return (
    <svg
      className="icono"
      width={tamano}
      height={tamano}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {trazos(nombre)}
    </svg>
  )
}

function trazos(nombre) {
  switch (nombre) {
    case 'hoja':
      return (
        <>
          <path d="M12 21V10" />
          <path d="M12 15c-4.2-.2-7-2.4-8-6 4.2.4 7 2.6 8 6z" />
          <path d="M12 13c4-.4 6.6-3 7.5-6.5-4 .5-6.6 3-7.5 6.5z" />
        </>
      )
    case 'buscar':
      return (
        <>
          <circle cx="11" cy="11" r="6.5" />
          <path d="M16 16.5 20 20.5" />
        </>
      )
    case 'carrito':
      return (
        <>
          <circle cx="9" cy="20" r="1.2" />
          <circle cx="18" cy="20" r="1.2" />
          <path d="M3 4h2l2.2 11h11.3l2-7H7" />
        </>
      )
    case 'usuario':
      return (
        <>
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5.5 19.5c1.4-3 3.6-4.5 6.5-4.5s5.1 1.5 6.5 4.5" />
        </>
      )
    case 'salir':
      return (
        <>
          <path d="M10 7V5H5v14h5v-2" />
          <path d="M10 12h9" />
          <path d="M16 8.5 19.5 12 16 15.5" />
        </>
      )
    case 'panel':
      return (
        <>
          <rect x="4" y="4" width="7" height="7" rx="1.2" />
          <rect x="13" y="4" width="7" height="7" rx="1.2" />
          <rect x="4" y="13" width="7" height="7" rx="1.2" />
          <rect x="13" y="13" width="7" height="7" rx="1.2" />
        </>
      )
    case 'mas':
      return (
        <>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </>
      )
    case 'menos':
      return <path d="M5 12h14" />
    case 'check':
      return <path d="M5 12.5 9.5 17 19 7" />
    case 'local':
      return (
        <>
          <path d="M4 10 12 4l8 6" />
          <path d="M6 10.5V20h12v-9.5" />
          <path d="M10 20v-6h4v6" />
        </>
      )
    case 'envio':
      return (
        <>
          <path d="M3 7h11v8H3z" />
          <path d="M14 10h4l3 3v2h-7" />
          <circle cx="7" cy="17.5" r="1.4" />
          <circle cx="17" cy="17.5" r="1.4" />
        </>
      )
    case 'sobre':
      return (
        <>
          <rect x="3.5" y="6" width="17" height="12" rx="1.5" />
          <path d="m4 7 8 6 8-6" />
        </>
      )
    default:
      return null
  }
}

export default Icono
