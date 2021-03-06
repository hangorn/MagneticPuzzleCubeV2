/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: MenuController.js
 *  Sinopsis: Clase controlador que se encargará de manejar lo eventos en los distintos menus.
 *  
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 30-03-2013
 *  Versión: 0.3
 *  Fecha: 04-01-2013
 *  Versión: 0.2
 *  Fecha: 03-01-2013
 *  Versión: 0.1
 *  */

/*
 *  CLASE MENUCONTROLLER
 *  */
function MenuController() {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/
	// Objeto 3D sobre el cual se realizarán operaciones (cambiar el color)
	var INTERSECTED;
	// Vector de 2 coordenadas que almacena la posición actual del ratón
	var mouse = new THREE.Vector2();

	// Entradas del menu
	var menuEntrys;
	// Identificador del submenu actual
	var currentMenu;
	// Materiales con los que se creará el puzzle
	var materials = [];

	// Ultimo nivel seleccionado
	var lastEntrySelected;

	// Vista del menu
	var view;

	// Controlador de la ayuda
	var helpCtl;
	// Controlador de las puntuaciones
	var scoresCtl;
	// Controlador de la biblioteca de imagenes
	var libraryCtl;
	// Controlador del modo multijugador
	var multiplayerCtl;

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase MenuController. Cuando este cargado mostrara la vista del menu principal
	 */

	// Desactivamos el menu contextual del boton derecho
	document.getElementById('canvas').oncontextmenu = function() {
		return false
	};

	// Obtenemos los datos para generar el menu
	Utils.ajaxRequest('data/Menu.json', function(menuResp) {
		var menuData = JSON.parse(menuResp).data;

		view = new MenuView(menuData);
		menuEntrys = view.getEntrys();
		// Mostramos la vista del menu principal
		show(0);
	});

	/*******************************************************************************************************************
	 * Métodos Privados
	 ******************************************************************************************************************/

	/**
	 * Manejador del evento de click
	 * 
	 * @param EventObject:event
	 *            caracteristicas del evento lanzado.
	 */
	function onMenuClick(event) {
		// Impedimos que se produzca la accion por defecto
		event.preventDefault();

		// Si el menu actual no tiene entradas de menu
		if (menuEntrys[currentMenu].dataType != 'webgl') {
			return;
		}

		// Calculamos donde esta el raton con el eje de coordenadas en el centro
		mouse.x = (event.clientX / windowWidth) * 2 - 1;
		mouse.y = -(event.clientY / windowHeight) * 2 + 1;

		// Usamos la utilidad de Utils indicando que hacer si hay o no hay entradas de menu
		ThreeDUtils.intersectObjects(mouse, menuEntrys[currentMenu], null, function(intersect) {
			remove();
			// Realizamos la animacion de explosion de la entrada seleccionada
			intersect.object.explode(function() {
				// Las entradas que no tengan indice se comportaran como boton de atras
				if (intersect.object.menuIndex == -1) {
					onMenuBack();
				} else {
					show(intersect.object.menuIndex);
				}
			})
		}, function() {
			view.changeAllEntrysColor();
		});
	}

	/**
	 * Manejador del evento del movimiento del ratón
	 * 
	 * @param EventObject:event
	 *            caracteristicas del evento lanzado.
	 */
	function onMenuMouseMove(event) {
		// Impedimos que se produzca la accion por defecto
		event.preventDefault();

		// Si el menu actual no tiene entradas de menu
		if (menuEntrys[currentMenu].dataType != 'webgl') {
			return;
		}

		// Calculamos donde esta el raton con el eje de coordenadas en el centro
		mouse.x = (event.clientX / windowWidth) * 2 - 1;
		mouse.y = -(event.clientY / windowHeight) * 2 + 1;

		// Usamos la utilidad de Utils indicando que hacer si hay o no hay entradas de menu
		ThreeDUtils.intersectObjects(mouse, menuEntrys[currentMenu], 'pointer', function(intersect) {
			// Si no se le ha cambiado ya el color
			if (intersect.object != INTERSECTED) {
				// Si hay algun objeto con el color cambiado
				if (INTERSECTED) {
					INTERSECTED.restoreEntryColor();
				}

				INTERSECTED = intersect.object;
				// Cambiamos el color de la figura
				INTERSECTED.changeEntryColor();
				sound.playMoved();
			}
		}, function() {
			// Si hay algun objeto con el color cambiado
			if (INTERSECTED) {
				INTERSECTED.restoreEntryColor();
				INTERSECTED = null;
			}
		});
	}

	/**
	 * Manejador del evento de pulsacion del boton anterior
	 * 
	 * @param EventObject:event
	 *            caracteristicas del evento lanzado.
	 */
	function onMenuBack(event) {
		// Calculamos cual es el menu anterior
		var add = 0;
		// Recorremos todos los menus
		for (var i = 0; i < menuEntrys.length; i++) {
			// El menu de atras no lo tenemos en cuenta
			for (var j = 0; j < menuEntrys[i].length; j++) {
				if (menuEntrys[i][j].menuIndex != -1) {
					add++
				}
			}
			if (currentMenu <= add) {
				show(i);
				break;
			}
		}
	}

	/**
	 * Manejador del evento de pulsacion del boton de biblioteca de imagenes
	 * 
	 * @param EventObject:event
	 *            caracteristicas del evento lanzado.
	 */
	function onMenuLibraryClick(event) {
		// Obtenemos el tipo de biblioteca que se ha de mostrar
		var libType;
		// Si la cantidad de imagenes depende del numero de cubos, segun el modo de juego
		if (menuEntrys[currentMenu].mode == 'classic' || menuEntrys[currentMenu].mode == 'trial') {
			libType = view.getSelectedNumberOfCubes();
		}
		// Si se trata del modo multijugador
		else if (menuEntrys[currentMenu].mode == 'multiplayer') {
			// Si el ultimo tipo de partida seleccionada es par
			if ((lastEntrySelected % 2) == 0) {
				libType = 2; // Es un tipo con 8 cubos
			} else {
				libType = 3; // Es un tipo con 27 cubos
			}
		} else {
			libType = 1;
		}
		// Ocultamos la vista del menu
		view.hide();

		// Si no esta creada la vista de la biblioteca la creamos
		if (libraryCtl == undefined) {
			libraryCtl = new LibraryController(libType, function(mats) {
				if (mats) {
					materials = mats;
				}
				show();
			});
		} else {
			// Si esta creada solo la mostramos
			libraryCtl.show(libType);
		}
	}

	/**
	 * Manejador del evento de pulsacion del boton de empezar
	 * 
	 * @param EventObject:event
	 *            caracteristicas del evento lanzado.
	 */
	function onMenuStartClick(event) {
		// Si se trata del menu de buscar partida multijugador y no hay partidas
		if (menuEntrys[currentMenu].mode == 'findServer'
				&& menuEntrys[currentMenu][0].getElementsByTagName('tBody')[0].children.length == 0) {
			// No hacemos nada
			return;
		}
		// Si menu actual es distinto de buscar partida multijugador
		if (menuEntrys[currentMenu].mode != 'findServer') {
			var imgsNeeded = 0;
			var selectedMaterials = materials.length;
			// Si la cantidad de imagenes depende del numero de cubos, segun el modo de juego
			if (menuEntrys[currentMenu].mode == 'classic' || menuEntrys[currentMenu].mode == 'trial') {
				imgsNeeded = 6 * view.getSelectedNumberOfCubes();
			}
			// Si se trata del modo multijugador
			else if (currentMenu == 10) {
				// Si el ultimo tipo de partida seleccionada es par
				if ((lastEntrySelected % 2) == 0) {
					imgsNeeded = 12;
				} else {
					imgsNeeded = 18;
				}
				// Si se puede seleccionar cualquier numero de imagenes y no hay ninguna
			} else if (materials.length == 0) {
				// Guardamos todos los materiales que se tienen
				for (var i = 0; i < IMAGES.length; i++) {
					materials.push(IMAGES[i]);
				}
			}

			// Si no se tienen suficientes imagenes buscamos aquellas que no se hayan elegido ya
			// Recorremos todas las imagenes
			for (var i = 0; materials.length < imgsNeeded; i++) {
				var found = false
				// Comprobamos si la imagen la tenemos almacenada ya
				for (var j = 0; j < selectedMaterials; j++) {
					if (materials[j] == IMAGES[i]) {
						found = true;
						break;
					}
				}
				if (!found) {
					materials.push(IMAGES[i]);
				}
			}
		}

		// Ocultamos los elementos del menu
		view.hide();
		container.appendChild(renderer.domElement);

		// Si se trata del modo clasico
		if (menuEntrys[currentMenu].mode == 'classic') {
			new ClassicModeController(view.getSelectedNumberOfCubes(), materials);
		}

		// Si se trata del modo niveles
		if (menuEntrys[currentMenu].mode == 'levels') {
			new LevelsModeController(lastEntrySelected, materials);
		}

		// Si se trata del modo contrareloj
		if (menuEntrys[currentMenu].mode == 'trial') {
			// Obtenemos la dificultad
			var difficulty;
			for (var i = 0; i < menuEntrys[currentMenu][0].getElementsByTagName('form')[0].difficulty.length; i++) {
				if (menuEntrys[currentMenu][0].getElementsByTagName('form')[0].difficulty[i].checked) {
					difficulty = i;
				}
			}
			new TrialModeController(view.getSelectedNumberOfCubes(), difficulty, materials);
		}

		// Si se trata del modo supervivencia
		if (menuEntrys[currentMenu].mode == 'survival') {
			// Obtenemos la dificultad
			var difficulty;
			for (var i = 0; i < menuEntrys[currentMenu][0].getElementsByTagName('form')[0].difficulty.length; i++) {
				if (menuEntrys[currentMenu][0].getElementsByTagName('form')[0].difficulty[i].checked) {
					difficulty = i;
				}
			}
			new SurvivalModeController(view.getSelectedNumberOfCubes(), difficulty, materials);
		}

		// Si se trata de crear una partida multijugador
		if (menuEntrys[currentMenu].mode == 'multiplayer') {
			// Si no tenemos conexion con el servidor la creamos
			if (socket == undefined) {
				socket = new Socket();
			}
			// Obtenemos el nombre y el tipo de la partida
			var name = menuEntrys[currentMenu][0].getElementsByTagName('form')[0].gameName.value || __["words.noName"];
			var type = lastEntrySelected;

			// Mostramos un dialogo mientras se espera a que se codifiquen las imagenes para enviarlas al servidor
			view.showWaitingDialog(__["words.loading"] + " ...", function() {
				view.showMenu(currentMenu);
				socket.finishedGame();
			});

			multiplayerCtl = new MultiplayerModeController(type, materials);
			var iniPos = multiplayerCtl.getInitialPositions();
			var iniRot = multiplayerCtl.getInitialRotations();

			// Esperamos un pequeño tiempo(1 milisegundo) para que de tiempo a mostrar el dialogo de espera
			setTimeout(function() {
				// Obtenemos todas las imagenes de los materiales codificadas en base 64 para enviarselas al servidor
				var images = [];
				var imgsNeeded = (lastEntrySelected % 2) == 0 ? 12 : 18;
				for (var i = 0; i < imgsNeeded; i++) {
					images.push(Utils.imageToBase64(materials[i].map.image));
				}

				// Le decimos al servidor que hemos creado una partida y indicamos la accion que se realizara cuando
				// empieze esta (se conecte alguien), la accion si se desconecta el otro jugador, y la accion para
				// cuando se cree la partida
				socket.createdGame(name, type, images, iniPos, iniRot, function() {
					view.hideWaitingDialog();

					// Mostramos un dialogo mientras se espera a que se el otro jugador este listo
					view.showWaitingDialog(__["dialogs.waitingPlayerReady"], function() {
						view.showMenu(currentMenu);
						socket.finishedGame();
					});

					// Le decimos al servidor que estamos listos para jugar y indicamos la funcion que se ejecutará
					// cuando todos los jugadores de la partida esten listos
					socket.readyToPlay(function() {
						// Ocultamos el dialogo de espera de carga
						view.hideWaitingDialog();
						// Mostramos la vista del modo multijugador
						multiplayerCtl.show();
					});
				}, function() {
					alert(__["dialogs.playerLeft"]);
					// Ocultamos la vista de la partida
					multiplayerCtl.hide();
					view.hideWaitingDialog();
					// Mostramos el menu del modo multijugador
					show(currentMenu);
				}, function() {
					// Ocultamos el dialogo de espera de carga
					view.hideWaitingDialog();
					// Mostramos un dialogo mientras se espera a otro jugador
					view.showWaitingDialog(__["dialogs.waitingPlayer"], function() {
						show(currentMenu);
						socket.finishedGame();
					});
				});
			}, 1);
		}

		// Si se trata de buscar una partida multijugador
		if (menuEntrys[currentMenu].mode == 'findServer') {
			// Si no tenemos conexion con el servidor la creamos
			if (socket == undefined) {
				socket = new Socket();
			}
			// Obtenemos el ID del juego seleccionado
			var gameID = menuEntrys[currentMenu][0].getElementsByTagName('tBody')[0].children[lastEntrySelected].ID;
			// Mostramos un dialogo mientras se espera a que se codifiquen las imagenes para enviarlas al servidor
			view.showWaitingDialog(__["words.loading"] + " ...", function() {
				view.showMenu(currentMenu);
				socket.finishedGame();
			});
			// Definimos la accion de conexion
			var connAction = function(imgs, type, iniPos, iniRot) {
				// Esperamos un pequeño tiempo(1 milisegundo) para que de tiempo a mostrar el dialogo de espera
				setTimeout(function() {
					// Creamos los materiales con las imagenes suministradas decodificandolas, ya que las obtenemos en
					// base 64
					Utils.loadAllBase64Imgs(imgs, function(textures) {
						var materials = [];
						for (var i = 0; i < textures.length; i++) {
							var texture = textures[i];
							texture.needsUpdate = true;
							materials.push(new THREE.MeshBasicMaterial({
								map : texture
							}));
						}

						// Creamos el puzzle
						multiplayerCtl = new MultiplayerModeController(type, materials, iniPos, iniRot);

						// Ocultamos el dialogo de espera de carga
						view.hideWaitingDialog();

						// Mostramos un dialogo mientras se espera a que se el otro jugador este listo
						view.showWaitingDialog(__["dialogs.waitingPlayerReady"], function() {
							view.showMenu(currentMenu);
							socket.finishedGame();
						});

						// Le decimos al servidor que estamos listos para jugar y indicamos la funcion
						// que se ejecutará cuando todos los jugadores de la partida esten listos
						socket.readyToPlay(function() {
							// Ocultamos el dialogo de espera de carga
							view.hideWaitingDialog();
							// Mostramos la vista del modo multijugador
							multiplayerCtl.show();
						});

					});
				}, 1);
			};
			var wrongAction = function() {
				alert(__["dialogs.noAvailableGame"]);
				show(currentMenu);
			};
			var discAction = function() {
				alert(__["dialogs.playerLeft"]);
				// Ocultamos la vista de la partida
				multiplayerCtl.hide();
				view.hideWaitingDialog();
				// Mostramos el menu del modo multijugador
				show(currentMenu);
			};

			// Nos unimos a la partida con el ID obtenido y indicamos la accion que se realizara cuando se conecte a
			// dicha partida, la accion que se realizara cuando no se consiga conectarse a la partida y la accion si se
			// desconecta el otro jugador
			socket.joinGame(gameID, connAction, wrongAction, discAction);
		}
	}

	/**
	 * Manejador del evento de pulsacion de una entrada: nivel, tipo de partida o partida multijugador
	 * 
	 * @param EventObject:event
	 *            caracteristicas del evento lanzado.
	 */
	function onEntryClick(event) {
		var entrys = menuEntrys[currentMenu][0].getElementsByClassName('menuItem');
		for (var i = 0; i < entrys.length; i++) {
			if (entrys[i] == event.currentTarget) {
				break;
			}
		}
		selectEntry(i);
	}
	
	/**
	 * Manejador del evento de doble click en una entrada: nivel, tipo de partida o partida multijugador
	 * 
	 * @param EventObject:event
	 *            caracteristicas del evento lanzado.
	 */
	function onEntryDblClick(event) {
		onEntryClick(event);
		onMenuStartClick(event);
	}

	/**
	 * Método que realizará las acciones necesarias para seleccionar la entrada indicada
	 * 
	 * @param Integer:l
	 *            índice del nivel a seleccionar.
	 */
	function selectEntry(l) {
		// Obtenemos el formulario activo
		var form = menuEntrys[currentMenu][0];
		var entrys = menuEntrys[currentMenu][0].getElementsByClassName('menuItem');
		// Si no estamos en un modo con entradas o la entrada indicado no existe
		if ((menuEntrys[currentMenu].mode != 'levels' && menuEntrys[currentMenu].mode != 'multiplayer' && menuEntrys[currentMenu].mode != 'findServer')
				|| l >= entrys.length) {
			return;
		}
		// Si el menu tiene descripciones (niveles o multijugador)
		if (menuEntrys[currentMenu].mode != 'findServer') {
			// Mostramos la descripcion de la entrada
			form.getElementsByTagName('form')[0].getElementsByClassName('description')[0].innerHTML = entrys[l]
					.getElementsByTagName('img')[0].alt;
		}
		// Deseleccionamos la entrada seleccionado hasta ahora
		if (lastEntrySelected != undefined) {
			entrys[lastEntrySelected].classList.remove('menuItemSelected');
		}
		// Seleccionamos la indicada
		entrys[l].classList.add('menuItemSelected');
		lastEntrySelected = l;
	}

	/**
	 * Manejador del evento de pulsacion del boton de actualizar partidas multijugador
	 * 
	 * @param EventObject:event
	 *            caracteristicas del evento lanzado.
	 */
	function onMenuRefreshClick(event) {
		// Si no tenemos conexion con el servidor la creamos
		if (socket == undefined) {
			socket = new Socket();
		}
		socket.getGames(function(items) {
			var table = menuEntrys[currentMenu][0].getElementsByTagName('tBody')[0];
			// Quitamos los eventos de las entradas antiguas
			for (var i = 0; i < table.children.length; i++) {
				table.children[i].removeEventListener('click', onEntryClick, false);
				table.children[i].removeEventListener('dblclick', onEntryDblClick, false);
			}
			// Mostramos las partidas actuales
			view.fillGameEntrys(items);
			// Registramos los eventos para las partidas actuales
			for (var i = 0; i < table.children.length; i++) {
				table.children[i].addEventListener('click', onEntryClick, false);
				table.children[i].addEventListener('dblclick', onEntryDblClick, false);
			}
		});
	}

	/**
	 * Método que elimina el controlador. Lo único que hace es eliminar los manejadores de eventos que tiene registrados
	 */
	function remove() {
		if (menuEntrys[currentMenu].dataType == 'webgl') {
			// Borramos receptores de eventos para el raton
			document.getElementById('canvas').removeEventListener('click', onMenuClick, false);
			document.getElementById('canvas').removeEventListener('mousemove', onMenuMouseMove, false);
			return;
		}

		var form = menuEntrys[currentMenu][0];
		// Si esta definido un formulario de configuracion de modo borramos los receptores del formulario
		if (form != undefined && form.getElementsByTagName != undefined) {
			if (menuEntrys[currentMenu].mode == 'findServer') {
				form.getElementsByTagName('form')[0].refresh.removeEventListener('click', onMenuRefreshClick, false);
			} else {
				form.getElementsByTagName('form')[0].library.removeEventListener('click', onMenuLibraryClick, false);
			}
			form.getElementsByTagName('form')[0].start.removeEventListener('click', onMenuStartClick, false);
			form.getElementsByTagName('form')[0].back.removeEventListener('click', onMenuBack, false);
			// Si se trata del modo niveles borramos los receptores de eventos para la seleccion de nivel
			if (menuEntrys[currentMenu].mode == 'levels' || menuEntrys[currentMenu].mode == 'multiplayer'
					|| menuEntrys[currentMenu].mode == 'findServer') {
				var entrys = form.getElementsByClassName('menuItem');
				for (var i = 0; i < entrys.length; i++) {
					entrys[i].removeEventListener('click', onEntryClick, false);
					entrys[i].removeEventListener('dblclick', onEntryDblClick, false);
					entrys[i].classList.remove('menuItemSelected');
				}
			}
		}

		// Usamos el cursor por defecto
		container.style.cursor = 'auto';
	}

	/**
	 * Método que habilita el controlador. Registra los eventos necesarios
	 * 
	 * @param Integer:menu
	 *            submenu para el que se activa el controlador.
	 */
	function enable(menu) {
		// Guardamos el nuevo tipo de vista
		if (menu != undefined) {
			currentMenu = menu;
		}
		// Si el menu seleccionado es de los que tienen entradas de menu
		if (menuEntrys[currentMenu].dataType == 'webgl') {
			// Añadimos receptores de eventos para el raton
			document.getElementById('canvas').addEventListener('click', onMenuClick, false);
			document.getElementById('canvas').addEventListener('mousemove', onMenuMouseMove, false);
		}
		// Si es el menu de un modo de un jugador o el de crear partida multijugador
		else if (menuEntrys[currentMenu].dataType == 'html') {
			// Obtenemos el formulario del menu actual
			var form = menuEntrys[currentMenu][0];
			// Si es el menu del modo niveles
			if (menuEntrys[currentMenu].mode == 'levels' || menuEntrys[currentMenu].mode == 'multiplayer'
					|| menuEntrys[currentMenu].mode == 'findServer') {
				// Indicamos que no habia una entrada seleccionada antes
				lastEntrySelected = undefined;
				// Seleccionamos la primera entrada
				selectEntry(0);
				var entrys = form.getElementsByClassName('menuItem');
				// Registramos los eventos de seleccion de entradas para todos las entradas
				for (var i = 0; i < entrys.length; i++) {
					entrys[i].addEventListener('click', onEntryClick, false);
					entrys[i].addEventListener('dblclick', onEntryDblClick, false);
				}
			}
			// Registramos el evento de la pulsacion del boton de empezar
			form.getElementsByTagName('form')[0].start.addEventListener('click', onMenuStartClick, false);
			// Registramos el evento de la pulsacion del boton de atras
			form.getElementsByTagName('form')[0].back.addEventListener('click', onMenuBack, false);
			// Si es el menu de un modo de un jugador o el de crear partida multijugador
			if (menuEntrys[currentMenu].mode == 'findServer') {
				// Registramos el evento de la pulsacion del boton de la refrescar las partidas
				form.getElementsByTagName('form')[0].refresh.addEventListener('click', onMenuRefreshClick, false);
			} else {
				// Registramos el evento de la pulsacion del boton de la libreria
				form.getElementsByTagName('form')[0].library.addEventListener('click', onMenuLibraryClick, false);
			}
		}
	}

	function show(menu) {
		// Desactivamos el controlador para el menu anterior
		if (currentMenu) {
			remove();
		}
		// Mostramos la vista
		view.showMenu(menu);
		// Activamos el controlador
		enable(menu);

		// Si el menu seleccionado es el menu de opciones
		if (menuEntrys[currentMenu].dataType == 'options') {
			// Mostramos el dialogo de opciones pasandole la funcion que se ejecutara al para mostrar la vista
			// correspondiente
			OptionsController.show(onMenuBack);
		}
		// Si el menu seleccionado es el menu de puntuaciones
		else if (menuEntrys[currentMenu].dataType == 'scores') {
			if (scoresCtl == undefined) {
				scoresCtl = new ScoresController(onMenuBack);
			} else {
				scoresCtl.show();
			}
		}
		// Si el menu seleccionado es el menu de ayuda
		else if (menuEntrys[currentMenu].dataType == 'help') {
			if (helpCtl == undefined) {
				helpCtl = new HelpController(onMenuBack);
			} else {
				helpCtl.show();
			}
		}
		// Si el menu seleccionado es el de buscar partida multijugador buscamos partidas
		else if (menuEntrys[currentMenu].mode == 'findServer') {
			onMenuRefreshClick();
		}
	}

	/*******************************************************************************************************************
	 * Métodos Públicos
	 ******************************************************************************************************************/

	this.hide = function() {
		// Desactivamos el controlador
		remove();
		// Ocultamos la vista
		view.hide();
	}

	this.show = show;

}
