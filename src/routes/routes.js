const express = require('express');
const router = express.Router();
const path = require('path');
const { ProductManager } = require('../../ProductManager');
const uploader = require('../utils'); // Importar el uploader desde utils

const productManager = new ProductManager(path.join(__dirname, '../../files/products.json'));

// Rutas para productos
router.get('/', async (req, res) => {
    try {
        const limit = req.query.limit;
        const products = await productManager.getProducts();

        if (limit) {
            res.json(products.slice(0, parseInt(limit)));
        } else {
            res.json(products);
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

router.get('/:productId', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        const productId = parseInt(req.params.productId);
        const product = products.find((product) => product.id === productId);

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

router.post('/', async (req, res) => {
    try {
        const newProduct = req.body;

        // Verificar si el campo quantity está presente en el cuerpo de la solicitud
        if (!newProduct.hasOwnProperty('quantity')) {
            throw new Error('El campo "quantity" es obligatorio');
        }

        await productManager.addProduct(newProduct.title, newProduct.description, newProduct.price, newProduct.thumbnail, newProduct.code, newProduct.stock, newProduct.quantity);
        res.json({ message: 'Producto agregado correctamente', product: newProduct });
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar un nuevo producto', message: error.message });
    }
});


router.put('/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;
        const updatedProduct = req.body;
        await productManager.updateProduct(productId, updatedProduct);
        res.json({ message: `Producto actualizado con ID: ${productId}`, product: updatedProduct });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar un producto' });
    }
});

router.delete('/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;
        await productManager.deleteProduct(productId);
        res.json({ message: `Producto eliminado con ID: ${productId}` });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar un producto' });
    }
});


// Ruta para manejar la subida de archivos que se guardaran en la carpeta public (logica en el archivo utils)
router.post('/upload', uploader.array('files'), (req, res) => {
    // req.files contendrá los archivos subidos
    console.log(req.files);
    // Lógica para manejar los archivos subidos
    res.send('Archivos subidos exitosamente.');
});

module.exports = router;
