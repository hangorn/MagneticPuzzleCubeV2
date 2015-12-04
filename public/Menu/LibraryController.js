/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: LibraryController.js
 *  Sinopsis: Clase controlador que se encargará de manejar lo eventos en la biblioteca de imágenes.
 *  
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 05-03-2013
 *  Versión: 0.5
 *  Fecha: 17-01-2013
 *  Versión: 0.4
 *  Fecha: 30-12-2012
 *  Versión: 0.3
 *  Fecha: 29-12-2012
 *  Versión: 0.2
 *  Fecha: 28-12-2012
 *  Versión: 0.1
 *  */

/*
 *  CLASE LIBRARYCONTROLLER
 *  */
function LibraryController(type, backAction) {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	// Objeto 3D sobre el que se realizarán las operaciones (rotación o traslación)
	var SELECTED;
	// Objeto 3D sobre el cual se realizarán operaciones (cambiar el color)
	var INTERSECTED;
	// Plano para hacer calculos
	var plane;
	// Proyector para realizar operaciones
	var projector;
	// Rayo que realizará las operaciones de intersección
	var ray;

	// Array con todos los planos de una determinada página
	var pagePlanes = [];
	// Pagina actual
	var currentPage;
	// Tipo de vista con la que ha sido creado el controlador, 1 -> imágenes seleccionables, 2 -> formar dos cubos con
	// imágenes, 3 -> formar tres cubos con imágenes
	var typeView;

	// Flag para saber si el botón derecho está pulsado
	var rightDown;
	// Flag para saber si el botón izquierdo está pulsado
	var leftDown;
	// Coordenadas del ratón en la última vez que se proceso el evento, necesarias para calcular cuanto ha de girar una
	// figura
	var lastMouseX;
	var lastMouseY;
	// Vector de 2 coordenadas que alamacena la posición actual del ratón
	var mouse = new THREE.Vector2();

	// Figura/imagen que esta agrandada
	var zoomedIn = null;
	// Control para subir/abrir ficheros
	var inputFile;
	// Lista de botones
	var buttons;

	// Sensibilidad de giro, relación entre el movimiento del ratón y la cantidad de giro de una figura
	var sensitivity;

	// Vista gestionada con THREE.js
	var view;

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase LibraryController
	 * 
	 * @param Integer:type
	 *            tipo de vista, 1 -> imágenes seleccionables, 2 -> formar dos cubos con imagánes, 3 formar tres cubos
	 *            con imágenes.
	 * @param Callback:backAction
	 *            acción que se ejecutará al pulsar el botón de atrás o el botón de aceptar. Esta función recibirá un
	 *            parámetro con un array de los materiales seleccionados. Si se pulsa atras este parametro tendra valor
	 *            null
	 */

	// Guardamos los parametros obtenidos
	typeView = type;
	// Creamos la vista
	view = new LibraryView(typeView);

	// Sensibilidad por defecto
	sensitivity = getOptions().sensitivity / 100;

	// Guardamos los planos de la primera pagina
	currentPage = 0;
	pagePlanes = view.getCurrentPlanes();

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
	// Si el tipo de vista necesita arrastra el raton registramos los eventos correspondientes
	if (typeView != 1) {
		document.getElementById('canvas').addEventListener('mousedown', onLibraryMouseDown, false);
		document.addEventListener('mouseup', onLibraryMouseUp, false);
	}
	document.addEventListener('mousemove', onLibraryMouseMove, false);
	document.getElementById('canvas').addEventListener('click', onLibraryClick, false);
	document.getElementById('canvas').addEventListener('dblclick', onLibraryDblClick, false);

	// Desactivamos el menu contextual del boton derecho
	document.getElementById('canvas').oncontextmenu = function() {
		return false
	};

	// Creamos una entrada de archivos
	inputFile = document.createElement('input')
	inputFile.type = 'file';
	inputFile.multiple = true;
	inputFile.accept = 'image/*';
	inputFile.addEventListener('change', onLibraryFile, false);
	// inputFile.style.display = 'none';
	// container.appendChild(inputFile);

	// Asociamos cada boton con su accion y los guardamos para luego poder hacer el picking sobre ellos
	view.getAcceptButton().action = onLibraryAccept;
	view.getBackButton().action = onLibraryBack;
	view.getAddImgButton().action = onLibraryAddImage;
	buttons = [ view.getAcceptButton(), view.getBackButton(), view.getAddImgButton() ];

	/*******************************************************************************************************************
	 * Métodos Privados
	 ******************************************************************************************************************/

	/**
	 * Manejador del evento de botón del ratón pulsado
	 * 
	 * @param EventObject:event->
	 *            caracteristicas del evento lanzado.
	 */
	function onLibraryMouseDown(event) {
		// Impedimos que se produzca la accion por defecto
		event.preventDefault();

		// Si hay una imagen agrandada la restauramos
		if (zoomedIn != null) {
			zoomedIn.position.copy(new THREE.Vector3(zoomedIn.iniPosX, zoomedIn.iniPosY, 0));
			zoomedIn = null;
		}

		// Calculamos donde esta el raton con el eje de coordenadas en el centro
		mouse.x = (event.clientX / windowWidth) * 2 - 1;
		mouse.y = -(event.clientY / windowHeight) * 2 + 1;
		// Creamos un vector en la direccion del raton hacia la escena
		var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
		projector.unprojectVector(vector, camera);
		ray.ray.direction = vector.subSelf(camera.position).normalize();

		// Si ya hay un objeto seleccionado seguimos operando con el
		if (SELECTED) {
			return;
		}

		// Obtenemos los planos de las imagenes de la pagina actual que son atravesados por el vector
		var intersects = ray.intersectObjects(pagePlanes);
		// Si hay algun objeto
		if (intersects.length > 0) {
			// Obtenemos el primer objeto atravesado, que sera el seleccionado, el que esta delante
			SELECTED = intersects[0].object;

			// Cambiamos al cursor de movimiento
			container.style.cursor = 'move';
		}

		// Obtenemos los cubos que son atravesados por el vector
		var intersects = ray.intersectObjects(view.getCubes());
		// Si hay algun objeto
		if (intersects.length > 0) {
			// Obtenemos el primer objeto atravesado, que sera el seleccionado, el que esta delante
			SELECTED = intersects[0].object;

			// Obtenemos la posicion del raton
			lastMouseX = event.clientX;
			lastMouseY = event.clientY;

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
	function onLibraryMouseMove(event) {
		// Impedimos que se produzca la accion por defecto
		event.preventDefault();

		// Si hay algun objeto seleccionado
		if (SELECTED) {
			// Si la figura seleccionada no es uno de los cubos
			if (view.getCubes().indexOf(SELECTED) == -1) {
				// Calculamos donde esta el raton con el eje de coordenadas en el centro
				mouse.x = (event.clientX / windowWidth) * 2 - 1;
				mouse.y = -(event.clientY / windowHeight) * 2 + 1;

				// Creamos un vector en la direccion del raton hacia la escena
				var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
				projector.unprojectVector(vector, camera);
				ray.ray.direction = vector.subSelf(camera.position).normalize();

				// Calculamos la interseccion con el plano
				var intersects = ray.intersectObject(plane);
				// Si el raton se encuentra en la zona de movimiento
				if (event.clientX >= 0 && event.clientX <= windowWidth && event.clientY >= 0
						&& event.clientY <= windowHeight) {
					// Movemos la figura seleccionada
					SELECTED.position.copy(intersects[0].point);
					// Si esta en la zona de los cubos adelantamos la figura para que se sobreponga a los cubos
					if (view.isCubeZone(intersects[0].point)) {
						view.putZBefore(SELECTED);
					} else {
						// Ponemos la figura que se esta moviendo delante para que se superponga al resto de planos
						view.putZ1(SELECTED);
					}
				}

				// Y salimos del evento
				return;
			}

			// si la figura es uno de los cubos
			else {
				// Obtenemos la posicion del raton
				var mouseX = event.clientX;
				var mouseY = event.clientY;

				// Giramos la figura
				// Creamos una matriz temporal para hacer transformaciones
				var temp = new THREE.Matrix4();
				// Introducimos la nueva rotacion
				temp.setRotationFromEuler(new THREE.Vector3(sensitivity * (mouseY - lastMouseY), sensitivity
						* (mouseX - lastMouseX), 0));
				// La transformamos segun la rotacion de la figura
				SELECTED.updateMatrix();
				temp.multiply(temp, SELECTED.matrix);
				// Extraemos la rotacion de la matriz y la guardamos en el vector
				SELECTED.rotation.setEulerFromRotationMatrix(temp);

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

		// Obtenemos los planos de la pagina que son atravesados por el vector
		var intersects = ray.intersectObjects(pagePlanes);
		// Si hay objetos atravesados de los planos
		if (intersects.length > 0) {
			// Cambiamos al cursor de seleccion
			container.style.cursor = 'pointer';
			return;
		} else {
			if (typeView != 1) {
				// Obtenemos los planos de la pagina que son atravesados por el vector
				var intersects = ray.intersectObjects(view.getCubes());
				// Si hay objetos atravesados de los planos
				if (intersects.length > 0) {
					// Cambiamos al cursor de seleccion
					container.style.cursor = 'pointer';
					return;
				}
			}

			// Obtenemos los numeros de pagina o los botones que son atravesados por el vector
			var intersects = ray.intersectObjects(view.getPages().concat(buttons));
			// Si hay objetos atravesados de los numeros de pagina
			if (intersects.length > 0) {
				// Cambiamos al cursor de seleccion
				container.style.cursor = 'pointer';
				// Si no se le ha cambiado ya el color
				if (intersects[0].object != INTERSECTED) {
					INTERSECTED = intersects[0].object;
					// Cambiamos el color de la figura
					var rand = randomColor();
					// Para diferencia entre paginas y botones comprobamos si tienen varios materiales (solo las
					// letras/paginas tiene dos materiales: frontal y lateral)
					if (INTERSECTED.material.materials) {
						INTERSECTED.material.materials[0].color.setHSV(rand, 0.95, 0.85);
						INTERSECTED.material.materials[1].color.setHSV(rand, 0.95, 0.50);
					} else {
						INTERSECTED.text.material.materials[0].color.setHSV(rand, 0.95, 0.85); // Color letra frontal
						INTERSECTED.text.material.materials[1].color.setHSV(rand, 0.95, 0.50); // Color letra lateral
						INTERSECTED.material.color.setHex((1 - rand) * 0xffffff); // Color fondo

					}
				}
			}
			// Si no hay objetos atravesados
			else {
				// Usamos el cursor por defecto
				container.style.cursor = 'auto';
				// Si hay algun objeto con el color cambiado
				if (INTERSECTED) {
					var rand = randomColor();
					// Para diferencia entre paginas y botones comprobamos si tienen varios materiales (solo las
					// letras/paginas tiene dos materiales: frontal y lateral)
					if (INTERSECTED.material.materials) {
						INTERSECTED.material.materials[0].color.setHSV(rand, 0.95, 0.85);
						INTERSECTED.material.materials[1].color.setHSV(rand, 0.95, 0.50);
					} else {
						INTERSECTED.text.material.materials[0].color.setHSV(rand, 0.95, 0.85); // Color letra frontal
						INTERSECTED.text.material.materials[1].color.setHSV(rand, 0.95, 0.50); // Color letra lateral
						INTERSECTED.material.color.setHex((1 - rand) * 0xffffff); // Color fondo

					}
					INTERSECTED = null;
				}
			}
		}
	}

	/**
	 * Manejador del evento de botón del ratón levantado
	 * 
	 * @param EventObject:event->
	 *            caracteristicas del evento lanzado.
	 */
	function onLibraryMouseUp(event) {
		// Impedimos que se produzca la accion por defecto
		event.preventDefault();

		// Si hay algun objeto seleccionado
		if (SELECTED) {
			// Si la figura seleccionada no es uno de los cubos
			if (view.getCubes().indexOf(SELECTED) == -1) {
				// Si se suelta en la zona de los cubos
				if (view.isCubeZone(SELECTED.position)) {
					// Buscamos el cubo mas cercano a la posicion en la que se ha soltado el plano
					var min = 0, dist;
					// Recorremos los cubos
					for (var i = 0; i < view.getCubes().length; i++) {
						// Calculamos la distancia
						var d = SELECTED.position.distanceTo(view.getCubes()[i].position);
						// Si la distancia minima no esta definida la iniciamos
						if (dist === undefined) {
							dist = d;
						} else if (d < dist) {
							// Si se ha encontrado un nuevo minimo lo guardamos
							dist = d;
							min = i;
						}
					}

					// Ahora obtenemos la cara del cubo que esta hacia la camara
					// Primero creamos un vector hacia el cubo
					var vector = new THREE.Vector3().copy(view.getCubes()[min].position);
					ray.ray.direction = vector.subSelf(camera.position).normalize();
					// Obtenemos la interseccion con el cubo
					var intersects = ray.intersectObject(view.getCubes()[min]);

					// Guardamos el material en la cara con la que intersecciona el vector
					view.getCubes()[min].material.materials[intersects[0].faceIndex] = SELECTED.material;
				}

				// Se devuelve a la posicion inicial
				SELECTED.position.copy(new THREE.Vector3(SELECTED.iniPosX, SELECTED.iniPosY, 0));
			}

			// Deseleccionamos el objeto seleccionado
			SELECTED = null;
			// Usamos el cursor por defecto
			container.style.cursor = 'auto';
		}
	}

	/**
	 * Manejador del evento de click
	 * 
	 * @param EventObject:event->
	 *            caracteristicas del evento lanzado.
	 */
	function onLibraryClick(event) {
		// Impedimos que se produzca la accion por defecto
		event.preventDefault();

		// Si hay una imagen agrandada la restauramos
		if (zoomedIn != null) {
			zoomedIn.position.copy(new THREE.Vector3(zoomedIn.iniPosX, zoomedIn.iniPosY, 0));
			zoomedIn = null;
		}

		// Calculamos donde esta el raton con el eje de coordenadas en el centro
		mouse.x = (event.clientX / windowWidth) * 2 - 1;
		mouse.y = -(event.clientY / windowHeight) * 2 + 1;
		// Creamos un vector en la direccion del raton hacia la escena
		var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
		projector.unprojectVector(vector, camera);
		ray.ray.direction = vector.subSelf(camera.position).normalize();

		// Obtenemos los numeros de pagina que son atravesados por el vector
		var intersects = ray.intersectObjects(view.getPages());
		// Si hay algun objeto
		if (intersects.length > 0) {
			// Obtenemos el identificador del texto para saber que tenemos que hacer
			var ID = intersects[0].object.textID;

			// Comprobamos que accion hay que realizar
			if (ID == -2) {// Ir a la primera pagina
				view.showPage(currentPage = 0);
			} else if (ID == -1) {// Ir a la pagina anterior
				view.showPage(currentPage = (currentPage == 0 ? 0 : currentPage - 1));
			} else if (ID == view.getNumberOfPages()) {// Ir a la pagina siguiente
				view.showPage(currentPage = (currentPage == view.getNumberOfPages() - 1 ? view.getNumberOfPages() - 1
						: currentPage + 1));
			} else if (ID == view.getNumberOfPages() + 1) {// Ir a la ultima pagina
				view.showPage(currentPage = (view.getNumberOfPages() - 1));
			} else if (ID >= 0 && ID <= view.getNumberOfPages() - 1) {// Ir a la pagina seleccionada
				view.showPage(currentPage = ID);
			} else { // A este punto no deberia llegar nunca
				console.error("ID de pagina de la biblioteca de imagenes desconocido");
			}
			// Guardamos los planos de la pagina seleccionada
			pagePlanes = view.getCurrentPlanes();
		}

		// Si el modo de vista es el imagenes seleccionables
		if (typeView == 1) {
			// Obtenemos los planos de imagenes que son atravesados por el vector
			var intersects = ray.intersectObjects(pagePlanes);
			// Si hay algun objeto
			if (intersects.length > 0) {
				// Si la imagen esta seleccionada
				if (intersects[0].object.selected) {
					// La deseleccionamos
					intersects[0].object.selected = !intersects[0].object.selected;
					scene.remove(intersects[0].object.selectedPlane);
				}
				// Si la imagen no esta seleccionada
				else {
					// La seleccionamos
					intersects[0].object.selected = !intersects[0].object.selected;
					scene.add(intersects[0].object.selectedPlane);
				}
				// Se devuelve a la posicion inicial
				intersects[0].object.position.x = intersects[0].object.iniPosX;
				intersects[0].object.position.y = intersects[0].object.iniPosY
				intersects[0].object.position.z = 0;
			}
		}

		// Obtenemos los botones que son atravesados por el vector
		var intersects = ray.intersectObjects(buttons);
		// Si hay algun objeto/boton ejecutamos su accion correspondiente
		if (intersects.length > 0) {
			intersects[0].object.action();
		}
	}

	/**
	 * Manejador del evento de doble click
	 * 
	 * @param EventObject:event->
	 *            caracteristicas del evento lanzado.
	 */
	function onLibraryDblClick(event) {
		// Impedimos que se produzca la accion por defecto
		event.preventDefault();

		// Calculamos donde esta el raton con el eje de coordenadas en el centro
		mouse.x = (event.clientX / windowWidth) * 2 - 1;
		mouse.y = -(event.clientY / windowHeight) * 2 + 1;
		// Creamos un vector en la direccion del raton hacia la escena
		var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
		projector.unprojectVector(vector, camera);
		ray.ray.direction = vector.subSelf(camera.position).normalize();

		// Si es el boton derecho
		if (event.button == 2) {
			// Activamos el flag del boton derecho
			rightDown = true;
		}

		// Si es el boton central
		if (event.button == 1) {

		}

		// Si es el boton izquierdo
		if (event.button == 0) {
			// Activamos el flag del boton izquierdo
			leftDown = true;
			// Usamos el cursor por defecto
			container.style.cursor = 'auto';

			// Obtenemos los objetos que son atravesados por el vector
			var intersects = ray.intersectObjects(pagePlanes);

			// Si hay algun objeto
			if (intersects.length > 0) {
				// Guardamos el objeto para poder restaurarlo
				zoomedIn = intersects[0].object;
				// Cambiamos la posicion del objeto, lo ponemos delante
				intersects[0].object.position.x = 0;
				intersects[0].object.position.y = 0;
				intersects[0].object.position.z = 2450;
			}
		}
	}

	/**
	 * Método que realiza la acción necesaria cuando se pulsa el botón de añadir imagen
	 * 
	 * @param EventObject:event->
	 *            caracteristicas del evento lanzado.
	 */
	function onLibraryAddImage(event) {
		// Obtenemos la entrada de archivos y ejecutamos su evento click
		inputFile.click();
	}

	/**
	 * Método que realiza la acción necesaria para obtener un archivo del tipo imagen
	 * 
	 * @param EventObject:event->
	 *            caracteristicas del evento lanzado.
	 */
	function onLibraryFile(event) {
		// Guardamos los archivos seleccionados por el usuario
		var files = this.files;

		// Contador para saber cuando se han cargado todas las figuras
		var counter = 0;
		// Array donde se introduciran las texturas
		var texture = [];
		// Recorremos todos los archivos seleccionados
		for (var i = 0; i < files.length; i++) {
			// Obtenemos la URL de la imagen
			var url = window.URL.createObjectURL(files[i]);
			// Creamos una textura con la imagen y la guardamos en el array de texturas
			texture.push(loadTexture(url, function() {
				counter += 1;

				// Si se han cargado todas las imagenes
				if (counter === files.length) {
					// Recorremos todas las texturas
					for (k = 0; k < texture.length; k++) {
						// Creamos un material con la textura
						var material = new THREE.MeshBasicMaterial({
							map : texture[k]
						});
						// Si se ha podido añadir el material a la biblioteca
						if (view.addImg(material)) {
							// Añadimos el material a la lista de materiales
							IMAGES.push(material);
						} else {
							alert("No caben mas imágenes en la biblioteca.");
						}
						// Guardamos los planos de la pagina seleccionada
						pagePlanes = view.getCurrentPlanes();
					}
				}
			}));
		}
	}

	/**
	 * Método que realiza la acción necesaria cuando se pulsa el botón de aceptar
	 * 
	 * @param EventObject:event->
	 *            caracteristicas del evento lanzado.
	 */
	function onLibraryAccept(event) {
		// Obtenemos los materiales de la biblioteca
		var mats = view.getSelectedMaterials();
		// Ocultamos la vista de la biblioteca
		hide();
		// Le pasamos los materiales a la accion correspondiente
		backAction(mats);
	}

	/**
	 * Método que realiza la acción necesaria cuando se pulsa el botón de aceptar
	 * 
	 * @param EventObject:event->
	 *            caracteristicas del evento lanzado.
	 */
	function onLibraryBack(event) {
		// Ocultamos la vista de la biblioteca
		hide();
		// Le pasamos los materiales a la accion correspondiente
		backAction(null);
	}

	/**
	 * Método que elimina el controlador. Lo único que hace es eliminar los manejadores de eventos que tiene registrados
	 */
	function remove() {
		// Borramos receptores de eventos para el raton
		document.getElementById('canvas').removeEventListener('mousedown', onLibraryMouseDown, false);
		document.removeEventListener('mouseup', onLibraryMouseUp, false);
		document.removeEventListener('mousemove', onLibraryMouseMove, false);
		document.getElementById('canvas').removeEventListener('click', onLibraryClick, false);
		document.getElementById('canvas').removeEventListener('dblclick', onLibraryDblClick, false);

		// Quitamos el plano del picking de la escena
		scene.remove(plane);
		container.removeChild(renderer.domElement);
	}

	/**
	 * Método que habilita el controlador. Registra los eventos necesarios
	 * 
	 * @param Integer:type
	 *            tipo de la vista con la que se activa el controlador.
	 */
	function enable() {
		container.appendChild(renderer.domElement);
		// Añadimos receptores de eventos para el raton
		// Si el tipo de vista necesita arrastra el raton registramos los eventos correspondientes
		if (typeView != 1) {
			document.getElementById('canvas').addEventListener('mousedown', onLibraryMouseDown, false);
			document.addEventListener('mouseup', onLibraryMouseUp, false);
		}
		document.addEventListener('mousemove', onLibraryMouseMove, false);
		document.getElementById('canvas').addEventListener('click', onLibraryClick, false);
		document.getElementById('canvas').addEventListener('dblclick', onLibraryDblClick, false);

		// Añadimos el plano a la escena
		scene.add(plane);

		// Guardamos la sensibilidad actual
		sensitivity = getOptions().sensitivity / 100;

		// Colocamos como pagina actual la primera
		currentPage = 0;
		pagePlanes = view.getCurrentPlanes();
	}

	function hide() {
		// Desactivamos el controlador
		remove();
		// Ocultamos la vista
		view.hide();
	}

	function show(type) {
		// Guardamos el nuevo tipo de vista
		typeView = type;

		// Mostramos la vista
		view.show(typeView);
		// Activamos el controlador
		enable();
	}

	/*******************************************************************************************************************
	 * Métodos Públicos
	 ******************************************************************************************************************/

	this.show = show;

}