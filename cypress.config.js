import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    // Puerto por defecto de "npm run dev"
    baseUrl: 'http://localhost:5173',
    // Tamaño de celular (RNF-01: 360 px de ancho)
    viewportWidth: 360,
    viewportHeight: 740,
    supportFile: false,
  },
})
