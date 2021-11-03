const { response } = require("express");
const { Categoria } = require('../models');

// obtenerCategorias - paginado - total - populate
const obtenerCategorias = async (req = request, res = response) => {

    const { limite = 5, desde = 0 } = req.query;
    const query = { estado: true }

    const [total, categorias] = await Promise.all([
        Categoria.countDocuments(query),
        Categoria.find(query)
            .skip(Number(desde))
            .limit(Number(limite))
            .populate("usuario", "nombre")
    ]);

    res.json({
        total,
        categorias
    });
}

// obtenerCategoria - populate {}
const obtenerCategoria = async (req = request, res = response) => {

    const query = { _id: req.params.id, estado: true }

    const categoria = await Categoria.find(query).populate("usuario", "nombre");

    if (categoria.length === 0) {
        return res.status(400).json({
            msg: `La categoria no existe`
        });
    }

    res.json({
        categoria
    });
}

const crearCategoria = async (req, res = response) => {

    const nombre = req.body.nombre.toUpperCase();

    const categoriaDB = await Categoria.findOne({ nombre });

    if (categoriaDB) {
        return res.status(400).json({
            msg: `La categoria ${categoriaDB.nombre}, ya existe`
        });
    }

    // Generar la data a guardar, excluyo que desde el front end me manden el estado por ejemplo
    const data = {
        nombre,
        usuario: req.usuario._id
    }

    const categoria = new Categoria(data);

    // Guardar DB
    await categoria.save();

    res.status(201).json(categoria);

}

// actualizarCategoria nombre
const actualizarCategoria = async (req = request, res = response) => {

    const { id } = req.params;
    const { estado, usuario, ...data } = req.body;

    data.nombre = data.nombre.toUpperCase();
    data.usuario = req.usuario._id;

    const categoria = await Categoria.findByIdAndUpdate(id, data, { new: true }); // new devuelve la respuesta actualizada

    res.json(categoria);
}

// borrarCategoria - estado: false
const borrarCategoria = async (req = request, res = response) => {

    const { id } = req.params;

    // Borrado fisico
    // const usuario = await Usuario.findByIdAndDelete(id);

    const categoriaBorrada = await Categoria.findByIdAndUpdate(id, { estado: false }, { new: true });
    const usuarioAutenticado = req.usuario; // Viene de validar-jwt.js por referencia

    res.json({
        categoriaBorrada,
        usuarioAutenticado
    });
}

module.exports = {
    obtenerCategorias,
    obtenerCategoria,
    crearCategoria,
    actualizarCategoria,
    borrarCategoria
}