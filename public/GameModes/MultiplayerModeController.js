/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: MultiplayerModeController.js
 *  Sinopsis: Clase del controlador del modo clásico.
 *  
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 06-05-2013
 *  Versión: 0.1
 *  */

/*
 *  CLASE MULTIPLAYERMODECONTROLLER
 *  */
function MultiplayerModeController(cont, numC, mats, cl, ty) {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	// Numero de piezas que tendra el puzzle
	var numberOfCubes;
	// Materiales con los que esta hecho el puzzle
	var materials;
	// Tipo de partida multijugador
	var type;

	// Reloj
	var clock;

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase MultiplayerModeController
	 * 
	 * @param HTMLElement:cont->
	 *            contendor con todos los elementos de la vista.
	 * @param Integer:numC
	 *            numero de cubos que tendra el puzzle, para simplicar se indicará mediante el número de cubos en una
	 *            dimensión, 27 (3x3x3) => 3.
	 * @param Material[]:mats
	 *            array con los materiales a usar para crear el puzzle.
	 * @param Clock:cl
	 *            objeto de la clase Clock con la que se cronometrará el tiempo.
	 */

	numberOfCubes = numC;
	materials = mats;
	clock = cl;
	type = ty;

	// Registramos el evento de la pulsación del boton de ir al menu
	cont.getElementsByTagName('form')[0].menu.addEventListener('click', onMenuClick, false);
	// Registramos el evento de la pulsación del boton de pausar
	cont.getElementsByTagName('form')[0].options.addEventListener('click', onOptionsClick, false);

	/*******************************************************************************************************************
	 * Métodos Privados
	 ******************************************************************************************************************/

	/**
	 * Manejador del evento de pulsación del botón de ir al menu principal
	 * 
	 * @param EventObject:event->
	 *            caracteristicas del evento lanzado.
	 */
	function onMenuClick(event) {
		// Confirmamos que se desea salir
		if (confirm('Esta seguro que desea salir?')) {
			mmv.hide();
			mv.showMenu(0);
			// Si el puzzle esta resuelto
			if (!mmv.isDone()) {
				socket.finishedGame();
			}
		}
	}

	/**
	 * Manejador del evento de pulsación del botón de opciones
	 * 
	 * @param EventObject:event->
	 *            caracteristicas del evento lanzado.
	 */
	function onOptionsClick(event) {
		// Eliminamos de la vista el actual modo de juego
		mmv.hide();
		// Mostramos el dialogo de opciones
		ov.show(function() {
			// Mostramos la vista del modo clasico
			mmv.show()
			// Actualizamos la opcion de ayuda con sonidos segun corresponda
			if (ov.getOptions().getAudioHelp()) {
				sound.enableHelpSound();
			} else {
				sound.disableHelpSound();
			}
		});
	}

	/*******************************************************************************************************************
	 * Métodos Públicos
	 ******************************************************************************************************************/
	/**
	 * Método que elimina el controlador. Lo único que hace es eliminar los manejadores de eventos que tiene registrados
	 */
	this.remove = function() {
		// Eliminamos los receptores de eventos de los botones
		cont.getElementsByTagName('form')[0].menu.removeEventListener('click', onMenuClick, false);
		cont.getElementsByTagName('form')[0].options.removeEventListener('click', onOptionsClick, false);
	}

	/**
	 * Método que habilita el controlador. Registra los eventos necesarios
	 */
	this.enable = function() {
		// Registramos los receptores de eventos de los botones
		cont.getElementsByTagName('form')[0].menu.addEventListener('click', onMenuClick, false);
		cont.getElementsByTagName('form')[0].options.addEventListener('click', onOptionsClick, false);
	}

}