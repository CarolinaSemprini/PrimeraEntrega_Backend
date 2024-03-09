const fs = require("fs").promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { ProductManager } = require('./ProductManager');
const EventEmitter = require('events');

class CartManager extends EventEmitter {
    constructor(filePath) {
        super();
        this.path = filePath;
        this.productManager = new ProductManager(path.join(__dirname, './files/products.json'));
        this.createFileIfNotExists();
    }

    async createFileIfNotExists() {
        try {
            // Verificar si el archivo carts.json existe
            try {
                await fs.access(this.path, fs.constants.F_OK);
            } catch (error) {
                // Si el archivo no existe, inicializarlo con un formato válido
                await fs.writeFile(this.path, JSON.stringify({ carts: [] }, null, 2), { encoding: 'utf-8' });
                console.log(`Archivo ${this.path} creado exitosamente.`);
            }
        } catch (error) {
            console.error(`Error al acceder al archivo ${this.path}: ${error.message}`);
            throw error;
        }
    }

    async getCarts() {
        try {
            const cartData = await fs.readFile(this.path, 'utf-8');
            return JSON.parse(cartData);
        } catch (error) {
            console.error('Error al leer los carritos desde el archivo:', error);
            throw error;
        }
    }


    async readCartsFromFile() {
        try {
            const cartData = await fs.readFile(this.path, 'utf-8');
            return JSON.parse(cartData);
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log(`El archivo ${this.path} no existe.`);
                return { carts: [] }; // Devolver un objeto vacío si el archivo no existe
            }
            console.error('Error al leer los carritos desde el archivo:', error);
            throw error;
        }
    }

    async displayAllCarts() {
        try {
            const carts = await this.getCarts();
            if (carts.length === 0) {
                console.log("No hay carritos disponibles.");
                return;
            }

            console.log("Listado de Carritos:");
            carts.forEach(cart => {
                console.log(`ID: ${cart.id}, Productos: ${JSON.stringify(cart.products)}`);
            });
        } catch (error) {
            console.error("Error al mostrar todos los carritos:", error);
            throw error;
        }
    }

    async createCart() {
        try {
            let carts = await this.getCarts(); // Obtener los carritos existentes
            const cartId = uuidv4(); // Generar un nuevo ID para el carrito
            const newCart = { id: cartId, products: [] }; // Crear un nuevo carrito vacío
            carts.push(newCart); // Agregar el nuevo carrito al array de carritos
            await this.saveCarts(carts); // Guardar los carritos actualizados en el archivo
            return newCart; // Devolver el nuevo carrito creado
        } catch (error) {
            console.error("Error al crear un nuevo carrito:", error);
            throw error;
        }
    }

    async saveCarts(cartsData) {
        try {
            await fs.writeFile(this.path, JSON.stringify(cartsData, null, 2));
        } catch (error) {
            console.error('Error al guardar los carritos en el archivo:', error);
            throw error;
        }
    }

    async getCartById(cartId) {
        try {
            const carts = await this.getCarts();
            return carts.find(cart => cart.id === cartId);
        } catch (error) {
            console.error('Error al obtener el carrito por ID:', error);
            throw error;
        }
    }



    async addProductToCart(cartId, productId, quantity) {
        try {
            if (typeof cartId !== 'string') {
                throw new Error('El cartId debe ser un string');
            }

            let carts = await this.getCarts();
            const cartIndex = carts.findIndex(cart => cart.id === cartId);

            if (cartIndex === -1) {
                throw new Error('El carrito especificado no existe');
            }

            productId = parseInt(productId);

            const product = await this.productManager.getProductById(productId);
            if (!product) {
                throw new Error('Producto no encontrado');
            }

            if (!this.isValidCartId(cartId) || !this.isValidProductId(productId) || !this.isValidQuantity(quantity)) {
                throw new Error('Datos de entrada no válidos');
            }

            if (product.stock < quantity) {
                throw new Error('No hay suficiente stock disponible');
            }

            const existingProductIndex = carts[cartIndex].products.findIndex(p => p.id === productId);
            if (existingProductIndex !== -1) {
                // Si el producto ya existe en el carrito, actualiza su cantidad
                carts[cartIndex].products[existingProductIndex].quantity += quantity;
            } else {
                // Si el producto no existe en el carrito, agrégalo
                carts[cartIndex].products.push({ id: productId, quantity });
            }

            const updatedStock = product.stock - quantity;
            await this.productManager.updateProductStock(productId, updatedStock);

            await this.saveCarts(carts);

            // Emitir evento 'productoAgregado' con los detalles del producto agregado al carrito
            this.emit('productoAgregado', { cartId, productId, quantity });

            return carts[cartIndex];
        } catch (error) {
            console.error("Error al agregar un producto al carrito:", error);
            throw error;
        }
    }

    isValidCartId(cartId) {
        return typeof cartId === 'string' && cartId.trim() !== '';
    }

    isValidProductId(productId) {
        return (typeof productId === 'number' && productId > 0) || (typeof productId === 'string' && productId.trim() !== '');
    }

    isValidQuantity(quantity) {
        return typeof quantity === 'number' && quantity > 0;
    }



    async getCartProducts(cartId) {
        try {
            const carts = await this.getCarts();
            console.log('Carts:', carts); // Agregar este log para verificar los carritos obtenidos
            const cart = carts.find(c => c.id === cartId);
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }
            return cart.products;
        } catch (error) {
            console.error('Error al obtener productos del carrito:', error);
            throw error;
        }
    }
}

module.exports.CartManager = CartManager;
