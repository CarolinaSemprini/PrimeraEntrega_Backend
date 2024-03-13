//views router
const express = require('express');
const router = express.Router();
const path = require('path');
const { ProductManager } = require('../../ProductManager');


// Crear una instancia de ProductManager
const productManager = new ProductManager(path.join(__dirname, '../../files/products.json'));

// Ruta para mostrar el formulario de login
router.get('/login', (req, res) => {
    res.render('login');
});

// Ruta para manejar el envío del formulario de login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Verifica si el usuario y la contraseña son "admin"
    if (username === 'admin' && password === 'admin') {
        // Si es "admin", redirige a la página de carga de productos
        res.redirect('/loadProducts');
    } else {
        // Si no, redirige a la lista de productos
        res.redirect('/home');
    }
});

// Ruta para mostrar la lista de productos
router.get('/home', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render('home', { products });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

// Ruta para mostrar el formulario de carga de productos
router.get('/loadProducts', (req, res) => {
    // Lógica para mostrar el formulario de carga de productos
    res.render('loadProducts');
});



// Ruta para mostrar la vista home con los datos de los productos
router.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render('home', { products });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

// Ruta para mostrar la vista realTimeProducts con los datos de los productos
router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render('realTimeProducts', { products });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

module.exports = router;