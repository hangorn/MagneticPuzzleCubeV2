/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: TrialModeController.js
 *  Sinopsis: Clase del controlador del modo contrareloj.
 *  
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 03-04-2013
 *  Versión: 0.1
 *  */

/*
 *  CLASE TRIALMODECONTROLLER
 *  */
function TrialModeController(numC, diff, mats) {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	// Dificultad del puzzle
	this.difficulty;
	// Creamos un array para cada numero de cubos con los tiempos de cada dificultad, la primera la mas fácil, la última
	// la mas díficil
	this.difTimes = [ [ 5 * 60, 3 * 60, 1 * 60, 40 ], // 8 cubos
	[ 20 * 60, 10 * 60, 5 * 60, 4 * 60 ] ]; // 27 cubos

	// Referencia a la ventana abierta
	var solWin;
	// Flag para saber si se esta mostrando la solucion parcial
	var showingSolution = false;

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase TrialModeController
	 * 
	 * @param Integer:numC
	 *            numero de cubos que tendra el puzzle, para simplicar se indicará mediante el número de cubos en una
	 *            dimensión, 27 (3x3x3) => 3.
	 * @param Integer:diff
	 *            entero que identificará la dificultad: 0->facil, 1->medio, 2->dificil, 3->imposible.
	 * @param Material[]:mats
	 *            array con los materiales a usar para crear el puzzle.
	 */

	// Guardamos la dificultad del puzzle, comprobamos que sea correcto
	if (diff != 0 && diff != 1 && diff != 2 && diff != 3) {
		this.difficulty = 1;
	} else {
		this.difficulty = diff;
	}
	// Llamamos al constructor de la clase padre (ClassicModeController)
	ClassicModeController.call(this, numC, mats);

	/*******************************************************************************************************************
	 * Métodos Privados
	 ******************************************************************************************************************/
}

/***********************************************************************************************************************
 * Heredamos de ClassicModeController
 **********************************************************************************************************************/
TrialModeController.prototype = Object.create(ClassicModeController.prototype);
TrialModeController.prototype.constructor = TrialModeController;

/**
 * Realiza las operaciones necesarias para arrancar el modo de juego
 */
TrialModeController.prototype.init = function() {
	// Creamos la vista del puzzle
	container.appendChild(renderer.domElement);
	var ctl = this;
	pv = this.puzzle = new PuzzleView(scene, this.numberOfCubes, function() {
		ctl.finish();
	}, this.materials);

	// Creamos el reloj para cronometrar el tiempo
	var ctl = this;
	this.clock = new Clock(this.difTimes[this.numberOfCubes - 2][this.difficulty], function() {
		ctl.timeFinished();
	});
	document.body.appendChild(this.clock.getDomElement());
	this.clock.start();
};

/**
 * Método que se ejecutará la terminar el puzzle
 */
TrialModeController.prototype.finish = function() {
	// Marcamos el flag de modo terminado
	this.finished = true;
	// Reproducimos el sonido final
	sound.playFinal();
	// Paramos el reloj y obtenemos el tiempo
	var time = this.clock.finish();
	// Obtenemos el mensaje que se mostrara
	var sec = time % 60;
	var min = Math.floor(time / 60) % 60;
	var hour = Math.floor(time / 3600);
	var text = "Enhorabuena!!! Puzzle solucionado !!! Te han sobrado ";
	if (hour != 0) {
		text += hour + " horas, ";
	}
	text += min + " minutos y " + sec + " segundos";
	// Mostramos el dialogo para guardar la puntuacion
	var submode = this.difficulty * 2 + (3 - this.numberOfCubes);
	ScoresController.saveScoreDialog(text, time, 2, submode);
};

/**
 * Método que se ejecutará cuando se termine el tiempo
 */
TrialModeController.prototype.timeFinished = function() {
	this.finished = true;
	sound.playExplosion();
	alert("Se ha terminado el tiempo.");
	this.puzzle.setDone();
};