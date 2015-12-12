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

	// Array con todos los planos de una determinada página
	var pagePlanes = [];
	// Pagina actual
	var currentPage;
	// Tipo de vista con la que ha sido creado el controlador, 1 -> imágenes seleccionables, 2 -> formar dos cubos con
	// imágenes, 3 -> formar tres cubos con imágenes
	var typeView;

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

		// Si ya hay un objeto seleccionado seguimos operando con el
		if (SELECTED) {
			return;
		}

		// Calculamos donde esta el raton con el eje de coordenadas en el centro
		mouse.x = (event.clientX / windowWidth) * 2 - 1;
		mouse.y = -(event.clientY / windowHeight) * 2 + 1;

		// Usamos la utilidad de Utils indicando que hacer si hay hay imagenes
		ThreeDUtils.intersectObjects(mouse, pagePlanes, 'move', function(intersect) {
			// Obtenemos el primer objeto atravesado, que sera el seleccionado, el que esta delante
			SELECTED = intersect.object;
		}, function() {
			// Usamos la utilidad de Utils indicando que hacer si hay hay cubos
			ThreeDUtils.intersectObjects(null, view.getCubes(), 'move', function(intersect) {
				// Obtenemos el primer objeto atravesado, que sera el seleccionado, el que esta delante
				SELECTED = intersect.object;
				// Obtenemos la posicion del raton
				lastMouseX = event.clientX;
				lastMouseY = event.clientY;
			});
		});
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

				// Usamos la utilidad de Utils indicando que hacer cuando se calcule la posicion del raton en la escena
				ThreeDUtils.intersectObjects(mouse, null, null, function(intersect) {
					// Si el raton se encuentra en la zona de movimiento
					if (event.clientX >= 0 && event.clientX <= windowWidth && event.clientY >= 0
							&& event.clientY <= windowHeight) {
						// Movemos la figura seleccionada
						SELECTED.position.copy(intersect.point);
						// Si esta en la zona de los cubos adelantamos la figura para que se sobreponga a los cubos
						if (view.isCubeZone(intersect.point)) {
							view.putZBefore(SELECTED);
						} else {
							// Ponemos la figura que se esta moviendo delante para que se superponga al resto de planos
							view.putZ1(SELECTED);
						}
					}
				});

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

		// Usamos la utilidad de Utils para cambiar el cursor si se pasa por las imagenes, si no hay imagenes seguimos
		// comprobando otros objetos
		ThreeDUtils.intersectObjects(mouse, pagePlanes, 'pointer', null, function() {
			if (typeView != 1) {
				ThreeDUtils.intersectObjects(null, view.getCubes(), 'pointer', null, function() {
					ThreeDUtils.intersectObjects(null, view.getPages().concat(buttons), 'pointer', function(intersect) {
						// Si no se le ha cambiado ya el color
						if (intersect.object != INTERSECTED) {
							INTERSECTED = intersect.object;
							// Cambiamos el color de la figura
							var rand = Utils.randomColor();
							// Para diferencia entre paginas y botones comprobamos si tienen varios materiales (solo las
							// letras/paginas tiene dos materiales: frontal y lateral)
							if (INTERSECTED.material.materials) {
								INTERSECTED.material.materials[0].color.setHSV(rand, 0.95, 0.85);
								INTERSECTED.material.materials[1].color.setHSV(rand, 0.95, 0.50);
							} else {
								// Color letra frontal
								INTERSECTED.text.material.materials[0].color.setHSV(rand, 0.95, 0.85);
								// Color letra lateral
								INTERSECTED.text.material.materials[1].color.setHSV(rand, 0.95, 0.50);
								// Color fondo
								INTERSECTED.material.color.setHex((1 - rand) * 0xffffff);
							}
						}
					}, function() {
						// Si hay algun objeto con el color cambiado
						if (INTERSECTED) {
							var rand = Utils.randomColor();
							// Para diferencia entre paginas y botones comprobamos si tienen varios materiales (solo las
							// letras/paginas tiene dos materiales: frontal y lateral)
							if (INTERSECTED.material.materials) {
								INTERSECTED.material.materials[0].color.setHSV(rand, 0.95, 0.85);
								INTERSECTED.material.materials[1].color.setHSV(rand, 0.95, 0.50);
							} else {
								// Color letra frontal
								INTERSECTED.text.material.materials[0].color.setHSV(rand, 0.95, 0.85);
								// Color letra lateral
								INTERSECTED.text.material.materials[1].color.setHSV(rand, 0.95, 0.50);
								// Color fondo
								INTERSECTED.material.color.setHex((1 - rand) * 0xffffff);
							}
							INTERSECTED = null;
						}
					});
				});
			}
		});
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

					// Buscamos la cara del cubo que este en la posicion de la imagen, si no hay ninguna buscamos la
					// cara frontal del cubo (la que este en la posicion del cubo)
					ThreeDUtils
							.intersectObjects(
									SELECTED.position,
									[ view.getCubes()[min] ],
									null,
									function(intersect) {
										// Guardamos el material en la cara con la que intersecciona el vector
										view.getCubes()[min].material.materials[intersect.faceIndex] = SELECTED.material;
									},
									function() {
										ThreeDUtils
												.intersectObjects(
														view.getCubes()[min].position,
														[ view.getCubes()[min] ],
														null,
														function(intersect) {
															// Guardamos el material en la cara con la que intersecciona
															// el vector
															view.getCubes()[min].material.materials[intersect.faceIndex] = SELECTED.material;
														});
									});
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

		ThreeDUtils.intersectObjects(mouse, view.getPages(), null, function(intersect) {
			// Obtenemos el identificador del texto para saber que tenemos que hacer
			var ID = intersect.object.textID;

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
		}, function() {
			// Si hay botones donde se ha hecho click, ejecutamos su accion asociada
			ThreeDUtils.intersectObjects(null, buttons, null, function(intersect) {
				intersect.object.action();
			}, function() {
				// Si el modo de vista es el imagenes seleccionables
				if (typeView == 1) {
					// Si hay imagenes donde se ha hecho click, las des/seleccionamos segun corresponda
					ThreeDUtils.intersectObjects(null, pagePlanes, null, function(intersect) {
						// Si la imagen esta seleccionada
						if (intersect.object.selected) {
							// La deseleccionamos
							intersect.object.selected = !intersect.object.selected;
							scene.remove(intersect.object.selectedPlane);
						}
						// Si la imagen no esta seleccionada
						else {
							// La seleccionamos
							intersect.object.selected = !intersect.object.selected;
							scene.add(intersect.object.selectedPlane);
						}
						// Se devuelve a la posicion inicial
						intersect.object.position.x = intersect.object.iniPosX;
						intersect.object.position.y = intersect.object.iniPosY
						intersect.object.position.z = 0;
					});
				}
			});
		});
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

		// Si es el boton izquierdo
		if (event.button == 0) {
			// Calculamos donde esta el raton con el eje de coordenadas en el centro
			mouse.x = (event.clientX / windowWidth) * 2 - 1;
			mouse.y = -(event.clientY / windowHeight) * 2 + 1;
			// Comprobamos si hay alguna imagen donde se ha hecho doble click
			ThreeDUtils.intersectObjects(mouse, pagePlanes, null, function(intersect) {
				// Guardamos el objeto para poder restaurarlo
				zoomedIn = intersect.object;
				// Cambiamos la posicion del objeto, lo ponemos delante
				intersect.object.position.x = 0;
				intersect.object.position.y = 0;
				intersect.object.position.z = 2450;
			});
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
			texture.push(Utils.loadTexture(url, function() {
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