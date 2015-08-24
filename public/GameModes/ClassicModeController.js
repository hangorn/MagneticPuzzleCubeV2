/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: ClassicModeController.js
 *  Sinopsis: Clase del controlador del modo clásico.
 *  
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 05-03-2013
 *  Versión: 0.4
 *  Fecha: 02-03-2013
 *  Versión: 0.3
 *  Fecha: 14-01-2013
 *  Versión: 0.2
 *  Fecha: 10-01-2013
 *  Versión: 0.1
 *  */

/*
 *  CLASE CLASSICMODECONTROLLER
 *  */
function ClassicModeController(cont, numC, mats, cl) {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	// Numero de piezas que tendra el puzzle
	var numberOfCubes;
	// Materiales con los que esta hecho el puzzle
	var materials;

	// Reloj
	var clock;

	// Referencia a la ventana abierta
	var solWin;
	// Flag para saber si se esta mostrando la solucion parcial
	var showingSolution = false;

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase ClassicModeController
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

	// Registramos el evento de la pulsación del boton de mostrar todas las soluciones
	cont.getElementsByTagName('form')[0].showSolutions.addEventListener('click', onShowSolutionsClick, false);
	// Registramos el evento de la pulsación del boton de mostrar la posible solución
	cont.getElementsByTagName('form')[0].showSolution.addEventListener('click', onShowSolutionClick, false);
	// Registramos el evento de la pulsación del boton de colocar una pieza en el puzzle
	cont.getElementsByTagName('form')[0].placeCube.addEventListener('click', onPlaceCubeClick, false);
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
		window.numC = numberOfCubes;
		window.sensitivity = ov.getOptions().getSensitivity();
		solWin = window.open("solutionsWindow.html", "solutionsWindow", "width=300,height=" + window.screen.availHeight
				+ ",left=" + (window.screen.availWidth - 300));
	}

	/**
	 * Manejador del evento de pulsación del botón de mostrar la posible solución
	 * 
	 * @param EventObject:event->
	 *            caracteristicas del evento lanzado.
	 */
	function onShowSolutionClick(event) {
		if (showingSolution) {
			pv.hideSolution();
			cont.getElementsByTagName('form')[0].showSolution.value = 'mostrar una posible solucion';
			showingSolution = false;
		} else {
			pv.showSolution();
			cont.getElementsByTagName('form')[0].showSolution.value = 'ocultar la posible solucion';
			showingSolution = true;
			clock.addTime(20);
		}
	}

	/**
	 * Manejador del evento de pulsación del botón de colocar una pieza en el puzzle
	 * 
	 * @param EventObject:event->
	 *            caracteristicas del evento lanzado.
	 */
	function onPlaceCubeClick(event) {
		pv.placeCube();
		clock.addTime(40);
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
			cmv.hide();
			mv.showMenu(0);
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
		if (confirm('Esta seguro que desea reiniciar?')) {
			// Eliminamos de la vista el actual modo de juego
			cmv.hide();
			// Creamos otro igual
			cmv = new ClassicModeView(scene, numberOfCubes, materials);
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
		cmv.hide();
		// Mostramos el dialogo de opciones
		ov.show(function() {
			// Mostramos la vista del modo clasico
			cmv.show()
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
		cmv.pause();
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
		cont.getElementsByTagName('form')[0].showSolution.removeEventListener('click', onShowSolutionClick, false);
		cont.getElementsByTagName('form')[0].placeCube.removeEventListener('click', onPlaceCubeClick, false);
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
		cont.getElementsByTagName('form')[0].showSolution.addEventListener('click', onShowSolutionClick, false);
		cont.getElementsByTagName('form')[0].placeCube.addEventListener('click', onPlaceCubeClick, false);
		cont.getElementsByTagName('form')[0].menu.addEventListener('click', onMenuClick, false);
		cont.getElementsByTagName('form')[0].restart.addEventListener('click', onRestartClick, false);
		cont.getElementsByTagName('form')[0].options.addEventListener('click', onOptionsClick, false);
		cont.getElementsByTagName('form')[0].pause.addEventListener('click', onPauseClick, false);
	}

}