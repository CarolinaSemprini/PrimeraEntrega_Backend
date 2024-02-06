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
router.post('/', async (req, res) => {
    try {
        await cartManager.createCart();
        res.json({ message: 'Nuevo carrito creado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear un nuevo carrito' });
    }
});

// Ruta para obtener productos de un carrito por ID
router.get('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cartProducts = await cartManager.getCartProducts(cartId);
        res.json({ message: `Obtener productos del carrito con ID: ${cartId}`, products: cartProducts });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener productos del carrito' });
    }
});

// Ruta para agregar un producto a un carrito
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const { quantity } = req.body; // Asegúrate de que la cantidad se envíe en el cuerpo de la solicitud

        const updatedCart = await cartManager.addProductToCart(cartId, productId, quantity);

        res.json({ message: `Producto agregado al carrito con ID: ${cartId}`, cart: updatedCart });
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar producto al carrito' });
    }
});


module.exports = router;
