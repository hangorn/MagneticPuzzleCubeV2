/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: Multiplayer.js
 *  Sinopsis: clase que se ejecutará en la parte del servidor, se encargará de
 *  toda la lógica de la partida multijugador.
 *
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 05-05-2013
 *  Versión: 0.1
 *  */

/*
 *  CLASE MULTIPLAYER
 *  */

function Multiplayer() {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	// Incluimos el modulo de constantes
	var constants = require('./Constants.js');

	// Partida que se esta jugando
	var game;
	// Tiempo en el que se inicio la partida
	var startTime;
	// Función de rellamada que será ejecutada cuando se resuelva el puzzle.
	var solvedAction;

	// Función que será ejecutada cuando se reciba un mensaje del host de la
	// partida,la guardamos para poder borrar su receptor de evento
	var onHostMessage;
	// Función que será ejecutada cuando se reciba un mensaje del cliente de la
	// partida,la guardamos para poder borrar su receptor de evento
	var onClientMessage;
	// Función que será ejecutada cuando un jugador resuelva una partida,
	// la guardamos para poder borrar su receptor de evento
	var onHostSolvedGame;
	// Función que será ejecutada cuando un jugador resuelva una partida,
	// la guardamos para poder borrar su receptor de evento
	var onClientMessage;

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase Multiplayer.
	 */

	/*******************************************************************************************************************
	 * Métodos Privados
	 ******************************************************************************************************************/

	/**
	 * Método para encargarse de los mensajes que lleguen de los cliente de la partida.
	 * 
	 * @param Client:client
	 *            cliente del que ha llegado un mensaje.
	 * @param Game:game
	 *            objeto game que contendrá los datos de la partida.
	 * @param String:message
	 *            mensaje recibido.
	 */
	function handleMessage(client, game, message) {
		// Dividimos el mensaje en las partes correspondientes
		var parts = message.split('#');
		// Si el mensaje no tiene cabecera y subcabecera no hacemos nada
		if (parts.length < 2) {
			return;
		}

		// Guardamos el cliente que no nos ha mandado el mensaje
		var otherClient = game.players.host == client ? game.players.client : game.players.host;

		// Decodificamos el mensaje
		switch (parts[0]) {
		// Mensaje del juego
		case 'g':
			switch (parts[1]) {
			// Pieza seleccionada
			case 's':
				// Si no se trata del modo cooperativo (contrareloj)
				if (!constants.isCooperativo(game.type)) {
					// Nos salimos, en el modo contrareloj no nos importan las piezas seleccionadas
					return;
				}
				// Si se ha seleccionado una pieza
				if (parts[3] == 1) {
					// Si la pieza seleccionada esta usada
					if (game.puzzle.isUsedCube(parseInt(parts[2]))) {
						// Le decimos al cliente que no puede usar esa pieza
						var messag = parts[0] + '#' + parts[1] + '#' + parts[2] + '#-1';
						client.socket.send(messag);
					}
					// Si la pieza seleccionada no esta usada
					else {
						// Marcamos el cubo como usado
						game.puzzle.setUsedCube(parseInt(parts[2]), true);
						// Le decimos al otro que se ha seleccionado una pieza
						otherClient.socket.send(message);
					}
				}
				// Si se ha deseleccionado una pieza
				else if (parts[3] == 0) {
					// Marcamos el cubo como usado
					game.puzzle.setUsedCube(parseInt(parts[2]), false);
					// Le decimos al otro que se ha seleccionado una pieza
					otherClient.socket.send(message);
				}
				break;
			// Pieza movida
			case 'm':
				// Guardamos la posicion de la pieza movida
				if (constants.isCooperativo(game.type)) {
					// Si es el tipo de partida cooperativa
					game.puzzle.setPosition(parts[2], parts[4], parts[5], parts[6]);
				} else {
					// Si es el tipo de partida contrareloj
					client.puzzle.setPosition(parts[2], parts[4], parts[5], parts[6]);
				}
				// Le comunicamos al otro cliente que el cliente ha movido una pieza
				otherClient.socket.send(message);
				break;
			// Pieza girada
			case 'r':
				// Guardamos la rotacion de la pieza girada
				if (constants.isCooperativo(game.type)) {
					// Si es el tipo de partida cooperativa
					game.puzzle.setRotation(parts[2], parts[4], parts[5], parts[6]);
				} else {
					// Si es el tipo de partida contrareloj
					client.puzzle.setRotation(parts[2], parts[4], parts[5], parts[6]);
				}
				// Le comunicamos al otro cliente que el cliente ha girado una pieza
				otherClient.socket.send(message);
				break;
			// Pieza introducida en el puzzle
			case 'p':
				// Si es el tipo de partida cooperativa
				if (constants.isCooperativo(game.type)) {
					// Guardamos la posicion y rotacion
					game.puzzle.setPosition(parts[2], parts[4], parts[5], parts[6]);
					game.puzzle.setRotation(parts[2], parts[7], parts[8], parts[9]);
					// Si la pieza ha sido introducida en el puzzle
					if (parts[3] == 1) {
						// Añadimos la figura al puzzle
						game.puzzle.addCube(parts[2]);
						// Si la pieza ha sido sacada del puzzle
					} else if (parts[3] == 0) {
						// Sacamos la figura del puzzle
						game.puzzle.removeCube(parts[2]);
					}
				}
				// Si es el tipo de partida contrareloj
				else {
					// Guardamos la posicion y rotacion
					client.puzzle.setPosition(parts[2], parts[4], parts[5], parts[6]);
					client.puzzle.setRotation(parts[2], parts[7], parts[8], parts[9]);
					// Si la pieza ha sido introducida en el puzzle
					if (parts[3] == 1) {
						// Añadimos la figura al puzzle
						client.puzzle.addCube(parts[2]);
						// Si la pieza ha sido sacada del puzzle
					} else if (parts[3] == 0) {
						// Sacamos la figura del puzzle
						client.puzzle.removeCube(parts[2]);
					}
				}
				otherClient.socket.send(message);
				break;
			}
			break;
		}
	}

	/**
	 * Método para encargarse de los mensajes que lleguen de los cliente de la partida.
	 * 
	 * @param Client:client
	 *            cliente que ha resuelto el puzzle.
	 * @param Game:game
	 *            objeto game que contendrá los datos de la partida.
	 * @param -Data:data
	 *            información recibida del cliente.
	 */
	function handleSolvedGame(client, game, data) {
		// Calculamos el tiempo que se ha tardado
		var time = Math.round(Date.now() / 1000) - startTime;
		// Si es el tipo de partida cooperativa
		if (constants.isCooperativo(game.type)) {
			// Comprobamos que el puzzle tiene introducidas todas la piezas
			if (!game.puzzle.isSolved()) {
				return;
			}
		}
		// Si es el tipo de partida contrareloj
		else {
			// Comprobamos que no se haya hallado ya un ganador
			if (game.players.client.winner || game.players.host.winner) {
				return;
			}
			// Comprobamos que el puzzle tiene introducidas todas la piezas
			if (!client.puzzle.isSolved()) {
				return;
			}
			// Marcamos a los jugadores como ganador y no ganador
			client.winner = true;
			(game.players.host == client ? game.players.client : game.players.host).winner = false;
		}

		// Le decimos a los dos jugadores que el puzzle ha sido resuelto
		game.players.host.socket.emit('onSolvedGame', {
			time : time,
			winner : game.players.host.winner
		});
		game.players.client.socket.emit('onSolvedGame', {
			time : time,
			winner : game.players.client.winner
		});

		// Ejecutamos la accion de puzzle resuelto
		solvedAction();
	}

	/*******************************************************************************************************************
	 * Métodos Públicos
	 ******************************************************************************************************************/

	/**
	 * Método para iniciar una partida en el servidor.
	 * 
	 * @param Game:g
	 *            objeto que contiene los datos del juego a iniciar.
	 * @param Callback:solAct
	 *            función de rellamada que será ejecutada cuando se resuelva el puzzle.
	 */
	this.startGame = function(g, solAct) {
		// Guardamos los datos del juego
		game = g;
		// Registramos el tiempo de inicio
		startTime = Math.round(Date.now() / 1000);
		// Calculamos el numero de cubos
		var numberOfCubes = (game.type % 2) + 2;

		// Si es el tipo de partida cooperativa
		if (constants.isCooperativo(game.type)) {
			// Creamos un puzzle pasandole el numero de cubos
			game.puzzle = require('./Puzzle.js');
			game.puzzle.createPuzzle(numberOfCubes);
			// Iniciamos la posicones y rotaciones iniciales de los cubos
			for (var i = 0; i < Math.pow(numberOfCubes, 3); i++) {
				game.puzzle.setPosition(i + 1, game.iniPos.x, game.iniPos.y, game.iniPos.z);
				game.puzzle.setRotation(i + 1, game.iniRot.x, game.iniRot.y, game.iniRot.z);
			}
		}
		// Si es el tipo de partida contrareloj
		else {
			// Indicamos que ninguno de los dos ha ganado la partida todavia
			game.players.host.winner = undefined;
			game.players.host.winner = undefined;
			// Creamos un puzzle para el host de la partida
			game.players.host.puzzle = require('./Puzzle.js');
			game.players.host.puzzle.createPuzzle(numberOfCubes);
			// Creamos un puzzle para el cliente de la partida
			game.players.client.puzzle = require('./Puzzle.js');
			game.players.client.puzzle.createPuzzle(numberOfCubes);
			// Iniciamos las posicones y rotaciones iniciales de los cubos de ambos puzzles
			for (var i = 0; i < Math.pow(numberOfCubes, 3); i++) {
				game.players.host.puzzle.setPosition(i + 1, game.iniPos.x, game.iniPos.y, game.iniPos.z);
				game.players.host.puzzle.setRotation(i + 1, game.iniRot.x, game.iniRot.y, game.iniRot.z);
				game.players.client.puzzle.setPosition(i + 1, game.iniPos.x, game.iniPos.y, game.iniPos.z);
				game.players.client.puzzle.setRotation(i + 1, game.iniRot.x, game.iniRot.y, game.iniRot.z);
			}
		}
		// Guardamos la accion que se ejecutara al resolver el puzzle
		solvedAction = solAct;

		// Registramos los eventos de recepcion de mensajes para ambos jugadores
		game.players.host.socket.on('message', onHostMessage = function(message) {
			handleMessage(game.players.host, game, message);
		});
		game.players.client.socket.on('message', onClientMessage = function(message) {
			handleMessage(game.players.client, game, message);
		});
		// Registramos los eventos de resolucion del puzzle
		game.players.host.socket.on('onSolvedGame', onHostSolvedGame = function(data) {
			handleSolvedGame(game.players.host, game, data);
		});
		game.players.client.socket.on('onSolvedGame', onClientSolvedGame = function(data) {
			handleSolvedGame(game.players.client, game, data);
		});
	}

	/**
	 * Método para terminar una partida en el servidor.
	 */
	this.finishGame = function() {
		// Borramos los receptores de los eventos de recepcion de mensajes para ambos jugadores
		game.players.host.socket.removeListener('message', onHostMessage);
		game.players.client.socket.removeListener('message', onClientMessage);
		// Borramos los receptores de los eventos de resolucion del puzzle
		game.players.host.socket.removeListener('onSolvedGame', onHostSolvedGame);
		game.players.client.socket.removeListener('onSolvedGame', onClientSolvedGame);
	}

	/**
	 * Método para obtener el identificador de la partida actual
	 */
	this.getID = function() {
		return game.ID;
	}

}

// Exportamos la clase para que pueda ser usada exteriormente en
// el lado del servidor
module.exports = Multiplayer;
