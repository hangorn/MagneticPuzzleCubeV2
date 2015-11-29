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
function MovingPuzzleController(cam, sce, cub, puz) {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	// Cámara de la escena necesaria para realizar los cálculos de la interacción
	var camera;
	// Escena en la que se representará el mundo 3D
	var scene;
	// Objeto 3D sobre el que se realizarán las operaciones (rotación y traslación)
	var SELECTED;
	// Plano para hacer calculos
	var plane;
	// Proyector para realizar operaciones
	var projector;
	// Rayo que realizará las operaciones de intersección
	var ray;

	// Array con los elementos del puzzle (los cubos y el grupo de piezas que forma el cubo)
	var objects = [];
	// Objeto de la clase puzzle
	var puzzle;
	// Booleano para indicar si el puzzle ha sido resuelto
	var isDone = false;

	// Flag para saber si el botón de rotación está pulsado
	var rotDown;
	// Flag para saber si el botón de movimiento está pulsado
	var movDown;
	// Coordenadas del ratón en la última vez que se proceso el evento, necesarias para calcular cuanto ha de girar una
	// figura
	var lastMouseX;
	var lastMouseY;
	// Vector de 2 coordenadas que alamacena la posición actual del ratón
	var mouse = new THREE.Vector2();

	// Sensibilidad de giro, relación entre el movimiento del ratón y la cantidad de giro de una figura
	var sensitivity;
	// Acumulador de giro para cuando se gira una pieza con la tecla CTRL pulsada
	var rotationStore = {
		x : 0,
		y : 0
	};
	// 90 grados en radianes
	var _90degrees = Math.PI / 2;

	// Flag para saber si esta activada la animación del movimiento de los cubos
	var animationEnabled = false;

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase MovingPuzzleController
	 * 
	 * @param Camera:cam
	 *            cámara con la que se realizarán los cálculos de la interacción.
	 * @param Scene:sce
	 *            escena en la que se representará el mundo 3D.
	 * @param Object3D[]:cub
	 *            array con las piezas del puzzle.
	 * @param Puzzle:puz
	 *            objeto de la clase Puzzle.
	 */
	camera = cam;
	scene = sce;

	puzzle = puz;
	// Guardamos los elementos que sufriran la interaccion
	objects = cub.concat(puzzle.getPuzzle());

	// Sensibilidad por defecto
	sensitivity = getOptions().sensitivity / 100;

	// Creamos un plano para el picking
	plane = new THREE.Mesh(new THREE.PlaneGeometry(10000, 10000, 8, 8), new THREE.MeshBasicMaterial({
		color : 0x000000,
		opacity : 0.25,
		transparent : true,
		wireframe : true
	}));
	// Hacemos que no sea visible, es para funcionamiento interno, no para mostrarlo
	plane.visible = false;
	// Añadimos el plano a la escena
	scene.add(plane);

	// Creamos un proyector para realizar el picking
	projector = new THREE.Projector();
	// Creamos un rayo con origen en la posicion de la camara
	ray = new THREE.Raycaster(camera.position);

	// Añadimos receptores de eventos para el raton
	document.getElementById('canvas').addEventListener('mousedown', onPuzzleMouseDown, false);
	document.addEventListener('mousemove', onPuzzleMouseMove, false);
	document.addEventListener('mouseup', onPuzzleMouseUp, false);
	// Desactivamos el menu contextual del boton derecho
	document.getElementById('canvas').oncontextmenu = function() {
		return false
	};

	enableAnimation();

	/*******************************************************************************************************************
	 * Métodos Privados
	 ******************************************************************************************************************/

	/**
	 * Manejador del evento de botón del ratón pulsado
	 * 
	 * @param EventObject:event->
	 *            caracteristicas del evento lanzado.
	 */
	function onPuzzleMouseDown(event) {
		// Impedimos que se produzca la accion por defecto
		event.preventDefault();

		// Calculamos donde esta el raton con el eje de coordenadas en el centro
		mouse.x = (event.clientX / windowWidth) * 2 - 1;
		mouse.y = -(event.clientY / windowHeight) * 2 + 1;
		// Creamos un vector en la direccion del raton hacia la escena
		var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
		projector.unprojectVector(vector, camera);
		ray.ray.direction = vector.subSelf(camera.position).normalize();

		// Si es el boton de giro
		if (event.button == getOptions().rotOpt) {
			// Activamos el flag del boton de rotacion
			rotDown = true;

			// Obtenemos la posicion del raton
			lastMouseX = event.clientX;
			lastMouseY = event.clientY;

			plane.position.z = 0;
			// Obtenemos la interseccion entre el vector y el plano
			var intersects = ray.intersectObject(plane);
			// Si el raton esta en la zona del puzzle
			if (puzzle.isPuzzleZone(intersects[0].point)) {
				// Si ya estaba pulsado el boton de mover y habia una pieza seleccionada
				if (movDown && SELECTED) {
					// Cambiamos la rotacion y traslacion de la figura a la que tendra en el puzzle
					puzzle.putInCube(SELECTED);
					// Y añadimos la figura al puzzle
					puzzle.getPuzzle().add(SELECTED);

					// Indicamos a la vista que hemos introducido una pieza en el puzzle
					isDone = pv.cubeInserted();
				}
				// Seleccionamos el grupo para girar este en vez de una figura individual
				SELECTED = puzzle.getPuzzle();
				// Cambiamos al cursor de movimiento
				container.style.cursor = 'crosshair';
				return;
			}

			// Obtenemos los objetos que son atravesados por el vector
			var intersects = ray.intersectObjects(objects);
			// Si hay algun objeto
			if (intersects.length > 0) {
				// Obtenemos el primer objeto atravesado, que sera el seleccionado, el que esta delante
				SELECTED = intersects[0].object;
				// Indicamos que la pieza esta siendo usada
				SELECTED.used = true;

				// Cambiamos al cursor de movimiento
				container.style.cursor = 'move';
			}
		}

		// Si es el boton de movimiento
		if (event.button == getOptions().movOpt) {
			// Activamos el flag del boton de movimiento
			movDown = true;
			// Si no esta resuelto el puzzle
			if (!isDone) {
				// Obtenemos los objetos que son atravesados por el vector
				var intersects = ray.intersectObjects(objects);
				// Si hay algun objeto
				if (intersects.length > 0) {
					// Obtenemos el primer objeto atravesado, que sera el seleccionado, el que esta delante
					SELECTED = intersects[0].object;
					// Indicamos que la pieza esta siendo usada
					SELECTED.used = true;
					// Si esta en el puzzle
					if (SELECTED.parent == puzzle.getPuzzle()) {
						// Si ya esta pulsado el boton de girar
						if (rotDown) {
							SELECTED = puzzle.getPuzzle();
						} else {
							// Sacamos la figura del puzzle
							puzzle.putOutCube(SELECTED);
							// Añadimos la figura a la escena, con lo cual se borrara tambien del grupo del puzzle
							scene.add(SELECTED);
						}
					}
					// Cambiamos al cursor de movimiento
					container.style.cursor = 'move';
				}
			}
		}
	}

	/**
	 * Manejador del evento del movimiento del ratón
	 * 
	 * @param EventObject:event->
	 *            caracteristicas del evento lanzado.
	 */
	function onPuzzleMouseMove(event) {
		// Impedimos que se produzca la accion por defecto
		event.preventDefault();

		// Si hay algun objeto seleccionado
		if (SELECTED) {
			// Si esta pulsado el boton de rotacion y no el de movimiento
			if (rotDown && !movDown) {
				// Obtenemos la posicion del raton
				var mouseX = event.clientX;
				var mouseY = event.clientY;

				// Si no está pulsada la tecla CTRL
				if (!event.ctrlKey) {
					rotationStore.x = rotationStore.y = 0;
					// Giramos la figura segun la sensibilidad
					pv.rotateShape(SELECTED, sensitivity * (mouseY - lastMouseY), sensitivity * (mouseX - lastMouseX));
				} else {
					// Calculamos cuanto se ha girado
					rotationStore.x += sensitivity * (mouseY - lastMouseY);
					rotationStore.y += sensitivity * (mouseX - lastMouseX);
					// Si el giro en el eje X ha sido mayor de 90 grados
					if (rotationStore.x > _90degrees) {
						pv.rotateShape(SELECTED, _90degrees, 0);
						rotationStore.x -= _90degrees;
					}
					// Si el giro en el eje X ha sido menor de -90 grados
					if (rotationStore.x < -_90degrees) {
						pv.rotateShape(SELECTED, -_90degrees, 0);
						rotationStore.x += _90degrees;
					}
					// Si el giro en el eje Y ha sido mayor de 90 grados
					if (rotationStore.y > _90degrees) {
						pv.rotateShape(SELECTED, 0, _90degrees);
						rotationStore.y -= _90degrees;
					}
					// Si el giro en el eje Y ha sido menor de -90 grados
					if (rotationStore.y < -_90degrees) {
						pv.rotateShape(SELECTED, 0, -_90degrees);
						rotationStore.y += _90degrees;
					}
				}

				// Guardamos la posicion para la siguiente llamada
				lastMouseX = mouseX;
				lastMouseY = mouseY;
				// Y salimos del evento
				return;
			}

			// Si esta pulsado el boton de movimiento y no el de rotacion
			if (movDown && !rotDown) {
				// Calculamos donde esta el raton con el eje de coordenadas en el centro
				mouse.x = (event.clientX / windowWidth) * 2 - 1;
				mouse.y = -(event.clientY / windowHeight) * 2 + 1;

				// Creamos un vector en la direccion del raton hacia la escena
				var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
				projector.unprojectVector(vector, camera);
				ray.ray.direction = vector.subSelf(camera.position).normalize();
				// Calculamos la interseccion con el plano
				var intersects = ray.intersectObject(plane);

				// Si el objeto seleccionado no es el puzzle ni esta solucionado el puzzle, entonces movemos el objeto
				if (SELECTED != puzzle.getPuzzle() && !isDone) {
					// Si el raton se encuentra en la zona de movimiento
					if (event.clientX >= 0 && event.clientX <= windowWidth && event.clientY >= 0
							&& event.clientY <= windowHeight) {
						// Movemos la figura seleccionada
						SELECTED.position.copy(intersects[0].point);
					}
					// Comprobamos si esta en la zona del puzzle, para mover el cubo hacia
					// delante en caso de tener uno detras, para que no se solapen
					if (puzzle.isPuzzleZone(SELECTED.position)) {
						// Obtenemos el objeto que es atravesado por el vector sin contar la figura seleccionada
						var intersects = ray.intersectObjects(objects);
						var intersector = null;
						for (var i = 0; i < intersects.length; i++) {
							if (intersects[i].object != SELECTED) {
								intersector = intersects[i];
								break;
							}
						}

						// Si hay un objeto
						if (intersector) {
							// Movemos tanto el plano de desplazamiento como la figura hacia delante
							// tanto como este la figura anterior mas la mitad del tamaño de la seleccionada
							plane.position.z = SELECTED.position.z = intersector.point.z + 200;
						} else if (SELECTED.position.z != 0) {
							// Si no hay objetos atravesados sin contar el seleccionado y la figura no esta en Z=0
							// Movemos tanto la figura como el plano de desplazamiento a Z=0
							SELECTED.position.z = plane.position.z = 0;
						}
					} else if (SELECTED.position.z != 0) {
						// Si no esta en la zona del puzzle pero no esta en Z=0
						// Movemos tanto la figura como el plano de desplazamiento a Z=0
						SELECTED.position.z = plane.position.z = 0;
					}
				}

				// Y salimos del evento
				return;
			}

			// Si esta pulsado el boton de movimiento y el de rotacion
			if (movDown && rotDown) {
				// Si la pieza ha girar esta introducida en el puzzle
				if (SELECTED.parent == puzzle.getPuzzle()) {
					// Giramos el puzzle
					SELECTED = puzzle.getPuzzle();
				}

				// Obtenemos la posicion del raton
				var mouseX = event.clientX;
				var mouseY = event.clientY;

				// Si no está pulsada la tecla CTRL
				if (!event.ctrlKey) {
					rotationStore.x = rotationStore.y = 0;
					// Giramos la figura segun la sensibilidad
					pv.rotateShape(SELECTED, 0, 0, -sensitivity * (mouseY - lastMouseY) - sensitivity
							* (mouseX - lastMouseX));
				}
				// Si esta pulsada la tecla CTRL
				else {
					// Calculamos cuanto se ha girado
					rotationStore.x += sensitivity * (mouseY - lastMouseY);
					rotationStore.y += sensitivity * (mouseX - lastMouseX);
					// Si el giro en el eje X o en el eje Y ha sido mayor de 90 grados
					if (rotationStore.x > _90degrees || rotationStore.y > _90degrees) {
						pv.rotateShape(SELECTED, 0, 0, -_90degrees);
						rotationStore.x = rotationStore.x - _90degrees * (Math.floor(rotationStore.x / _90degrees));
						rotationStore.y = rotationStore.y - _90degrees * (Math.floor(rotationStore.y / _90degrees));
					}
					// Si el giro en el eje X ha sido menor de -90 grados
					if (rotationStore.x < -_90degrees || rotationStore.y < -_90degrees) {
						pv.rotateShape(SELECTED, 0, 0, +_90degrees);
						rotationStore.x = rotationStore.x - _90degrees * (Math.floor(rotationStore.x / _90degrees));
						rotationStore.y = rotationStore.y - _90degrees * (Math.floor(rotationStore.y / _90degrees));
					}
				}

				// Guardamos la posicion para la siguiente llamada
				lastMouseX = mouseX;
				lastMouseY = mouseY;

				// Y salimos del evento
				return;
			}
		}

		// Si llegamos hasta aqui es que no esta seleccionado ningun objeto
		// Calculamos donde esta el raton con el eje de coordenadas en el centro
		mouse.x = (event.clientX / windowWidth) * 2 - 1;
		mouse.y = -(event.clientY / windowHeight) * 2 + 1;
		// Creamos un vector en la direccion del raton hacia la escena
		var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
		projector.unprojectVector(vector, camera);
		ray.ray.direction = vector.subSelf(camera.position).normalize();
		// Obtenemos los objetos que son atravesados por el vector
		var intersects = ray.intersectObjects(objects);

		// Si hay objetos atravesados
		if (intersects.length > 0) {
			// Cambiamos al cursor de seleccion
			container.style.cursor = 'pointer';
		}
		// Si no hay objetos atravesados
		else {
			// Usamos el cursor por defecto
			container.style.cursor = 'auto';
		}
	}

	/**
	 * Manejador del evento de botón del ratón levantado
	 * 
	 * @param EventObject:event->
	 *            caracteristicas del evento lanzado.
	 */
	function onPuzzleMouseUp(event) {
		// Impedimos que se produzca la accion por defecto
		event.preventDefault();

		// Si es el boton de giro
		if (event.button == getOptions().rotOpt) {
			// Desactivamos el flag de boton de rotacion pulsado
			rotDown = false;
			// Si no esta pulsado el boton de movimiento
			if (!movDown) {
				// Si hay alguna pieza seleccionada
				if (SELECTED) {
					// Indicamos que la pieza esta ya no esta siendo usada
					SELECTED.used = false;
				}
				// Deseleccionamos el objeto seleccionado
				SELECTED = null;
				// Usamos el cursor por defecto
				container.style.cursor = 'auto';
			}
		}

		// Si es el boton de movimiento
		if (event.button == getOptions().movOpt) {
			// Desactivamos el flag de boton de movimiento pulsado
			movDown = false;
			// Si hay algun objeto seleccionado
			if (SELECTED) {
				// Si se suelta en la zona del puzzle y no esta resuelto
				if (SELECTED != puzzle.getPuzzle() && puzzle.isPuzzleZone(SELECTED.position) && !isDone) {
					// Cambiamos la rotacion y traslacion de la figura a la que tendra en el puzzle
					puzzle.putInCube(SELECTED);
					// Y añadimos la figura al puzzle
					puzzle.getPuzzle().add(SELECTED);

					// Indicamos a la vista que hemos introducido una pieza en el puzzle
					isDone = pv.cubeInserted();
				}
				// Si no esta pulsado el boton de rotacion
				if (!rotDown) {
					// Indicamos que la pieza esta ya no esta siendo usada
					SELECTED.used = false;
					// Deseleccionamos el objeto seleccionado
					SELECTED = null;
					// Usamos el cursor por defecto
					container.style.cursor = 'auto';
				}
			}
		}
	}

	/**
	 * Método que iniciará la animación de los cubos
	 */
	function enableAnimation() {
		animationEnabled = true;
		for (i = 0; i < objects.length; i++) {
			objects[i].dir = new THREE.Vector2(1, 1);
		}
		animateCubes();
	}

	/**
	 * Método para mover los cubos
	 */
	function animateCubes() {
		if (animationEnabled) {
			// Recorremos todos los objetos que sufren una interaccion (piezas del puzzle y el puzzle)
			for (var i = 0; i < objects.length; i++) {
				// Comprobamos que no sea ni el puzzle, ni este introducido en el puzzle ni este siendo usado
				if (objects[i] != puzzle.getPuzzle() && objects[i].parent != puzzle.getPuzzle() && !objects[i].used) {
					// Movemos cada cubo
					objects[i].position.addSelf(new THREE.Vector3(objects[i].dir.x * (Math.random() * 20 + 40),
							objects[i].dir.y * (Math.random() * 20 + 40), 0));
					// Comprobamos que no se salga por la izquierda
					if (objects[i].position.x < -1000) {
						objects[i].dir.x = 1;
					}
					// Comprobamos que no se salga por la derecha
					if (objects[i].position.x > 1000) {
						objects[i].dir.x = -1;
					}
					// Comprobamos que no se salga por arriba
					if (objects[i].position.y < -700) {
						objects[i].dir.y = 1;
					}
					// Comprobamos que no se salga por arriba
					if (objects[i].position.y > 700) {
						objects[i].dir.y = -1;
					}
					// Giramos cada cubo
					objects[i].rotation.addSelf(new THREE.Vector3(0.005, 0.005, 0.005));
				}
			}
			setTimeout(animateCubes, 100);
		}
	}

	/*******************************************************************************************************************
	 * Métodos Públicos
	 ******************************************************************************************************************/

	/**
	 * Método que elimina el controlador. Lo único que hace es eliminar los manejadores de eventos que tiene registrados
	 */
	this.remove = function() {
		// Desactivamos la animacion del movimiento de los cubos
		animationEnabled = false;

		// Borramos receptores de eventos para el raton
		document.getElementById('canvas').removeEventListener('mousedown', onPuzzleMouseDown, false);
		document.removeEventListener('mousemove', onPuzzleMouseMove, false);
		document.removeEventListener('mouseup', onPuzzleMouseUp, false);

		// Usamos el cursor por defecto
		container.style.cursor = 'auto';
	}

	/**
	 * Método que habilita el controlador. Registra los eventos necesarios
	 */
	this.enable = function() {
		// Registramos de nuevo los receptores de eventos para el raton
		document.getElementById('canvas').addEventListener('mousedown', onPuzzleMouseDown, false);
		document.addEventListener('mousemove', onPuzzleMouseMove, false);
		document.addEventListener('mouseup', onPuzzleMouseUp, false);

		// Obtenemos la sensibilidad con la que se debe girar
		sensitivity = getOptions().sensitivity / 100;

		// Activamos la animacion del movimiento de los cubos
		enableAnimation();
	}

	/**
	 * Método para indicar al controlador que el puzzle ha sido resuelto
	 */
	this.setIsDone = function() {
		isDone = true;
	}

}