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

    function quitarProducto(producto){
        setItems(items.filter((i) => i.id !== producto.id))
    }

    // cambio es +1 o -1; si la cantidad llega a 0, el producto sale del carrito
    function cambiarCantidad(producto, cambio){
        setItems(
            items
                .map((i) => (i.id === producto.id ? { ...i, cantidad: i.cantidad + cambio } : i))
                .filter((i) => i.cantidad > 0)
        )
    }

    function vaciarCarrito(){
        setItems([])
    }

    // Suma de precio por cantidad de todos los productos
    const subtotal = items.reduce((suma, i) => suma + i.precio * i.cantidad, 0)

    return (
    <CartContext.Provider value={{ items, subtotal, agregarProducto, quitarProducto, cambiarCantidad, vaciarCarrito }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext) 
}