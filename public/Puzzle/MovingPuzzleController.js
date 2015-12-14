/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: MovingPuzzleController.js
 *  Sinopsis: Clase controlador que se encargará de manejar lo eventos en el puzzle con piezas en movimiento.
 *  
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 19-04-2013
 *  Versión: 0.1
 *  */

/*
 *  CLASE MOVINGPUZZLECONTROLLER
 *  */
function MovingPuzzleController(numC, finAct, mats) {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	// Flag para saber si esta activada la animación del movimiento de los cubos
	this.animationEnabled = false;

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase MovingPuzzleController
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
MovingPuzzleController.prototype = Object.create(PuzzleController.prototype);
MovingPuzzleController.prototype.constructor = MovingPuzzleController;

/***********************************************************************************************************************
 * Métodos Protected (para usar herencia)
 **********************************************************************************************************************/

/**
 * Método que iniciará la animación de los cubos
 */
MovingPuzzleController.prototype.enableAnimation = function() {
	this.animationEnabled = true;
	for (i = 0; i < this.objects.length; i++) {
		this.objects[i].dir = new THREE.Vector2(1, 1);
	}
	this.animateCubes();
}

/**
 * Método para mover los cubos
 */
MovingPuzzleController.prototype.animateCubes = function() {
	if (this.animationEnabled) {
		// Recorremos todos los objetos que sufren una interaccion (piezas del puzzle y el puzzle)
		for (var i = 0; i < this.objects.length; i++) {
			// Comprobamos que no sea ni el puzzle, ni este introducido en el puzzle ni este siendo usado
			if (this.objects[i] != this.puzzle.getPuzzle() && this.objects[i].parent != this.puzzle.getPuzzle()
					&& this.objects[i] != this.SELECTED) {
				// Movemos cada cubo
				this.objects[i].position.addSelf(new THREE.Vector3(this.objects[i].dir.x * (Math.random() * 20 + 40),
						this.objects[i].dir.y * (Math.random() * 20 + 40), 0));
				// Comprobamos que no se salga por la izquierda
				if (this.objects[i].position.x < -1000) {
					this.objects[i].dir.x = 1;
				}
				// Comprobamos que no se salga por la derecha
				if (this.objects[i].position.x > 1000) {
					this.objects[i].dir.x = -1;
				}
				// Comprobamos que no se salga por arriba
				if (this.objects[i].position.y < -700) {
					this.objects[i].dir.y = 1;
				}
				// Comprobamos que no se salga por arriba
				if (this.objects[i].position.y > 700) {
					this.objects[i].dir.y = -1;
				}
				// Giramos cada cubo
				this.objects[i].rotation.addSelf(new THREE.Vector3(0.005, 0.005, 0.005));
			}
		}
		var ctl = this;
		setTimeout(function() {
			ctl.animateCubes();
		}, 100);
	}
}

/**
 * Método que elimina el controlador. Lo único que hace es eliminar los manejadores de eventos que tiene registrados
 */
MovingPuzzleController.prototype.remove = function() {
	// Desactivamos la animacion del movimiento de los cubos
	this.animationEnabled = false;
	// Borramos receptores de eventos para el raton
	document.getElementById('canvas').removeEventListener('mousedown', this.actions[0], false);
	document.removeEventListener('mousemove', this.actions[1], false);
	document.removeEventListener('mouseup', this.actions[2], false);

	// Usamos el cursor por defecto
	container.style.cursor = 'auto';
}

/**
 * Método que habilita el controlador. Registra los eventos necesarios
 */
MovingPuzzleController.prototype.enable = function() {
	if (this.actions.length == 0) {
		var ctl = this;
		this.actions[0] = function(event) {
			ctl.onPuzzleMouseDown(event);
		};
		this.actions[1] = function(event) {
			ctl.onPuzzleMouseMove(event);
		};
		this.actions[2] = function(event) {
			ctl.onPuzzleMouseUp(event);
		};
	}

	// Registramos de nuevo los receptores de eventos para el raton
	document.getElementById('canvas').addEventListener('mousedown', this.actions[0], false);
	document.addEventListener('mousemove', this.actions[1], false);
	document.addEventListener('mouseup', this.actions[2], false);

	// Obtenemos la sensibilidad con la que se debe girar
	this.sensitivity = getOptions().sensitivity / 100;

	// Activamos la animacion del movimiento de los cubos
	this.enableAnimation();
}
