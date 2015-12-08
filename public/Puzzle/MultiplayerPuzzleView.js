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
function MultiplayerPuzzleView(sce, numC, ty, mats, finAct, iniPos, iniRot) {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	// Escena en la que se mostrarán la vista
	var scene;

	// Objeto de la clase puzzle con el cual se realizara la logica de negocio
	var puzzle;
	// Numero de cubos que tendrá el puzzle
	var numberOfCubes;
	// Tipo de puzzle multijugador
	var type;
	// Posiciones iniciales
	var initialPositions;
	// Rotaciones iniciales
	var initialRotations;

	// Figura para representar que el otro jugador esta utilizando un cubo
	var usedCubeShape;
	// Figura para representar que el otro jugador esta utilizando el puzzle
	var usedPuzzleShape;

	// Linea para delimitar el area del puzzle
	var puzzleArea;

	// Función de rellamada que se ejecutará al solucionar el puzzle.
	var finishedAction;
	// Booleano para saber si el puzzle está resuelto
	var isDone = false;

	// Controlador
	var puzC;

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase MultiplayerPuzzleView
	 * 
	 * @param Scene:sce
	 *            escena en la que se representará el mundo 3D.
	 * @param Integer:numC
	 *            numero de cubos que tendra el puzzle, para simplicar se indicara mediante el número de cubos en una
	 *            dimensión, 27 (3x3x3) => 3.
	 * @param Integer:type
	 *            tipo de puzzle multijugador.
	 * @param Material[]:mats
	 *            array con los materiales a usar para crear el puzzle.
	 * @param Callback:finAct
	 *            función de rellamada que se ejecutará al solucionar el puzzle.
	 * @param Vector3[]:iniPos
	 *            posiciones iniciales de los cubos, si no estan definidas nos encargaremos nosotros de crearlas.
	 * @param Vector3[]:iniRot
	 *            rotaciones iniciales de los cubos, si no estan definidas nos encargaremos nosotros de crearlas.
	 */

	scene = sce;
	finishedAction = finAct;
	type = ty;

	// Guardamos el numero de cubos que tendra el cubo, comprobamos que sea correcto
	if (numC != 2 && numC != 3) {
		numberOfCubes = 3;
	} else {
		numberOfCubes = numC;
	}

	// Creamos el puzzle
	puzzle = new MultiplayerPuzzle(numberOfCubes, mats);

	// Si no estan de definidas las posiciones iniciales las creamos dependiendo del numero de cubos
	if (iniPos == undefined) {
		initialPositions = [];
		var separation = 50;
		if (numberOfCubes == 3) {
			if (type == 2 || type == 3) {
				// Posiciones laterales izquierda
				for (var i = 0; i < 12; i++) {
					var v = new THREE.Vector3();
					v.x = (puzzle.getCubeSize() + separation)
							* (Math.floor(i / 6))
							+ (((Math.floor(i / 6)) < 2) ? -(puzzle.getPuzzleAreaSize() / 2 + (puzzle.getCubeSize() * 1.5 + separation * 3))
									: (puzzle.getPuzzleAreaSize() / 2 - puzzle.getCubeSize() * 1.5));
					v.y = (puzzle.getCubeSize() + separation) * (i % 6) - (separation + puzzle.getCubeSize()) * 5 / 2;
					initialPositions.push(v);
				}
				// Posiciones laterales derecha
				for (var i = 0; i < 12; i++) {
					var v = new THREE.Vector3();
					v.x = (puzzle.getCubeSize() + separation) * (Math.floor(i / 3)) + puzzle.getPuzzleAreaSize() / 2
							+ puzzle.getCubeSize();
					v.y = (puzzle.getCubeSize() + separation) * (i % 3) - (separation + puzzle.getCubeSize()) * 5 / 2;
					initialPositions.push(v);
				}
			} else {
				// Posiciones laterales
				for (var i = 0; i < 24; i++) {
					var v = new THREE.Vector3();
					v.x = (puzzle.getCubeSize() + separation)
							* (Math.floor(i / 6))
							+ (((Math.floor(i / 6)) < 2) ? -(puzzle.getPuzzleAreaSize() / 2 + (puzzle.getCubeSize() * 1.5 + separation * 3))
									: (puzzle.getPuzzleAreaSize() / 2 - puzzle.getCubeSize() * 1.5));
					v.y = (puzzle.getCubeSize() + separation) * (i % 6) - (separation + puzzle.getCubeSize()) * 5 / 2;
					initialPositions.push(v);
				}
			}
			// Posiciones inferiores
			for (var i = -1; i < 2; i++) {
				var v = new THREE.Vector3();
				v.x = (puzzle.getCubeSize() + separation * 2) * i;
				v.y = -(separation + puzzle.getCubeSize()) * 5 / 2;
				initialPositions.push(v);
			}
		} else {
			if (type == 2 || type == 3) {
				// Posiciones laterales izquierda
				for (var i = 0; i < 4; i++) {
					var v = new THREE.Vector3();
					v.x = (puzzle.getCubeSize() + separation)
							* (Math.floor(i / 4))
							+ (((Math.floor(i / 4)) < 1) ? -(puzzle.getPuzzleAreaSize() / 2 + (puzzle.getCubeSize() + separation))
									: (puzzle.getPuzzleAreaSize() / 2));
					v.y = (puzzle.getCubeSize() + separation) * (i % 4) - (separation + puzzle.getCubeSize()) * 3 / 2;
					initialPositions.push(v);
				}
				// Posiciones laterales derecha
				for (var i = 0; i < 4; i++) {
					var v = new THREE.Vector3();
					v.x = (puzzle.getCubeSize() + separation) * (Math.floor(i / 2)) + puzzle.getPuzzleAreaSize() / 2
							+ puzzle.getCubeSize() / 2 + separation * 3;
					v.y = (puzzle.getCubeSize() + separation) * (i % 2) - (separation + puzzle.getCubeSize()) * 3 / 2;
					initialPositions.push(v);
				}
			} else {
				for (var i = 0; i < 8; i++) {
					var v = new THREE.Vector3();
					v.x = (puzzle.getCubeSize() + separation)
							* (Math.floor(i / 4))
							+ (((Math.floor(i / 4)) < 1) ? -(puzzle.getPuzzleAreaSize() / 2 + (puzzle.getCubeSize() + separation))
									: (puzzle.getPuzzleAreaSize() / 2));
					v.y = (puzzle.getCubeSize() + separation) * (i % 4) - (separation + puzzle.getCubeSize()) * 3 / 2;
					initialPositions.push(v);
				}
			}
		}
		// Desordenamos el array
		shuffle(initialPositions);
	} else {
		initialPositions = iniPos;
	}

	// Si no tenemos rotaciones iniciales creamos un array para guardarlas
	if (iniRot == undefined) {
		initialRotations = [];
	} else {
		initialRotations = iniRot;
	}

	// Colocamos las figuras en sus posiciones y rotaciones iniciales
	for (var i = 0; i < puzzle.getPuzzleCubes().length; i++) {
		puzzle.getPuzzleCubes()[i].position.copy(initialPositions[i]);
		if (iniRot == undefined) {
			puzzle.getPuzzleCubes()[i].rotation.x = roundAngle(Math.random() * Math.PI * 2);
			puzzle.getPuzzleCubes()[i].rotation.y = roundAngle(Math.random() * Math.PI * 2);
			initialRotations.push(new THREE.Vector3().copy(puzzle.getPuzzleCubes()[i].rotation));
		} else {
			puzzle.getPuzzleCubes()[i].rotation.copy(initialRotations[i]);
		}

		// Guardamos su colocacion inicial
		puzzle.getPuzzleCubes()[i].iniPos = initialPositions[i];
		puzzle.getPuzzleCubes()[i].iniRot = new THREE.Vector3().copy(puzzle.getPuzzleCubes()[i].rotation);
	}

	// Creamos un cuadrado para delimitar el area del puzzle
	var geometry = new THREE.Geometry();
	var vertice;
	vertice = new THREE.Vector3(-puzzle.getPuzzleAreaSize() / 2, -puzzle.getPuzzleAreaSize() / 2, 0);
	geometry.vertices.push(vertice);
	vertice = new THREE.Vector3(puzzle.getPuzzleAreaSize() / 2, -puzzle.getPuzzleAreaSize() / 2, 0);
	geometry.vertices.push(vertice);
	vertice = new THREE.Vector3(puzzle.getPuzzleAreaSize() / 2, puzzle.getPuzzleAreaSize() / 2, 0);
	geometry.vertices.push(vertice);
	vertice = new THREE.Vector3(-puzzle.getPuzzleAreaSize() / 2, puzzle.getPuzzleAreaSize() / 2, 0);
	geometry.vertices.push(vertice);
	vertice = new THREE.Vector3(-puzzle.getPuzzleAreaSize() / 2, -puzzle.getPuzzleAreaSize() / 2, 0);
	geometry.vertices.push(vertice);
	var puzzleArea = new THREE.Line(geometry, new THREE.LineBasicMaterial({
		color : 0xff0000
	}));

	// Añadimos todos los objetos a la escena
	// Añadimos los cubos a la escena
	for (var i = 0; i < puzzle.getPuzzleCubes().length; i++) {
		// Si no estan encajados en el puzzle
		if (puzzle.getPuzzleCubes()[i].parent != puzzle.getPuzzle()) {
			scene.add(puzzle.getPuzzleCubes()[i]);
		}
	}
	// Añadimos el puzzle
	scene.add(puzzle.getPuzzle());
	// Añadimos el indicador del area del puzzle
	scene.add(puzzleArea);

	// Creamos el controlador
	puzC = new MultiplayerPuzzleController(camera, scene, puzzle.getPuzzleCubes(), puzzle);

	/*******************************************************************************************************************
	 * Métodos Publicos
	 ******************************************************************************************************************/

	/**
	 * Método para girar la figura suministrada los angulos indicados en X e Y
	 * 
	 * @param Object3D:shape
	 *            figura a rotar.
	 * @param Float:rotX
	 *            angulo en radianes a rotar la figura en el eje X
	 * @param Float:rotY
	 *            angulo en radianes a rotar la figura en el eje Y
	 * @param Float:rotZ
	 *            angulo en radianes a rotar la figura en el eje Z
	 */
	this.rotateShape = function(shape, rotX, rotY, rotZ) {
		// Creamos una variable para guardar la figura que se va a girar
		var toRotate;
		// Si no recibimos la rotacion en el eje Z no giramos en el eje Z
		rotZ = rotZ || 0;

		// Comprobamos que la figura no esta en el puzzle
		if (shape.parent == puzzle.getPuzzle()) {
			toRotate = puzzle.getPuzzle();
		} else {
			toRotate = shape;
		}

		// Giramos la figura
		// Creamos una matriz temporal para hacer transformaciones
		var temp = new THREE.Matrix4();
		// Introducimos la nueva rotacion
		temp.setRotationFromEuler(new THREE.Vector3(rotX, rotY, rotZ));
		// La transformamos segun la rotacion de la figura
		toRotate.updateMatrix();
		temp.multiply(temp, toRotate.matrix);
		// Extraemos la rotacion de la matriz y la guardamos en el vector
		toRotate.rotation.setEulerFromRotationMatrix(temp);
	}

	/**
	 * Método para eliminar de la interfaz todos los elementos de la vista, ocultarlos
	 */
	this.hide = function() {
		// Quitamos los cubos a la escena
		for (var i = 0; i < puzzle.getPuzzleCubes().length; i++) {
			// Si no estan encajados en el puzzle
			if (puzzle.getPuzzleCubes()[i].parent != puzzle.getPuzzle()) {
				scene.remove(puzzle.getPuzzleCubes()[i]);
			}
		}
		// Quitamos el puzzle
		scene.remove(puzzle.getPuzzle());
		// Quitamos el indicador del area del puzzle
		scene.remove(puzzleArea);
		// Desactivamos el controlador asociado
		puzC.remove();
	}

	/**
	 * Método para mostrar la vista del puzzle
	 */
	this.show = function() {
		// Añadimos los cubos a la escena
		for (var i = 0; i < puzzle.getPuzzleCubes().length; i++) {
			// Si no estan encajados en el puzzle
			if (puzzle.getPuzzleCubes()[i].parent != puzzle.getPuzzle()) {
				scene.add(puzzle.getPuzzleCubes()[i]);
			}
		}
		// Añadimos el puzzle
		scene.add(puzzle.getPuzzle());
		// Añadimos el indicador del area del puzzle
		scene.add(puzzleArea);
		// Activamos el controlador asociado
		puzC.enable();
	}

	/**
	 * Método que será llamado cada vez que se inserte/encaje un cubo en el puzzle
	 * 
	 * @returns Boolean booleano que indicará si el puzzle ha sido resuelto al encajar la pieza
	 */
	this.cubeInserted = function() {
		isDone = false;
		// Si se han introducido todas las piezas en el puzzle y no se habia resuelto
		if (puzzle.getPuzzle().children.length == puzzle.getNumberOfCubes()) {
			if (puzzle.isSolved()) {
				finishedAction();
			}
		}
		if (!isDone) {
			if (puzzle.isLastCubeRigthPlaced()) {
				sound.playRigthPlaced();
			} else {
				sound.playWrongPlaced();
			}
		}
		return isDone;
	}

	/**
	 * Método para activar el controlador asociado a la vista
	 */
	this.enableController = function() {
		puzC.enable();
	}

	/**
	 * Método para desactivar el controlador asociado a la vista
	 */
	this.disableController = function() {
		puzC.remove();
	}

	/**
	 * Método para saber si el puzzle está resuelto
	 * 
	 * @returns Boolean booleano que indicará si el puzzle está resuelto
	 */
	this.isDone = function() {
		return isDone;
	}

	/**
	 * Método para indicar que el puzzle no se seguira resolviendo
	 */
	this.setDone = function() {
		isDone = true;
		puzC.setIsDone();
	}

	/**
	 * Método para obtener las posiciones iniciales de las piezas del puzzle
	 */
	this.getInitialPositions = function() {
		return initialPositions;
	}

	/**
	 * Método para obtener las rotaciones iniciales de las piezas del puzzle
	 */
	this.getInitialRotations = function() {
		return initialRotations;
	}

	/**
	 * Método para mover la pieza indicada del puzzle
	 * 
	 * @param Integer:ID
	 *            ID de la pieza a mover.
	 * @param Vector3:pos
	 *            vector de 3 elementos con la nueva posición de la pieza.
	 */
	this.movePiece = function(ID, pos) {
		puzzle.getPuzzleCubes()[ID - 1].position.copy(pos);
	}

	/**
	 * Método para girar la pieza indicada del puzzle
	 * 
	 * @param Integer:ID
	 *            ID de la pieza a girar.
	 * @param Vector3:rot
	 *            vector de 3 elementos con la nueva rotación de la pieza.
	 */
	this.rotatePiece = function(ID, rot) {
		if (ID == 0) {
			puzzle.getPuzzle().rotation.copy(rot)
		} else {
			puzzle.getPuzzleCubes()[ID - 1].rotation.copy(rot);
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
	this.putInPiece = function(ID, pos, rot) {
		var cube = puzzle.getPuzzleCubes()[ID - 1];
		// Colocamos el cubo en la posicion y rotacion indicadas
		cube.position.copy(pos);
		cube.rotation.copy(rot);
		// Introducimos la figura en el puzzle
		puzzle.getPuzzle().add(cube);
		// Reproducimos el sonido de pieza encajada en el puzzle
		if (!isDone) {
			if (puzzle.isLastCubeRigthPlaced()) {
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
	this.putOutPiece = function(ID, pos, rot) {
		var cube = puzzle.getPuzzleCubes()[ID - 1];
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
	this.markShape = function(ID) {
		// Si la figura a marcar es el puzzle
		if (ID == 0) {
			// Marcamos el puzzle como usado
			puzzle.getPuzzle().used = true;
			// Recorremos todos los cubos que esten en el puzzle y los marcamos
			for (var i = 0; i < puzzle.getPuzzle().children.length; i++) {
				var cube = puzzle.getPuzzle().children[i];
				// Si no tiene creada la marca la creamos
				if (cube.mark == undefined) {
					// Obtenemos el tamaño de los cubos
					var cubeSize = puzzle.getCubeSize();
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
			var cube = puzzle.getPuzzleCubes()[ID - 1];
			// Marcamos el cubo como usado
			cube.used = true;
			// Si no tiene creada la marca la creamos
			if (cube.mark == undefined) {
				// Obtenemos el tamaño de los cubos
				var cubeSize = puzzle.getCubeSize();
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
	this.unmarkShape = function(ID) {
		// Si la figura a marcar es el puzzle
		if (ID == 0) {
			// Marcamos el puzzle como no usado
			puzzle.getPuzzle().used = false;
			// Recorremos todos los cubos que esten en el puzzle y los desmarcamos
			for (var i = 0; i < puzzle.getPuzzle().children.length; i++) {
				var cube = puzzle.getPuzzle().children[i];
				// Si tiene creada la marca la ocultamos
				if (cube.mark != undefined) {
					cube.remove(cube.mark);
				}
			}
		}
		// Si es una pieza del puzzle
		else {
			var cube = puzzle.getPuzzleCubes()[ID - 1];
			// Marcamos el cubo como no usado
			cube.used = false;
			// Si tiene creada la marca la ocultamos
			if (cube.mark != undefined) {
				cube.remove(cube.mark);
			}
		}
	}

	/**
	 * Método para soltar una pieza que el jugador haya seleccionado
	 * 
	 * @param Integer:ID
	 *            ID de la pieza a girar.
	 */
	this.releasePiece = function(ID) {
		puzC.releasePiece(ID);
	}

}