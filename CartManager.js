const fs = require("fs").promises;
const path = require('path');
const { createInterface } = require("readline");
const { v4: uuidv4 } = require('uuid');

class CartManager {
    constructor(filePath) {
        this.path = filePath;
        this.carts = [];
        this.createFileIfNotExists();
    }

    // Método que crea el archivo si no existe
    async createFileIfNotExists() {
        try {
            await fs.access(this.path, fs.constants.F_OK);
        } catch (error) {
            await fs.writeFile(this.path, '[]', { encoding: 'utf-8' });
            console.log(`Archivo ${this.path} creado exitosamente.`);
        }
    }

    async displayAllCarts() {
        try {
            const carts = await this.getCarts();
            console.log("Listado de Carritos:");
            carts.forEach(cart => {
                console.log(`ID: ${cart.id}, Productos: ${JSON.stringify(cart.products)}`);
            });
        } catch (error) {
            console.error("Error al mostrar todos los carritos:", error);
            throw error;
        }
    }
    // Método que lee y parsea el contenido del archivo para obtener la lista de carritos
    async getCarts() {
        try {
            const cartsContent = await fs.readFile(this.path, "utf-8");
            const cartsList = JSON.parse(cartsContent);
            return cartsList;
        } catch (error) {
            console.error("Error al obtener la lista de carritos:", error);
            throw error;
        }
    }

    async createCart() {
        try {
            const newCart = {
                id: uuidv4(),
                products: []
            };

            this.carts.push(newCart);

            // Guarda la lista actualizada en el archivo
            await fs.writeFile(this.path, JSON.stringify(this.carts, null, 2), { encoding: 'utf-8' });

            console.log("Nuevo carrito creado:", newCart);
        } catch (error) {
            console.error("Error al crear un nuevo carrito:", error);
            throw error;
        }
    }
    // Método que guarda la lista de carritos en el archivo
    async saveCarts(carts) {
        try {
            await fs.writeFile(this.path, JSON.stringify(carts, null, 2), { encoding: 'utf-8' });
        } catch (error) {
            console.error("Error al guardar la lista de carritos:", error);
            throw error;
        }
    }

    // Método para crear un nuevo carrito con productos
    async createNewCartWithProducts(products) {
        try {
            // Obtener la lista actual de carritos
            this.carts = await this.getCarts();

            // Generar un nuevo ID para el carrito
            const cartId = await this.generateCartId();

            // Crear el nuevo carrito con la estructura requerida
            const newCart = {
                id: cartId,
                products
            };

            // Agregar el nuevo carrito a la lista
            this.carts.push(newCart);

            // Guardar la lista actualizada en el archivo
            await this.saveCarts(this.carts);

            console.log("Nuevo carrito creado:", newCart);
            return newCart;
        } catch (error) {
            console.error("Error al crear un nuevo carrito:", error);
            throw error;
        }
    }
    async addProductToCart(cartId, productId, quantity) {
        try {
            const carts = await this.getCarts();
            let cart = carts.find(c => c.id === cartId);
            if (!cart) {
                cart = {
                    id: cartId,
                    products: []
                };
                carts.push(cart);
            }

            const existingProductIndex = cart.products.findIndex(p => p.id === productId);
            if (existingProductIndex !== -1) {
                // Si el producto ya existe en el carrito, actualiza la cantidad
                cart.products[existingProductIndex].quantity += quantity;
            } else {
                // Si el producto no existe en el carrito, agrégalo con la cantidad especificada
                cart.products.push({ id: productId, quantity });
            }

            await this.saveCarts(carts);
            return cart;
        } catch (error) {
            console.error("Error al agregar un producto al carrito:", error);
            throw error;
        }
    }

    // Método que genera un nuevo ID para un carrito
    async generateCartId() {
        try {
            const counter = this.carts.length;
            return counter === 0 ? 1 : this.carts[counter - 1].id + 1;
        } catch (error) {
            console.error("Error al generar IDs para carritos:", error);
            throw error;
        }
    }

    //obtener los productos de un carrito específico dado su ID
    async getCartProducts(cartId) {
        try {
            const carts = await this.getCarts();
            const cart = carts.find(c => c.id === cartId);
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }
            return cart.products;
        } catch (error) {
            throw new Error('Error al obtener productos del carrito');
        }
    }
}
module.exports.CartManager = CartManager;

