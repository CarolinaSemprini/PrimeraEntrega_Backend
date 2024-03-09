//ProductManager.js

const fs = require("fs").promises;
const { createInterface } = require("readline");
const path = require('path');
const EventEmitter = require('events');

class ProductManager extends EventEmitter {
    constructor(filePath) {
        super();
        this.path = filePath;
        this.products = [];
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

    // Método que lee y parsea el contenido del archivo para obtener la lista de productos
    async getProducts() {
        try {
            const productList = await fs.readFile(this.path, "utf-8");
            const parsedList = JSON.parse(productList);
            return parsedList;
        } catch (error) {
            console.error("Error al obtener la lista de productos:", error);
            throw error;
        }
    }

    // Método que genera un nuevo ID para un producto
    async generateIds() {
        try {
            const products = await this.getProducts();
            const counter = products.length;
            return counter === 0 ? 1 : products[counter - 1].id + 1;
        } catch (error) {
            console.error("Error al generar IDs:", error);
            throw error;
        }
    }

    // Método para obtener un producto por su ID
    async getProductById(productId) {
        try {
            // Obtener la lista de productos
            const products = await this.getProducts();

            // Imprimir los IDs de los productos disponibles

            const availableProductIds = products.map(product => product.id);
            console.log("IDs de los productos disponibles:", products.map(product => product.id));

            // Buscar el producto por su ID
            const product = products.find(product => product.id === productId);

            // Imprimir el ID del producto que estás intentando agregar al carrito
            console.log("ID del producto que estás buscando:", productId);

            return product; // Devolver el producto encontrado
        } catch (error) {
            console.error("Error al obtener el producto por ID:", error);
            throw error;
        }
    }



    // Método que agrega un nuevo producto a la lista
    async addProduct(title, description, price, thumbnail, code, stock, status, category, thumbnails) {
        try {
            // Verifica que se proporcionen todos los datos del producto
            if (!title || !description || !price || !thumbnail || !code || !stock || !status || !category || !thumbnails) {
                console.error("Ingrese todos los datos del producto");
                return;
            }

            // Obtiene la lista actual de productos
            this.products = await this.getProducts();

            // Verifica si ya existe un producto con el mismo código
            const productFiltered = this.products.find(element => element.code == code);

            if (!productFiltered) {
                const id = await this.generateIds();

                // Crea un nuevo producto y lo agrega a la lista
                const newProduct = {
                    id,
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

                this.products.push(newProduct);

                // Guarda la lista actualizada en el archivo
                await fs.writeFile(this.path, JSON.stringify(this.products, null, 2), { encoding: 'utf-8' });

                console.log("Producto agregado:", newProduct);

                // Emitir evento 'productoAgregado' con los detalles del producto
                this.emit('productoAgregado', newProduct)

            } else {
                console.error("El código del producto ya existe");
            }
        } catch (error) {
            console.error("Error al agregar productos:", error);
            throw error;
        }
    }
    //actualizar el stock de un producto después de que se haya agregado al carrito
    async updateProductStock(productId, updatedStock) {
        try {
            const products = await this.getProducts(); // Obtener la lista de productos
            const updatedProducts = products.map(product => {
                if (product.id === productId) {
                    product.stock = updatedStock;
                }
                return product;
            });
            await this.saveProducts(updatedProducts); // Guardar los productos actualizados
        } catch (error) {
            console.error("Error al actualizar el stock del producto:", error);
            throw error;
        }
    }


    async saveProducts(products) {
        try {
            await fs.writeFile(this.path, JSON.stringify(products, null, 2), { encoding: 'utf-8' });
        } catch (error) {
            console.error("Error al guardar los productos:", error);
            throw error;
        }
    }
    // Método que busca un producto por código o da la opción de agregar uno nuevo y de actualizar
    async searchProductByCode() {
        try {
            const rl = createInterface({
                input: process.stdin,
                output: process.stdout
            });

            rl.question("Ingrese el código del producto que desea buscar, agregar, actualizar o eliminar: ", async (code) => {
                const product = await this.getProductByCode(code);

                if (product) {
                    console.log("Producto encontrado:", product);

                    rl.question("¿Desea actualizar la información de este producto? (Sí/No): ", async (answer) => {
                        if (answer.toLowerCase() === "si" || answer.toLowerCase() === "sí") {
                            await this.promptUpdateProduct(rl, product.id);
                        } else {
                            rl.question("¿Desea eliminar este producto? (Sí/No): ", async (deleteAnswer) => {
                                if (deleteAnswer.toLowerCase() === "si" || deleteAnswer.toLowerCase() === "sí") {
                                    await this.promptDeleteProduct(rl, product.id);
                                } else {
                                    rl.close();
                                    process.exit(0);
                                }
                            });
                        }
                    });
                } else {
                    console.log("No se encontró ningún producto con el código ingresado.");

                    rl.question("¿Desea agregar un nuevo producto? (Sí/No): ", async (answer) => {
                        if (answer.toLowerCase() === "si" || answer.toLowerCase() === "sí") {
                            await this.promptAddProduct(rl);
                        } else {
                            rl.question("¿Desea eliminar un producto? (Sí/No): ", async (answer) => {
                                if (answer.toLowerCase() === "si" || answer.toLowerCase() === "sí") {
                                    await this.promptDeleteProduct(rl);
                                } else {
                                    rl.close();
                                    process.exit(0);
                                }
                            });
                        }
                    });
                }
            });
        } catch (error) {
            console.error("Error al buscar producto por código:", error);
            throw error;
        }
    }

    // Agregar un método para actualizar la cantidad de un producto en el carrito
    async updateProductQuantity(productId, newQuantity) {
        try {
            const products = await this.getProducts();
            const updatedProducts = products.map(product => {
                if (product.id === productId) {
                    product.quantity = newQuantity;
                }
                return product;
            });
            await this.saveProducts(updatedProducts);
        } catch (error) {
            console.error("Error al actualizar la cantidad del producto en el carrito:", error);
            throw error;
        }
    }
    // Método que guía al usuario para agregar un nuevo producto interactivamente
    async promptAddProduct(rl) {
        rl.question("Ingrese el título del nuevo producto: ", async (title) => {
            rl.question("Ingrese la descripción del nuevo producto: ", async (description) => {
                rl.question("Ingrese el precio del nuevo producto: ", async (price) => {
                    rl.question("Ingrese la URL de la imagen del nuevo producto: ", async (thumbnail) => {
                        rl.question("Ingrese el código del nuevo producto: ", async (code) => {
                            rl.question("Ingrese el stock del nuevo producto: ", async (stock) => {
                                rl.question("Ingrese el status del nuevo producto: ", async (status) => {
                                    rl.question("Ingrese la categoría del nuevo producto: ", async (category) => {
                                        rl.question("Ingrese las rutas de las imágenes separadas por comas (o presione Enter para omitir): ", async (thumbnails) => {
                                            await this.addProduct(
                                                title,
                                                description,
                                                parseFloat(price),
                                                thumbnail,
                                                code,
                                                parseInt(stock),
                                                status,
                                                category,
                                                thumbnails.split(',').map(path => path.trim())
                                            );
                                            rl.close();
                                            process.exit(0);
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    // Método que guía al usuario para actualizar un producto existente
    async promptUpdateProduct(rl, productId) {
        try {
            const product = this.products.find(element => element.id === productId);

            if (!product) {
                console.error("No se encontró el producto para actualizar.");
                rl.close();
                process.exit(1);
            }

            rl.question("Ingrese el nuevo título del producto: ", async (title) => {
                rl.question("Ingrese la nueva descripción del producto: ", async (description) => {
                    rl.question("Ingrese el nuevo precio del producto: ", async (price) => {
                        rl.question("Ingrese la nueva URL de la imagen del producto: ", async (thumbnail) => {
                            rl.question("Ingrese el nuevo código del producto: ", async (code) => {
                                rl.question("Ingrese el nuevo stock del producto: ", async (stock) => {
                                    rl.question("Ingrese el nuevo status del producto: ", async (status) => {
                                        rl.question("Ingrese la nueva categoría del producto: ", async (category) => {
                                            rl.question("Ingrese las nuevas rutas de las imágenes separadas por comas (o presione Enter para omitir): ", async (thumbnails) => {
                                                const updatedFields = {
                                                    title,
                                                    description,
                                                    price: parseFloat(price),
                                                    thumbnail,
                                                    code,
                                                    stock: parseInt(stock),
                                                    status,
                                                    category,
                                                    thumbnails: thumbnails ? thumbnails.split(',').map(path => path.trim()) : []
                                                };

                                                await this.updateProduct(productId, updatedFields);

                                                console.log("Producto actualizado:", { id: productId, ...updatedFields });

                                                rl.close();
                                                process.exit(0);
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        } catch (error) {
            console.error("Error al solicitar actualización de producto:", error);
            throw error;
        }
    }

    // Método que obtiene un producto por código
    async getProductByCode(code) {
        try {
            this.products = await this.getProducts();

            const found = this.products.find(element => element.code === code);
            return found;
        } catch (error) {
            console.error("Error al obtener producto por código:", error);
            throw error;
        }
    }

    // Método que muestra todos los productos por consola
    async displayAllProducts() {
        try {
            this.products = await this.getProducts();
            console.log("Listado de Productos:");
            this.products.forEach(product => {
                console.log(`ID: ${product.id}, Título: ${product.title}, Código: ${product.code}`);
            });
        } catch (error) {
            console.error("Error al mostrar todos los productos:", error);
            throw error;
        }
    }

    // Método que actualiza la información de un producto
    async updateProduct(id, updatedFields) {
        try {
            this.products = await this.getProducts();

            const currentProductsList = this.products.map(elemento => {
                if (elemento.id === id) {
                    const updatedProduct = {
                        ...elemento,
                        ...updatedFields
                    };
                    return updatedProduct;
                } else {
                    return elemento;
                }
            });

            await fs.writeFile(this.path, JSON.stringify(currentProductsList, null, 2), { encoding: 'utf-8' });
        } catch (error) {
            console.error("Error al actualizar productos:", error);
            throw error;
        }
    }

    // Método que guía al usuario para eliminar un producto
    async promptDeleteProduct(rl) {
        rl.question("Ingrese el código del producto que desea eliminar: ", async (code) => {
            const product = await this.getProductByCode(code);

            if (product) {
                await this.deleteProduct(product.id);
                console.log("Producto eliminado:", product);
            } else {
                console.log("No existe un producto con el código proporcionado.");
            }

            rl.close();
            process.exit(0);
        });
    }

    // Método que elimina un producto por ID
    async deleteProduct(productId) {
        try {
            this.products = await this.getProducts();
            const updatedProducts = this.products.filter(product => product.id !== productId);
            await fs.writeFile(this.path, JSON.stringify(updatedProducts, null, 2), { encoding: 'utf-8' });
        } catch (error) {
            console.error("Error al eliminar producto:", error);
            throw error;
        }
    }


}

module.exports = {
    ProductManager
};

const ejecutar = async () => {
    try {
        const productManager = new ProductManager(path.join(__dirname, 'files/products.json'));

        // Muestra todos los productos por consola
        await productManager.displayAllProducts();

        // Inicia la búsqueda, agregado o actualización de productos por código
        await productManager.searchProductByCode();
    } catch (error) {
        console.error("Error general:", error);
    }
};

ejecutar();