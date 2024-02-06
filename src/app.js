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

// Ruta para crear un nuevo carrito
app.post('/api/carts', async (req, res) => {
    try {
        await cartManager.createCart();
        res.json({ message: 'Nuevo carrito creado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear un nuevo carrito' });
    }
});

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
});