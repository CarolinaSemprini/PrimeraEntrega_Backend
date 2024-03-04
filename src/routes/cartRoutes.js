// cartRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const { CartManager } = require('../../CartManager');

const cartManager = new CartManager(path.join(__dirname, '../../files/carts.json'));

// Ruta para obtener todos los carritos
router.get('/', async (req, res) => {
    try {
        const allCarts = await cartManager.getCarts();
        res.json(allCarts);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener todos los carritos' });
    }
});

// Ruta para crear un nuevo carrito
router.post('/api/carts/', async (req, res) => {
    try {
        // Lógica para crear un nuevo carrito utilizando CartManager
        const newCart = await cartManager.createCart();
        res.json({ message: 'Nuevo carrito creado', cart: newCart });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear un nuevo carrito' });
    }
});

// Ruta para obtener un carrito por su ID y ver sus productos
router.get('/:cartId', async (req, res) => {
    try {
        const cartId = req.params.cartId;
        const cart = await cartManager.getCartById(cartId);
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }
        return res.json(cart);
    } catch (error) {
        console.error('Error al obtener el carrito por ID:', error);
        return res.status(500).json({ error: 'Error al obtener el carrito por ID' });
    }
});


// Ruta para agregar un producto a un carrito
router.post('/:cartId/product/:productId', async (req, res) => {
    try {
        const cartId = req.params.cartId;
        const productId = req.params.productId; // Asegúrate de que el nombre del parámetro sea correcto
        const quantity = req.body.quantity; // Asegúrate de que la cantidad se envíe en el cuerpo de la solicitud

        // Agregar el producto al carrito
        const updatedCart = await cartManager.addProductToCart(cartId, productId, quantity);

        res.json({ message: `Producto agregado al carrito con ID: ${cartId}`, cart: updatedCart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



module.exports = router;
