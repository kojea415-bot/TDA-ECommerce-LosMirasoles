import { createContext, useContext, useState} from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }){
    const [items, setItems] = useState([])

     return (
    <CartContext.Provider value={{ items }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext) 
}