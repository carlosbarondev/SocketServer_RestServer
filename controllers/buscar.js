const { response } = require("express");
const { ObjectId } = require('mongoose').Types;

const { Usuario, Categoria, Producto } = require('../models');

const coleccionesPermitidas = [
    'usuarios',
    'categorias',
    'productos',
    'roles'
];

const buscarUsuarios = async (termino = '', res = response) => {

    const esMongoID = ObjectId.isValid(termino); // TRUE

    if (esMongoID) {
        const usuario = await Usuario.findById(termino); // BUSQUEDA POR ID
        return res.json({
            results: (usuario) ? [usuario] : []
        });
    }

    const regex = new RegExp(termino, 'i'); // Insensible a mayusculas y minusculas

    const usuarios = await Usuario.find({ // BUSQUEDA POR NOMBRE O CORREO
        $or: [{ nombre: regex }, { correo: regex }],
        $and: [{ estado: true }]
    });

    const usuariosnum = await Usuario.count({ // BUSQUEDA POR NOMBRE O CORREO
        $or: [{ nombre: regex }, { correo: regex }],
        $and: [{ estado: true }]
    });

    res.json({
        num: usuariosnum,
        results: usuarios
    });

}

const buscarCategorias = async (termino = '', res = response) => {

    const esMongoID = ObjectId.isValid(termino); // TRUE

    if (esMongoID) {
        const categoria = await Categoria.findById(termino); // BUSQUEDA POR ID
        return res.json({
            results: (categoria) ? [categoria] : []
        });
    }

    const regex = new RegExp(termino, 'i'); // Insensible a mayusculas y minusculas

    const categorias = await Categoria.find({ nombre: regex, estado: true }); // BUSQUEDA POR NOMBRE O CORREO

    res.json({
        results: categorias
    });

}

const buscarProductos = async (termino = '', res = response) => {

    const esMongoID = ObjectId.isValid(termino); // TRUE

    if (esMongoID) {
        const producto = await Producto.findById(termino) // BUSQUEDA POR ID
            .populate('categoria', 'nombre')
            .populate('usuario', 'nombre');
        return res.json({
            results: (producto) ? [producto] : []
        });
    }

    const regex = new RegExp(termino, 'i'); // Insensible a mayusculas y minusculas

    const productos = await Producto.find({ nombre: regex, estado: true }) // BUSQUEDA POR NOMBRE O CORREO
        .populate('categoria', 'nombre')
        .populate('usuario', 'nombre');

    // {categoria: ObjectId('61753be725f769f9025d5b12')} BUSQUEDA POR CATEGORIA

    res.json({
        results: productos
    });

}

const buscar = (req, res = response) => {

    const { coleccion, termino } = req.params;

    if (!coleccionesPermitidas.includes(coleccion)) {
        return res.status(400).json({
            msg: `Las colecciones permitidas son: ${coleccionesPermitidas}`
        })
    }

    switch (coleccion) {
        case 'usuarios':
            buscarUsuarios(termino, res);
            break;
        case 'categorias':
            buscarCategorias(termino, res);
            break;
        case 'productos':
            buscarProductos(termino, res);
            break;
        default:
            res.status(500).json({
                msg: 'Se le olvido hacer esta búsqueda'
            })
            break;
    }

}

module.exports = {
    buscar
}