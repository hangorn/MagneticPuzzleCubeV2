/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: TooManyPiecesPuzzleView.js
 *  Sinopsis: Clase de la vista del puzzle con demasiadas piezas.
 *  
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 18-04-2013
 *  Versión: 0.1
 *  */

/*
 *  CLASE TOOMANYPIECESPUZZLEVIEW
 *  */
function TooManyPiecesPuzzleView(puzz, numC, finAct, mats) {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase TooManyPiecesPuzzleView
	 * 
	 * @param Puzzle:puzz
	 *            objeto de la clase puzzle con la logica
	 * @param Integer:numC
	 *            numero de cubos que tendra el puzzle, para simplicar se indicara mediante el número de cubos en una
	 *            dimensión, 27 (3x3x3) => 3.
	 * @param Material[]:mats
	 *            array con los materiales a usar para crear el puzzle.
	 * @param Callback:finAct
	 *            función de rellamada que se ejecutará al solucionar el puzzle.
	 */

	PuzzleView.call(this, puzz, numC, finAct, mats);
}

/***********************************************************************************************************************
 * Heredamos de PuzzleView
 **********************************************************************************************************************/
TooManyPiecesPuzzleView.prototype = Object.create(PuzzleView.prototype);
TooManyPiecesPuzzleView.prototype.constructor = TooManyPiecesPuzzleView;

/***********************************************************************************************************************
 * Métodos Protected (para usar herencia)
 **********************************************************************************************************************/

/**
 * Método para crear las posiciones iniciales que tendran los cubos
 */
TooManyPiecesPuzzleView.prototype.initInitialPositions = function() {
	// Creamos las posiciones iniciales dependiendo del numero de cubos
	if (this.numberOfCubes == 3) {
		// Posiciones laterales
		for (var i = 0; i < 30; i++) {
			var v = new THREE.Vector3();
			v.x = (this.puzzle.getCubeSize() + this.separation)
					* (Math.floor(i / 6))
					+ (((Math.floor(i / 6)) < 2) ? -(this.puzzle.getPuzzleAreaSize() / 2 + (this.puzzle.getCubeSize() * 1.5 + this.separation * 3))
							: (this.puzzle.getPuzzleAreaSize() / 2 - this.puzzle.getCubeSize() * 1.5));
			v.y = (this.puzzle.getCubeSize() + this.separation) * (i % 6)
					- (this.separation + this.puzzle.getCubeSize()) * 5 / 2;
			this.iniPos.push(v);
		}
		// Posiciones inferiores
		for (var i = -1; i < 2; i++) {
			var v = new THREE.Vector3();
			v.x = (this.puzzle.getCubeSize() + this.separation * 2) * i;
			v.y = -(this.separation + this.puzzle.getCubeSize()) * 5 / 2;
			this.iniPos.push(v);
		}
	} else {
		for (var i = 0; i < 12; i++) {
			var v = new THREE.Vector3();
			v.x = (this.puzzle.getCubeSize() + this.separation)
					* (Math.floor(i / 4))
					+ (((Math.floor(i / 4)) < 1) ? -(this.puzzle.getPuzzleAreaSize() / 2 + (this.puzzle.getCubeSize() + this.separation))
							: (this.puzzle.getPuzzleAreaSize() / 2));
			v.y = (this.puzzle.getCubeSize() + this.separation) * (i % 4)
					- (this.separation + this.puzzle.getCubeSize()) * 3 / 2;
			this.iniPos.push(v);
		}
	}
	// Desordenamos el array
	Utils.shuffle(this.iniPos);
}
