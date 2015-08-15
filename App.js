/*
 *  Copyright (c) 2013 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: index.js
 *  Sinopsis: archivo que se ejecutará en el servidor utilizando node.js, y con su framework Express.
 *  Se encarga de poner a punto el servidor y activar los sockets.
 *
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 28-04-2013
 *  Versión: 0.1
 *  */

/*******************************************************************************
 * Creamos tanto el servidor como los sockets
 ******************************************************************************/

var gameport;
var verbose = true;

var UUID = require('node-uuid');

var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var path = require('path');

var io = require('socket.io');

/*******************************************************************************
 * Ponemos en marcha el servidor
 ******************************************************************************/

// Comprobamos si estamos utilizando nodejitsu
if (process.env.SUBDOMAIN == 'magneticube') {
	gameport = 80;
} else {
	gameport = 8080;
}

// Hacemos que el servidor escuche en el puerto indicado
server.listen(gameport);
console.log('\t :: Express :: Listening on port ' + gameport);

// Todos los recursos se obtendran estaticamente del directorio publico
app.use(express.static(path.join(__dirname, 'public')));

/*******************************************************************************
 * Ponemos en marcha los sockets
 ******************************************************************************/

// Creamos una instancia de socket.io usando el servidor
var sio = io.listen(server);

// Configuramos los sockets
sio.configure(function() {
	// Mensajes en log: 0-error 1-warn 2-info 3-debug
	sio.set('log level', 2);
	// Permitimos que se conecte cualquiera
	sio.set('authorization', function(handshakeData, callback) {
		callback(null, true);
	});
});

/*******************************************************************************
 * Registramos el evento de conexion
 ******************************************************************************/

// Creamos el manejador del evento de conexion, es decir cuando se conecta un
// cliente
sio.sockets.on('connection', function(socket) {
	// Creamos un objeto cliente
	var client = {
		ID : UUID()
	};
	// Asignamos el socket al cliente correspondiente
	client.socket = socket;

	// Le indicamos al cliente que esta conectado con su ID
	client.socket.emit('onconnected', {
		id : client.ID
	});
	if (verbose) {
		console.log('\t socket.io:: player ' + client.ID + ' connected');
	}

	// Obtenemos el nucleo de la logica del servidor
	var server = require("./game/Server.js");

	/***************************************************************************
	 * Registramos los eventos que recibiremos del cliente
	 **************************************************************************/

	// Registramos el evento de partida creada
	socket.on('onCreateGame', function(data) {
		server.createGame(client, data.name, data.type, data.images,
				data.iniPos, data.iniRot);
	});

	// Registramos el evento de enviar todas las partidas disponibles al cliente
	socket.on('onGetGames', function(data) {
		server.sendGames(client);
	});

	// Registramos el evento de agregar un cliente al juego disponible
	// solicidado
	socket.on('onJoinGame', function(data) {
		server.joinClient(client, data.gameID);
	});

	// Registramos el evento de indicar que un cliente esta listo para jugar
	socket.on('onReadyToPlay', function(data) {
		server.readyToPlay(client);
	});

	// Registramos el evento de partida terminada
	socket.on('onFinishedGame', function(data) {
		server.finishGame(client, data.gameID);
	});

	// Evento de cliente desconectado
	socket.on('disconnect', function() {
		if (verbose) {
			console.log('\t socket.io:: disconnected client ' + client.ID);
		}
		server.saveLastScore(client);
		// Si el cliente esta en una partida y es el propietario de esta
		if (client.gameID) {
			server.finishGame(client, client.gameID);
		}
	});
	
	//TODO hacer esto con AJAX
	// Registramos el evento de enviar todos las puntuaciones del modo
	// solicitado al cliente
	socket.on('onGetScores', function(data) {
		server.sendScores(client, data.mode, data.submode);
	});

	// Registramos el evento guardar una puntuacion
	socket.on('onSaveScore', function(data) {
		server.saveScore(client, data);
	});
});
