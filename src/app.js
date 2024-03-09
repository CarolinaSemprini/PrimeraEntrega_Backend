const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const path = require('path');
const { create } = require('express-handlebars');
const { ProductManager } = require('../ProductManager');
const { CartManager } = require('../CartManager');
const viewsRouter = require('./routes/viewsRouter');
const fs = require('fs').promises;


const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 8080;

//Middleware para analizar los cuerpos de las solicitudes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Configurar Handlebars como motor de plantillas
const hbs = create({
    /* Opciones de Handlebars */
    extname: '.handlebars',
    defaultLayout: 'main',
    helpers: { /* ... */ }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));


/*Middleware para servir archivos estáticos desde la carpeta 'public ( si la necesitamos dentro de la carpeta src)'
app.use('/static', express.static(__dirname + '/public'))*/

// Middleware para servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'src', 'public')));
app.use(express.static('public', {
    setHeaders: function (res, path, stat) {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));


// Configurar el servidor Socket.IO
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    // Escuchar eventos del ProductManager
    productManager.on('productoAgregado', (producto) => {
        io.emit('productoAgregado', producto);
    });

    productManager.on('productoEliminado', (productoId) => {
        io.emit('productoEliminado', productoId);
    });


});

// Crea instancias de ProductManager y CartManager
const productManager = new ProductManager(path.join(__dirname, '../files/products.json'));
const cartManager = new CartManager(path.join(__dirname, '../files/carts.json'))


/// Importar y utilizar las rutas
const productRoutes = require('../src/routes/routes');
const cartRoutes = require('../src/routes/cartRoutes');
const { appendFileSync } = require('fs');


// Utilizar el router de las vistas
app.use('/', viewsRouter);
app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);



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

// Ruta para manejar el envío del formulario de login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Verifica si el usuario y la contraseña son "admin"
    if (username === 'admin' && password === 'admin') {
        // Si es "admin", redirige a la página de carga de productos
        res.redirect('/loadProducts');
    } else {
        // Si no, redirige a la lista de productos
        res.redirect('/products');
    }
});

// Ruta para cargar la vista principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'views', 'main.handlebars'));
});

// Ruta para agregar un nuevo producto desde la vista loadProducts.handlebars
app.post('/api/addProduct', async (req, res) => {
    try {
        // Obtener los datos del producto del cuerpo de la solicitud
        const { title, description, price, thumbnail, code, stock, status, category, thumbnails } = req.body;

        // Crear el objeto del producto
        const newProduct = {
            title,
            description,
            price,
            thumbnail,
            code,
            stock,
            status,
            category,
            thumbnails
        };

        // Obtener la lista actual de productos
        const productsFilePath = path.join(__dirname, '../files/products.json');
        const productsData = await fs.readFile(productsFilePath, 'utf-8');
        const products = JSON.parse(productsData);

        // Agregar el nuevo producto a la lista de productos
        products.push(newProduct);

        // Guardar la lista actualizada de productos en el archivo JSON
        await fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), 'utf-8');

        // Redirigir a la página de realtimeproducts
        res.redirect('/realTimeProducts');
    } catch (error) {
        console.error('Error al procesar la solicitud POST:', error);
        res.status(500).send('Error interno del servidor');
    }
});

// Ruta para mostrar la vista realTimeProducts con los datos de los productos
app.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render('realTimeProducts', { products });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

// Ruta para mostrar el formulario de login
app.get('/login', (req, res) => {
    res.render('login');
});


// Manejador de errores
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        res.status(400).json({ error: 'Solicitud JSON mal formada' });
    } else {
        next();
    }
});

// Modificar la lógica del servidor para agregar un id único a cada producto
let nextProductId = 1; // Inicializar un contador para asignar ids únicos a los productos
// Emitir evento 'productoAgregado' al cliente cuando se agrega un producto
productManager.on('productoAgregado', (producto) => {
    // Asignar un id único al producto antes de emitirlo
    producto.id = nextProductId++;
    io.emit('productoAgregado', producto);
});
// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
});



