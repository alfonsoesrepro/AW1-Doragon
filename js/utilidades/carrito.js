// Funciones puras del carrito: reciben la lista de ítems y devuelven una nueva.
// No tocan el DOM ni localStorage, así se pueden probar con node --test.

export function limitar(cantidad, stock) {
  const numero = Math.floor(Number(cantidad)) || 1;
  return Math.min(Math.max(numero, 1), Math.max(stock, 1));
}

export function agregarItem(items, id, cantidad, stock) {
  const existente = items.find((item) => item.id === id);

  if (!existente) {
    return [...items, { id, cantidad: limitar(cantidad, stock) }];
  }

  return items.map((item) =>
    item.id === id ? { id, cantidad: limitar(item.cantidad + cantidad, stock) } : item
  );
}

export function cambiarCantidadItem(items, id, cantidad, stock) {
  return items.map((item) =>
    item.id === id ? { id, cantidad: limitar(cantidad, stock) } : item
  );
}

export function quitarItem(items, id) {
  return items.filter((item) => item.id !== id);
}

export function contarUnidades(items) {
  return items.reduce((total, item) => total + item.cantidad, 0);
}

export function calcularTotales(items, productos, opciones = {}) {
  const { descuentoDrop = 0, porcentajeCodigo = 0 } = opciones;

  const subtotal = items.reduce((total, item) => {
    const producto = productos.find((registro) => registro.id === item.id);
    return producto ? total + producto.precio * item.cantidad : total;
  }, 0);

  const drop = subtotal > 0 ? Math.min(descuentoDrop, subtotal) : 0;
  const codigo = Math.round(subtotal * porcentajeCodigo);

  return { subtotal, drop, codigo, total: subtotal - drop - codigo };
}
