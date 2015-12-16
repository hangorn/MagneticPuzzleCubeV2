/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: TooManyPiecesPuzzleController.js
 *  Sinopsis: Clase controlador que se encargará de manejar lo eventos en el puzzle con demasiadas piezas.
 *  
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 19-04-2013
 *  Versión: 0.1
 *  */

/*
 *  CLASE TOOMANYPIECESPUZZLECONTROLLER
 *  */
function TooManyPiecesPuzzleController(numC, finAct, mats) {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	// Flag para saber si esta activada la animación del movimiento de los cubos
	this.animationEnabled = false;

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase TooManyPiecesPuzzleController
	 * 
	 * @param Integer:numC
	 *            numero de cubos que tendra el puzzle, para simplicar se indicara mediante el número de cubos en una
	 *            dimensión, 27 (3x3x3) => 3.
	 * @param Material[]:mats
	 *            array con los materiales a usar para crear el puzzle.
	 * @param Callback:finAct
	 *            función de rellamada que se ejecutará al solucionar el puzzle.
	 */

	PuzzleController.call(this, numC, finAct, mats);

	/*******************************************************************************************************************
	 * Métodos Públicos
	 ******************************************************************************************************************/
}

/***********************************************************************************************************************
 * Heredamos de PuzzleController
 **********************************************************************************************************************/
TooManyPiecesPuzzleController.prototype = Object.create(PuzzleController.prototype);
TooManyPiecesPuzzleController.prototype.constructor = TooManyPiecesPuzzleController;

/***********************************************************************************************************************
 * Métodos Protected (para usar herencia)
 **********************************************************************************************************************/

/**
 * Realiza las operaciones necesarias para arrancar el puzzle
 * 
 * @param Integer:numC
 *            numero de cubos que tendra el puzzle, para simplicar se indicara mediante el número de cubos en una
 *            dimensión, 27 (3x3x3) => 3.
 * @param Callback:finAct
 *            función de rellamada que se ejecutará al solucionar el puzzle.
 * @param Material[]:mats
 *            array con los materiales a usar para crear el puzzle.
 * @param Callback:finAct
 *            función de rellamada que se ejecutará al solucionar el puzzle.
 * @param Boolean:col
 *            booleano que indicará si el puzzle es de colores, si no se ignorará.
 */
TooManyPiecesPuzzleController.prototype.init = function(numC, finAct, mats, col) {
	// Creamos el puzzle
	this.puzzle = new TooManyPiecesPuzzle(numC, mats, col);
	this.view = new TooManyPiecesPuzzleView(this.puzzle, numC, finAct, mats);
}