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
	var cubesSize = 40;

	entrys = [];
	for (var i = 0; i < menuData.length; i++) {
		entrys[i] = [];
		for (var j = 0; j < menuData[i].length; j++) {
			var data = menuData[i][j];
			entrys[i].dataType = data.type;
			entrys[i].mode = data.mode;
			if (data.type == 'webgl') {
				entrys[i][j] = createMenuEntry(data.txt, new THREE.Vector3(0, data.data, 0));
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
	 * Método que crea un objeto 3D formado por cubos representando la letra suministrada
	 * 
	 * @param String:letter
	 *            cadena de texto con la letra que se creará.
	 * @param Vector3:pos
	 *            posicion inicial en la que se colocará la letra, esquina inferior izquierda.
	 * @param Material:frontMat
	 *            material con el cual se creará la cara del frente de la letra.
	 * @param Material:backMat->
	 *            material con el cual se creará la cara de atrás de la letra.
	 * @returns Mesh objeto 3D creado con la letra o null si no es una letra conocida (un espacio, ...).
	 */
	function createLetter(letter, pos, frontMat, backMat) {
		// Creamos una variable estatica al metodo para el material de los lados y si no esta definido la iniciamos, asi
		// no creamos un material para cada letra (ahorramos recursos)
		if (createLetter.sidesMaterial === undefined) {
			createLetter.sidesMaterial = new THREE.MeshBasicMaterial({
				color : 0x000000,
				overdraw : true,
				wireframe : true,
				wireframeLinewidth : 1
			});
		}
		var faceMat = new THREE.MeshFaceMaterial([ createLetter.sidesMaterial, createLetter.sidesMaterial,
				createLetter.sidesMaterial, createLetter.sidesMaterial, frontMat, backMat ]);

		// Creamos una variable estatica al metodo para la geometria de los cubos y si no esta definido la iniciamos,
		// asi no creamos una geometria para cada cubo de cada letra (ahorramos recursos)
		if (createLetter.geom === undefined) {
			createLetter.geom = new THREE.CubeGeometry(cubesSize, cubesSize, cubesSize, 1, 1, 1);
		}

		// Obtenemos los datos de las letras si estan cargados
		if (lettersData) {
			var data = lettersData[letter];
		} else {
			console.error("los datos de las letras no se han cargado");
		}

		// Obtenmos los datos de la letra correspondiente
		if (data == undefined) {
			return null;
		}

		// Creamos un objeto 3D para juntar los cubos de la letra
		var letterMesh = new THREE.Object3D();
		// Recorremos cada dato de la letra
		for (var i = 0; i < data.length; i++) {
			var cub = new THREE.Mesh(createLetter.geom, faceMat);
			cub.iniPosX = cub.position.x = data[i][0] * cubesSize;
			cub.iniPosY = cub.position.y = data[i][1] * cubesSize;
			letterMesh.add(cub);
		}

		// Ponemos la letra en su posicion inicial
		letterMesh.position.copy(pos);
		// Calculamos la anchura de la letra
		letterMesh.width = letterMesh.children[letterMesh.children.length - 1].position.x + cubesSize;

		return letterMesh;
	}

	/**
	 * Método que crea un objeto 3D para una entrada en el menú
	 * 
	 * @param String:sentence
	 *            cadena de texto con la frase que contendrá la entrada del menú.
	 * @param Vector3:pos
	 *            posicion inicial en la que se colocará el boton, esquina inferior izquierda.
	 * @returns Mesh objeto 3D creado con la frase.
	 */
	function createMenuEntry(sentence, pos) {
		// Creamos un array para guardar todas la letras de la frase
		var letters = [];
		var sentenceWidth = cubesSize;

		// Pasamos las letras a minusculas, ya que es lo que reconoce la funcion de crear letras
		var sent = sentence.toLowerCase();

		var rand = Math.random();
		var frontMat = new THREE.MeshBasicMaterial({
			color : rand * 0xffffff,
			overdraw : true,
			side : THREE.DoubleSide
		});
		var backMat = new THREE.MeshBasicMaterial({
			color : Math.random() * 0xffffff,
			overdraw : true,
			side : THREE.DoubleSide
		});

		// Recorremos las letras de la frase
		for (var i = 0; i < sent.length; i++) {
			// Creamos la letra
			var l = createLetter(sent[i], new THREE.Vector3(sentenceWidth, -cubesSize * 2, cubesSize / 2 + 1),
					frontMat, backMat);

			// Si se ha podido crear la letra
			if (l != null) {
				// Actualizamos la anchura de la frase
				sentenceWidth += l.width + cubesSize * 2;
				letters.push(l);
			} else {
				// Añadimos un espacio
				sentenceWidth += cubesSize * 3;
			}
		}
		// Añadimos el espacio final
		sentenceWidth += cubesSize;

		// Recolocamos las letra para que queden centradas
		for (var i = 0; i < letters.length; i++) {
			letters[i].position.x -= sentenceWidth / 2 - cubesSize;
		}

		// Creamos un plano como fondo de la entrada de menu y como contenedor de todas las letras
		var geometry = new THREE.PlaneGeometry(sentenceWidth, cubesSize * 7, 1, 1);
		var mat = new THREE.MeshBasicMaterial({
			color : (1 - rand) * 0xffffff,
			overdraw : true
		});
		// Comprobamos que el color no sea demasiado claro
		if (mat.color.r > 0.87 && mat.color.g > 0.87 && mat.color.b > 0.87) {
			mat.color.setHex(Math.random() * mat.color.getHex());
		}
		var plane = new THREE.Mesh(geometry, mat);
		// Añadimos todas las letras al plano
		for (var i = 0; i < letters.length; i++) {
			plane.add(letters[i]);
		}

		// Colocamos la frase y guardamos su anchura
		plane.position.copy(pos);
		plane.rotation.x = -0.5;
		plane.rotation.y = -0.2;
		plane.width = sentenceWidth;
		// Guardamos los colores
		plane.frontColor = frontMat.color.getHex();
		plane.backColor = backMat.color.getHex();
		plane.backgroundColor = mat.color.getHex();

		return plane;
	}

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

	/**
	 * Método recursivo que realiza la animación de explosión de una entrada del menú
	 * 
	 * @param Object3D:entry
	 *            objeto 3D que sufrirá la animación.
	 */
	function explode(entry, callback) {
		// Comprobamos si no se ha iniciado la animacion
		if (explode.frameCount == undefined) {
			// Iniciamos la cuenta de frames
			explode.frameCount = 1;
			// Reproducimos el sonido de la explosion
			sound.playExplosion();
		}

		// Si no se ha llegado al final de la animacion
		if (explode.frameCount < 10) {
			// Recorremos todas las letras de la entrada del menu
			for (var i = 0; i < entry.children.length; i++) {
				// Recorremos todos los cubos de cada letra
				for (var j = 0; j < entry.children[i].children.length; j++) {
					// Movemos el cubo en la direccion de su vector aleatorio correspondiente
					entry.children[i].children[j].position.addSelf(entry.children[i].children[j].randVec);
					// Giramos el cubo
					entry.children[i].children[j].rotation.x += 0.4;
					entry.children[i].children[j].rotation.y += 0.4;
				}
			}
			// Incrementamos el numero de frames de la animacion que se han mostrado
			explode.frameCount++;
			// Llamamos a esta misma funcion pero con un retardo de 50 milisegundos
			setTimeout(explode, 50, entry, callback);
		} else {
			// Llamamos a la funcion callback de fin de la animacion
			callback();

			// Restauramos el estado por defecto de la entrada del menu
			for (var i = 0; i < entry.children.length; i++) {
				for (var j = 0; j < entry.children[i].children.length; j++) {
					entry.children[i].children[j].position.x = entry.children[i].children[j].iniPosX;
					entry.children[i].children[j].position.y = entry.children[i].children[j].iniPosY;
					entry.children[i].children[j].position.z = 0;
					entry.children[i].children[j].rotation.x = 0;
					entry.children[i].children[j].rotation.y = 0;
				}
			}
		}
	}

	/*******************************************************************************************************************
	 * Métodos Publicos
	 ******************************************************************************************************************/

	/**
	 * Método público que realiza la animación de explosión de una entrada del menú
	 * 
	 * @param Object3D:entry
	 *            objeto 3D que sufrirá la animación.
	 * @param Callback:callback
	 *            funcion callback que será llamada cuando acabe la animación.
	 */
	this.explode = function(entry, callback) {
		// Recorremos todos los cubos, creando para cada uno un vector aleatorio normalizado
		// y posteriormente escalado que indicara la direccion del cubo en la animacion de explosion
		for (var i = 0; i < entry.children.length; i++) {
			for (var j = 0; j < entry.children[i].children.length; j++) {
				entry.children[i].children[j].randVec = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1,
						Math.random()).normalize().multiplyScalar(60);
			}
		}
		// Iniciamos la animacion
		explode.frameCount = undefined;
		explode(entry, callback);
	}

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
	 * Método para para cambiar el color de la entrada indicada
	 */
	this.changeEntryColor = function(entry) {
		entry.children[0].children[0].material.materials[4].color.setHex(Math.random() * 0xffffff);
		entry.material.wireframe = true;
		entry.material.wireframeLinewidth = 10;
	}

	/**
	 * Método para para restaurar los colores de la entrada indicada
	 */
	this.restoreEntryColor = function(entry) {
		entry.children[0].children[0].material.materials[4].color.setHex(entry.frontColor);
		entry.material.wireframe = false;
		entry.material.wireframeLinewidth = 1;
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
			alert("No se ha encontrado ninguna partida. Pruebe a crear una.");
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