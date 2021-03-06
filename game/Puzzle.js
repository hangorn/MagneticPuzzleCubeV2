/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: Puzzle.js
 *  Sinopsis: Clase del lado del servidor que se encargará de la lógica del puzzle.
 *  
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 06-05-2013
 *  Versión: 0.1
 *  */

/*
 *  CLASE PUZZLE
 *  */
function Puzzle() {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	// Grupo de objetos que contendrá todas las piezas encajadas en el puzzle
	var group = [];
	// Numero de cubos que tendrá el puzzle
	var numberOfCubes;
	// Array con lo cubos que forman el puzzle
	var cubes = [];

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase Puzzle.
	 */

	/*******************************************************************************************************************
	 * Métodos Públicos
	 ******************************************************************************************************************/

	/**
	 * Método para crear un puzzle.
	 * 
	 * @param Integer:numC
	 *            numero de cubos que tendra el puzzle, para simplicar se indicara mediante el número de cubos en una
	 *            dimensión, 27 (3x3x3) => 3.
	 */
	this.createPuzzle = function(numC) {
		// Objeto con los datos de un cubo
		var Cube = function() {
			this.position = {
				x : 0,
				y : 0,
				z : 0
			};
			this.rotation = {
				x : 0,
				y : 0,
				z : 0
			};
		};

		// Guardamos el numero de cubos que tendra el cubo, comprobamos que sea correcto
		if (numC != 2 && numC != 3) {
			numberOfCubes = 3;
		} else {
			numberOfCubes = numC;
		}

		// Creamos los cubos
		for (var i = 0; i < numberOfCubes * numberOfCubes * numberOfCubes; i++) {
			// Creamos el cubo
			var cube = new Cube();
			// Guardamos un ID del cubo
			cube.ID = i + 1;
			cube.used = false;
			// Lo introducimos en el array de los cubos
			cubes.push(cube);
		}

		// Iniciamos los datos del grupo de objetos que contendra las piezas
		group.position = {
			x : 0,
			y : 0,
			z : 0
		};
		group.rotation = {
			x : 0,
			y : 0,
			z : 0
		};
		group.used = false;
		group.ID = 0;
	}

	/**
	 * Método para marcar un cubo como usado o no usado.
	 * 
	 * @param Integer:ID
	 *            entero que identifica al cubo que se quiere marcar como usado o no usado.
	 * @param Boolean:isUsed
	 *            booleano que indicará si el cubo esta o no usado.
	 */
	this.setUsedCube = function(ID, isUsed) {
		if (ID == 0) {
			group.used = isUsed;
		} else {
			cubes[ID - 1].used = isUsed;
		}
	}

	/**
	 * Método para saber si un cubo esta usado o no.
	 * 
	 * @param Integer:ID
	 *            entero que identifica al cubo que se quiere marcar como usado o no usado.
	 */
	this.isUsedCube = function(ID) {
		if (ID == 0) {
			return group.used;
		} else {
			return cubes[ID - 1].used;
		}
	}

	/**
	 * Método para añadir un cubo al puzzle. Entradas:
	 * 
	 * @param Integer:ID
	 *            entero que identifica al cubo que se quiere añadir al puzzle.
	 */
	this.addCube = function(ID) {
		group.push(cubes[ID - 1]);
	}

	/**
	 * Método para quitar un cubo del puzzle. Entradas:
	 * 
	 * @param Integer:ID
	 *            entero que identifica al cubo que se quiere quitar del puzzle.
	 */
	this.removeCube = function(ID) {
		for (var i = 0; i < group.length; i++) {
			if (group[i].ID == ID) {
				group.splice(i, 1);
				break;
			}
		}
	}

	/**
	 * Método para guardar la posición de un cubo.
	 * 
	 * @param Integer:ID
	 *            entero que identifica al cubo.
	 */
	this.setPosition = function(ID, posx, posy, posz) {
		if (ID > 0) {
			cubes[ID - 1].position.x = posx;
			cubes[ID - 1].position.y = posy;
			cubes[ID - 1].position.z = posz;
		}
	}

	/**
	 * Método para obtener la posición de un cubo.
	 * 
	 * @param Integer:ID
	 *            entero que identifica al cubo.
	 */
	this.getPosition = function(ID) {
		if (ID > 0) {
			return cubes[ID - 1].position;
		}
	}

	/**
	 * Método para guardar la rotación de un cubo.
	 * 
	 * @param Integer:ID
	 *            entero que identifica al cubo.
	 */
	this.setRotation = function(ID, rotx, roty, rotz) {
		if (ID == 0) {
			group.rotation.x = rotx;
			group.rotation.y = roty;
			group.rotation.z = rotz;
		} else {
			cubes[ID - 1].rotation.x = rotx;
			cubes[ID - 1].rotation.y = roty;
			cubes[ID - 1].rotation.z = rotz;
		}
	}

	/**
	 * Método para guardar la rotación de un cubo.
	 * 
	 * @param Integer:ID
	 *            entero que identifica al cubo.
	 */
	this.getRotation = function(ID) {
		if (ID == 0) {
			return group.rotation;
		} else {
			return cubes[ID - 1].rotation;
		}
	}

	/**
	 * Método para saber si un puzzle puede estar resuelto.
	 * 
	 * @returns Boolean booleano para indicar si un puzzle puede estar resuelto.
	 */
	this.isSolved = function() {
		// Si el puzzle no contiene todos los cubos
		if (group.length < numberOfCubes) {
			return false;
		} else {
			return true;
		}
	}

}

module.exports = new Puzzle();
