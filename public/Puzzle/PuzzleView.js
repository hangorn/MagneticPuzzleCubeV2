/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: PuzzleView.js
 *  Sinopsis: Clase de la vista del puzzle.
 *  
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 19-02-2013
 *  Versión: 0.3
 *  Fecha: 10-01-2013
 *  Versión: 0.2
 *  Fecha: 09-01-2013
 *  Versión: 0.1
 *  */

/*
 *  CLASE PUZZLEVIEW
 *  */
function PuzzleView(puzz, numberOfCubes, finAct, mats) {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	// Objeto de la clase puzzle con el cual se realizara la logica de negocio
	this.puzzle;
	// Posiciones iniciales
	this.iniPos = [];

	// Solucion que se mostrara si el usuario lo indica
	this.solution = undefined;

	// Linea para delimitar el area del puzzle
	this.puzzleArea;

	// Función de rellamada que se ejecutará al solucionar el puzzle.
	this.finishedAction;
	// Booleano para saber si el puzzle está resuelto
	this.isDone = false;

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase PuzzleView
	 * 
	 * @param Integer:numC
	 *            numero de cubos que tendra el puzzle, para simplicar se indicara mediante el número de cubos en una
	 *            dimensión, 27 (3x3x3) => 3.
	 * @param Material[]:mats
	 *            array con los materiales a usar para crear el puzzle.
	 * @param Callback:finAct
	 *            función de rellamada que se ejecutará al solucionar el puzzle.
	 */

	this.finishedAction = finAct;
	this.puzzle = puzz;

	// Creamos las posiciones iniciales dependiendo del numero de cubos
	var separation = 50;
	if (numberOfCubes == 3) {
		// Posiciones laterales
		for (var i = 0; i < 24; i++) {
			var v = new THREE.Vector3();
			v.x = (this.puzzle.getCubeSize() + separation)
					* (Math.floor(i / 6))
					+ (((Math.floor(i / 6)) < 2) ? -(this.puzzle.getPuzzleAreaSize() / 2 + (this.puzzle.getCubeSize() * 1.5 + separation * 3))
							: (this.puzzle.getPuzzleAreaSize() / 2 - this.puzzle.getCubeSize() * 1.5));
			v.y = (this.puzzle.getCubeSize() + separation) * (i % 6) - (separation + this.puzzle.getCubeSize()) * 5 / 2;
			this.iniPos.push(v);
		}
		// Posiciones inferiores
		for (var i = -1; i < 2; i++) {
			var v = new THREE.Vector3();
			v.x = (this.puzzle.getCubeSize() + separation * 2) * i;
			v.y = -(separation + this.puzzle.getCubeSize()) * 5 / 2;
			this.iniPos.push(v);
		}
	} else {
		for (var i = 0; i < 8; i++) {
			var v = new THREE.Vector3();
			v.x = (this.puzzle.getCubeSize() + separation)
					* (Math.floor(i / 4))
					+ (((Math.floor(i / 4)) < 1) ? -(this.puzzle.getPuzzleAreaSize() / 2 + (this.puzzle.getCubeSize() + separation))
							: (this.puzzle.getPuzzleAreaSize() / 2));
			v.y = (this.puzzle.getCubeSize() + separation) * (i % 4) - (separation + this.puzzle.getCubeSize()) * 3 / 2;
			this.iniPos.push(v);
		}
	}
	// Desordenamos el array
	Utils.shuffle(this.iniPos);

	// Colocamos las figuras en sus posiciones iniciales
	for (var i = 0; i < this.puzzle.getPuzzleCubes().length; i++) {
		this.puzzle.getPuzzleCubes()[i].position.copy(this.iniPos[i]);
		this.puzzle.getPuzzleCubes()[i].rotation.x = Utils.roundAngle(Math.random() * Math.PI * 2);
		this.puzzle.getPuzzleCubes()[i].rotation.y = Utils.roundAngle(Math.random() * Math.PI * 2);
		// Guardamos su colocacion inicial
		this.puzzle.getPuzzleCubes()[i].iniPos = this.iniPos[i];
		this.puzzle.getPuzzleCubes()[i].iniRot = new THREE.Vector3().copy(this.puzzle.getPuzzleCubes()[i].rotation);
	}

	// Creamos un cuadrado para delimitar el area del puzzle
	var geometry = new THREE.Geometry();
	var vertice;
	vertice = new THREE.Vector3(-this.puzzle.getPuzzleAreaSize() / 2, -this.puzzle.getPuzzleAreaSize() / 2, 0);
	geometry.vertices.push(vertice);
	vertice = new THREE.Vector3(this.puzzle.getPuzzleAreaSize() / 2, -this.puzzle.getPuzzleAreaSize() / 2, 0);
	geometry.vertices.push(vertice);
	vertice = new THREE.Vector3(this.puzzle.getPuzzleAreaSize() / 2, this.puzzle.getPuzzleAreaSize() / 2, 0);
	geometry.vertices.push(vertice);
	vertice = new THREE.Vector3(-this.puzzle.getPuzzleAreaSize() / 2, this.puzzle.getPuzzleAreaSize() / 2, 0);
	geometry.vertices.push(vertice);
	vertice = new THREE.Vector3(-this.puzzle.getPuzzleAreaSize() / 2, -this.puzzle.getPuzzleAreaSize() / 2, 0);
	geometry.vertices.push(vertice);
	this.puzzleArea = new THREE.Line(geometry, new THREE.LineBasicMaterial({
		color : 0xff0000
	}));

	// Añadimos todos los objetos a la escena
	// Añadimos los cubos a la escena
	for (var i = 0; i < this.puzzle.getPuzzleCubes().length; i++) {
		// Si no estan encajados en el puzzle
		if (this.puzzle.getPuzzleCubes()[i].parent != this.puzzle.getPuzzle()) {
			scene.add(this.puzzle.getPuzzleCubes()[i]);
		}
	}
	// Añadimos el puzzle
	scene.add(this.puzzle.getPuzzle());
	// Añadimos el indicador del area del puzzle
	scene.add(this.puzzleArea);

}
PuzzleView.prototype.constructor = PuzzleView;

/***********************************************************************************************************************
 * Métodos Protected (para usar herencia)
 **********************************************************************************************************************/

/*******************************************************************************************************************
 * Métodos Publicos
 ******************************************************************************************************************/

/**
 * Método para eliminar de la interfaz todos los elementos de la vista, ocultarlos
 */
PuzzleView.prototype.hide = function() {
	// Quitamos los cubos a la escena
	for (var i = 0; i < this.puzzle.getPuzzleCubes().length; i++) {
		// Si no estan encajados en el puzzle
		if (this.puzzle.getPuzzleCubes()[i].parent != this.puzzle.getPuzzle()) {
			scene.remove(this.puzzle.getPuzzleCubes()[i]);
		}
	}

	// Quitamos el puzzle
	scene.remove(this.puzzle.getPuzzle());

	// Si se esta mostrando la solucion la ocultamos
	if (this.solution != undefined) {
		scene.remove(this.solution);
	}

	// Quitamos el indicador del area del puzzle
	scene.remove(this.puzzleArea);
}

/**
 * Método para mostrar la vista del puzzle
 */
PuzzleView.prototype.show = function() {
	// Añadimos los cubos a la escena
	for (var i = 0; i < this.puzzle.getPuzzleCubes().length; i++) {
		// Si no estan encajados en el puzzle
		if (this.puzzle.getPuzzleCubes()[i].parent != this.puzzle.getPuzzle()) {
			scene.add(this.puzzle.getPuzzleCubes()[i]);
		}
	}

	// Añadimos el puzzle
	scene.add(this.puzzle.getPuzzle());

	// Si se esta mostrando la solucion la ocultamos
	if (this.solution != undefined) {
		scene.add(this.solution);
	}

	// Añadimos el indicador del area del puzzle
	scene.add(this.puzzleArea);
}

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
PuzzleView.prototype.rotateShape = function(shape, rotX, rotY, rotZ) {
	// Creamos una variable para guardar la figura que se va a girar
	var toRotate;
	// Si no recibimos la rotacion en el eje Z no giramos en el eje Z
	rotZ = rotZ || 0;

	// Comprobamos que la figura no esta en el puzzle
	if (shape.parent == this.puzzle.getPuzzle()) {
		toRotate = this.puzzle.getPuzzle();
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

	// Comprobamos si se esta mostrando la solucion y si se esta girando el puzzle
	if (this.solution && toRotate == this.puzzle.getPuzzle()) {
		// Girarmos la solucion igual que el puzzle
		temp.setRotationFromEuler(new THREE.Vector3(rotX, rotY, rotZ));
		this.solution.updateMatrix();
		temp.multiply(temp, this.solution.matrix);
		this.solution.rotation.setEulerFromRotationMatrix(temp);
	}
}

/**
 * Método que será llamado cada vez que se inserte/encaje un cubo en el puzzle
 * 
 * @returns Boolean booleano que indicará si el puzzle ha sido resuelto al encajar la pieza
 */
PuzzleView.prototype.cubeInserted = function() {
	this.isDone = false;
	// Si se han introducido todas las piezas en el puzzle y no se habia resuelto
	if (this.puzzle.getPuzzle().children.length == this.puzzle.getNumberOfCubes()) {
		if (this.puzzle.isSolved()) {
			this.isDone = true;
			this.finishedAction();
		}
	}
	if (!this.isDone) {
		if (this.puzzle.isLastCubeRigthPlaced()) {
			sound.playRigthPlaced();
		} else {
			sound.playWrongPlaced();
		}
	}
	return this.isDone;
}

/**
 * Método para mostrar la solución al puzzle como se encuentre el momento de llamar a este método
 */
PuzzleView.prototype.showSolution = function() {
	this.solution = this.puzzle.getSolution();
	scene.add(this.solution);
}

/**
 * Método para ocultar la solución al puzzle
 */
PuzzleView.prototype.hideSolution = function() {
	scene.remove(this.solution);
	this.solution = undefined;
}

/**
 * Método para colocar automáticamente un cubo en el puzzle de manera correcta
 */
PuzzleView.prototype.placeCube = function() {
	// Si no esta solucionado, se intenta insertar un cubo, si se consigue, se realizan las acciones indicadas
	if (!this.isDone && this.puzzle.placeCube()) {
		this.cubeInserted();
	}
}