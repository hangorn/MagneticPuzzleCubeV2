/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: ClassicModeController.js
 *  Sinopsis: Clase del controlador del modo clásico.
 *  
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 05-03-2013
 *  Versión: 0.4
 *  Fecha: 02-03-2013
 *  Versión: 0.3
 *  Fecha: 14-01-2013
 *  Versión: 0.2
 *  Fecha: 10-01-2013
 *  Versión: 0.1
 *  */

/*
 *  CLASE CLASSICMODECONTROLLER
 *  */
function ClassicModeController(numC, mats) {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	// Numero de piezas que tendra el puzzle
	this.numberOfCubes;
	// Materiales con los que esta hecho el puzzle
	this.materials;
	// Puzzle al que se esta jugando
	this.puzzle;
	
	// Flag para saber si se ha acabado el modo
	this.finished = false;
	// Flag para saber si se esta mostrando la solucion parcial
	this.showingSolution = false;

	// Reloj
	this.clock;
	// Dialogo de pausa
	this.pauseDialog;

	// Vista con los botones
	this.view;
	// Formulario con los botones
	this.form;
	// Lista con los botones y sus acciones asociadas
	this.buttons;

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase ClassicModeController
	 * 
	 * @param Integer:numC
	 *            numero de cubos que tendra el puzzle, para simplicar se indicará mediante el número de cubos en una
	 *            dimensión, 27 (3x3x3) => 3.
	 * @param Material[]:mats
	 *            array con los materiales a usar para crear el puzzle.
	 */

	// Guardamos el numero de cubos que tendra el cubo, comprobamos que sea correcto
	if (numC != 2 && numC != 3) {
		this.numberOfCubes = 3;
	} else {
		this.numberOfCubes = numC;
	}
	this.materials = mats;

	this.init();

	// Hay que guardar esta instancia en una variable, por que 'this' dentro de la funcion anonima no referencia a este
	// controlador
	var ctl = this;
	// Creamos el contenedor que contendra el formulario para las distintas opciones
	this.view = document.createElement('div');
	addDynamicComponent('html/puzzleButtons.html', this.view, function() {
		ctl.form = ctl.view.getElementsByTagName('form')[0];
		document.body.appendChild(ctl.view);
		ctl.buttons = ctl.getButtonsWithActions();
		ctl.enable();
	});

	/*******************************************************************************************************************
	 * Métodos Privados
	 ******************************************************************************************************************/

};
ClassicModeController.prototype.constructor = ClassicModeController;

/***********************************************************************************************************************
 * Métodos Protected (para usar herencia)
 **********************************************************************************************************************/

/**
 * Realiza las operaciones necesarias para arrancar el modo de juego
 */
ClassicModeController.prototype.init = function() {
	// Creamos la vista del puzzle
	container.appendChild(renderer.domElement);
	var ctl = this;
	pv = this.puzzle = new PuzzleView(scene, this.numberOfCubes, function() {
		ctl.finish();
	}, this.materials);

	// Creamos el reloj para cronometrar el tiempo
	this.clock = new Clock(0);
	document.body.appendChild(this.clock.getDomElement());
	this.clock.start();
};

/**
 * Método que se ejecutará la terminar el puzzle
 */
ClassicModeController.prototype.finish = function() {
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
	var text = "Enhorabuena!!! Puzzle solucionado ! en ";
	if (hour != 0) {
		text += hour + " horas, ";
	}
	text += min + " minutos y " + sec + " segundos";
	// Mostramos el dialogo para guardar la puntuacion
	ScoresController.saveScoreDialog(text, time, 0, 3 - this.numberOfCubes);
};

/**
 * Método para reiniciar el puzzle
 */
ClassicModeController.prototype.restart = function() {
	// Eliminamos de la vista el actual modo de juego
	this.hide();
	// Iniciamos de nuevo este modo
	this.init();
	// Mostramos la interfaz en el cuerpo del documento HTML
	document.body.appendChild(this.view);
	// Activamos las acciones
	this.enable();
}

/**
 * Manejador del evento de pulsación del botón de mostrar todas las soluciones
 * 
 * @param EventObject:event->
 *            caracteristicas del evento lanzado.
 */
ClassicModeController.prototype.onShowSolutionsClick = function(event) {
	// Creamos tres variables globalesa 'window' para poder pasarle datos a la nueva ventana
	window.mats = this.materials;
	window.numC = this.numberOfCubes;
	window.sensitivity = getOptions().sensitivity;
	// Mostramos la nueva ventana indicando: URL, nombre, tamaño y posicion
	window.open('Solutions/solutionsWindow.html', 'solutionsWindow', 'width=300,height=' + window.screen.availHeight
			+ ',left=' + (window.screen.availWidth - 300));
};

/**
 * Manejador del evento de pulsación del botón de mostrar la posible solución
 * 
 * @param EventObject:event->
 *            caracteristicas del evento lanzado.
 */
ClassicModeController.prototype.onShowSolutionClick = function(event) {
	if (this.showingSolution) {
		this.puzzle.hideSolution();
		this.form.showSolution.value = "mostrar una posible solucion";
		this.showingSolution = false;
	} else {
		this.puzzle.showSolution();
		this.form.showSolution.value = "ocultar la posible solucion";
		this.showingSolution = true;
		this.clock.addTime(20);
	}
};

/**
 * Manejador del evento de pulsación del botón de colocar una pieza en el puzzle
 * 
 * @param EventObject:event->
 *            caracteristicas del evento lanzado.
 */
ClassicModeController.prototype.onPlaceCubeClick = function(event) {
	this.puzzle.placeCube();
	this.clock.addTime(40);
};

/**
 * Manejador del evento de pulsación del botón de ir al menu principal
 * 
 * @param EventObject:event->
 *            caracteristicas del evento lanzado.
 */
ClassicModeController.prototype.onMenuClick = function(event) {
	// Confirmamos que se desea salir
	if (confirm("Esta seguro que desea salir?")) {
		this.hide();
		menuCtl.show(0);
	}
};

/**
 * Manejador del evento de pulsación del botón de reiniciar el juego
 * 
 * @param EventObject:event->
 *            caracteristicas del evento lanzado.
 */
ClassicModeController.prototype.onRestartClick = function(event) {
	// Confirmamos que se desea reiniciar
	if (confirm("Esta seguro que desea reiniciar?")) {
		this.restart();
	}
};

/**
 * Manejador del evento de pulsación del botón de opciones
 * 
 * @param EventObject:event->
 *            caracteristicas del evento lanzado.
 */
ClassicModeController.prototype.onOptionsClick = function(event) {
	// Eliminamos de la vista el actual modo de juego
	this.hide();
	// Mostramos el dialogo de opciones
	var ctl = this;
	OptionsController.show(function() {
		// Mostramos la vista de este modo de juego
		ctl.show();
	});
};

/**
 * Manejador del evento de pulsación del botón de pausa
 * 
 * @param EventObject:event->
 *            caracteristicas del evento lanzado.
 */
ClassicModeController.prototype.onPauseClick = function(event) {
	// Pausamos el reloj
	this.clock.pause();
	// Desactivamos el controlador del puzzle
	this.puzzle.disableController();

	// Creamos un dialogo para mostrar mientras el juego este pausado
	if (this.pauseDialog == undefined) {
		// Creamos un contenedor para todos los elementos del dialogo
		this.pauseDialog = document.createElement('div');
		document.body.appendChild(this.pauseDialog);
		var ctl = this;
		addDynamicComponent('html/pauseDialog.html', ctl.pauseDialog, function() {
			// Definimos la funcion para cuando se pulse el boton
			ctl.pauseDialog.getElementsByClassName('pauseDialogContinue')[0].onclick = function() {
				// Ocultamos el dialogo de pausa
				document.body.removeChild(ctl.pauseDialog);
				// Si el modo no se ha acabado
				if (!ctl.finished) {
					// Activamos el reloj
					ctl.clock.start();
				}
				// Activamos el controlador del puzzle
				ctl.puzzle.enableController();
			}
		});
	} else {
		// Si ya esta creado el dialogo unicamente los mostramos
		document.body.appendChild(this.pauseDialog);
	}
};

/**
 * Método que elimina el controlador. Lo único que hace es eliminar los manejadores de eventos que tiene registrados
 */
ClassicModeController.prototype.remove = function() {
	// Eliminamos los receptores de eventos de los botones
	for (var i = 0; i < this.buttons.length; i++) {
		this.buttons[i].button.removeEventListener('click', this.buttons[i].action, false);

	}
};

/**
 * Método que habilita el controlador. Registra los eventos necesarios
 */
ClassicModeController.prototype.enable = function() {
	// Registramos los receptores de eventos de los botones
	for (var i = 0; i < this.buttons.length; i++) {
		this.buttons[i].button.addEventListener('click', this.buttons[i].action, false);

	}
};

/**
 * Método para mostrar en la interfaz todos los elementos de la vista
 */
ClassicModeController.prototype.show = function() {
	document.body.appendChild(this.clock.getDomElement());
	// Si no se ha acabado el tiempo activamos el reloj
	if (!this.finished) {
		this.clock.start();
	}
	container.appendChild(renderer.domElement);
	// Mostramos el puzzle
	this.puzzle.show();
	// Mostramos la interfaz en el cuerpo del documento HTML
	document.body.appendChild(this.view);
	// Activamos las acciones
	this.enable();
};

/**
 * Método para eliminar de la interfaz todos los elementos de la vista, ocultarlos
 */
ClassicModeController.prototype.hide = function() {
	// Pausamos el reloj
	this.clock.pause();
	document.body.removeChild(this.clock.getDomElement());
	// Ocultamos el puzzle
	this.puzzle.hide();
	// Borramos la interfaz del cuerpo del documento HTML
	document.body.removeChild(this.view);
	// Deshabilitamos el controlador asociado
	this.remove();
	if (renderer.domElement.parentNode == container) {
		container.removeChild(renderer.domElement);
	}
};

/**
 * Devuelve una lista de los botones a mostrar y su accion asociada con el formato [{button, action}, {button,action},
 * ...]. Internamente tambien ocultara los botones que no sean necesarios.
 * 
 */
ClassicModeController.prototype.getButtonsWithActions = function() {
	//Ocultamos los botones de siguiente y anterior, no se usan en este modo
	this.form.removeChild(this.form.next);
	this.form.removeChild(this.form.previous);
	var ctl = this;
	// Creamos funciones anonimas por que si no javascript se piensa que 'this' es 'window' dentro de las funciones
	return [ {
		button : this.form.showSolutions,
		action : function(event) {
			ctl.onShowSolutionsClick();
		}
	}, {
		button : this.form.showSolution,
		action : function(event) {
			ctl.onShowSolutionClick();
		}
	}, {
		button : this.form.placeCube,
		action : function(event) {
			ctl.onPlaceCubeClick();
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