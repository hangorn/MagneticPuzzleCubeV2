/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: PuzzleController.js
 *  Sinopsis: Clase controlador que se encargará de manejar lo eventos en el puzzle.
 *  
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 19-02-2013
 *  Versión: 0.5
 *  Fecha: 14-01-2013
 *  Versión: 0.4
 *  Fecha: 10-01-2013
 *  Versión: 0.3
 *  Fecha: 25-12-2012
 *  Versión: 0.2
 *  Fecha: 23-12-2012
 *  Versión: 0.1
 *  */

/*
 *  CLASE PUZZLECONTROLLER
 *  */
function PuzzleController(numC, finAct, mats, col) {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	// Acciones que se ejecutaran con cada evento registrado
	this.actions = [];

	// Objeto 3D sobre el que se realizarán las operaciones (rotación y traslación)
	this.SELECTED;
	// Array con los elementos del puzzle (los cubos y el grupo de piezas que forma el cubo)
	this.objects = [];
	// Objeto de la clase puzzle
	this.puzzle;

	// Flag para saber si el botón de rotación está pulsado
	this.rotDown;
	// Flag para saber si el botón de movimiento está pulsado
	this.movDown;
	// Coordenadas del ratón en la última vez que se proceso el evento, necesarias para calcular cuanto ha de girar una
	// figura
	this.lastMouseX;
	this.lastMouseY;

	// Sensibilidad de giro, relación entre el movimiento del ratón y la cantidad de giro de una figura
	this.sensitivity;
	// Acumulador de giro para cuando se gira una pieza con la tecla CTRL pulsada
	this.rotationStore = {
		x : 0,
		y : 0
	};
	// 90 grados en radianes
	this._90degrees = Math.PI / 2;

	// Vista del puzzle
	this.view;

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase PuzzleController
	 * 
	 * @param Integer:numC
	 *            numero de cubos que tendra el puzzle, para simplicar se indicara mediante el número de cubos en una
	 *            dimensión, 27 (3x3x3) => 3.
	 * @param Material[]:mats
	 *            array con los materiales a usar para crear el puzzle.
	 * @param Callback:finAct
	 *            función de rellamada que se ejecutará al solucionar el puzzle.
	 * @param Boolean:col
	 *            booleano que indicará si el puzzle es de colores, si no se ignorará.
	 */

	// Guardamos el numero de cubos que tendra el cubo, comprobamos que sea correcto
	if (numC != 2 && numC != 3) {
		numC = 3;
	}
	// Iniciamos el controlador, y los objetos que sean necesarios (vista,...)
	this.init(numC, finAct, mats, col);

	// Guardamos los elementos que sufriran la interaccion
	this.objects = this.puzzle.getPuzzleCubes().concat(this.puzzle.getPuzzle());

	// Activamos el controlador
	this.enable();

	// Desactivamos el menu contextual del boton derecho
	document.getElementById('canvas').oncontextmenu = function() {
		return false
	};

	/*******************************************************************************************************************
	 * Métodos Privados
	 ******************************************************************************************************************/

}
PuzzleController.prototype.constructor = PuzzleController;

/***********************************************************************************************************************
 * Métodos Protected (para usar herencia)
 **********************************************************************************************************************/

/**
 * Realiza las operaciones necesarias para arrancar el puzzle
 * 
 * @param Integer:numC
 *            numero de cubos que tendra el puzzle, para simplicar se indicara mediante el número de cubos en una
 *            dimensión, 27 (3x3x3) => 3.
 * @param Callback:finAct
 *            función de rellamada que se ejecutará al solucionar el puzzle.
 * @param Material[]:mats
 *            array con los materiales a usar para crear el puzzle.
 * @param Callback:finAct
 *            función de rellamada que se ejecutará al solucionar el puzzle.
 * @param Boolean:col
 *            booleano que indicará si el puzzle es de colores, si no se ignorará.
 */
PuzzleController.prototype.init = function(numC, finAct, mats, col) {
	// Creamos el puzzle
	this.puzzle = new Puzzle(numC, mats, col);
	this.view = new PuzzleView(this.puzzle, numC, finAct, mats, col);
}

/**
 * Manejador del evento de botón del ratón pulsado
 * 
 * @param EventObject:event
 *            caracteristicas del evento lanzado.
 */
PuzzleController.prototype.onPuzzleMouseDown = function(event) {
	// Impedimos que se produzca la accion por defecto
	event.preventDefault();

	// Calculamos donde esta el raton con el eje de coordenadas en el centro
	var mouse = new THREE.Vector2((event.clientX / windowWidth) * 2 - 1, -(event.clientY / windowHeight) * 2 + 1);

	// Si es el boton de giro
	if (event.button == getOptions().rotButton) {
		// Activamos el flag del boton de rotacion
		this.rotDown = true;

		// Obtenemos la posicion del raton
		this.lastMouseX = event.clientX;
		this.lastMouseY = event.clientY;
		// Restauramos la posicion del plano para picking
		ThreeDUtils.plane.position.z = 0;

		// Usamos la utilidad de Utils para ver si se ha hecho click en la zona del puzzle
		var ctl = this;
		ThreeDUtils.intersectObjects(mouse, null, null, function(intersect) {
			// Si el raton esta en la zona del puzzle
			if (ctl.puzzle.isPuzzleZone(intersect.point)) {
				// Si ya estaba pulsado el boton de mover y habia una pieza seleccionada
				if (ctl.movDown && ctl.SELECTED) {
					// Cambiamos la rotacion y traslacion de la figura a la que tendra en el puzzle
					ctl.puzzle.putInCube(ctl.SELECTED);
					// Y añadimos la figura al puzzle
					ctl.puzzle.getPuzzle().add(ctl.SELECTED);

					// Indicamos a la vista que hemos introducido una pieza en el puzzle
					ctl.view.cubeInserted();
				}
				// Seleccionamos el grupo para girar este en vez de una figura individual
				ctl.SELECTED = ctl.puzzle.getPuzzle();
				// Cambiamos al cursor de movimiento
				container.style.cursor = 'crosshair';
			} else {
				// Usamos la utilidad de Utils para ver si se ha hecho click en algun objeto
				ThreeDUtils.intersectObjects(null, ctl.objects, 'move', function(intersect) {
					// Obtenemos el primer objeto atravesado, que sera el seleccionado, el que esta delante
					ctl.SELECTED = intersect.object;
				});
			}
		});
	}

	// Si es el boton de movimiento
	if (event.button == getOptions().movButton) {
		// Activamos el flag del boton de movimiento
		this.movDown = true;
		// Si no esta resuelto el puzzle
		if (!this.view.isDone) {
			// Usamos la utilidad de Utils para ver si se ha hecho click en algun objeto
			var ctl = this;
			ThreeDUtils.intersectObjects(mouse, this.objects, 'move', function(intersect) {
				// Obtenemos el primer objeto atravesado, que sera el seleccionado, el que esta delante
				ctl.SELECTED = intersect.object;
				// Si esta en el puzzle
				if (ctl.SELECTED.parent == ctl.puzzle.getPuzzle()) {
					// Si ya esta pulsado el boton de girar
					if (ctl.rotDown) {
						ctl.SELECTED = ctl.puzzle.getPuzzle();
					} else {
						// Sacamos la figura del puzzle
						ctl.puzzle.putOutCube(ctl.SELECTED);
						// Añadimos la figura a la escena, con lo cual se borrara tambien del grupo del puzzle
						scene.add(ctl.SELECTED);
					}
				}
			});
		}
	}
}

/**
 * Manejador del evento del movimiento del ratón
 * 
 * @param EventObject:event
 *            caracteristicas del evento lanzado.
 */
PuzzleController.prototype.onPuzzleMouseMove = function(event) {
	// Impedimos que se produzca la accion por defecto
	event.preventDefault();

	// Si hay algun objeto seleccionado
	if (this.SELECTED) {
		// Si esta pulsado el boton de rotacion y no el de movimiento
		if (this.rotDown && !this.movDown) {
			// Obtenemos la posicion del raton
			var rotationX = this.sensitivity * (event.clientX - this.lastMouseX);
			var rotationY = this.sensitivity * (event.clientY - this.lastMouseY);

			// Si no está pulsada la tecla CTRL
			if (!event.ctrlKey) {
				this.rotationStore.x = this.rotationStore.y = 0;
				// Giramos la figura segun la sensibilidad
				this.view.rotateShape(this.SELECTED, rotationY, rotationX);
			} else {
				// Calculamos cuanto se ha girado
				this.rotationStore.x += rotationY;
				this.rotationStore.y += rotationX;
				// Si el giro en el eje X ha sido mayor de 90 grados
				if (this.rotationStore.x > this._90degrees) {
					this.view.rotateShape(this.SELECTED, this._90degrees, 0);
					this.rotationStore.x -= this._90degrees;
				}
				// Si el giro en el eje X ha sido menor de -90 grados
				if (this.rotationStore.x < -this._90degrees) {
					this.view.rotateShape(this.SELECTED, -this._90degrees, 0);
					this.rotationStore.x += this._90degrees;
				}
				// Si el giro en el eje Y ha sido mayor de 90 grados
				if (this.rotationStore.y > this._90degrees) {
					this.view.rotateShape(this.SELECTED, 0, this._90degrees);
					this.rotationStore.y -= this._90degrees;
				}
				// Si el giro en el eje Y ha sido menor de -90 grados
				if (this.rotationStore.y < -this._90degrees) {
					this.view.rotateShape(this.SELECTED, 0, -this._90degrees);
					this.rotationStore.y += this._90degrees;
				}
			}

			// Guardamos la posicion para la siguiente llamada
			this.lastMouseX = event.clientX;
			this.lastMouseY = event.clientY;
			// Y salimos del evento
			return;
		}

		// Si esta pulsado el boton de movimiento y no el de rotacion
		if (this.movDown && !this.rotDown) {
			// Calculamos donde esta el raton con el eje de coordenadas en el centro
			var mouse = new THREE.Vector2((event.clientX / windowWidth) * 2 - 1,
					-(event.clientY / windowHeight) * 2 + 1);

			// Usamos la utilidad de Utils para ver si el cursor esta en la zona del puzzle
			var ctl = this;
			ThreeDUtils.intersectObjects(mouse, null, null, function(intersect) {
				// Si el objeto seleccionado no es el puzzle ni esta solucionado el puzzle, entonces movemos el objeto
				if (ctl.SELECTED != ctl.puzzle.getPuzzle() && !ctl.view.isDone) {
					// Si el raton se encuentra en la zona de movimiento
					if (event.clientX >= 0 && event.clientX <= windowWidth && event.clientY >= 0
							&& event.clientY <= windowHeight) {
						// Movemos la figura seleccionada
						ctl.SELECTED.position.copy(intersect.point);
					}

					// Comprobamos si esta en la zona del puzzle, para mover el cubo hacia
					// delante en caso de tener uno detras, para que no se solapen
					if (ctl.puzzle.isPuzzleZone(ctl.SELECTED.position)) {

						// Usamos la utilidad de Utils para ver si el cursor esta sobre algun objeto
						ThreeDUtils.intersectObjects(mouse, ctl.objects, null, null, null, function(intersects) {
							var intersector = null;
							for (var i = 0; i < intersects.length; i++) {
								if (intersects[i].object != ctl.SELECTED) {
									intersector = intersects[i];
									break;
								}
							}

							// Si hay un objeto
							if (intersector) {
								// Movemos tanto el plano de desplazamiento como la figura hacia delante
								// tanto como este la figura anterior mas la mitad del tamaño de la seleccionada
								ThreeDUtils.plane.position.z = ctl.SELECTED.position.z = intersector.point.z + 200;
							} else {
								// Si no hay objetos atravesados sin contar el seleccionado y la figura no esta en Z=0
								if (ctl.SELECTED.position.z != 0) {
									// Movemos tanto la figura como el plano de desplazamiento a Z=0
									ctl.SELECTED.position.z = ThreeDUtils.plane.position.z = 0;
								}
							}
						});
					}
					// Si no esta en la zona del puzzle pero no esta en Z=0
					else if (ctl.SELECTED.position.z != 0) {
						// Movemos tanto la figura como el plano de desplazamiento a Z=0
						ctl.SELECTED.position.z = ThreeDUtils.plane.position.z = 0;
					}
				}

			});
			// Y salimos del evento
			return;
		}

		// Si esta pulsado el boton de movimiento y el de rotacion
		if (this.movDown && this.rotDown) {
			// Si la pieza ha girar esta introducida en el puzzle
			if (this.SELECTED.parent == this.puzzle.getPuzzle()) {
				// Giramos el puzzle
				this.SELECTED = this.puzzle.getPuzzle();
			}

			// Obtenemos la posicion del raton
			var mouseX = event.clientX;
			var mouseY = event.clientY;

			// Si no está pulsada la tecla CTRL
			if (!event.ctrlKey) {
				this.rotationStore.x = this.rotationStore.y = 0;
				// Giramos la figura segun la sensibilidad
				this.view.rotateShape(this.SELECTED, 0, 0, -this.sensitivity * (mouseY - this.lastMouseY)
						- this.sensitivity * (mouseX - this.lastMouseX));
			}
			// Si esta pulsada la tecla CTRL
			else {
				// Calculamos cuanto se ha girado
				this.rotationStore.x += this.sensitivity * (mouseY - this.lastMouseY);
				this.rotationStore.y += this.sensitivity * (mouseX - this.lastMouseX);
				// Si el giro en el eje X o en el eje Y ha sido mayor de 90 grados
				if (this.rotationStore.x > this._90degrees || this.rotationStore.y > this._90degrees) {
					this.view.rotateShape(this.SELECTED, 0, 0, -this._90degrees);
					this.rotationStore.x = this.rotationStore.x - this._90degrees
							* (Math.floor(this.rotationStore.x / this._90degrees));
					this.rotationStore.y = this.rotationStore.y - this._90degrees
							* (Math.floor(this.rotationStore.y / this._90degrees));
				}
				// Si el giro en el eje X ha sido menor de -90 grados
				if (this.rotationStore.x < -this._90degrees || this.rotationStore.y < -this._90degrees) {
					this.view.rotateShape(this.SELECTED, 0, 0, +this._90degrees);
					this.rotationStore.x = this.rotationStore.x - this._90degrees
							* (Math.floor(this.rotationStore.x / this._90degrees));
					this.rotationStore.y = this.rotationStore.y - this._90degrees
							* (Math.floor(this.rotationStore.y / this._90degrees));
				}
			}

			// Guardamos la posicion para la siguiente llamada
			this.lastMouseX = mouseX;
			this.lastMouseY = mouseY;

			// Y salimos del evento
			return;
		}
	}

	// Si llegamos hasta aqui es que no esta seleccionado ningun objeto
	// Calculamos donde esta el raton con el eje de coordenadas en el centro
	var mouse = new THREE.Vector2((event.clientX / windowWidth) * 2 - 1, -(event.clientY / windowHeight) * 2 + 1);
	// Usamos la utilidad de Utils para ver si el cursor esta sobre algun objeto
	ThreeDUtils.intersectObjects(mouse, this.objects, 'pointer');
}

/**
 * Manejador del evento de botón del ratón levantado
 * 
 * @param EventObject:event
 *            caracteristicas del evento lanzado.
 */
PuzzleController.prototype.onPuzzleMouseUp = function(event) {
	// Impedimos que se produzca la accion por defecto
	event.preventDefault();

	// Si es el boton de giro
	if (event.button == getOptions().rotButton) {
		// Desactivamos el flag de boton de rotacion pulsado
		this.rotDown = false;
		// Si no esta pulsado el boton de movimiento
		if (!this.movDown) {
			// Deseleccionamos el objeto seleccionado
			this.SELECTED = null;
			// Usamos el cursor por defecto
			container.style.cursor = 'auto';
		}
	}

	// Si es el boton de movimiento
	if (event.button == getOptions().movButton) {
		// Desactivamos el flag de boton de movimiento pulsado
		this.movDown = false;
		// Si hay algun objeto seleccionado
		if (this.SELECTED) {
			// Si se suelta en la zona del puzzle y no esta resuelto
			if (this.SELECTED != this.puzzle.getPuzzle() && this.puzzle.isPuzzleZone(this.SELECTED.position)
					&& !this.view.isDone) {
				// Cambiamos la rotacion y traslacion de la figura a la que tendra en el puzzle
				this.puzzle.putInCube(this.SELECTED);
				// Y añadimos la figura al puzzle
				this.puzzle.getPuzzle().add(this.SELECTED);

				// Indicamos a la vista que hemos introducido una pieza en el puzzle
				this.view.cubeInserted();
			}
			// Si no esta pulsado el boton de rotacion
			if (!this.rotDown) {
				// Deseleccionamos el objeto seleccionado
				this.SELECTED = null;
				// Usamos el cursor por defecto
				container.style.cursor = 'auto';
			}
		}
	}
}

/*******************************************************************************************************************
 * Métodos Publicos
 ******************************************************************************************************************/

/**
 * Método que elimina el controlador. Lo único que hace es eliminar los manejadores de eventos que tiene registrados
 */
PuzzleController.prototype.remove = function() {
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
PuzzleController.prototype.enable = function() {
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
}

/**
 * Método para mostrar en la interfaz todos los elementos de la vista
 */
PuzzleController.prototype.show = function() {
	// Mostramos el puzzle
	this.view.show();
	// Activamos las acciones
	this.enable();
};

/**
 * Método para eliminar de la interfaz todos los elementos de la vista, ocultarlos
 */
PuzzleController.prototype.hide = function() {
	// Deshabilitamos el controlador asociado
	this.remove();
	// Ocultamos el puzzle
	this.view.hide();
};

/**
 * Método para mostrar la solución al puzzle como se encuentre el momento de llamar a este método
 */
PuzzleController.prototype.showSolution = function() {
	this.view.showSolution();
}

/**
 * Método para ocultar la solución al puzzle
 */
PuzzleController.prototype.hideSolution = function() {
	this.view.hideSolution();
}

/**
 * Método para colocar automáticamente un cubo en el puzzle de manera correcta
 */
PuzzleController.prototype.placeCube = function() {
	this.view.placeCube();
}

/**
 * Método para saber si el puzzle ha sido resuelto
 */
PuzzleController.prototype.isDone = function() {
	this.view.isDone;
}