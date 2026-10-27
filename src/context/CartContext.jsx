import { createContext, useContext, useState} from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }){
    // TEMPORAL: productos de prueba para ver el carrito. Volver a useState([])
    const [items, setItems] = useState([
        { id: 1, nombre: 'Quinoa', precio: 2500, cantidad: 2 },
        { id: 2, nombre: 'Miel orgánica', precio: 4200, cantidad: 1 },
    ])

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

    return (
    <CartContext.Provider value={{ items, agregarProducto, quitarProducto, cambiarCantidad, vaciarCarrito }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext) 
}