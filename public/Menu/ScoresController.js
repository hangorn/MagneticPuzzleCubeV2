/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: ScoresController.js
 *  Sinopsis: Clase controlador que se encargará de manejar lo eventos de las puntuaciones.
 *  
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 12-05-2013
 *  Versión: 0.1
 *  */

/*
 *  CLASE SCORESCONTROLLER
 *  */
function ScoresController(cont, modesCont, submodes) {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase ScoresController
	 * 
	 * @param HTMLElement:cont
	 *            contenedor con todos los elementos de la vista.
	 * @param HTMLElement:modesCont
	 *            contenedor con las pestañas de los modos.
	 * @param HTMLElement[][]:submodes
	 *            array con los submodos.
	 */

	// Registramos los eventos de seleccion de los modos
	for (var i = 0; i < modesCont.getElementsByTagName('div').length; i++) {
		modesCont.getElementsByTagName('div')[i].addEventListener('click', onModeClick, false);
	}

	// Registramos los eventos de seleccion de los submodos
	for (var i = 0; i < submodes.length; i++) {
		for (var j = 0; j < submodes[i].length; j++) {
			submodes[i][j].addEventListener('click', onSubmodeClick, false);
		}
	}

	/*******************************************************************************************************************
	 * Métodos Privados
	 ******************************************************************************************************************/

	/**
	 * Manejador del evento de pulsación en un modo
	 * 
	 * @param EventObject:event->
	 *            caracteristicas del evento lanzado.
	 */
	function onModeClick(event) {
		// Mostramos el modo seleccionado
		sv.showMode(event.currentTarget.id);
	}

	/**
	 * Manejador del evento de pulsación en un submodo
	 * 
	 * @param EventObject:event->
	 *            caracteristicas del evento lanzado.
	 */
	function onSubmodeClick(event) {
		// Mostramos el modo seleccionado
		sv.showSubmode(event.currentTarget.id);
	}

	/*******************************************************************************************************************
	 * Métodos Públicos
	 ******************************************************************************************************************/

	/**
	 * Método que elimina el controlador. Lo único que hace es eliminar los manejadores de eventos que tiene registrados
	 */
	this.remove = function() {
		// Registramos los eventos de seleccion de los modos
		for (var i = 0; i < modesCont.getElementsByTagName('div').length; i++) {
			modesCont.getElementsByTagName('div')[i].removeEventListener('click', onModeClick, false);
		}

		// Registramos los eventos de seleccion de los submodos
		for (var i = 0; i < submodes.length; i++) {
			for (var j = 0; j < submodes[i].length; j++) {
				submodes[i][j].removeEventListener('click', onSubmodeClick, false);
			}
		}
	}

	/**
	 * Método que habilita el controlador. Registra los eventos necesarios
	 */
	this.enable = function() {
		// Registramos los eventos de seleccion de los modos
		for (var i = 0; i < modesCont.getElementsByTagName('div').length; i++) {
			modesCont.getElementsByTagName('div')[i].addEventListener('click', onModeClick, false);
		}

		// Registramos los eventos de seleccion de los submodos
		for (var i = 0; i < submodes.length; i++) {
			for (var j = 0; j < submodes[i].length; j++) {
				submodes[i][j].addEventListener('click', onSubmodeClick, false);
			}
		}
	}

}