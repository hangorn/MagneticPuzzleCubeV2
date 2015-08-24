/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: Options.js
 *  Sinopsis: Clase del modelo que se encargará de la lógica de negocio para las opciones.
 *  
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 14-03-2013
 *  Versión: 0.2
 *  Fecha: 03-03-2013
 *  Versión: 0.1
 *  */

/*
 *  CLASE OPTIONS
 *  */
function Options(cont) {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	// Opción de sensibilidad del ratón en el giro
	var sensitivity;
	// Opción de ayuda con sonidos
	var audioHelp;
	// Botón izquierdo = 0
	// Botón central = 1
	// Botón derecho = 2
	// Opción para indicar el boton del ratón que se utilizará para mover
	var movButton;
	// Opción para indicar el boton del ratón que se utilizará para girar
	var rotButton;

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase OptionsView
	 */

	// Iniciamos las opciones a los valores por defecto
	sensitivity = 5;
	audioHelp = false;
	movButton = 0;
	rotButton = 2;

	/*******************************************************************************************************************
	 * Métodos Privados
	 ******************************************************************************************************************/

	/*******************************************************************************************************************
	 * Métodos Públicos
	 ******************************************************************************************************************/

	/**
	 * Método para cambiar el valor de la sensibilidad por el proporcionado
	 * 
	 * @param Float:sens
	 *            nueva sensivilidad que se guardará.
	 */
	this.setSensitivity = function(sens) {
		sensitivity = sens;
	}

	/**
	 * Método para obtener la opción de sensibilidad
	 * 
	 * @return Float sensibilidad actual.
	 */
	this.getSensitivity = function() {
		return sensitivity;
	}

	/**
	 * Método para cambiar el estado de la opción de ayuda con sonidos
	 * 
	 * @param Boolean:help
	 *            booleano que indica si se activará o no la ayuda con sonidos.
	 */
	this.setAudioHelp = function(help) {
		audioHelp = help;
	}

	/**
	 * Método para obtener el estado de la opción de ayuda con sonidos
	 * 
	 * @return Boolean booleano que indica si esta activada o no la ayuda con sonidos.
	 */
	this.getAudioHelp = function() {
		return audioHelp;
	}

	/**
	 * Método para cambiar el estado de la opción del botón de movimiento
	 * 
	 * @param Integer:button
	 *            índice que indicará el botón del ratón con el que se moverán las piezas. Botón izquierdo=0, Botón
	 *            central=1, Botón derecho=2.
	 */
	this.setMovOpt = function(button) {
		movButton = button;
	}

	/**
	 * Método para obtener el estado de la opción del botón de movimiento
	 * 
	 * @return Integer índice que indicará el botón del ratón con el que se moverán las piezas. Botón izquierdo=0, Botón
	 *         central=1, Botón derecho=2.
	 */
	this.getMovOpt = function() {
		return movButton;
	}

	/**
	 * Método para cambiar el estado de la opción del botón de rotación
	 * 
	 * @param Integer:button
	 *            índice que indicará el botón del ratón con el que se girarán las piezas. Botón izquierdo=0, Botón
	 *            central=1, Botón derecho=2.
	 */
	this.setRotOpt = function(button) {
		rotButton = button;
	}

	/**
	 * Método para obtener el estado de la opción del botón de rotación
	 * 
	 * @return Integer índice que indicará el botón del ratón con el que se girarán las piezas. Botón izquierdo=0, Botón
	 *         central=1, Botón derecho=2.
	 */
	this.getRotOpt = function() {
		return rotButton;
	}

}