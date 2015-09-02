/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: LevelsModeController.js
 *  Sinopsis: Clase del controlador del modo niveles.
 *  
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 14-04-2013
 *  Versión: 0.1
 *  */

/*
 *  CLASE LEVELSMODECONTROLLER
 *  */
function LevelsModeController(cont, l, mats, cl) {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	// Nivel actual
	var level;
	// Materiales con los que esta hecho el puzzle
	var materials;
	// Todos los materiales que se utilizarán en el modo de juego
	var allMaterials;

	// Reloj
	var clock;

	// Referencia a la ventana abierta
	var solWin;

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase LevelsModeController
	 * 
	 * @param HTMLElement:cont->
	 *            contendor con todos los elementos de la vista.
	 * @param Integer:l
	 *            entero que identificará el nivel con el que se comenzará.
	 * @param Material[]:mats
	 *            array con los materiales a usar para crear el puzzle.
	 * @param Clock:cl
	 *            objeto de la clase Clock con la que se cronometrará el tiempo.
	 */

	level = l;
	materials = mats;
	clock = cl;

	// Registramos el evento de la pulsación del boton de mostrar todas las soluciones
	cont.getElementsByTagName('form')[0].showSolutions.addEventListener('click', onShowSolutionsClick, false);
	// Registramos el evento de la pulsación del boton de pasar al siguiente nivel
	cont.getElementsByTagName('form')[0].next.addEventListener('click', onNextClick, false);
	// Registramos el evento de la pulsación del boton de pasar al nivel anterior
	cont.getElementsByTagName('form')[0].previous.addEventListener('click', onPreviousClick, false);
	// Registramos el evento de la pulsación del boton de ir al menu
	cont.getElementsByTagName('form')[0].menu.addEventListener('click', onMenuClick, false);
	// Registramos el evento de la pulsación del boton de reiniciar
	cont.getElementsByTagName('form')[0].restart.addEventListener('click', onRestartClick, false);
	// Registramos el evento de la pulsación del boton de pausar
	cont.getElementsByTagName('form')[0].options.addEventListener('click', onOptionsClick, false);
	// Registramos el evento de la pulsación del boton de pausar
	cont.getElementsByTagName('form')[0].pause.addEventListener('click', onPauseClick, false);

	/*******************************************************************************************************************
	 * Métodos Privados
	 ******************************************************************************************************************/

	/**
	 * Manejador del evento de pulsación del botón de mostrar todas las soluciones
	 * 
	 * @param EventObject:event->
	 *            caracteristicas del evento lanzado.
	 */
	function onShowSolutionsClick(event) {
		window.mats = materials;
		window.numC = Math.floor(materials.length / 6);
		window.sensitivity = ov.getOptions().getSensitivity();
		solWin = window.open("Solutions/solutionsWindow.html", "solutionsWindow", "width=300,height=" + window.screen.availHeight
				+ ",left=" + (window.screen.availWidth - 300));
	}

	/**
	 * Manejador del evento de pulsación del botón de pasar al nivel siguiente
	 * 
	 * @param EventObject:event->
	 *            caracteristicas del evento lanzado.
	 */
	function onNextClick(event) {
		// Confirmamos que se desea pasar al nivel siguiente
		if (confirm('Esta seguro que desea pasar al nivel siguiente?')) {
			lmv.nextLevel();
		}
	}

	/**
	 * Manejador del evento de pulsación del botón de pasar al nivel anterior
	 * 
	 * @param EventObject:event->
	 *            caracteristicas del evento lanzado.
	 */
	function onPreviousClick(event) {
		// Confirmamos que se desea pasar al nivel anterior
		if (confirm('Esta seguro que desea pasar al nivel anterior?')) {
			lmv.previousLevel();
		}
	}

	/**
	 * Manejador del evento de pulsación del botón de ir al menu principal
	 * 
	 * @param EventObject:event->
	 *            caracteristicas del evento lanzado.
	 */
	function onMenuClick(event) {
		// Confirmamos que se desea salir
		if (confirm('Esta seguro que desea salir?')) {
			lmv.hide();
			menuCtl.show(0);
		}
	}

	/**
	 * Manejador del evento de pulsación del botón de reiniciar el juego
	 * 
	 * @param EventObject:event->
	 *            caracteristicas del evento lanzado.
	 */
	function onRestartClick(event) {
		// Confirmamos que se desea reiniciar
		if (confirm('Esta seguro que desea reiniciar el nivel?')) {
			lmv.restartLevel();
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
		lmv.hide();
		// Mostramos el dialogo de opciones, indicandole la accion que tendra que hacer cuando se oculten las opciones
		ov.show(function() {
			// Mostramos la vista del modo supervivencia
			lmv.show()
			// Actualizamos la opcion de ayuda con sonidos segun corresponda
			if (ov.getOptions().getAudioHelp()) {
				sound.enableHelpSound();
			} else {
				sound.disableHelpSound();
			}
		});
	}

	/**
	 * Manejador del evento de pulsación del botón de pausa
	 * 
	 * @param EventObject:event->
	 *            caracteristicas del evento lanzado.
	 */
	function onPauseClick(event) {
		lmv.pause();
	}

	/*******************************************************************************************************************
	 * Métodos Públicos
	 ******************************************************************************************************************/
	/**
	 * Método que elimina el controlador. Lo único que hace es eliminar los manejadores de eventos que tiene registrados
	 */
	this.remove = function() {
		// Eliminamos los receptores de eventos de los botones
		cont.getElementsByTagName('form')[0].showSolutions.removeEventListener('click', onShowSolutionsClick, false);
		cont.getElementsByTagName('form')[0].next.removeEventListener('click', onNextClick, false);
		cont.getElementsByTagName('form')[0].previous.removeEventListener('click', onPreviousClick, false);
		cont.getElementsByTagName('form')[0].menu.removeEventListener('click', onMenuClick, false);
		cont.getElementsByTagName('form')[0].restart.removeEventListener('click', onRestartClick, false);
		cont.getElementsByTagName('form')[0].options.removeEventListener('click', onOptionsClick, false);
		cont.getElementsByTagName('form')[0].pause.removeEventListener('click', onPauseClick, false);
	}

	/**
	 * Método que habilita el controlador. Registra los eventos necesarios
	 */
	this.enable = function() {
		// Registramos los receptores de eventos de los botones
		cont.getElementsByTagName('form')[0].showSolutions.addEventListener('click', onShowSolutionsClick, false);
		cont.getElementsByTagName('form')[0].next.addEventListener('click', onNextClick, false);
		cont.getElementsByTagName('form')[0].previous.addEventListener('click', onPreviousClick, false);
		cont.getElementsByTagName('form')[0].menu.addEventListener('click', onMenuClick, false);
		cont.getElementsByTagName('form')[0].restart.addEventListener('click', onRestartClick, false);
		cont.getElementsByTagName('form')[0].options.addEventListener('click', onOptionsClick, false);
		cont.getElementsByTagName('form')[0].pause.addEventListener('click', onPauseClick, false);
	}

}