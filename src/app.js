const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');



const app = express();
const PORT = 8080;

app.use(bodyParser.json());

// Importa y utiliza las rutas
const productRoutes = require('./routes/routes'); // Cambiado el camino de importación
const cartRoutes = require('./routes/cartRoutes'); // Cambiado el camino de importación
const { CartManager } = require('../CartManager'); // Cambiado el camino de importación


app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes); // Cambiado el camino de importación

// Crea una instancia de CartManager
const cartManager = new CartManager(path.join(__dirname, '../files/carts.json'));


// Mostrar todos los carritos
cartManager.displayAllCarts();

// Ruta para mostrar todos los carritos
app.get('/api/carts', async (req, res) => {
    try {
        const allCarts = await cartManager.getCarts();
        res.json(allCarts);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener todos los carritos' });
    }
});

// Ruta para crear un nuevo carrito
app.post('/api/carts', async (req, res) => {
    try {
        await cartManager.createCart();
        res.json({ message: 'Nuevo carrito creado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear un nuevo carrito' });
    }
});


// Manejador de errores
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        res.status(400).json({ error: 'Solicitud JSON mal formada' });
    } else {
        next();
    }
});

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
});