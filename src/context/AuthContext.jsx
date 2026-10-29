import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [perfilListo, setPerfilListo] = useState(false)
  const [cargando, setCargando] = useState(true)
  const lectura = useRef(0)
  const usuarioVisto = useRef(undefined)

  async function leerPerfil(user) {
    const actual = ++lectura.current
    const id = user?.id ?? null
    const mismoUsuario = usuarioVisto.current === id
    usuarioVisto.current = id
    if (!user) {
      if (actual !== lectura.current) return
      setPerfil(null)
      setPerfilListo(true)
      return
    }
    // Only blank the role when the account changes. A token refresh
    // must not unmount the panel while the same profile is loading again.
    if (!mismoUsuario) setPerfilListo(false)
    const { data } = await supabase
      .from('perfiles')
      .select('nombre, rol')
      .eq('id', user.id)
      .maybeSingle()
    if (actual !== lectura.current) return
    setPerfil(data)
    setPerfilListo(true)
  }

  useEffect(() => {
    let vigente = true

    // Stay on "loading" until the role is known, so the panel does not
    // redirect an administrator before the profile arrives.
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user ?? null
      if (!vigente) return
      setUsuario(user)
      await leerPerfil(user)
      if (vigente) setCargando(false)
    })

    const { data } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      const user = sesion?.user ?? null
      setUsuario(user)
      leerPerfil(user)
    })

    return () => {
      vigente = false
      data.subscription.unsubscribe()
    }
  }, [])

  // Cierra la sesión en Supabase; el "timbre" de arriba pone usuario en null
  async function cerrarSesion() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ usuario, perfil, perfilListo, cargando, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
