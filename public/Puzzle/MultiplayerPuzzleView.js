/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: MultiplayerPuzzleView.js
 *  Sinopsis: Clase de la vista del puzzle.
 *  
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 06-05-2013
 *  Versión: 0.1
 *  */

/*
 *  CLASE MULTIPLAYERPUZZLEVIEW
 *  */
function MultiplayerPuzzleView(puzz, numC, finAct, mats, ty, iniPos, iniRot) {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	// Tipo de puzzle multijugador
	this.type;

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase MultiplayerPuzzleView
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
	 * @param Integer:type
	 *            tipo de puzzle multijugador.
	 * @param Vector3[]:iniPos
	 *            posiciones iniciales de los cubos, si no estan definidas nos encargaremos nosotros de crearlas.
	 * @param Vector3[]:iniRot
	 *            rotaciones iniciales de los cubos, si no estan definidas nos encargaremos nosotros de crearlas.
	 */

	this.type = ty;
	this.initialPositions = iniPos;
	this.initialRotations = iniRot;

	PuzzleView.call(this, puzz, numC, finAct, mats);

}

/***********************************************************************************************************************
 * Heredamos de PuzzleView
 **********************************************************************************************************************/
MultiplayerPuzzleView.prototype = Object.create(PuzzleView.prototype);
MultiplayerPuzzleView.prototype.constructor = MultiplayerPuzzleView;

/***********************************************************************************************************************
 * Métodos Protected (para usar herencia)
 **********************************************************************************************************************/

/**
 * Método para crear las posiciones iniciales iniciales que tendran los cubos
 */
MultiplayerPuzzleView.prototype.initInitialPositions = function() {
	// Si no estan de definidas las posiciones iniciales las creamos dependiendo del numero de cubos
	if (!this.initialPositions) {
		this.initialPositions = [];
		if (this.numberOfCubes == 3) {
			if (this.type == 2 || this.type == 3) {
				// Posiciones laterales izquierda
				for (var i = 0; i < 12; i++) {
					var v = new THREE.Vector3();
					v.x = (this.puzzle.getCubeSize() + this.separation)
							* (Math.floor(i / 6))
							+ (((Math.floor(i / 6)) < 2) ? -(this.puzzle.getPuzzleAreaSize() / 2 + (this.puzzle
									.getCubeSize() * 1.5 + this.separation * 3))
									: (this.puzzle.getPuzzleAreaSize() / 2 - this.puzzle.getCubeSize() * 1.5));
					v.y = (this.puzzle.getCubeSize() + this.separation) * (i % 6)
							- (this.separation + this.puzzle.getCubeSize()) * 5 / 2;
					this.initialPositions.push(v);
				}
				// Posiciones laterales derecha
				for (var i = 0; i < 12; i++) {
					var v = new THREE.Vector3();
					v.x = (this.puzzle.getCubeSize() + this.separation) * (Math.floor(i / 3))
							+ this.puzzle.getPuzzleAreaSize() / 2 + this.puzzle.getCubeSize();
					v.y = (this.puzzle.getCubeSize() + this.separation) * (i % 3)
							- (this.separation + this.puzzle.getCubeSize()) * 5 / 2;
					this.initialPositions.push(v);
				}
			} else {
				// Posiciones laterales
				for (var i = 0; i < 24; i++) {
					var v = new THREE.Vector3();
					v.x = (this.puzzle.getCubeSize() + this.separation)
							* (Math.floor(i / 6))
							+ (((Math.floor(i / 6)) < 2) ? -(this.puzzle.getPuzzleAreaSize() / 2 + (this.puzzle
									.getCubeSize() * 1.5 + this.separation * 3))
									: (this.puzzle.getPuzzleAreaSize() / 2 - this.puzzle.getCubeSize() * 1.5));
					v.y = (this.puzzle.getCubeSize() + this.separation) * (i % 6)
							- (this.separation + this.puzzle.getCubeSize()) * 5 / 2;
					this.initialPositions.push(v);
				}
			}
			// Posiciones inferiores
			for (var i = -1; i < 2; i++) {
				var v = new THREE.Vector3();
				v.x = (this.puzzle.getCubeSize() + this.separation * 2) * i;
				v.y = -(this.separation + this.puzzle.getCubeSize()) * 5 / 2;
				this.initialPositions.push(v);
			}
		} else {
			if (this.type == 2 || this.type == 3) {
				// Posiciones laterales izquierda
				for (var i = 0; i < 4; i++) {
					var v = new THREE.Vector3();
					v.x = (this.puzzle.getCubeSize() + this.separation)
							* (Math.floor(i / 4))
							+ (((Math.floor(i / 4)) < 1) ? -(this.puzzle.getPuzzleAreaSize() / 2 + (this.puzzle
									.getCubeSize() + this.separation)) : (this.puzzle.getPuzzleAreaSize() / 2));
					v.y = (this.puzzle.getCubeSize() + this.separation) * (i % 4)
							- (this.separation + this.puzzle.getCubeSize()) * 3 / 2;
					this.initialPositions.push(v);
				}
				// Posiciones laterales derecha
				for (var i = 0; i < 4; i++) {
					var v = new THREE.Vector3();
					v.x = (this.puzzle.getCubeSize() + this.separation) * (Math.floor(i / 2))
							+ this.puzzle.getPuzzleAreaSize() / 2 + this.puzzle.getCubeSize() / 2 + this.separation * 3;
					v.y = (this.puzzle.getCubeSize() + this.separation) * (i % 2)
							- (this.separation + this.puzzle.getCubeSize()) * 3 / 2;
					this.initialPositions.push(v);
				}
			} else {
				for (var i = 0; i < 8; i++) {
					var v = new THREE.Vector3();
					v.x = (this.puzzle.getCubeSize() + this.separation)
							* (Math.floor(i / 4))
							+ (((Math.floor(i / 4)) < 1) ? -(this.puzzle.getPuzzleAreaSize() / 2 + (this.puzzle
									.getCubeSize() + this.separation)) : (this.puzzle.getPuzzleAreaSize() / 2));
					v.y = (this.puzzle.getCubeSize() + this.separation) * (i % 4)
							- (this.separation + this.puzzle.getCubeSize()) * 3 / 2;
					this.initialPositions.push(v);
				}
			}
		}
		// Desordenamos el array
		Utils.shuffle(this.initialPositions);
	}
}

/**
 * Método para crear las rotaciones iniciales iniciales que tendran los cubos
 */
MultiplayerPuzzleView.prototype.initInitialRotations = function() {
	// Si no tenemos rotaciones iniciales creamos un array para guardarlas
	if (!this.initialRotations) {
		// Rellenamos las rotaciones iniciales con cantidades aleatorias entre 0 y 360 grados
		this.initialRotations = [];
		for (var i = 0; i < this.initialPositions.length; i++) {
			this.initialRotations[i] = new THREE.Vector3(Utils.roundAngle(Math.random() * Math.PI * 2), Utils
					.roundAngle(Math.random() * Math.PI * 2), 0);
		}
	}
}

/***********************************************************************************************************************
 * Métodos Publicos
 **********************************************************************************************************************/

/**
 * Método para obtener las posiciones iniciales de las piezas del puzzle
 */
MultiplayerPuzzleView.prototype.getInitialPositions = function() {
	return this.initialPositions;
}

/**
 * Método para obtener las rotaciones iniciales de las piezas del puzzle
 */
MultiplayerPuzzleView.prototype.getInitialRotations = function() {
	return this.initialRotations;
}

/**
 * Método para mover la pieza indicada del puzzle
 * 
 * @param Integer:ID
 *            ID de la pieza a mover.
 * @param Vector3:pos
 *            vector de 3 elementos con la nueva posición de la pieza.
 */
MultiplayerPuzzleView.prototype.movePiece = function(ID, pos) {
	this.puzzle.getPuzzleCubes()[ID - 1].position.copy(pos);
}

/**
 * Método para girar la pieza indicada del puzzle
 * 
 * @param Integer:ID
 *            ID de la pieza a girar.
 * @param Vector3:rot
 *            vector de 3 elementos con la nueva rotación de la pieza.
 */
MultiplayerPuzzleView.prototype.rotatePiece = function(ID, rot) {
	if (ID == 0) {
		this.puzzle.getPuzzle().rotation.copy(rot)
	} else {
		this.puzzle.getPuzzleCubes()[ID - 1].rotation.copy(rot);
	}
}

/**
 * Método para introducir una pieza en el puzzle
 * 
 * @param Integer:ID
 *            ID de la pieza a girar.
 * @param Vector3:pos
 *            vector de 3 elementos con la nueva posición de la pieza.
 * @param Vector3:rot
 *            vector de 3 elementos con la nueva rotación de la pieza.
 */
MultiplayerPuzzleView.prototype.putInPiece = function(ID, pos, rot) {
	var cube = this.puzzle.getPuzzleCubes()[ID - 1];
	// Colocamos el cubo en la posicion y rotacion indicadas
	cube.position.copy(pos);
	cube.rotation.copy(rot);
	// Introducimos la figura en el puzzle
	this.puzzle.getPuzzle().add(cube);
	// Reproducimos el sonido de pieza encajada en el puzzle
	if (!this.isDone) {
		if (this.puzzle.isLastCubeRigthPlaced()) {
			sound.playRigthPlaced();
		} else {
			sound.playWrongPlaced();
		}
	}
}

/**
 * Método para introducir una pieza en el puzzle
 * 
 * @param Integer:ID
 *            ID de la pieza a girar.
 * @param Vector3:pos
 *            vector de 3 elementos con la nueva posición de la pieza.
 * @param Vector3:rot
 *            vector de 3 elementos con la nueva rotación de la pieza.
 */
MultiplayerPuzzleView.prototype.putOutPiece = function(ID, pos, rot) {
	var cube = this.puzzle.getPuzzleCubes()[ID - 1];
	// Colocamos el cubo en la posicion y rotacion indicadas
	cube.position.copy(pos);
	cube.rotation.copy(rot);
	// Introducimos la figura en la escena, con lo cual se eliminara del puzzle
	scene.add(cube);
}

/**
 * Método para marcar una figura, para indicar que esta siendo usado por otro jugador.
 * 
 * @param Integer:ID
 *            figura a marcar.
 */
MultiplayerPuzzleView.prototype.markShape = function(ID) {
	// Si la figura a marcar es el puzzle
	if (ID == 0) {
		// Marcamos el puzzle como usado
		this.puzzle.getPuzzle().used = true;
		// Recorremos todos los cubos que esten en el puzzle y los marcamos
		for (var i = 0; i < this.puzzle.getPuzzle().children.length; i++) {
			var cube = this.puzzle.getPuzzle().children[i];
			// Si no tiene creada la marca la creamos
			if (cube.mark == undefined) {
				// Obtenemos el tamaño de los cubos
				var cubeSize = this.puzzle.getCubeSize();
				// Creamos un nuevo material para las figuras que indicaran lo que esta usando el otro jugador
				var mat = new THREE.MeshBasicMaterial({
					color : 0x00c0c0,
					transparent : true,
					opacity : 0.5
				});
				// Creamos una figura para indicar que el otro jugador esta usando un cubo
				var geom = new THREE.CubeGeometry(cubeSize + 10, cubeSize + 10, cubeSize + 10, 1, 1, 1);
				cube.mark = new THREE.Mesh(geom, mat);
			}
			// Mostramos la marca
			cube.add(cube.mark);
		}
	}
	// Si es una pieza del puzzle
	else {
		var cube = this.puzzle.getPuzzleCubes()[ID - 1];
		// Marcamos el cubo como usado
		cube.used = true;
		// Si no tiene creada la marca la creamos
		if (cube.mark == undefined) {
			// Obtenemos el tamaño de los cubos
			var cubeSize = this.puzzle.getCubeSize();
			// Creamos un nuevo material para las figuras que indicaran lo que esta usando el otro jugador
			var mat = new THREE.MeshBasicMaterial({
				color : 0x00c0c0,
				transparent : true,
				opacity : 0.5
			});
			// Creamos una figura para indicar que el otro jugador esta usando un cubo
			var geom = new THREE.CubeGeometry(cubeSize + 10, cubeSize + 10, cubeSize + 10, 1, 1, 1);
			cube.mark = new THREE.Mesh(geom, mat);
		}
		// Mostramos la marca
		cube.add(cube.mark);
	}

}

/**
 * Método para marcar una figura, para indicar que esta siendo usado por otro jugador.
 * 
 * @param Integer:ID
 *            figura a marcar.
 */
MultiplayerPuzzleView.prototype.unmarkShape = function(ID) {
	// Si la figura a marcar es el puzzle
	if (ID == 0) {
		// Marcamos el puzzle como no usado
		this.puzzle.getPuzzle().used = false;
		// Recorremos todos los cubos que esten en el puzzle y los desmarcamos
		for (var i = 0; i < this.puzzle.getPuzzle().children.length; i++) {
			var cube = this.puzzle.getPuzzle().children[i];
			// Si tiene creada la marca la ocultamos
			if (cube.mark != undefined) {
				cube.remove(cube.mark);
			}
		}
	}
	// Si es una pieza del puzzle
	else {
		var cube = this.puzzle.getPuzzleCubes()[ID - 1];
		// Marcamos el cubo como no usado
		cube.used = false;
		// Si tiene creada la marca la ocultamos
		if (cube.mark != undefined) {
			cube.remove(cube.mark);
		}
	}
}