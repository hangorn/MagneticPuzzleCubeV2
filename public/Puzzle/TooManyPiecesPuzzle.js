/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: TooManyPiecesPuzzle.js
 *  Sinopsis: Clase del modelo que se encargará de la lógica de negocio del puzzle con demasiadas piezas.
 *  
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 18-04-2013
 *  Versión: 0.1
 *  */

/*
 *  CLASE TOOMANYPIECESPUZZLE
 *  */
function TooManyPiecesPuzzle(numC, mats) {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase TooManyPiecesPuzzle
	 * 
	 * @param Integer:numC
	 *            numero de cubos que tendra el puzzle, para simplicar se indicara mediante el número de cubos en una
	 *            dimensión, 27 (3x3x3) => 3.
	 * @param Material[]:mats
	 *            array con los materiales a usar para crear el puzzle
	 */

	Puzzle.call(this, numC, mats);

	// Creamos mas cubos para que sobren
	for (var i = 0; i < this.numberOfCubes * 2; i++) {
		// Calculamos unas secciones aletorias
		var sections = [];
		for (var j = 0; j < 6; j++) {
			if (this.numberOfCubes == 2) {
				sections.push(new THREE.Vector3(Math.round(Math.random()), Math.round(Math.random()), 0));
			} else if (this.numberOfCubes == 3) {
				sections.push(new THREE.Vector3(Math.floor(Math.random() * 3), Math.floor(Math.random() * 3), 0));
			}
		}
		// Calculamos las imagenes para cada cara de forma aleatoria y de manera que no se repita ninguna
		// Creamos un array con todos los posibles indeces de las imagenes
		var possImgs = [];
		for (var j = 0; j < this.numberOfCubes * 6; j++) {
			possImgs.push(j);
		}
		// Escogemos 6 imagenes de manera aletoria
		var randomImgs = [];
		for (var j = 0; j < 6; j++) {
			randomImgs.push(possImgs.splice(Math.floor(Math.random() * possImgs.length), 1)[0]);
		}
		var imgs;
		// Si hay imagenes repetidas
		if (this.repeated) {
			imgs = [];
			var found;
			for (var k = 0; k < data[i].imgs.length; k++) {
				found = false;
				for (var j = 0; j < this.repeatedIndex.length; j++) {
					if (randomImgs[k] == this.repeatedIndex[j][0]) {
						imgs.push(this.repeatedIndex[j][1]);
						found = true;
						break;
					}
				}

				if (!found) {
					imgs.push(randomImgs[k]);
				}
			}
		} else {
			imgs = randomImgs;
		}
		// Creamos el cubo
		var cube = new Cube(this.materials, this.cubeSize, imgs, sections, this.numberOfCubes);
		// Lo introducimos en el array de los cubos
		this.cubes.push(cube);
	}

	/*******************************************************************************************************************
	 * Métodos Privados
	 ******************************************************************************************************************/

}

/***********************************************************************************************************************
 * Heredamos de Puzzle
 **********************************************************************************************************************/
TooManyPiecesPuzzle.prototype = Object.create(Puzzle.prototype);
TooManyPiecesPuzzle.prototype.constructor = TooManyPiecesPuzzle;