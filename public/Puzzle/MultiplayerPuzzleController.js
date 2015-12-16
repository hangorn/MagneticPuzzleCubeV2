/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: MultiplayerPuzzleController.js
 *  Sinopsis: Clase controlador que se encargará de manejar lo eventos en el puzzle.
 *  
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 06-05-2013
 *  Versión: 0.1
 *  */

/*
 *  CLASE MULTIPLAYERPUZZLECONTROLLER
 *  */
function MultiplayerPuzzleController(numC, finAct, mats, ty, iniPos, iniRot) {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase MultiplayerPuzzleController
	 * 
	 * @param Integer:numC
	 *            numero de cubos que tendra el puzzle, para simplicar se indicara mediante el número de cubos en una
	 *            dimensión, 27 (3x3x3) => 3.
	 * @param Material[]:mats
	 *            array con los materiales a usar para crear el puzzle.
	 * @param Callback:finAct
	 *            función de rellamada que se ejecutará al solucionar el puzzle.
	 */
	this.type = ty;
	this.iniPos = iniPos;
	this.iniRot = iniRot;

	PuzzleController.call(this, numC, finAct, mats);

}

/***********************************************************************************************************************
 * Heredamos de PuzzleView
 **********************************************************************************************************************/
MultiplayerPuzzleController.prototype = Object.create(PuzzleController.prototype);
MultiplayerPuzzleController.prototype.constructor = MultiplayerPuzzleController;

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
MultiplayerPuzzleController.prototype.init = function(numC, finAct, mats, col) {
	// Creamos el puzzle
	this.puzzle = new Puzzle(numC, mats, col);
	this.view = new MultiplayerPuzzleView(this.puzzle, numC, finAct, mats, this.type, this.iniPos, this.iniRot);
}

/**
 * Manejador del evento de botón del ratón pulsado
 * 
 * @param EventObject:event
 *            caracteristicas del evento lanzado.
 */
MultiplayerPuzzleController.prototype.onPuzzleMouseDown = function(event) {
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
				// Si ya estaba pulsado el boton de mover y habia una pieza seleccionada y no es el puzzle
				if (ctl.movDown && ctl.SELECTED && ctl.SELECTED != ctl.puzzle.getPuzzle()) {
					// Le indicamos al servidor que hemos deseleccionado una pieza
					socket.selectedPiece(ctl.SELECTED.ID, false);
					// Cambiamos la rotacion y traslacion de la figura a la que tendra en el puzzle
					ctl.puzzle.putInCube(ctl.SELECTED);
					// Y añadimos la figura al puzzle
					ctl.puzzle.getPuzzle().add(ctl.SELECTED);

					// Le indicamos al servidor que hemos colodado una pieza en el puzzle
					socket.placedPiece(ctl.SELECTED.ID, true, ctl.SELECTED.position, ctl.SELECTED.rotation);
					// Indicamos a la vista que hemos introducido una pieza en el puzzle
					ctl.view.cubeInserted();

					// Si esta marcado el puzzle marcamos tambien la pieza introducida
					if (ctl.puzzle.getPuzzle().used) {
						ctl.view.markShape(0);
					}
					ctl.SELECTED = null;
				}

				// Si el puzzle no esta usado por el otro jugador
				if (!ctl.puzzle.getPuzzle().used) {
					// Seleccionamos el grupo para girar este en vez de una figura individual
					ctl.SELECTED = ctl.puzzle.getPuzzle();
					// Cambiamos al cursor de movimiento
					container.style.cursor = 'crosshair';
					// Le indicamos al servidor que hemos seleccionado una pieza
					socket.selectedPiece(0, true);
				}
			} else {
				// Usamos la utilidad de Utils para ver si se ha hecho click en algun objeto
				ThreeDUtils.intersectObjects(null, ctl.objects, null, function(intersect) {
					if (!intersect.object.used) {
						// Obtenemos el primer objeto atravesado, que sera el seleccionado, el que esta delante
						ctl.SELECTED = intersect.object;
						// Cambiamos al cursor de movimiento
						container.style.cursor = 'move';
						// Si no estaba pulsado el boton de mover
						if (!ctl.movDown) {
							// Le indicamos al servidor que hemos seleccionado una pieza
							socket.selectedPiece(ctl.SELECTED.ID, true);
						}
					}
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
			ThreeDUtils.intersectObjects(mouse, this.objects, null, function(intersect) {
				if (!intersect.object.used) {
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
							// Le indicamos al servidor que hemos sacado una pieza del puzzle
							socket.placedPiece(ctl.SELECTED.ID, false, ctl.SELECTED.position, ctl.SELECTED.rotation);
						}
					}
					// Si no esta pulsado el boton de girar
					if (!ctl.rotDown) {
						// Le indicamos al servidor que hemos seleccionado una pieza
						socket.selectedPiece(ctl.SELECTED.ID, true);
					}
					// Cambiamos al cursor de movimiento
					container.style.cursor = 'move';
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
MultiplayerPuzzleController.prototype.onPuzzleMouseMove = function(event) {
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
			// Le indicamos al servidor que hemos girado una pieza
			socket.rotatedPiece(this.SELECTED.ID, this.SELECTED.rotation);

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
					// Le indicamos al servidor que hemos movido una pieza
					socket.movedPiece(ctl.SELECTED.ID, ctl.SELECTED.position);
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

			// Le indicamos al servidor que hemos girado una pieza
			socket.rotatedPiece(this.SELECTED.ID, this.SELECTED.rotation);

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
MultiplayerPuzzleController.prototype.onPuzzleMouseUp = function(event) {
	// Impedimos que se produzca la accion por defecto
	event.preventDefault();

	// Si es el boton de giro
	if (event.button == getOptions().rotButton) {
		// Desactivamos el flag de boton de rotacion pulsado
		this.rotDown = false;
		// Si no esta pulsado el boton de movimiento
		if (!this.movDown) {
			// Si hay alguna figura seleccionada
			if (this.SELECTED != null) {
				// Le indicamos al servidor que hemos deseleccionado una pieza
				socket.selectedPiece(this.SELECTED.ID, false);
			}
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
			// Si no esta pulsado el boton de rotacion
			if (!this.rotDown) {
				// Le indicamos al servidor que hemos deseleccionado una pieza
				socket.selectedPiece(this.SELECTED.ID, false);
			}

			// Si se suelta en la zona del puzzle y no esta resuelto
			if (this.SELECTED != this.puzzle.getPuzzle() && this.puzzle.isPuzzleZone(this.SELECTED.position)
					&& !this.view.isDone) {
				// Cambiamos la rotacion y traslacion de la figura a la que tendra en el puzzle
				this.puzzle.putInCube(this.SELECTED);
				// Y añadimos la figura al puzzle
				this.puzzle.getPuzzle().add(this.SELECTED);

				// Le indicamos al servidor que hemos colodado una pieza en el puzzle
				socket.placedPiece(this.SELECTED.ID, true, this.SELECTED.position, this.SELECTED.rotation);
				// Indicamos a la vista que hemos introducido una pieza en el puzzle
				this.view.cubeInserted();
				// Si esta marcado el puzzle marcamos tambien la pieza introducida
				if (this.puzzle.getPuzzle().used) {
					this.view.markShape(0);
				}
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

/***********************************************************************************************************************
 * Métodos Públicos
 **********************************************************************************************************************/

/**
 * Método para soltar una pieza que el jugador haya seleccionado
 * 
 * @param Integer:ID
 *            ID de la pieza a girar.
 */
MultiplayerPuzzleController.prototype.releasePiece = function(ID) {
	// Si la figura a soltar es la que esta seleccionada
	if (this.SELECTED.ID == ID) {
		// Desactivamos el flag de boton de rotacion pulsado
		this.otDown = false;
		// Desactivamos el flag de boton de movimiento pulsado
		this.movDown = false;
		// Si se suelta en la zona del puzzle y no esta resuelto
		if (this.SELECTED != this.puzzle.getPuzzle() && this.puzzle.isPuzzleZone(this.SELECTED.position)
				&& !this.view.isDone) {
			// Cambiamos la rotacion y traslacion de la figura a la que tendra en el puzzle
			this.puzzle.putInCube(this.SELECTED);
			// Y añadimos la figura al puzzle
			this.puzzle.getPuzzle().add(this.SELECTED);
			// Le indicamos al servidor que hemos colodado una pieza en el puzzle
			socket.placedPiece(this.SELECTED.ID, true, this.SELECTED.position, this.SELECTED.rotation);
			// Indicamos a la vista que hemos introducido una pieza en el puzzle
			this.view.cubeInserted();
		}
		// Deseleccionamos el objeto seleccionado
		this.SELECTED = null;
		// Usamos el cursor por defecto
		container.style.cursor = 'auto';
	}
}

/**
 * Método para obtener las posiciones iniciales de las piezas del puzzle
 */
MultiplayerPuzzleController.prototype.getInitialPositions = function() {
	return this.view.initialPositions;
}

/**
 * Método para obtener las rotaciones iniciales de las piezas del puzzle
 */
MultiplayerPuzzleController.prototype.getInitialRotations = function() {
	return this.view.initialRotations;
}

/**
 * Método para mover la pieza indicada del puzzle
 * 
 * @param Integer:ID
 *            ID de la pieza a mover.
 * @param Vector3:pos
 *            vector de 3 elementos con la nueva posición de la pieza.
 */
MultiplayerPuzzleController.prototype.movePiece = function(ID, pos) {
	this.view.movePiece(ID, pos);
}

/**
 * Método para girar la pieza indicada del puzzle
 * 
 * @param Integer:ID
 *            ID de la pieza a girar.
 * @param Vector3:rot
 *            vector de 3 elementos con la nueva rotación de la pieza.
 */
MultiplayerPuzzleController.prototype.rotatePiece = function(ID, rot) {
	this.view.rotatePiece(ID, rot);
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
MultiplayerPuzzleController.prototype.putInPiece = function(ID, pos, rot) {
	this.view.putInPiece(ID, pos, rot);
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
MultiplayerPuzzleController.prototype.putOutPiece = function(ID, pos, rot) {
	this.view.putOutPiece(ID, pos, rot);
}

/**
 * Método para marcar una figura, para indicar que esta siendo usado por otro jugador.
 * 
 * @param Integer:ID
 *            figura a marcar.
 */
MultiplayerPuzzleController.prototype.markShape = function(ID) {
	this.view.markShape(ID);
}

/**
 * Método para marcar una figura, para indicar que esta siendo usado por otro jugador.
 * 
 * @param Integer:ID
 *            figura a marcar.
 */
MultiplayerPuzzleController.prototype.unmarkShape = function(ID) {
	this.view.unmarkShape(ID);
}