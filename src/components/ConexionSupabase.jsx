import { useEffect, useState } from 'react'
import { supabase, supabaseConfigurado } from '../lib/supabase'

const TABLA_DE_PRUEBA = 'categorias'

function ConexionSupabase() {
  const [estado, setEstado] = useState('Probando...')

  useEffect(() => {
    async function probar() {
      if (!supabaseConfigurado) {
        setEstado('Error: faltan las variables de entorno (revisar .env)')
        return
      }
      const { error } = await supabase.from(TABLA_DE_PRUEBA).select('*').limit(1)
      setEstado(error ? `Error: ${error.message}` : 'Conexión OK')
    }
    probar()
  }, [])

  return <p>{estado}</p>
}

export default ConexionSupabase
