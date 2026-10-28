// Empty crosshatch when the product has no stored image, matching the wireframes.
function MarcoImagen({ src, alt, variante }) {
  const clase = `marco-imagen${variante ? ` marco-imagen-${variante}` : ''}`
  if (!src) {
    return (
      <div className={`${clase} marco-imagen-vacia`} aria-hidden="true">
        <span>imagen</span>
      </div>
    )
  }
  return <img className={clase} src={src} alt={alt} />
}

export default MarcoImagen
