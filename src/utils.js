const multer = require('multer');
const path = require('path');

// Configuración de la carpeta de destino para los archivos subidos
const uploadDir = path.join(__dirname, 'public'); // Ruta de la carpeta 'public'

// Configuración del almacenamiento con Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // La carpeta de destino para los archivos subidos
    },
    filename: function (req, file, cb) {
        // Nombre de archivo único basado en la marca de tiempo actual
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname); // Extensión del archivo original
        cb(null, file.fieldname + '-' + uniqueSuffix + ext); // Nombre de archivo final
    }
});

// Crear el objeto uploader utilizando Multer
const uploader = multer({ storage: storage });

module.exports = uploader;