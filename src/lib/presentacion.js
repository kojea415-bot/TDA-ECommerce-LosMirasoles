// Labels and money formatting shared by the wireframe screens.

export function etiquetasDe(producto) {
  const etiquetas = []
  if (producto.sin_tacc) etiquetas.push('Sin TACC')
  if (producto.vegano) etiquetas.push('Vegano')
  if (producto.sin_lactosa) etiquetas.push('Sin lactosa')
  return etiquetas
}

export function pesos(valor) {
  return `$ ${Number(valor).toLocaleString('es-AR')}`
}
