/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: LibraryView.js
 *  Sinopsis: Clase de la vista de la biblioteca de imágenes.
 *  
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 30-12-2012
 *  Versión: 0.5
 *  Fecha: 29-12-2012
 *  Versión: 0.4
 *  Fecha: 28-12-2012
 *  Versión: 0.3
 *  Fecha: 27-12-2012
 *  Versión: 0.2
 *  Fecha: 25-12-2012
 *  Versión: 0.1
 *  */

/*
 *  CLASE LIBRARYVIEW
 *  */
function LibraryView(ty) {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	// Array de materiales para cada imagen
	var materials;

	// Array de planos para mostrar cada imagen
	var planes = [];
	// Array con los cubos donde se pondran las imágenes
	var cubes = [];
	// Line que delimitará la zona de los cubos
	var line;
	// Array de paginas que contiene un array de los indices de las imagenes
	var pagesIndex = [];
	// Array con todos los textos del numero de página
	var pages = [];
	// Marcador de la página actual
	var pageMark;
	// Pagina seleccionada
	var currentPage = 0;

	// Altura de las imágenes en pixeles
	var imagesHeight;
	// Espacio para las imágenes
	var imgSpace;
	// Separación entre cada imagen
	var separation;
	// Márgenes, hasta donde se colocarán imágenes
	var margins;
	// Tamaño del texto
	var textSize;
	// Separacion vertical de los numeros de pagina
	var verTextSep = 150;
	// Separacion horizontal de los numeros de pagina
	var horTextSep = 50;
	// Tipo de vista que se tendrá, 1 -> imágenes seleccionables, 2 -> formar dos cubos con imágenes, 3 -> formar tres
	// cubos con imágenes
	var type;

	// Controlador de la biblioteca
	var libC;
	// Botón de aceptar
	var acceptButton;
	// Botón de anterior
	var backButton;
	// Botón de añadir imagen
	var addImgButton;

	var backgroundColor = 0xf0f0f0;

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase LibraryView
	 * 
	 * @param Integer:ty
	 *            tipo de vista, 1 -> imágenes seleccionables, 2 -> formar dos cubos con imagánes, 3 formar tres cubos
	 *            con imágenes.
	 */

	// Guardamos la escena y los materiales
	materials = IMAGES;
	// Guardamos el tipo de vista, comrpobando que sea correcto
	type = (ty >= 1 && ty <= 3) ? ty : 1;
	// Iniciamos el tamaño de las imagenes y la separacion entre estas
	imagesHeight = 300;
	separation = 100;
	// Iniciamos el tamaño del texto
	textSize = 100;

	// Limpiamos la escena
	clearView();
	// Calculamos los margenes
	margins = new THREE.Vector2(-803.8333 * 11 / 5, 803.8333);

	// Creamos las imagenes y mostramos las que correspondan
	buildImages();
	buildPagination();

	// Si es una vista con cubos, los creamos
	if (type == 2 || type == 3) {
		buildCubes();
	}

	// Mostramos la primera pagina
	for (var i = 0; i < pagesIndex[0].length; i++) {
		scene.add(planes[pagesIndex[0][i]]);
		if (planes[pagesIndex[0][i]].selected) {
			scene.add(planes[pagesIndex[0][i]].selectedPlane);
		}
	}

	// Añadimos los botones necesarios
	buildButtons();
	// Mostramos los graficos 3D
	container.appendChild(renderer.domElement);

	/*******************************************************************************************************************
	 * Métodos Privados
	 ******************************************************************************************************************/

	/**
	 * Método para limpiar la escena, elimina todos los objetos de la escena menos la cámara
	 */
	function clearView() {
		for (var i = 0; i < scene.children.length; i++) {
			if (!(scene.children[i] instanceof THREE.Camera)) {
				scene.remove(scene.children[i]);
				i--;
			}
		}
	}

	/**
	 * Método encargado de construir un plano por cada imagen, y mostrar las correspondientes segun la paginación
	 */
	function buildImages() {
		// Creamos un plano para cada material
		for (var i = 0; i < materials.length; i++) {
			// Creamos la geometria con la altura indicada y con su anchura proporcional
			var geometry = new THREE.PlaneGeometry(imagesHeight * materials[i].map.image.width
					/ materials[i].map.image.height, imagesHeight, 1, 1);
			// Creamos la figura con la geometria anterior
			var plane = new THREE.Mesh(geometry, materials[i]);
			// Añadimos una propiedad para saber si la figura esta seleccionada, si es la vista de seleccionar imagenes,
			// se marcan todas como seleccionadas, si no no se marca ninguna
			plane.selected = type == 1;
			// Creamos otro plano para mostrar si la figura esta seleccionada
			var geometry = new THREE.PlaneGeometry(imagesHeight * materials[i].map.image.width
					/ materials[i].map.image.height + 40, imagesHeight + 40, 1, 1);
			var material = new THREE.MeshBasicMaterial({
				color : 0x7777aa,
				overdraw : true
			});
			plane.selectedPlane = new THREE.Mesh(geometry, material);
			plane.selectedPlane.position.z = -2;
			planes.push(plane);
		}

		// Espacio que se utilizara para mostrar las imagenes
		imgSpace = {
			bottom : -margins.y,
			top : margins.y - 200,
			left : margins.x,
			rigth : -margins.x
		};
		// Si es le tipo de vista con cubos
		if (type == 2 || type == 3) {
			// Dejamos espacio para los cubos
			imgSpace.rigth -= (imagesHeight + separation * 4);
		}
		// Numero de imagenes por pagina
		var pagImg = 0;
		// Array con los indices de las imagenes de una pagina
		var page = [];
		// Numero de filas que se han introducido
		var row = 0;
		// Posicion horizontal en pixeles de la ultima figura introducida
		var pos = imgSpace.left;
		// Colocamos los planos
		for (var i = 0; i < materials.length; i++) {
			// Calculamos el tamaño horizontal del plano
			var size = planes[i].geometry.vertices[1].x - planes[i].geometry.vertices[0].x;

			// Calculamos la posicion horizontal que deberá tener el plano
			var posx = pos + separation + size / 2;

			// Si llega al final de la fila, pasamos a la fila siguiente
			if (posx + size / 2 >= imgSpace.rigth - separation) {
				// Aumentamos el numero de filas
				row++;
				// Colocamos el plano a la izquierda del todo
				posx = imgSpace.left + separation + size / 2;
			}

			// Calculamos la posicion vertical que deberá tener el plano
			var posy = imgSpace.top - separation - imagesHeight / 2 - row * (separation + imagesHeight);

			// Si se llega al final de la pagina
			if (posy - imagesHeight / 2 <= imgSpace.bottom + separation) {
				// Reiniciamos la cuenta de las imagenes por pagina
				pagImg = 0;
				// Reiniciamos la cuenta de columnas
				row = 0;

				// Guardamos los indices de las imagenes de esta paginas en el array
				pagesIndex.push(page);
				// Vaciamos el array de imagenes por pagina
				page = [];

				// Calculamos la posicion vertical que deberá tener el plano en la nueva pagina
				posy = imgSpace.top - separation - imagesHeight / 2 - row * (separation + imagesHeight);
			}

			// Colocamos el plano en la posicion calculada
			planes[i].position.x = planes[i].selectedPlane.position.x = planes[i].iniPosX = posx;
			planes[i].position.y = planes[i].selectedPlane.position.y = planes[i].iniPosY = posy;

			// Guardamos el indice del plano en la informacion de la pagina
			page.push(i);
			// Aumentamos el numero de imagenes que tiene la pagina actual
			pagImg++;

			// Colocamos la posicion el el lado derecho del plano, no en el centro, para el siguente plano que se
			// coloque
			pos = posx + size / 2;
		}
		// Guardamos los indices de la ultima pagina
		pagesIndex.push(page);
	}

	/**
	 * Método encargado de construir los cubos donde se añadirán las imágenes
	 */
	function buildCubes() {
		// Recorremos cada uno de los cubos
		for (var i = 0; i < type; i++) {
			var mats = [];
			for (var j = 0; j < 6; j++) {
				mats.push(materials[j + i * 6]);
			}
			cubes[i] = new THREE.Mesh(new THREE.CubeGeometry(imagesHeight, imagesHeight, imagesHeight, 1, 1, 1),
					new THREE.MeshFaceMaterial(mats));
			cubes[i].position.x = imgSpace.rigth + separation * 1.5 + imagesHeight / 2;
			cubes[i].position.y = imgSpace.top - separation - imagesHeight / 2 - i * (separation + imagesHeight);
			cubes[i].rotation.y = -0.51;
			// Añadimos la figura a la escena
			scene.add(cubes[i]);
		}
		// Añadimos un rectangulo para mostrar el area de los cubos
		var geometry = new THREE.Geometry();
		var vertice
		vertice = new THREE.Vector3(imgSpace.rigth, imgSpace.bottom + 150, 0);
		geometry.vertices.push(vertice);
		vertice = new THREE.Vector3(-margins.x - 50, imgSpace.bottom + 150, 0);
		geometry.vertices.push(vertice);
		vertice = new THREE.Vector3(-margins.x - 50, imgSpace.top - 50, 0);
		geometry.vertices.push(vertice);
		vertice = new THREE.Vector3(imgSpace.rigth, imgSpace.top - 50, 0);
		geometry.vertices.push(vertice);
		vertice = new THREE.Vector3(imgSpace.rigth, imgSpace.bottom + 150, 0);
		geometry.vertices.push(vertice);
		line = new THREE.Line(geometry, new THREE.LineBasicMaterial({
			color : 0xff0000
		}));
		scene.add(line);
	}

	/**
	 * Método encargado de construir los controles para poder seleccionar las distintas páginas
	 */
	function buildPagination() {
		// Ahora crearemos los botones para cambiar de pagina
		// Espacio que se utilizara para mostrar los numeros de pagina
		var textSpace = {
			bottom : -margins.y,
			top : margins.y,
			left : margins.x + 300, // Dejamos espacio para el icono del sonido
			rigth : -margins.x
		};
		// Ultima posicion horizontal en la que se ha colocado un numero
		var pos = textSpace.left;

		var letters = [ "{", "<", ">", "}" ];
		// Recorremos cada pagina
		for (var i = -2; i < pagesIndex.length + 2; i++) {
			var letter;
			if (i < 0) {
				letter = letters[i + 2];
			} else if (i >= pagesIndex.length) {
				letter = letters[i - pagesIndex.length + 2];
			} else {
				letter = (i + 1).toString();
			}

			var text = ThreeDUtils.createTextEntry(letter, new THREE.Vector3(0, textSpace.top - verTextSep, 0), 30);
			text.implode = true;
			text.position.x = pos + horTextSep + text.width / 2;
			// Guardamos una propiedad para saber a que pagina corresponde
			text.textID = i;
			pos += text.width + horTextSep;
			scene.add(text);
			pages.push(text);
		}

		// Creamos una marca para señala que pagina esta marcada
		pageMark = ThreeDUtils.createLetterEntry("_", pages[2].position, pages[2].frontColor, pages[2].backColor, 30);
		scene.add(pageMark);
	}

	/**
	 * Método encargado de construir los botones
	 */
	function buildButtons() {
		// Creamos un metodo generico para crear cada boton
		var createButton = function(text, position) {
			var rand = Math.random();
			// Creamos el texto del boton
			var yPosition = -margins.y + 10 + 30 * 7 / 2
			var button = ThreeDUtils.createTextEntry(text, new THREE.Vector3(0, yPosition, 0), 20);
			// Posicionamos el texto: Un poco descentrado hacia la izquierda para no ponerlo encima de los cubos
			button.position.x = position;
			scene.add(button);
			return button;
		}
		acceptButton = createButton(__["buttons.accept"], -margins.x / 2 - 200);
		addImgButton = createButton(__["buttons.addImage"], -450);
		addImgButton.implode = true;
		backButton = createButton(__["buttons.back"], margins.x / 2 - 500);
	}

	/*******************************************************************************************************************
	 * Métodos Publicos
	 ******************************************************************************************************************/

	/**
	 * Método para mostrar la pagina solicitada
	 * 
	 * @param Integer:index
	 *            indice de la pagina a mostrar.
	 */
	this.showPage = function(index) {
		// Si el indice de la pagina no corresponde con un numero de pagina
		if (index < 0 || index >= pages.length) {
			// No hacemos nada
			return;
		}
		// Colocamos la marca de la pagina actual donde corresponda
		var j = index + 2;
		pageMark.position.copy(pages[j].position);
		pageMark.children[0].children[0].material.materials[4].color.setHex(pages[j].frontColor);
		pageMark.children[0].children[0].material.materials[5].color.setHex(pages[j].backColor);

		// Eliminamos los planos de la escena
		for (var i = 0; i < planes.length; i++) {
			scene.remove(planes[i]);
			scene.remove(planes[i].selectedPlane);
		}

		// Añadimos a la escena los planos de la pagina indicada
		for (var i = 0; i < pagesIndex[index].length; i++) {
			scene.add(planes[pagesIndex[index][i]]);
			if (planes[pagesIndex[index][i]].selected) {
				scene.add(planes[pagesIndex[index][i]].selectedPlane);
			}
		}

		// Guardamos la pagina actual
		currentPage = index;
	}

	/**
	 * Método para saber si una posición esta en la zona de los cubos
	 * 
	 * @param Vector2:position
	 *            Posición para la que realizara el cálculo.
	 * @returns Boolean true si se encuentra en la zona de los cubos y false si no.
	 */
	this.isCubeZone = function(position) {
		if (position.x < imgSpace.rigth || position.x > -margins.x - 50 || position.y < imgSpace.bottom + 50
				|| position.y > imgSpace.top - 50) {
			return false;
		} else {
			return true;
		}
	}

	/**
	 * Método para colocar un plano delante de un cubo
	 * 
	 * @param Mesh:object
	 *            figura que se moverá hacia delante.
	 */
	this.putZBefore = function(object) {
		object.position.z = imagesHeight / 1.5;
	}

	/**
	 * Método para colocar un plano en Z=1, es decir en su profundidad normal en movimiento
	 * 
	 * @param Mesh:object
	 *            figura que se colocará en su profundidad normal en movimiento.
	 */
	this.putZ1 = function(object) {
		object.position.z = 1;
	}

	/**
	 * Método para añadir una imagen a la biblioteca
	 * 
	 * @param Material:material
	 *            material con el que se creará el plano que represente a la figura.
	 * @returns Boolean muestra si se tuvo éxito al añadir la imagen.
	 */
	this.addImg = function(material) {
		// Flag para saber si hay que añadir un nuevo numero de pagina
		var createPage = false;

		// Creamos la geometria con la altura indicada y con su anchura proporcional
		var geometry = new THREE.PlaneGeometry(imagesHeight * material.map.image.width / material.map.image.height,
				imagesHeight, 1, 1);
		// Creamos la figura con la geometria anterior
		var plane = new THREE.Mesh(geometry, material);
		// Añadimos una propiedad para saber si la figura esta seleccionada, si es la vista de seleccionar imagenes,
		// se marcan todas como seleccionadas, si no no se marca ninguna
		if (type == 1) {
			plane.selected = true;
		} else {
			plane.selected = false;
		}
		// Creamos otro plano para mostrar si la figura esta seleccionada
		var geometry = new THREE.PlaneGeometry(
				imagesHeight * material.map.image.width / material.map.image.height + 40, imagesHeight + 40, 1, 1);
		plane.selectedPlane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
			color : 0x7777aa,
			overdraw : true
		}));
		plane.selectedPlane.position.z = -2;
		// Añadimos el plano al array
		planes.push(plane);

		// Espacio que se utilizara para mostrar las imagenes
		imgSpace = {
			bottom : -margins.y,
			top : margins.y - 200,
			left : margins.x,
			rigth : -margins.x
		};
		// Si es le tipo de vista con cubos
		if (type == 2 || type == 3) {
			// Dejamos espacio para los cubos
			imgSpace.rigth -= (imagesHeight + separation * 4);
		}
		// Obtenemos los indices de la ultima pagina y del anterior al ultimo plano de la pagina, ya que ya hemos
		// introducido el nuevo plano
		var lastPage = pagesIndex.length - 1;
		var lastPlane = pagesIndex[lastPage][pagesIndex[lastPage].length - 1];
		// Calculamos la posicion de la ultima figura
		var lastPosition = new THREE.Vector3().copy(planes[lastPlane].position);

		// Calculamos el tamaño horizontal del plano
		var size = plane.geometry.vertices[1].x - plane.geometry.vertices[0].x;
		// Calculamos la posicion horizontal que deberá tener el plano
		var posx = lastPosition.x
				+ (planes[lastPlane].geometry.vertices[1].x - planes[lastPlane].geometry.vertices[0].x) / 2
				+ separation + size / 2;
		// Calculamos la posicion vertical que deberá tener el plano
		var posy = lastPosition.y;
		// Si llega al final de la fila, pasamos a la fila siguiente
		if (posx + size / 2 >= imgSpace.rigth - separation) {
			// Colocamos el plano a la izquierda del todo
			posx = imgSpace.left + separation + size / 2;
			// En la siguiente fila
			posy -= separation + imagesHeight;
		}
		// Si se llega al final de la pagina
		if (posy - imagesHeight / 2 <= imgSpace.bottom + separation) {
			// Añadimos una nueva pagina vacia
			pagesIndex.push([]);
			// Calculamos la posicion vertical que deberá tener el plano en la nueva pagina
			posy = imgSpace.top - separation - imagesHeight / 2;
			createPage = true;
		}

		// Colocamos el plano en la posicion calculada
		plane.position.x = plane.selectedPlane.position.x = plane.iniPosX = posx;
		plane.position.y = plane.selectedPlane.position.y = plane.iniPosY = posy;

		// Guardamos el indice en la ultima pagina
		pagesIndex[pagesIndex.length - 1].push(planes.length - 1);

		if (createPage) {
			// Creamos el numero de la pagina
			var text = ThreeDUtils.createTextEntry(pagesIndex.length.toString(), new THREE.Vector3(0, margins.y
					- verTextSep, 0), 30);
			text.implode = true;

			// Comprobamos que no se salga de la pantalla
			if (pages[pages.length - 1].position.x + pages[pages.length - 1].width / 2 + text.width + horTextSep > -margins.x) {
				pagesIndex.pop();
				planes.pop();
				return false;
			}

			// Obtenemos la posicion del ultimo numero de pagina
			var lastPage = pages[pagesIndex.length - 2 + 2];
			// Calculamos su posicion
			text.position.x = lastPage.width / 2 + text.width / 2 + lastPage.position.x + horTextSep;
			text.textID = pagesIndex.length - 1;

			// Movemos los dos siguientes simbolos (pag siguiente y ultima pag)
			pages[pages.length - 1].position.x += text.width + horTextSep;
			pages[pages.length - 2].position.x += text.width + horTextSep;
			// Incrementamos en uno los identificadores, ya que hay una nueva pagina
			pages[pages.length - 1].textID++;
			pages[pages.length - 2].textID++;

			// Añadimos el numero al array de paginas y a la escena
			pages.splice(pages.length - 2, 0, text);
			scene.add(text);
		} else if (currentPage == pagesIndex.length - 1) {
			scene.add(plane);
			if (plane.selected) {
				scene.add(plane.selectedPlane);
			}
		}
		return true;
	}

	/**
	 * Método para eliminar de la interfaz todos los elementos de la vista, ocultarlos
	 */
	this.hide = function() {
		// Recorremos los planos de la pagina actual
		for (var i = 0; i < pagesIndex[currentPage].length; i++) {
			// Quitamos el plano de la escena
			scene.remove(planes[pagesIndex[currentPage][i]]);
			// Si el modo de vista es el de imagenes seleccionable y esta seleccionada la imagen
			if (type == 1 && planes[pagesIndex[currentPage][i]].selected) {
				// Quitamos la marca de seleccion de la escena
				scene.remove(planes[pagesIndex[currentPage][i]].selectedPlane);
			}
		}
		// Recorremos los numeros de pagina
		for (var i = 0; i < pages.length; i++) {
			// Quitamos el numero de pagina de la escena
			scene.remove(pages[i]);
		}
		// Quitamos la marca de la pagina actual
		scene.remove(pageMark);

		// Si el tipo de vista es uno de los que tienen cubos
		if (type != 1) {
			for (var i = 0; i < cubes.length; i++) {
				// Quitamos el cubo de la escena
				scene.remove(cubes[i]);
			}
			// Quitamos la linea que marca el area de los cubos
			scene.remove(line);
		}

		// Ocultamos los botones
		scene.remove(acceptButton);
		scene.remove(backButton);
		scene.remove(addImgButton);
	}

	/**
	 * Método para mostrar la vista del tipo indicado
	 * 
	 * @param Integer:t
	 *            tipo de vista que se mostrará.
	 */
	this.show = function(t) {
		// Si el tipo suministrado no es correcto
		if (t < 1 || t > 3) {
			// No hacemos nada
			return;
		}
		// Si no es el tipo que se tiene actualmente, hay que remodelar la vista
		if (t != type) {
			// Si el tipo de vista anterior o el actual son el de imagenes seleccionables recolocamos los planos
			if (t == 1 || type == 1) {
				// Redefinimos el espacio para mostrar las figuras en funcion del tipo
				if (t == 1) {
					imgSpace.rigth = -margins.x;
				}
				if (t == 2 || t == 3) {
					// Dejamos espacio para los cubos
					imgSpace.rigth = -margins.x - (imagesHeight + separation * 4);
				}

				// Vaciamos el array de indices de pagina para crearlos de nuevo
				while (pagesIndex.length != 0) {
					pagesIndex.pop();
				}

				// Numero de imagenes por pagina
				var pagImg = 0;
				// Array con los indices de las imagenes de una pagina
				var page = [];
				// Numero de filas que se han introducido
				var row = 0;
				// Posicion horizontal en pixeles de la ultima figura introducida
				var pos = imgSpace.left;
				// Colocamos los planos
				for (var i = 0; i < planes.length; i++) {
					// Calculamos el tamaño horizontal del plano
					var size = planes[i].geometry.vertices[1].x - planes[i].geometry.vertices[0].x;

					// Calculamos la posicion horizontal que deberá tener el plano
					var posx = pos + separation + size / 2;

					// Si llega al final de la fila, pasamos a la fila siguiente
					if (posx + size / 2 >= imgSpace.rigth - separation) {
						// Aumentamos el numero de filas
						row++;
						// Colocamos el plano a la izquierda del todo
						posx = imgSpace.left + separation + size / 2;
					}

					// Calculamos la posicion vertical que deberá tener el plano
					var posy = imgSpace.top - separation - imagesHeight / 2 - row * (separation + imagesHeight);

					// Si se llega al final de la pagina
					if (posy - imagesHeight / 2 <= imgSpace.bottom + separation) {
						// Reiniciamos la cuenta de las imagenes por pagina
						pagImg = 0;
						// Reiniciamos la cuenta de columnas
						row = 0;

						// Guardamos los indices de las imagenes de esta paginas en el array
						pagesIndex.push(page);
						// Vaciamos el array de imagenes por pagina
						page = [];

						// Calculamos la posicion vertical que deberá tener el plano en la nueva pagina
						posy = imgSpace.top - separation - imagesHeight / 2 - row * (separation + imagesHeight);
					}

					// Colocamos el plano en la posicion calculada
					planes[i].position.x = planes[i].selectedPlane.position.x = planes[i].iniPosX = posx;
					planes[i].position.y = planes[i].selectedPlane.position.y = planes[i].iniPosY = posy;

					// Guardamos el indice del plano en la informacion de la pagina
					page.push(i);
					// Aumentamos el numero de imagenes que tiene la pagina actual
					pagImg++;

					// Colocamos la posicion el el lado derecho del plano, no en el centro, para el siguente plano que
					// se coloque
					pos = posx + size / 2;
				}
				// Guardamos los indices de la ultima pagina
				pagesIndex.push(page);

				// Si hay un numero diferente de paginas
				// Si habia mas
				if (pages.length - 4 > pagesIndex.length) {
					// Movemos los dos ultimos simbolos (pag siguiente y ultima pag)
					pages[pages.length - 1].position.x -= ((pages[pages.length - 3].geometry.boundingBox.max.x - pages[pages.length - 3].geometry.boundingBox.min.x) + 150);
					pages[pages.length - 2].position.x -= ((pages[pages.length - 3].geometry.boundingBox.max.x - pages[pages.length - 3].geometry.boundingBox.min.x) + 150);
					// Decrementamos en uno los identificadores, ya que hay una pagina menos
					pages[pages.length - 1].textID--;
					pages[pages.length - 2].textID--;
					// Eliminamos el ultimo numero de pagina
					pages.splice(pages.length - 3, 1);
				}
				// Si habia menos
				if (pages.length - 4 < pagesIndex.length) {
					// Creamos el numero de la pagina
					var text = ThreeDUtils.createTextEntry(pagesIndex.length.toString(), new THREE.Vector3(0, margins.y
							- verTextSep, 0), 30);
					text.implode = true;

					// Obtenemos la posicion del ultimo numero de pagina
					var lastPage = pages[pagesIndex.length - 2 + 2];
					// Calculamos su posicion
					text.position.x = lastPage.width / 2 + text.width / 2 + lastPage.position.x + horTextSep;
					text.textID = pagesIndex.length - 1;

					// Movemos los dos siguientes simbolos (pag siguiente y ultima pag)
					pages[pages.length - 1].position.x += text.width + horTextSep;
					pages[pages.length - 2].position.x += text.width + horTextSep;
					// Incrementamos en uno los identificadores, ya que hay una nueva pagina
					pages[pages.length - 1].textID++;
					pages[pages.length - 2].textID++;

					// Añadimos el numero al array de paginas y a la escena
					pages.splice(pages.length - 2, 0, text);
				}

				// Si el tipo de vista es el de imagenes seleccionables
				if (t == 1) {
					// Seleccionamos todas las imagenes
					for (var i = 0; i < planes.length; i++) {
						planes[i].selected = true;
					}
				}
				// Si el tipo de vista no es el de imagenes seleccionables
				else {
					// Deseleccionamos todas las imagenes
					for (var i = 0; i < planes.length; i++) {
						planes[i].selected = false;
					}
				}
			}

			// Si es una vista con cubos, los creamos si es necesario
			if (t == 2 || t == 3) {
				// Recorremos cada uno de los cubos
				for (var i = 0; i < t; i++) {
					// Si el cubo no esta creado
					if (cubes[i] == undefined) {
						var mats = [];
						for (var j = 0; j < 6; j++) {
							mats.push(materials[j + i * 6]);
						}
						cubes[i] = new THREE.Mesh(new THREE.CubeGeometry(imagesHeight, imagesHeight, imagesHeight, 1,
								1, 1), new THREE.MeshFaceMaterial(mats));
						cubes[i].position.x = imgSpace.rigth + separation * 1.5 + imagesHeight / 2;
						cubes[i].position.y = imgSpace.top - separation - imagesHeight / 2 - i
								* (separation + imagesHeight);
						cubes[i].rotation.y = -0.51;
						// Añadimos la figura a la escena
						scene.add(cubes[i]);
					}
				}

				// Si el rectangulo para delimitar el area de los cubos no esta creado lo creamos
				if (line === undefined) {
					var geometry = new THREE.Geometry();
					var vertice
					vertice = new THREE.Vector3(imgSpace.rigth, imgSpace.bottom + 50, 0);
					geometry.vertices.push(vertice);
					vertice = new THREE.Vector3(-margins.x - 50, imgSpace.bottom + 50, 0);
					geometry.vertices.push(vertice);
					vertice = new THREE.Vector3(-margins.x - 50, imgSpace.top - 50, 0);
					geometry.vertices.push(vertice);
					vertice = new THREE.Vector3(imgSpace.rigth, imgSpace.top - 50, 0);
					geometry.vertices.push(vertice);
					vertice = new THREE.Vector3(imgSpace.rigth, imgSpace.bottom + 50, 0);
					geometry.vertices.push(vertice);
					line = new THREE.Line(geometry, new THREE.LineBasicMaterial({
						color : 0xff0000
					}));
				}
			}
		}

		// Mostramos todos los elementos

		// Mostramos los planos de la primera pagina
		for (var i = 0; i < pagesIndex[0].length; i++) {
			scene.add(planes[pagesIndex[0][i]]);
			if (planes[pagesIndex[0][i]].selected) {
				scene.add(planes[pagesIndex[0][i]].selectedPlane);
			}
		}
		// Mostramos los numeros de paginas
		for (var i = 0; i < pages.length; i++) {
			scene.add(pages[i]);
		}
		// Mostramos la marca de pagina
		currentPage = 0;
		// Colocamos la marca de la pagina actual donde corresponda
		var j = currentPage + 2;
		pageMark.position.copy(pages[2].position)
		scene.add(pageMark);

		// Mostramos los cubos si corresponde
		if (t == 2 || t == 3) {
			// Recorremos cada uno de los cubos y lo añadimos a la escena
			for (var i = 0; i < t; i++) {
				scene.add(cubes[i]);
			}
			// Añadimos la linea delimitadora a la escena
			scene.add(line);
		}

		// Mostramos los botones
		scene.add(acceptButton);
		scene.add(backButton);
		scene.add(addImgButton);

		type = t;
	}

	/**
	 * Obtiene un arrays con los planos (imagenes) que se estan mostrando actualmente (de la pagina actual)
	 * 
	 * @returns Mesh[] array con los planos de la pagina actual
	 */
	this.getCurrentPlanes = function() {
		var pagePlanes = [];
		for (var i = 0; i < pagesIndex[currentPage].length; i++) {
			pagePlanes.push(planes[pagesIndex[currentPage][i]]);
		}
		return pagePlanes;
	}

	/**
	 * Obtiene el numero total de paginas que hay actualmente
	 * 
	 * @returns Integer numero de paginas
	 */
	this.getNumberOfPages = function() {
		return pagesIndex.length;
	}

	/**
	 * Método que obtendrá los materiales seleccionados cuando se termine de escoger
	 * 
	 * @returns Material[] array de materiales que contendrá todos los materiales seleccionados.
	 */
	this.getSelectedMaterials = function() {
		var mats = [];

		// Si la vista es la de imagenes seleccionables
		if (type == 1) {
			// Recorremos todas la imagenes
			for (var i = 0; i < planes.length; i++) {
				// Y si estan seleccionadas
				if (planes[i].selected) {
					// Guardamos sus materiales
					mats.push(planes[i].material);
				}
			}
			return mats;
		}

		// Si no es la vista recorremos todos los cubos
		for (var i = 0; i < type; i++) {
			// Recorremos las caras de cada cubo
			for (var j = 0; j < 6; j++) {
				// Guardamos el material de cada cara
				mats.push(cubes[i].material.materials[j]);
			}
		}
		return mats;
	}

	/**
	 * GETTERS VARIOS
	 */
	this.getPages = function() {
		return pages;
	}
	this.getCubes = function() {
		return cubes;
	}
	this.getAcceptButton = function() {
		return acceptButton;
	}
	this.getBackButton = function() {
		return backButton;
	}
	this.getAddImgButton = function() {
		return addImgButton;
	}

}