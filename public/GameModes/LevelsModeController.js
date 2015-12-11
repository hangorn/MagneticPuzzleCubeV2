/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: LevelsModeController.js
 *  Sinopsis: Clase del controlador del modo niveles.
 *  
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 14-04-2013
 *  Versión: 0.1
 *  */

/*
 *  CLASE LEVELSMODECONTROLLER
 *  */
function LevelsModeController(l, mats) {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	// Nivel actual
	this.level;
	// Flag para saber si al iniciar un nivel hay que cambiar los materiales (cambio de nivel) o no (reinicio)
	this.isRestarted = true;
	// Datos de cada nivel
	this.levelsData;

	// Todos los materiales que se utilizarán en el modo de juego, el otro atributo de materiales contendra los que se
	// utilicen en el puzzle actual
	this.allMaterials;
	// Índice del ultimo material usado en el puzzle actual
	this.lastMaterialUsed = -1;

	// Diálogo de puzzle resuelto
	this.finishedDialog;

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase LevelsModeController
	 * 
	 * @param Integer:l
	 *            entero que identificará el nivel con el que se comenzará.
	 * @param Material[]:mats
	 *            array con los materiales a usar para crear el puzzle.
	 */

	// Creamos un mapeo para asociar cada nivel con el puzzle correspondiente, para cada nivel tenemos que definir el
	// constructor del puzzle, si hay imagenes repetidas y si no tiene materiales. Se definira una entrada para cada dos
	// niveles. ya que son iguales cambiando el numero de piezas
	this.levelsData = {};
	// Nivel 1-2: 8-27 cubos (2-3 soluciones) con 12-18 imagenes
	this.levelsData[0] = {
		puzzle : PuzzleView
	};
	// Nivel 3-4: 8-27 cubos (2-3 soluciones) con imagenes repetidas 2 veces (6-9 imagenes distintas)
	this.levelsData[1] = {
		puzzle : PuzzleView,
		imgsRepeated : 2
	};
	// Nivel 5-6: 8-27 cubos (2-3 soluciones) con colores
	this.levelsData[2] = {
		puzzle : ColoredPuzzleView,
		noMaterials : true
	};
	// Nivel 7-8: 8-9 cubos (2-3 soluciones) con imagenes repetidas 3 veces (4-6 imagenes distintas)
	this.levelsData[3] = {
		puzzle : PuzzleView,
		imgsRepeated : 3
	};
	// Nivel 9-10: 8-27 cubos (2-3 soluciones) mas 4-6 cubos con secciones aleatorias
	this.levelsData[4] = {
		puzzle : TooManyPiecesPuzzleView
	};
	// Nivel 11-12: 8-27 cubos (2-3 soluciones) con imagenes repetidas 6 veces (2-3 imagenes distintas)
	this.levelsData[5] = {
		puzzle : PuzzleView,
		imgsRepeated : 6
	};
	// Nivel 13-14: 8-27 cubos (2-3 soluciones) en movimiento
	this.levelsData[6] = {
		puzzle : MovingPuzzleView
	};
	// Nivel 15-16: 8-27 cubos (2-3 soluciones) con imagenes repetidas 12-18 veces (1 imagen distinta)
	this.levelsData[7] = {
		puzzle : PuzzleView,
		imgsRepeated : 18
	};

	// Guardamos el nivel y los materiales
	this.level = l;
	this.allMaterials = mats;
	// Calculamos el numero de cubos para pasarselos a la clase padre (niveles pares -> 2, niveles impares -> 3)
	var numC = this.level % 2 + 2;
	// Llamamos al constructor de la clase padre (ClassicModeController)
	ClassicModeController.call(this, numC, mats);

	/*******************************************************************************************************************
	 * Métodos Privados
	 ******************************************************************************************************************/
}

/***********************************************************************************************************************
 * Heredamos de ClassicModeController
 **********************************************************************************************************************/
LevelsModeController.prototype = Object.create(ClassicModeController.prototype);
LevelsModeController.prototype.constructor = LevelsModeController;

/***********************************************************************************************************************
 * Métodos Protected (para usar herencia)
 **********************************************************************************************************************/

/**
 * Realiza las operaciones necesarias para arrancar el modo de juego
 */
LevelsModeController.prototype.init = function() {
	// Creamos la vista del puzzle
	container.appendChild(renderer.domElement);
	this.puzzle = this.startLevel();

	// Creamos el reloj para cronometrar el tiempo
	this.clock = new Clock(0);
	document.body.appendChild(this.clock.getDomElement());
	this.clock.start();
};

/**
 * Método para iniciar el nivel actual
 * 
 * @returns Puzzle puzzle creado para iniciar el nivel actual
 */
LevelsModeController.prototype.startLevel = function() {
	// Obtenemos los datos del nivel correspondiente, dividientdolo entre dos ya que hay un dato cada dos niveles
	var levelData = this.levelsData[Math.floor(this.level / 2)];
	// Obtenemos el numero de cubos del nivel, si es par => 2, si no => 3
	this.numberOfCubes = this.level % 2 + 2;
	// Calculamos el numero de imagenes necesarios segun el nivel
	var imgsNeeded = levelData.noMaterials ? 0 : this.numberOfCubes * 6;
	// Obtenemos las imagenes necesarias para iniciar el nivel
	var imgs = this.getMaterials(imgsNeeded, levelData.imgsRepeated);
	var ctl = this;
	var puzzle = new levelData.puzzle(scene, this.numberOfCubes, function() {
		ctl.finish()
	}, imgs);
	// Si al puzzle no hay que pasarle los materiales, los obtenemos de el para poder mostrar la pantalla con todas las
	// solucines
	if (levelData.noMaterials) {
		this.materials = puzzle.getMaterials();
	}

	// TODO borrar esto cuando esten refactorizados las clases de los puzzles
	pv = puzzle;

	return puzzle;
}

/**
 * Método para obtener los materiales que se deben usar en el nivel actual, si hay que reiniciar se devolveran los que
 * ya se estan usando
 * 
 * @param Integer:imgsNeeded
 *            numero de imagenes que se necesitan (12 o 18)
 * @param Integer:imgsRepeated
 *            si este parametro es mayor que uno, se repetira cada imagen el numero indicado de veces hasta alcanzar el
 *            numero de imagenes necesitadas
 * @returns Materials[] array con los materiales necesarios
 */
LevelsModeController.prototype.getMaterials = function(imgsNeeded, imgsRepeated) {
	// Comprobamos que el segundo parametro es valido
	if (!imgsRepeated || imgsRepeated < 1) {
		imgsRepeated = 1;
	}
	// Solo calculamos los materiales si no hay que reiniciar
	if (!this.isRestated) {
		// Vaciamos la lista de materiales actuales
		this.materials = []
		// Recorremos todos los materiales disponibles, empezando por el ultimo que se ha usado, hasta tener todos los
		// que necesitamos
		for (var i = this.lastMaterialUsed + 1; this.materials.length < imgsNeeded; i++) {
			// Si hemos llegado al final de todos los materiales, volvemos a empezar
			if (i == this.allMaterials.length) {
				i = 0;
			}
			this.lastMaterialUsed = i;
			// Añadimos el material las veces indicadas, sin pasarse nunca de las imagenes que necesitamos
			for (var j = 0; j < imgsRepeated && j < imgsNeeded; j++) {
				this.materials.push(this.allMaterials[i]);
			}
		}
		// Si hay que repetir materiales los colocamos de manera aleatoria
		if (imgsRepeated > 1) {
			var mats = [];
			for (var i = 0; i < imgsNeeded / 6; i++) {
				if (!mats[i]) {
					mats[i] = [];
				}
				for (var j = 0; j < 6; j++) {
					mats[i].push(this.materials[i * 6 + j]);
				}
			}
			this.materials = [];
			for (var i = 0; i < mats.length; i++) {
				Utils.shuffle(mats[i]);
				this.materials = this.materials.concat(mats[i]);
			}
		}
	}
	return this.materials;
}

/**
 * Método que se ejecutará la terminar el puzzle
 */
LevelsModeController.prototype.finish = function() {
	// Obtenemos el tiempo sobrante
	var time = this.clock.finish();
	// Indicamos que se ha terminado el puzzle
	var finished = true;
	// Reproducimos el sonido de puzzle finalizado
	sound.playFinal();
	// Mostramos un mensaje
	var sec = time % 60;
	var min = Math.floor(time / 60) % 60;
	var hour = Math.floor(time / 3600);
	var timeString = "";
	if (hour != 0) {
		timeString += hour + " horas, ";
	}
	timeString += min + " minutos y " + sec + " segundos !!!";

	// Creamos un dialogo para mostrar al terminar y mostrar las distintas opciones
	if (this.finishedDialog == undefined) {
		// Creamos un contenedor para todos los elementos del dialogo
		this.finishedDialog = document.createElement('div');
		document.body.appendChild(this.finishedDialog);
		var ctl = this;
		Utils.addDynamicComponent('html/finishedLevelForm.html', this.finishedDialog, function() {
			// Definimos la funcion para cuando se pulse el boton de ver el puzzle
			ctl.finishedDialog.getElementsByClassName('watch')[0].onclick = function() {
				document.body.removeChild(ctl.finishedDialog);
			};
			// Definimos la funcion para cuando se pulse el boton de reiniciar el puzzle
			ctl.finishedDialog.getElementsByClassName('restart')[0].onclick = function() {
				document.body.removeChild(ctl.finishedDialog);
				ctl.restart();
			};
			// Definimos la funcion para cuando se pulse el boton de nivel siguiente
			ctl.finishedDialog.getElementsByClassName('next')[0].onclick = function() {
				document.body.removeChild(ctl.finishedDialog);
				ctl.nextLevel();
			};
			// Definimos el texto del dialogo
			ctl.finishedDialog.getElementsByClassName('finishedLevelText')[0].innerHTML += "NIVEL SOLUCIONADO en "
					+ timeString;
		});
	} else {
		// Definimos el texto del dialogo y lo mostramos
		this.finishedDialog.getElementsByClassName('finishedLevelText')[0].innerHTML += "NIVEL SOLUCIONADO en "
				+ timeString;
		document.body.appendChild(this.finishedDialog);
	}
	var text = "Enhorabuena!!! Puzzle solucionado ! en " + timeString;
	// Mostramos el dialogo para guardar la puntuacion
	ScoresController.saveScoreDialog(text, time, 1, this.level);
}

/**
 * Método para iniciar el siguiente nivel
 */
LevelsModeController.prototype.nextLevel = function() {
	// Si estamos en el ultimo nivel
	if (this.level == levelsData.length - 1) {
		alert("No hay mas niveles.");
		return;
	}
	this.isRestarted = false;
	++this.level;
	this.restart();
	this.isRestarted = true;
}

/**
 * Método para iniciar el nivel anterior
 */
LevelsModeController.prototype.previousLevel = function() {
	// Si estamos en el primer nivel
	if (this.level == 0) {
		alert("Este es el primer nivel.");
		return;
	}
	this.isRestarted = false;
	--this.level;
	this.restart();
	this.isRestarted = true;
}

/**
 * Manejador del evento de pulsación del botón de pasar al nivel siguiente
 * 
 * @param EventObject:event->
 *            caracteristicas del evento lanzado.
 */
LevelsModeController.prototype.onNextClick = function(event) {
	// Confirmamos que se desea pasar al nivel siguiente
	if (confirm("Esta seguro que desea pasar al nivel siguiente?")) {
		this.nextLevel();
	}
}

/**
 * Manejador del evento de pulsación del botón de pasar al nivel anterior
 * 
 * @param EventObject:event->
 *            caracteristicas del evento lanzado.
 */
LevelsModeController.prototype.onPreviousClick = function(event) {
	// Confirmamos que se desea pasar al nivel anterior
	if (confirm("Esta seguro que desea pasar al nivel anterior?")) {
		this.previousLevel();
	}
}

/**
 * Devuelve una lista de los botones a mostrar y su accion asociada con el formato [{button, action}, {button,action},
 * ...]. Internamente tambien ocultara los botones que no sean necesarios.
 * 
 */
LevelsModeController.prototype.getButtonsWithActions = function() {
	// Ocultamos los botones de siguiente y anterior, no se usan en este modo
	this.form.removeChild(this.form.showSolution);
	this.form.removeChild(this.form.placeCube);
	var ctl = this;
	// Creamos funciones anonimas por que si no javascript se piensa que "this" es "window" dentro de las funciones
	return [ {
		button : this.form.showSolutions,
		action : function(event) {
			ctl.onShowSolutionsClick();
		}
	}, {
		button : this.form.next,
		action : function(event) {
			ctl.onNextClick();
		}
	}, {
		button : this.form.previous,
		action : function(event) {
			ctl.onPreviousClick();
		}
	}, {
		button : this.form.menu,
		action : function(event) {
			ctl.onMenuClick();
		}
	}, {
		button : this.form.restart,
		action : function(event) {
			ctl.onRestartClick();
		}
	}, {
		button : this.form.options,
		action : function(event) {
			ctl.onOptionsClick();
		}
	}, {
		button : this.form.pause,
		action : function(event) {
			ctl.onPauseClick();
		}
	} ];
};
