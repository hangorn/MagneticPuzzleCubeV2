/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: SurvivalModeController.js
 *  Sinopsis: Clase del controlador del modo supervivencia.
 *  
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 31-03-2013
 *  Versión: 0.1
 *  */

/*
 *  CLASE SURVIVALMODECONTROLLER
 *  */
function SurvivalModeController(numC, diff, mats) {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	// Dificultad del puzzle
	this.difficulty;
	// Creamos un array para cada numero de cubos con los tiempos de cada dificultad, la primera la mas fácil, la última
	// la mas díficil
	this.difTimes = [ [ 5 * 60, 3 * 60, 1 * 60, 40 ], // 8 cubos
	[ 20 * 60, 10 * 60, 5 * 60, 4 * 60 ] ]; // 27 cubos
	// Tiempe que sobra de un puzzle para hacer el siguiente
	this.remainingTime = 0;
	// Número de puzzles que se han resuelto
	this.solvedPuzzles = 0;

	// Todos los materiales que se utilizarán en el modo de juego
	this.allMaterials;
	// Índice del ultimo material usado en el puzzle actual
	this.lastMaterialUsed = -1;

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase SurvivalModeController
	 * 
	 * @param Integer:numC
	 *            numero de cubos que tendra el puzzle, para simplicar se indicará mediante el número de cubos en una
	 *            dimensión, 27 (3x3x3) => 3.
	 * @param Integer:diff
	 *            entero que identificará la dificultad: 0->facil, 1->medio, 2->dificil, 3->imposible.
	 * @param Material[]:mats
	 *            array con los materiales a usar para crear el puzzle.
	 */

	this.allMaterials = mats;
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
SurvivalModeController.prototype = Object.create(ClassicModeController.prototype);
SurvivalModeController.prototype.constructor = SurvivalModeController;

/**
 * Realiza las operaciones necesarias para arrancar el modo de juego
 */
SurvivalModeController.prototype.init = function() {
	// Creamos la vista del puzzle
	container.appendChild(renderer.domElement);
	var ctl = this;
	this.puzzle = new PuzzleController(this.numberOfCubes, function() {
		ctl.finish();
	}, this.getMaterials());

	// Creamos el reloj para cronometrar el tiempo
	var ctl = this;
	this.clock = new Clock(this.difTimes[this.numberOfCubes - 2][this.difficulty] + this.remainingTime
			- this.solvedPuzzles * (5 - this.difficulty), function() {
		ctl.timeFinished();
	});
	document.body.appendChild(this.clock.getDomElement());
	this.clock.start();
};

/**
 * Método para obtener los materiales que se deben usar en el puzzle actual
 * 
 * @returns Materials[] array con los materiales necesarios
 */
SurvivalModeController.prototype.getMaterials = function() {
	// Vaciamos la lista de materiales actuales
	this.materials = []
	// Recorremos todos los materiales disponibles, empezando por el ultimo que se ha usado, hasta tener todos los
	// que necesitamos
	for (var i = this.lastMaterialUsed + 1; this.materials.length < this.numberOfCubes * 6; i++) {
		// Si hemos llegado al final de todos los materiales, volvemos a empezar
		if (i == this.allMaterials.length) {
			i = 0;
		}
		this.lastMaterialUsed = i;
		this.materials.push(this.allMaterials[i]);
	}
	return this.materials;
}

/**
 * Método que se ejecutará la terminar el puzzle
 */
SurvivalModeController.prototype.finish = function() {
	// Incrementamos el numero de puzzles resueltos
	this.solvedPuzzles++;
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
	text += min + " minutos y " + sec + " segundos para la siguiente ronda";
	alert(text);
	this.restart();
};

/**
 * Método que se ejecutará cuando se termine el tiempo
 */
SurvivalModeController.prototype.timeFinished = function() {
	this.finished = true;
	sound.playExplosion();
	this.finishMode("Se ha terminado el tiempo. ");
	this.puzzle.setDone();
}

/**
 * Método que se cuando no se acabe la partida, cuando se acabe el tiempo o cuando se quiera salir o reiniciar.
 * 
 * @param String:str
 *            cadena que se mostrara al inicio del mensaje.
 */
SurvivalModeController.prototype.finishMode = function(str) {
	var text = str + " Has conseguido solucionar " + this.solvedPuzzles + " puzzles. Enhorabuena!!!";
	// Mostramos el dialogo para guardar la puntuacion
	var submode = this.difficulty * 2 + (3 - this.numberOfCubes);
	ScoresController.saveScoreDialog(text, this.solvedPuzzles, 3, submode);
}

/**
 * Manejador del evento de pulsación del botón de ir al menu principal
 * 
 * @param EventObject:event->
 *            caracteristicas del evento lanzado.
 */
SurvivalModeController.prototype.onMenuClick = function(event) {
	// Confirmamos que se desea salir
	if (confirm("Esta seguro que desea salir?")) {
		// Si no se ha acabado el tiempo ejecutamos la accion de finalizacion de modo
		if (!this.puzzle.isDone()) {
			this.finishMode("");
		}
		this.hide();
		menuCtl.show(0);
	}
}

/**
 * Manejador del evento de pulsación del botón de reiniciar el juego
 * 
 * @param EventObject:event->
 *            caracteristicas del evento lanzado.
 */
SurvivalModeController.prototype.onRestartClick = function(event) {
	// Confirmamos que se desea reiniciar
	if (confirm("Esta seguro que desea reiniciar?")) {
		// Si no se ha acabado el tiempo ejecutamos la accion de finalizacion de modo
		if (!this.puzzle.isDone()) {
			this.finishMode("");
		}
		this.restart();
	}
}