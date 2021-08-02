const Marcadores = require("./marcadores");

class Sockets {
    constructor(io) {
        this.io = io;

        this.marcadores = new Marcadores();

        this.socketEvents();
    }

    socketEvents() {
        // On connection
        this.io.on("connection", (socket) => {
            console.log("Cliente conectado!");

            // Marcadores activos para un nuevo cliente
            socket.emit("marcadores-activos", this.marcadores.activos);

            // Marcador nuevo para los clientes
            socket.on("marcador-nuevo", (marcador) => {
                this.marcadores.agregarMarcador(marcador);
                socket.broadcast.emit("marcador-nuevo", marcador);
            });

            // Marcador actualizado para los clientes
            socket.on("marcador-actualizado", (marcador) => {
                this.marcadores.actualizarMarcador(marcador);
                socket.emit("marcador-actualizado", marcador);
            });
        });
    }
}

module.exports = Sockets;
