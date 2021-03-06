/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: Server.js
 *  Sinopsis: clase que se ejecutará en la parte del servidor, se encargará de
 *  toda la lógica del servidor: gestionar partidas, gestionar jugadores, ...
 *
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 28-04-2013
 *  Versión: 0.1
 *  */

/*
 *  CLASE SERVER
 *  */

Server = function() {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	// Incluimos el modulo UUID para asignar IDs a las partidas
	var UUID = require('node-uuid');
	// Incluimos el modulo de constantes
	var constants = require('./Constants.js');

	// Mapa con todos los juegos activos, como indice tendra el id del juego
	var games = {};
	// Objeto para el acceso a datos persistentes
	var dao;

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase Server
	 */

	/*******************************************************************************************************************
	 * Métodos Privados
	 ******************************************************************************************************************/

	/**
	 * Método que se ejecutará al resolver el puzzle.
	 * 
	 * @param Game:game
	 *            objeto de la clase Game con los datos de la partida.
	 */
	function solvedGame(game) {
		// Si no hay partida no hacemos nada
		if (!games[game.ID]) {
			return;
		}
		// Si hemos empezado la partida
		if (game.core != undefined) {
			// Terminamos la partida
			game.core.finishGame();
		}
		// Marcamos a los clientes como no preparados por si vuelven a jugar
		game.players.client.ready = false;
		game.players.host.ready = false;
		// Desasociamos los jugadores con sus partidas
		game.players.client.gameID = undefined;
		game.players.host.gameID = undefined;
		// Guardamos el ultimo jugador con el que ha jugado cada uno para luego guardar la puntuacion
		game.players.client.lastPartner = game.players.host;
		game.players.host.lastPartner = game.players.client;
		// Borramos la partida
		delete games[game.ID];
		console.log("game " + game.ID + " solved");
	}

	/*******************************************************************************************************************
	 * Métodos Públicos
	 ******************************************************************************************************************/

	/**
	 * Método para guardar una puntuación cuando empieze otra partida o se desconecte el cliente, si hay alguna
	 * puntuacion que guardar.
	 * 
	 * @param Client:client
	 *            objeto de la clase cliente con los datos del cliente que quiere desconectarse.
	 */
	this.saveLastScore = function(client) {
		// Si el cliente que se va a desconectar tiene un ultimo jugador con el que ha jugado y este ultimo jugador
		// quiere guardar la partida
		if (client.lastPartner != undefined && client.lastPartner.savingScore) {
			// Si no tenemos un DAO lo inicamos
			dao = dao || require('./dal/DataAccessObject.js');
			// Guardamos la puntuacion con el nombre anonimo
			var score = client.lastPartner.score;
			// Si no se trata del modo cooperativo (contrareloj)
			if (!constants.isCooperativo(score.submode)) {
				// Si el cliente que quiere guardar la puntuacion es el ganador lo ponemos primero, si no ponemos
				// primero al otro jugador
				if (client.winner) {
					score.name = "Anonimo#" + client.lastPartner.score.name;
				} else {
					score.name = client.lastPartner.score.name + "#Anonimo";
				}
			} else {
				// Si se trata del modo cooperativo
				score.name = client.lastPartner.score.name + "#Anonimo";
			}
			// Guardamos la puntuacion en la bb dd
			dao.saveScore(score);
			// Marcamos a ambos jugadores como que no quieren guardar la puntuacion
			client.savingScore = false;
			client.lastPartner.savingScore = false;
		}
	}

	/**
	 * Método para crear una partida en el servidor.
	 * 
	 * @param Client:client
	 *            objeto de la clase cliente con los datos del cliente que ha creado la partida.
	 * @param String:name
	 *            cadena con el nombre de la partida.
	 * @param Integer:type
	 *            entero que identificará el tipo de partida.
	 * @param String[]:images
	 *            array con cadenas de texto que representan las imágenes con las que se ha iniciado la partida
	 *            codificadas en base 64.
	 * @param Vector3[]:iniPos
	 *            posiciones iniciales de los cubos de la partida creada.
	 * @param Vector3[]:iniRot
	 *            rotaciones iniciales de los cubos de la partida creada.
	 */
	this.createGame = function(client, name, type, images, iniPos, iniRot) {
		// Creamos un objeto partida
		var game = {
			name : name,
			type : type,
			images : images,
			iniPos : iniPos,
			iniRot : iniRot
		};
		// Le asiganmos un ID
		game.ID = UUID.v4();
		// Guardamos los jugadores de la partida
		game.players = {};
		// Guardamos el jugador que ha creado la partida como host
		game.players.host = client;
		// Guardamos el jugador que se conectara como vacio
		game.players.client = null;
		// Guardamos la partida en el mapeo de partidas
		games[game.ID] = game;
		// Le indicamos al cliente en que juego esta
		client.gameID = game.ID;
		// Le indicamos al cliente que se ha creado la partida con su ID
		client.socket.emit('onCreatedGame', {
			gameID : game.ID
		});

		console.log("Game named: " + name + " type: " + type + " was created with ID: " + game.ID + " by the player "
				+ game.players.host.ID + " with " + game.images.length + " images.  We have " + games + " games");
	}

	/**
	 * Método para enviar al cliente la información de todas las partidas disponibles.
	 * 
	 * @param Client:client
	 *            objeto de la clase cliente con los datos del cliente que quiere recibir las partidas disponibles.
	 */
	this.sendGames = function(client) {
		// Buscamos los juegos disponibles
		var availableGames = [];
		for (gameId in games) {
			var game = games[gameId];
			// Si la partida solo tiene un jugador
			if (game.players.client == null) {
				availableGames.push({
					name : game.name,
					ID : game.ID,
					type : game.type
				});
			}
		}
		// Enviamos la respuesta con los datos al cliente
		client.socket.emit('onSentGames', {
			games : availableGames
		});
	}

	/**
	 * Método para unir un cliente a una partida disponible.
	 * 
	 * @param Client:client
	 *            objeto de la clase cliente con los datos del cliente que se quiere unir a la partida.
	 * @param String:gameID
	 *            ID del juego al que se quiere unir el cliente.
	 */
	this.joinClient = function(client, gameID) {
		// Si no se ha encontrado la partida o la partida ya se ha iniciado
		if (!games[gameID] || games[gameID].players.client) {
			// Registramos el evento para cuando se conecte a la partida, pero sin enviarle ninguna partida
			client.socket.emit('onJointGame', {
				game : undefined
			});
			return;
		}
		// Guardamos el juego al que se quiere conectar
		var game = games[gameID];
		// Guardamos el cliente como el cliente de la partida
		game.players.client = client;
		// Asignamos el juego al que esta jugando el cliente
		client.gameID = game.ID;
		// Guardamos los datos de la partida para enviarselos a los jugadores
		var gameData = {
			name : game.name,
			type : game.type,
			ID : game.ID,
			images : game.images,
			iniPos : game.iniPos,
			iniRot : game.iniRot,
			players : {
				host : {
					ID : game.players.host.ID
				},
				client : {
					ID : game.players.client.ID
				}
			}
		};

		// Le enviamos los datos de la partida al cliente que se desea unir a
		// esta
		client.socket.emit('onJointGame', {
			game : gameData
		});
		// Le decimos al host de la partida que ya hay un jugador disponible
		game.players.host.socket.emit('onJointClient', {});
	}

	/**
	 * Método para que un cliente se una a una partida disponible.
	 * 
	 * @param Client:client
	 *            objeto de la clase cliente con los datos del cliente que esta listo para jugar.
	 */
	this.readyToPlay = function(client) {
		// Si no encontramos la partida
		if (!games[client.gameID]) {
			return;
		}
		// Guardamos la partida
		var game = games[client.gameID];
		// Indicamos que el cliente esta listo
		client.ready = true;
		// Si el cliente es el host de la partida y el cliente de la partida ya esta listo o si el cliente es el cliente
		// de la partida y el host de la partida ya esta listo
		if ((game.players.host == client && game.players.client.ready)
				|| (game.players.client == client && game.players.host.ready)) {
			// Indicamos a ambos jugadores que los dos estan listos para empezar la partida
			game.players.host.socket.emit('onAllReady', {});
			game.players.client.socket.emit('onAllReady', {});
			// Miramos a ver si alguno de los dos jugadores tiene alguna puntuacion pendiente de guardar
			this.saveLastScore(game.players.client);
			this.saveLastScore(game.players.host);
			// Iniciamos la partida
			game.core = new (require('./Multiplayer.js'))();
			game.core.startGame(game, function() {
				solvedGame(game)
			});
		}
	}

	/**
	 * Método para terminar una partida en el servidor.
	 * 
	 * @param Client:client
	 *            objeto de la clase cliente con los datos del cliente que quiere borrar la partida.
	 * @param String:gameID
	 *            ID del juego que será terminado.
	 */
	this.finishGame = function(client, gameID) {
		// Si no encontramos la partida
		if (!games[gameID]) {
			return;
		}
		// Guardamos la partida
		var game = games[gameID];

		// Si hemos empezado la partida
		if (game.core) {
			// Terminamos la partida
			game.core.finishGame();
		}
		// Si la partida tiene dos jugadorres
		if (game.players.client && game.players.host) {
			// Marcamos a los clientes como no preparados por si vuelven a jugar
			game.players.client.ready = false;
			game.players.host.ready = false;
			// Si el que ha abandonado es el host de la partida
			if (client == game.players.host) {
				// Le decimos al cliente de la partida que se ha desconectado el host
				game.players.client.socket.emit('onOtherPlayerLeft', {});
				game.players.client.gameID = undefined;
				game.players.client = null;
			}
			// Si el que ha abandonado es el cliente de la partida
			if (client == game.players.client) {
				// Le decimos al host de la partida que se ha desconectado el cliente
				game.players.host.socket.emit('onOtherPlayerLeft', {});
				game.players.host.gameID = undefined;
				game.players.host = null;
			}
		}
		console.log("game " + game.ID + " finished");
		// Desasociamos el cliente con la partida
		client.gameID = undefined;
		// La borramos
		delete games[gameID];
	}

	/**
	 * Método para guardar una puntuación. Entradas:
	 * 
	 * @param Client:client
	 *            objeto de la clase cliente con los datos del cliente que quiere guardar una puntuación.
	 * @param Data:data->
	 *            objeto que contendrá los datos de la puntuación a guardar : nombre, puntuación, fecha, modo y submodo.
	 */
	this.saveScore = function(client, data) {
		// Si no tenemos un DAO lo inicamos
		dao = dao || require('../dal/DataAccessObject.js');
		// Si no se trata de un modo multijugador
		if (data.mode != constants.MODO_MULTIJUGADOR) {
			// Unicamente guardamos las puntuaciones
			dao.saveScore(data);
		} else {
			// Indicamos que quiere guardar una puntuacion
			client.savingScore = true;
			// Guardamos la puntuacion que quiere guardar el cliente
			client.score = data;
			// Si el ultimo compañero con el que se jugo ya quiere guardar la puntuacion
			if (client.lastPartner != undefined && client.lastPartner.savingScore == true) {
				// Guardamos los nombres de los jugadores
				var score = client.score;
				// Si no se trata del modo cooperativo (contrareloj)
				if (!constants.isCooperativo(score.submode)) {
					// Si el cliente que quiere guardar la puntuacion es el ganador lo ponemos primero, si no ponemos
					// primero al otro jugador
					if (client.winner) {
						score.name = client.score.name + '#' + client.lastPartner.score.name;
					} else {
						score.name = client.lastPartner.score.name + '#' + client.score.name;
					}
				} else {
					// Si se trata del modo cooperativo
					score.name = client.score.name + '#' + client.lastPartner.score.name;
				}
				// Guardamos la puntuacion en la bb dd
				dao.saveScore(score);
				// Marcamos a ambos jugadores como que no quieren guardar la puntuacion
				client.savingScore = false;
				client.lastPartner.savingScore = false;
			}
		}
	}

}

// Exportamos la clase servidor para que pueda ser usada exteriormente en
// el lado del servidor
module.exports = new Server();
