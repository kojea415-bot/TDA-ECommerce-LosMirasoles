import { createClient } from '@supabase/supabase-js'

// Variables de entorno (se definen en el archivo .env, ver .env.example)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Aviso claro si falta alguna variable
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Faltan variables de entorno de Supabase: definí VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el archivo .env (copiá .env.example).'
  )
}

// Solo la anon key en el frontend, nunca la service role key.
// Si faltan las variables usamos valores vacíos para que la app no se rompa al cargar.
export const supabase = createClient(supabaseUrl || 'http://localhost', supabaseAnonKey || 'sin-clave')

export const supabaseConfigurado = Boolean(supabaseUrl && supabaseAnonKey)
