/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: ColoredPuzzleController.js
 *  Sinopsis: Clase del controlador del puzzle de colores.
 *  
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 17-04-2013
 *  Versión: 0.1
 *  */

/*
 *  CLASE COLOREDPUZZLECONTROLLER
 *  */
function ColoredPuzzleController(numC, finAct) {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	// Array con los materiales de colores
	this.coloredMaterials;

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase PuzzleView
	 * 
	 * @param Integer:numC
	 *            numero de cubos que tendra el puzzle, para simplicar se indicara mediante el número de cubos en una
	 *            dimensión, 27 (3x3x3) => 3.
	 * @param Callback:finAct
	 *            función de rellamada que se ejecutará al solucionar el puzzle.
	 */

	// Creamos los materiales de colores
	var colors = [ 0xff0000, 0xffff00, 0x00c000, 0x0080ff, 0xff00ff, 0x804000, 0xff8000, 0xffc000, 0x005000, 0x00ffff,
			0x8000ff, 0x000000, 0x800000, 0x808000, 0x80ff00, 0x0000ff, 0xff8080, 0x808080 ];
	var materials = [];
	for (var i = 0; i < numC * 6; i++) {
		materials.push(new THREE.MeshBasicMaterial({
			color : colors[i]
		}));
	}

	// Llamamos al constructor de PuzzleView para heredar todos sus metodos y atributos
	PuzzleController.call(this, numC, finAct, materials, true);

	this.coloredMaterials = materials;

	/*******************************************************************************************************************
	 * Métodos Públicos
	 ******************************************************************************************************************/

}

/***********************************************************************************************************************
 * Heredamos de PuzzleController
 **********************************************************************************************************************/
ColoredPuzzleController.prototype = Object.create(PuzzleController.prototype);
ColoredPuzzleController.prototype.constructor = ColoredPuzzleController;

/***********************************************************************************************************************
 * Métodos Protected (para usar herencia)
 **********************************************************************************************************************/

/**
 * Método que devuelve un array con los materiales de colores que formarán el puzzle
 * 
 * @returns Material[] array con los materiales de colores que formarán el puzzle.
 */
ColoredPuzzleController.prototype.getMaterials = function() {
	return this.coloredMaterials;
}