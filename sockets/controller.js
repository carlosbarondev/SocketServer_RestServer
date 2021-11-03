const { comprobarJWT } = require("../helpers");

const { ChatMensajes } = require('../models');

const chatMensajes = new ChatMensajes();

const socketController = async (socket, io) => {

    console.log('Servidor: Cliente conectado ', socket.id);

    //console.log(socket.handshake.headers['x-token']);

    const usuario = await comprobarJWT(socket.handshake.headers['x-token']);
    if (!usuario) {
        return socket.disconnect();
    }

    //console.log('Se conecto ', usuario.nombre);

    // Agregar el usuario conectado
    chatMensajes.conectarUsuario(usuario);
    io.emit('usuarios-activos', chatMensajes.usuariosArr);
    socket.emit('recibir-mensajes', chatMensajes.ultimos10);

    // Conectarlo a una sala especial
    socket.join(usuario.id); // Salas a las que se conecta el usuario: global(por defecto), socket.id(por defecto) y lo unimos tambien a usuario.id

    // Limpiar cuando alguien se desconecta
    socket.on('disconnect', () => {
        chatMensajes.desconectarUsuario(usuario.id);
        io.emit('usuarios-activos', chatMensajes.usuariosArr);
    });

    socket.on('enviar-mensaje', ({ uid, mensaje }) => {
        if (uid) {
            // Mensaje privado
            socket.to(uid).emit('mensaje-privado', { de: usuario.nombre, mensaje });
        } else {
            chatMensajes.enviarMensaje(usuario.id, usuario.nombre, mensaje);
            io.emit('recibir-mensajes', chatMensajes.ultimos10);
        }
    });

}

module.exports = {
    socketController
}