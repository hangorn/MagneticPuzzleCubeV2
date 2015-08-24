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
 *  Fecha: 17-01-2013
 *  Versión: 0.2
 *  Fecha: 10-01-2013
 *  Versión: 0.1
 *  */

/*
 *  CLASE SOLUTIONSCONTROLLER
 *  */
function SolutionsController(cam, sce, cub, sens) {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	// Cámara de la escena necesaria para realizar los cálculos de la interacción
	var camera;
	// Escena en la que se representará el mundo 3D
	var scene;
	// Objeto 3D sobre el que se realizarán las operaciones (rotación y traslación)
	var SELECTED;
	// Proyector para realizar operaciones
	var projector;
	// Rayo que realizará las operaciones de intersección
	var ray;

	// Array con los cubos de las soluciones
	var cubes;

	// Coordenadas del ratón en la última vez que se proceso el evento, necesarias para calcular cuanto ha de girar una
	// figura
	var lastMouseX;
	var lastMouseY;
	// Vector de 2 coordenadas que alamacena la posición actual del ratón
	var mouse = new THREE.Vector2();
	// Sensibilidad de giro, relación entre el movimiento del ratón y la cantidad de giro de una figura
	var sensitivity;

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase PuzzleController
	 * 
	 * @param Camera:cam
	 *            cámara con la que se realizarán los cálculos de la interacción.
	 * @param Scene:sce
	 *            escena en la que se representará el mundo 3D.
	 * @param Object3D[]:cub
	 *            array con los cubos de las soluciones.
	 * @param Float:sens
	 *            sensibilidad proporcionada para realizar los giros.
	 */
	camera = cam;
	scene = sce;
	cubes = cub;

	// Sensibilidad por defecto
	sensitivity = sens / 100;

	// Creamos un proyector para realizar el picking
	projector = new THREE.Projector();
	// Creamos un rayo con origen en la posicion de la camara
	ray = new THREE.Raycaster(camera.position);

	// Añadimos receptores de eventos para el raton
	document.getElementById('solutionsCanvas').addEventListener('mousedown', onSolutionsMouseDown, false);
	document.addEventListener('mousemove', onSolutionsMouseMove, false);
	document.addEventListener('mouseup', onSolutionsMouseUp, false);
	// Desactivamos el menu contextual del boton derecho
	document.getElementById('solutionsCanvas').oncontextmenu = function() {
		return false
	};

	/*******************************************************************************************************************
	 * Métodos Privados
	 ******************************************************************************************************************/

	/**
	 * Manejador del evento de botón del ratón pulsado
	 * 
	 * @param EventObject:event->
	 *            caracteristicas del evento lanzado.
	 */
	function onSolutionsMouseDown(event) {
		// Impedimos que se produzca la accion por defecto
		event.preventDefault();

		// Calculamos donde esta el raton con el eje de coordenadas en el centro
		mouse.x = (event.clientX / windowWidth) * 2 - 1;
		mouse.y = -(event.clientY / windowHeight) * 2 + 1;
		// Creamos un vector en la direccion del raton hacia la escena
		var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
		projector.unprojectVector(vector, camera);
		ray.ray.direction = vector.subSelf(camera.position).normalize();

		// Obtenemos la posicion del raton
		lastMouseX = event.clientX;
		lastMouseY = event.clientY;

		// Obtenemos los objetos que son atravesados por el vector
		var intersects = ray.intersectObjects(cubes);

		// Si hay algun objeto
		if (intersects.length > 0) {
			// Obtenemos el primer objeto atravesado, que sera el seleccionado, el que esta delante
			SELECTED = intersects[0].object;

			// Cambiamos al cursor de movimiento
			container.style.cursor = 'move';
		}
	}

	/**
	 * Manejador del evento del movimiento del ratón
	 * 
	 * @param EventObject:event->
	 *            caracteristicas del evento lanzado.
	 */
	function onSolutionsMouseMove(event) {
		// Impedimos que se produzca la accion por defecto
		event.preventDefault();

		// Si hay algun objeto seleccionado
		if (SELECTED) {
			// Obtenemos la posicion del raton
			var mouseX = event.clientX;
			var mouseY = event.clientY;

			// Giramos la figura segun la sensibilidad
			sv.rotateShape(SELECTED, sensitivity * (mouseY - lastMouseY), sensitivity * (mouseX - lastMouseX));

			// Guardamos la posicion para la siguiente llamada
			lastMouseX = mouseX;
			lastMouseY = mouseY;
			// Y salimos del evento
			return;
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
		var intersects = ray.intersectObjects(cubes);

		// Si hay objetos atravesados
		if (intersects.length > 0) {
			// Cambiamos al cursor de seleccion
			container.style.cursor = 'pointer';
		} else {
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
	function onSolutionsMouseUp(event) {
		// Impedimos que se produzca la accion por defecto
		event.preventDefault();

		// Desactivamos el flag de boton derecho pulsado
		rightDown = false;
		// Si no esta pulsado el boton izquierdo
		// Deseleccionamos el objeto seleccionado
		SELECTED = null;
		// Usamos el cursor por defecto
		container.style.cursor = 'auto';
	}

}
