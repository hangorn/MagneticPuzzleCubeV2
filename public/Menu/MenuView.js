/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: MenuView.js
 *  Sinopsis: Clase de la vista de la biblioteca de imágenes.
 *  
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 30-03-2013
 *  Versión: 0.4
 *  Fecha: 04-01-2013
 *  Versión: 0.3
 *  Fecha: 03-01-2013
 *  Versión: 0.2
 *  Fecha: 02-01-2013
 *  Versión: 0.1
 *  */

/*
 *  CLASE MENUVIEW
 *  */
function MenuView(menuData) {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	// Tamaño de los cubos que formarán las letras
	var cubesSize;

	// Entradas del menu
	var currentMenu;
	var entrys;

	// Datos de las partidas multijugador
	var multiplayerLevelsData;

	// Dialogo que se mostrará cuando se espere por un jugador
	var waitingDialog;

	// Controlador de la biblioteca
	var menC;

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase MenuView
	 * 
	 * @param Object[][]:menuData
	 *            datos con los que se generara el menu. Cada elemento del array exterior es un menu, y cada elemento
	 *            del array interior es una entrada del menu.
	 */

	// Iniciamos los cubos al tamaño por defecto
	cubesSize = 40;

	entrys = [];
	for (var i = 0; i < menuData.length; i++) {
		entrys[i] = [];
		for (var j = 0; j < menuData[i].length; j++) {
			var data = menuData[i][j];
			entrys[i].dataType = data.type;
			entrys[i].mode = data.mode;
			if (data.type == 'webgl') {
				entrys[i][j] = ThreeDUtils.createTextEntry(data.txt, new THREE.Vector3(0, data.data, 0), cubesSize);
				// Marcamos las entradas de atras, ya que tienen un comportamiento diferente
				if (data.mode == 'back') {
					entrys[i][j].menuIndex = -1;
				}
			} else if (data.type == 'html') {
				entrys[i][j] = document.createElement('div');
				Utils.addDynamicComponent(data.data, entrys[i][j]);
			}
		}
	}

	// Iniciamos los indices de los menus
	var ind = 0;
	for (var i = 0; i < entrys.length; i++) {
		for (var j = 0; j < entrys[i].length; j++) {
			// La entradadas de atras (marcadas con un -1) no las tenemos en cuenta
			if (entrys[i][j].menuIndex != -1) {
				entrys[i][j].menuIndex = ++ind;
			}
		}
	}

	Utils.ajaxRequest('data/MultiplayerLevels.json', function(resp) {
		// Transformamos los datos del fichero a notacion JSON
		multiplayerLevelsData = JSON.parse(resp).data;

	});

	/*******************************************************************************************************************
	 * Métodos Privados
	 ******************************************************************************************************************/

	/**
	 * Método para añadir al diálogo de configuración de buscar partidas multijugador una partida
	 * 
	 * @param String:name
	 *            nombre del nivel a crear.
	 * @param String:ID
	 *            identificador de la partida.
	 * @param Integer:type
	 *            tipo de partida multijugador.
	 * @returns DOMobject fila con los datos de la partida.
	 */
	function buildGameEntry(name, ID, type) {
		// Creamos una fila para la entrada
		var row = document.createElement('tr');

		// Creamos una funcion para crear un dato de la entrada
		var makeData = function(data) {
			var cell = document.createElement('td');
			cell.innerHTML = data;
			return cell;
		}

		// Añadimos el nombre de la partida
		row.appendChild(makeData(name));
		row.appendChild(makeData(multiplayerLevelsData[type].name));
		// Fijamos la clases CSS para el estilo y para luego obtener la lista
		row.classList.add('clickable', 'menuItem');

		// Guardamos el ID
		row.ID = ID;
		return row;
	}

	/*******************************************************************************************************************
	 * Métodos Publicos
	 ******************************************************************************************************************/

	/**
	 * Método para para cambiar el color de todas las entradas del menu actual
	 */
	this.changeAllEntrysColor = function() {
		// Cambiamos el color de todas las entradas
		for (var i = 0; i < entrys[currentMenu].length; i++) {
			var rand = Math.random();
			// Cambiamos el color del fondo
			entrys[currentMenu][i].backgroundColor = entrys[currentMenu][i].material.color.setHex(rand * 0xffffff)
					.getHex();
			// Cambiamos el color de las letras
			entrys[currentMenu][i].frontColor = entrys[currentMenu][i].children[0].children[0].material.materials[4].color
					.setHex((1 - rand) * 0xffffff).getHex();
			entrys[currentMenu][i].backColor = entrys[currentMenu][i].children[0].children[0].material.materials[5].color
					.setHex(Math.random() * 0xffffff).getHex();
		}
	}

	/**
	 * Método para eliminar de la interfaz todos los elementos de la vista, ocultarlos
	 */
	this.hide = function() {
		if (renderer.domElement.parentNode == container) {
			container.removeChild(renderer.domElement);
		}

		// Si el menu a ocultar es de los que tienen entradas de menu
		if (entrys[currentMenu].dataType == 'webgl') {
			// Eliminamos de la escena todas las entradas del menu actual
			for (var i = 0; i < entrys[currentMenu].length; i++) {
				scene.remove(entrys[currentMenu][i]);
			}
		} else if (entrys[currentMenu].dataType == 'html') {
			// Si el menu a ocultar es un formulario lo ocultamos
			if (entrys[currentMenu][0].parentNode == document.body) {
				document.body.removeChild(entrys[currentMenu][0]);
			}
		}
	}

	/**
	 * Método para mostrar el submenu solicitado
	 * 
	 * @param Integer:menuInd
	 *            indice del menu a mostrar, si no se le pasa nada se mostrara le menu actual.
	 */
	this.showMenu = function(menuIndex) {
		// Primero quitamos la vista actual del menu
		if (currentMenu != undefined) {
			this.hide();
		}

		// Guardamos el menu actual
		if (menuIndex != undefined) {
			currentMenu = menuIndex;
		}

		// Si el menu seleccionado es de los que tienen entradas de menu
		if (entrys[currentMenu].dataType == 'webgl') {
			container.appendChild(renderer.domElement);
			// Mostramos las entradas del menu correspondiente
			for (var i = 0; i < entrys[currentMenu].length; i++) {
				scene.add(entrys[currentMenu][i]);
			}
		} else if (entrys[currentMenu].dataType == 'html') {
			// Si el menu a mostrar es un formulario lo ocultamos
			var child = entrys[currentMenu][0];
			document.body.appendChild(child);
		}
	}

	/**
	 * Método para mostrar el dialogo de espera
	 * 
	 * @param String:message
	 *            cadena de texto con el mensaje que se mostrará mientras se espera
	 * @param Callback:cancelAction
	 *            función de rellamada que será ejecutada cuando se pulse el botón de cancelar.
	 */
	this.showWaitingDialog = function(message, cancelAction) {
		// Funcion que se ejecutara tanto si esta como si no esta cargado el dialogo, para personalizarlo
		var custom = function() {
			// Mostramos el mensaje indicado
			waitingDialog.getElementsByTagName('p')[0].innerHTML = message;
			waitingDialog.getElementsByClassName('waitingDialogCancel')[0].onclick = function() {
				document.body.removeChild(waitingDialog);
				cancelAction();
			}
			document.body.appendChild(waitingDialog);
		}

		if (waitingDialog == undefined) {
			// Creamos el contenedor
			waitingDialog = document.createElement('div');
			Utils.addDynamicComponent('html/waitingDialog.html', waitingDialog, custom);
		} else {
			custom();
		}
	}

	/**
	 * Método para mostrar el dialogo de espera por un jugador
	 */
	this.hideWaitingDialog = function() {
		if (waitingDialog != undefined && waitingDialog.parentNode == document.body) {
			document.body.removeChild(waitingDialog);
		}
	}

	/**
	 * Método para rellenar el dialogo de buscar partidas multijugador con las entradas suministradas.
	 * 
	 * @param Array:items
	 *            array con los datos de todas las entradas que se desean introducir, cada entrada del array debera
	 *            tener las siguientes propiedades: -name con el nombre de la partida -ID con el ID de la partida -type
	 *            con el tipo de la partida.
	 */
	this.fillGameEntrys = function(items) {
		var table = entrys[currentMenu][0].getElementsByTagName('tBody')[0];
		// Primero quitamos todas las partidas que hubiera antes
		while (table.firstChild) {
			table.removeChild(table.firstChild);
		}
		// Si no hay partidas
		if (items.length == 0) {
			alert(__["dialogs.noFoundGames"]);
			return;
		}
		// Rellenamos el dialogo con las entradas suministras
		for (var i = 0; i < items.length; i++) {
			var row = buildGameEntry(items[i].name, items[i].ID, items[i].type);
			table.appendChild(row);
		}
	}

	/**
	 * Calcula el numero de cubos seleccionados en el formulario para empezar un juego. Si el menu actual no es uno de
	 * estos formularios o no consta de seleccion de numero de cubos, devolvera 0
	 * 
	 * @returns 2 (para 8 cubos) o 3 (para 27 cubos) segun el numero de cubos seleccionados, 0 en caso de que no sea
	 *          posible realizar la operacion
	 */
	this.getSelectedNumberOfCubes = function() {
		// Si el formulario actual no es html -> 0
		if (!entrys[currentMenu][0].getElementsByTagName) {
			return 0;
		}
		// 27 cubos
		if (entrys[currentMenu][0].getElementsByTagName('form')[0].cubesNumber[0].checked) {
			return 3;
		}
		// 8 cubos
		if (entrys[currentMenu][0].getElementsByTagName('form')[0].cubesNumber[1].checked) {
			return 2;
		}
		return 0;
	}

	/**
	 * Obtiene los datos de las entradas de los menus. De que tipo y modo es cada una, y las entradas correspodientes al
	 * tipo si corresponde (para el tipo webgl un array de figuras, y para el tipo html un elemento del DOM
	 */
	this.getEntrys = function() {
		return entrys;
	}
}