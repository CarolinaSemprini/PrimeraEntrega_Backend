//realTimeProducts.js que maneja la vista realtimeproducts

// Conectarse al servidor Socket.IO
const socket = io();

// Escuchar el evento 'clienteConectado' para mostrar el mensaje
socket.on('clienteConectado', (mensaje) => {
    // Mostrar el mensaje en la página
    document.getElementById('mensaje-conexion').innerText = mensaje;
});

// Obtener la lista de productos
const productList = document.querySelector('ul');

// Escuchar el evento productoAgregado
socket.on('productoAgregado', (producto) => {
    // Crear un nuevo elemento de lista para el producto agregado
    const newProductItem = document.createElement('li');
    newProductItem.textContent = `${producto.title} - ${producto.price}`;
    newProductItem.dataset.id = producto.id; // Establecer el id del producto como un atributo de datos
    productList.appendChild(newProductItem);
});

// Escuchar el evento productoEliminado
socket.on('productoEliminado', (productoId) => {
    // Encontrar y eliminar el elemento de lista correspondiente al producto eliminado
    const productItem = productList.querySelector(`li[data-id="${productoId}"]`);
    if (productItem) {
        productItem.remove();
    }
});