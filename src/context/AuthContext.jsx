import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)

  async function leerPerfil(user) {
    if (!user) {
      setPerfil(null)
      return
    }
    const { data } = await supabase
      .from('perfiles')
      .select('nombre, rol')
      .eq('id', user.id)
      .maybeSingle()
    setPerfil(data)
  }

  useEffect(() => {
    // 1. preguntar si hay sesión abierta
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user ?? null
      setUsuario(user)
      setCargando(false)
      leerPerfil(user)
    })

    // 2. escuchar cuando alguien entra o sale
    const { data } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      const user = sesion?.user ?? null
      setUsuario(user)
      leerPerfil(user)
    })

    // 3. al desmontar, dejar de escuchar
    return () => data.subscription.unsubscribe()
  }, [])

  // Cierra la sesión en Supabase; el "timbre" de arriba pone usuario en null
  async function cerrarSesion() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ usuario, perfil, cargando, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
