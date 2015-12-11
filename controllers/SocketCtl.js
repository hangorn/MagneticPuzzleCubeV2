/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: SocketCtl.js
 *  Sinopsis: controlador de las acciones con los sockets
 *
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 23-08-2015
 *  Versión: 0.1
 *  */

/***********************************************************************************************************************
 * Evento de conexion
 **********************************************************************************************************************/

var UUID = require('node-uuid');
var verbose = true;

exports.onConnect =  function(socket) {
	// Creamos un objeto cliente
	var client = {
		ID : UUID.v4()
	};
	// Asignamos el socket al cliente correspondiente
	client.socket = socket;

	// Le indicamos al cliente que esta conectado con su ID
	client.socket.emit('onconnected', {
		id : client.ID
	});
	if (verbose) {
		console.log("\t socket.io:: player " + client.ID + " connected");
	}

	// Obtenemos el nucleo de la logica del servidor
	var server = require('../game/Server.js');

	/*******************************************************************************************************************
	 * Registramos los eventos que recibiremos del cliente
	 ******************************************************************************************************************/

	// Registramos el evento de partida creada
	socket.on('onCreateGame', function(data) {
		server.createGame(client, data.name, data.type, data.images, data.iniPos, data.iniRot);
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
			console.log("\t socket.io:: disconnected client " + client.ID);
		}
		server.saveLastScore(client);
		// Si el cliente esta en una partida y es el propietario de esta
		if (client.gameID) {
			server.finishGame(client, client.gameID);
		}
	});

	// Registramos el evento guardar una puntuacion
	socket.on('onSaveScore', function(data) {
		server.saveScore(client, data);
	});
};
