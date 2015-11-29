/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: Options.js
 *  Sinopsis: Clase que se encargara de mantener los valores de las opciones.
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
function Options() {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	// Opción de sensibilidad del ratón en el giro
	this.sensitivity = 5;
	// Opción de ayuda con sonidos
	this.audioHelp = false;
	// Botón izquierdo = 0
	// Botón central = 1
	// Botón derecho = 2
	// Opción para indicar el boton del ratón que se utilizará para mover
	this.movButton = 0;
	// Opción para indicar el boton del ratón que se utilizará para girar
	this.rotButton = 2;

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase OptionsView
	 */

	/*******************************************************************************************************************
	 * Métodos Privados
	 ******************************************************************************************************************/

	/*******************************************************************************************************************
	 * Métodos Públicos
	 ******************************************************************************************************************/
}