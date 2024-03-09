// Conectarse al servidor Socket.IO
const socket = io();

// Obtener el formulario de carga de productos
const form = document.getElementById('form-cargar-producto');

// Escuchar el evento de envío del formulario
form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevenir el envío por defecto del formulario

    // Obtener los datos del formulario
    const formData = new FormData(form);
    const title = formData.get('title');
    const description = formData.get('description'); // Agregado: obtener descripción
    const price = formData.get('price');
    const thumbnail = formData.get('thumbnail'); // Agregado: obtener thumbnail
    const code = formData.get('code'); // Agregado: obtener código
    const stock = formData.get('stock'); // Agregado: obtener stock
    const status = formData.get('status'); // Agregado: obtener status
    const category = formData.get('category'); // Agregado: obtener categoría
    const thumbnails = formData.getAll('thumbnails'); // Agregado: obtener todas las miniaturas

    // Crear el objeto de producto
    const productoNuevo = {
        title: title,
        description: description, // Agregado: agregar descripción
        price: parseFloat(price),
        thumbnail: thumbnail, // Agregado: agregar thumbnail
        code: code, // Agregado: agregar código
        stock: parseInt(stock), // Agregado: agregar stock
        status: status, // Agregado: agregar status
        category: category, // Agregado: agregar categoría
        thumbnails: thumbnails // Agregado: agregar todas las miniaturas
    };

    try {
        // Realizar una solicitud POST al servidor para agregar el producto
        const response = await fetch('/api/addProduct', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productoNuevo)
        });

        if (response.ok) {
            // Si la respuesta es exitosa, redirigir al usuario a la página realTimeProducts.handlebars
            window.location.href = '/realTimeProducts';
        } else {
            // Si hay un error en la respuesta, mostrar un mensaje de error
            console.error('Error al agregar el producto:', response.statusText);
            alert('Error al agregar el producto. Inténtalo de nuevo más tarde.');
        }
    } catch (error) {
        console.error('Error al agregar el producto:', error);
        alert('Error al agregar el producto. Inténtalo de nuevo más tarde.');
    }
});
