import { createContext, useContext, useState} from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }){
    const [items, setItems] = useState([])

    function agregarProducto(producto){
        const existe = items.find((i) => i.id === producto.id) 
        if (existe){
            setItems(items.map((i) => (i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i)))
        }else{
            setItems([...items, { ...producto, cantidad: 1 }])
        }
    }
     return (
    <CartContext.Provider value={{ items, agregarProducto }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext) 
}