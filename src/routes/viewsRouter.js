const express = require('express');
const router = express.Router();

// Ruta raíz que renderiza la vista 'index'
router.get('/', (req, res) => {
    res.render('index');
});

module.exports = router;