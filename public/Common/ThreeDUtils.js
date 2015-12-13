/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: ThreeDUtils.js
 *  Sinopsis: Fichero con funciones auxiliares relaccionadas con graficos 3D.
 *
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 11-12-2015
 *  Versión: 0.1
 *  */

/***********************************************************************************************************************
 * Funciones Varias
 **********************************************************************************************************************/

var ThreeDUtils = {};

/**
 * Funcion para calcular si los objectos indicados son estan en la posicion del raton. Se encarga de iniciar y gestionar
 * todas las clases que sean necesarias.
 * 
 * @param THREE.Vector2|THREE.Vector3:mouse
 *            vector 2D para las coordenadas del raton ya tranformadas (con el eje de coordenadas en el centro de la
 *            pantalla). Tambien acepta un vector de tres coordendas. Si no se recibe un valor se utilizaran las
 *            coordenadas recibidas en la llamada anterior a este metodo
 * @param Object3D[]:objects
 *            objetos 3D con los que se comprobara si la posicion del raton coincide. Si no se recibe ningun objeto, se
 *            comprobara en que punto esta el raton en un plano paralelo a la pantalla y en Z=0, de modo que siempre se
 *            ejecutara la funcion de rellamada "onIntersect"
 * @param String:changePointer
 *            estilo CSS del cursor que se fijara si hay algun objeto en la posicion del raton, si no hay objecto si
 *            fijara el cursor por defecto. Si no se recibe un valor, no se cambiara el cursor
 * @param Callback:onIntersect
 *            funcion de rellamada que se ejecutara si hay algun objeto en la posicion. Esta recibira un parametro con
 *            la informacion de la interseccion: distancia, punto, cara del objeto, el objecto en si, ... En caso de que
 *            haya mas de un objeto en la posicion del raton, solo se tendra en cuenta el mas cercano a la camara
 * @param Callback:onNotIntersect
 *            funcion de rellamada que se ejecutara si no hay algun objeto en la posicion
 * @param Callback:onNoMatter
 *            funcion de rellamada que sera llamada siempre, haya o no objetos en la posicion indicada. Se le pasara
 *            como parametro un array con la informacion de la interseccion de todos los objetos que se hayen en esa
 *            posicion
 */
ThreeDUtils.intersectObjects = function(mouse, objects, changePointer, onIntersect, onNotIntersect, onNoMatter) {
	// Si no estan iniciados los objectos necesarios, los creamos
	if (!ThreeDUtils.ray) {
		// Proyector para realizar operaciones
		ThreeDUtils.projector = new THREE.Projector();
		// Rayo que realizará las operaciones de intersección con origen en la posicion de la camara
		ThreeDUtils.ray = new THREE.Raycaster(camera.position);
		// Plano para hacer calculos
		ThreeDUtils.plane = new THREE.Mesh(new THREE.PlaneGeometry(10000, 10000, 8, 8), new THREE.MeshBasicMaterial({
			color : 0x000000,
			transparent : true,
			wireframe : true
		}));
		// Hacemos que no sea visible, es para funcionamiento interno, no para mostrarlo
		ThreeDUtils.plane.visible = false;
	}

	// Si recibimos la posicion del raton, cambiamos la direccion del ray
	if (mouse) {
		if (mouse instanceof THREE.Vector2) {
			// Creamos un vector en la direccion del raton hacia la escena
			var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
			ThreeDUtils.projector.unprojectVector(vector, camera);
		} else if (mouse instanceof THREE.Vector3) {
			var vector = new THREE.Vector3().copy(mouse);
			vector.z = 0;
		}
		ThreeDUtils.ray.ray.direction = vector.subSelf(camera.position).normalize();
	}
	// Si recibimos objectos, contra estos, si no contra el plano
	if (objects) {
		var intersects = ThreeDUtils.ray.intersectObjects(objects);
	} else {
		var intersects = ThreeDUtils.ray.intersectObject(ThreeDUtils.plane);
	}
	// Si hay objetos
	if (intersects.length > 0) {
		if (changePointer) {
			// Cambiamos al cursor indicado
			container.style.cursor = changePointer;
		}
		if (onIntersect) {
			onIntersect(intersects[0]);
		}
	} else {
		if (changePointer) {
			// Usamos el cursor por defecto
			container.style.cursor = 'auto';
		}
		if (onNotIntersect) {
			onNotIntersect();
		}
	}
	if(onNoMatter) {
		onNoMatter(intersects);
	}
}

/**
 * Método que crea un objeto 3D formado por cubos representando la letra suministrada
 * 
 * @param String:letter
 *            cadena de texto con la letra que se creará.
 * @param Vector3:pos
 *            posicion inicial en la que se colocará la letra, esquina inferior izquierda.
 * @param Material:frontMat
 *            material con el cual se creará la cara del frente de la letra.
 * @param Material:backMat
 *            material con el cual se creará la cara de atrás de la letra.
 * @param Integer:cubeSize
 *            tamaño de los cubos que formaran la letra
 * @returns Mesh objeto 3D creado con la letra o null si no es una letra conocida (un espacio, ...).
 */
ThreeDUtils.createLetter = function(letter, pos, frontMat, backMat, cubeSize) {
	// Creamos una variable estatica al metodo para el material de los lados y si no esta definido la iniciamos, asi
	// no creamos un material para cada letra (ahorramos recursos)
	if (ThreeDUtils.createLetter.sidesMaterial === undefined) {
		ThreeDUtils.createLetter.sidesMaterial = new THREE.MeshBasicMaterial({
			color : 0x000000,
			overdraw : true,
			wireframe : true,
			wireframeLinewidth : 1
		});
	}
	var faceMat = new THREE.MeshFaceMaterial([ ThreeDUtils.createLetter.sidesMaterial,
			ThreeDUtils.createLetter.sidesMaterial, ThreeDUtils.createLetter.sidesMaterial,
			ThreeDUtils.createLetter.sidesMaterial, frontMat, backMat ]);

	// Creamos un mapeo estatico al metodo para la geometria de los cubos en funcion de su tamaño y si no esta definido
	// la iniciamos, asi no creamos una geometria para cada cubo de cada letra (ahorramos recursos)
	if (!ThreeDUtils.createLetter.geoms) {
		ThreeDUtils.createLetter.geoms = {};
	}
	if (!ThreeDUtils.createLetter.geoms[cubeSize]) {
		ThreeDUtils.createLetter.geoms[cubeSize] = new THREE.CubeGeometry(cubeSize, cubeSize, cubeSize, 1, 1, 1);
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
	// Guardamos la coordenada max y min para calcular el ancho
	var max = 0, min = 0;
	// Recorremos cada dato de la letra
	for (var i = 0; i < data.length; i++) {
		var cub = new THREE.Mesh(ThreeDUtils.createLetter.geoms[cubeSize], faceMat);
		cub.iniPosX = cub.position.x = data[i][0] * cubeSize;
		cub.iniPosY = cub.position.y = data[i][1] * cubeSize;
		letterMesh.add(cub);
		if (cub.iniPosX > max) {
			max = cub.iniPosX;
		}
		if (cub.iniPosX < min) {
			min = cub.iniPosX;
		}
	}

	// Ponemos la letra en su posicion inicial
	letterMesh.position.copy(pos);
	// Calculamos la anchura de la letra
	letterMesh.width = max - min + cubeSize;

	return letterMesh;
}

/**
 * Crea una entrada con una unica letra y sin fondo
 * 
 * @param String:letter
 *            cadena de texto con la letra que se creará.
 * @param Vector3:pos
 *            posicion inicial en la que se colocará la letra, esquina inferior izquierda.
 * @param Integer:frontColor
 *            color con el cual se creará la cara del frente de la letra.
 * @param Integer:backColor
 *            color con el cual se creará la cara de atrás de la letra.
 * @param Integer:cubeSize
 *            tamaño de los cubos que formaran la letra
 * @returns Mesh objeto 3D creado con la letra o null si no es una letra conocida (un espacio, ...).
 */
ThreeDUtils.createLetterEntry = function(letter, pos, frontColor, backColor, cubeSize) {
	var frontMat = new THREE.MeshBasicMaterial({
		color : frontColor,
		overdraw : true,
		side : THREE.DoubleSide
	});
	var backMat = new THREE.MeshBasicMaterial({
		color : backColor,
		overdraw : true,
		side : THREE.DoubleSide
	});
	// Creamos la letra
	var l = ThreeDUtils.createLetter(letter, new THREE.Vector3(0, -cubeSize * 2, cubeSize / 2 + 1), frontMat, backMat,
			cubeSize);
	// Creamos un contenedor invisible
	var geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
	var mat = new THREE.MeshBasicMaterial({
		color : 0xffffff,
		overdraw : true,
		visible : false
	});
	var plane = new THREE.Mesh(geometry, mat);
	// Colocamos la frase y guardamos su anchura
	plane.position.copy(pos);
	plane.rotation.x = -0.5;
	plane.rotation.y = -0.2;

	if (l != null) {
		l.position.x -= (l.width - cubeSize) / 2;
		// Añadimos todas las letras al plano
		plane.add(l);
	}

	return plane;
}

/**
 * Método que crea un objeto 3D para una entrada en el menú o de texto en general. La entrada tendra tres metodos: <br>
 * ---".explode(callback)", el cual al ser ejecutado iniciara la animacion de explosion, y cuando acabe la animacion
 * ejecutara la funcion de rellamada que se le pase como unico parametro <br>
 * ---".changeEntryColor()" cambiara el color de la entrada a un color aleatorio <br>
 * ---".restoreEntryColor()", restaurara el color que tenia originalmente la entrada antes de llamar a
 * "changeEntryColor()" Si a la entrada creada se le asocia una variable llamada ".implode" con valor igual a "true",
 * tras finalizar la animacion de explosion, se iniciara otra animacion de implosion hasta que los cubos vuelvan a su
 * lugar original
 * 
 * @param String:sentence
 *            cadena de texto con la frase que contendrá la entrada del menú.
 * @param Vector3:pos
 *            posicion inicial en la que se colocará el boton, esquina inferior izquierda.
 * @param Integer:cubeSize
 *            tamaño de los cubos que formaran la letra
 * @returns Mesh objeto 3D creado con la frase.
 */
ThreeDUtils.createTextEntry = function(sentence, pos, cubeSize) {
	// Creamos un array para guardar todas la letras de la frase
	var letters = [];
	var sentenceWidth = cubeSize;

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
		var l = ThreeDUtils.createLetter(sent[i], new THREE.Vector3(sentenceWidth, -cubeSize * 2, cubeSize / 2 + 1),
				frontMat, backMat, cubeSize);

		// Si se ha podido crear la letra
		if (l != null) {
			// Actualizamos la anchura de la frase
			sentenceWidth += l.width + cubeSize * 2;
			letters.push(l);
		} else {
			// Añadimos un espacio
			sentenceWidth += cubeSize * 3;
		}
	}

	// Recolocamos las letra para que queden centradas
	for (var i = 0; i < letters.length; i++) {
		letters[i].position.x -= sentenceWidth / 2 - cubeSize;
	}

	// Creamos un plano como fondo de la entrada de menu y como contenedor de todas las letras
	var geometry = new THREE.PlaneGeometry(sentenceWidth, cubeSize * 7, 1, 1);
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

	// Creamos los eventos de cambio de color y explosion
	ThreeDUtils.createExplodeEvent(plane);
	ThreeDUtils.createChangeColorsEvent(plane);

	return plane;
}

/**
 * Asigna a la entrada de texto indicada un metodo ".explode(callback)", el cual al ser ejecutado iniciara la animacion
 * de explosion, y cuando acabe la animacion ejecutara la funcion de rellamada que se le pase como unico parametro
 * 
 * @param Object3D:entry
 *            objeto 3D al que se le registrara la funcion de animación.
 */
ThreeDUtils.createExplodeEvent = function(entry) {
	entry.explode = function(callback) {
		// Recorremos todos los cubos, creando para cada uno un vector aleatorio normalizado
		// y posteriormente escalado que indicara la direccion del cubo en la animacion de explosion
		for (var i = 0; i < entry.children.length; i++) {
			for (var j = 0; j < entry.children[i].children.length; j++) {
				entry.children[i].children[j].randVec = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1,
						Math.random()).normalize().multiplyScalar(60);
			}
		}
		entry.explode.frameCount = undefined;
		// Flag para saber la direccion de la explosion o implosion
		entry.explode.imploding = 1;
		// Flag para poder parar la explosion
		entry.keepExploding = true;
		// Creamos un evento para que se detenga la explosion la proxima vez que se haga click antes de que acabe
		var stopExplosion = function() {
			entry.keepExploding = false;
			document.getElementById('canvas').removeEventListener('click', stopExplosion, false);
		}
		// Creamos la funcion de animacion de la explosion
		var exploding = function() {
			// Comprobamos si no se ha iniciado la animacion
			if (entry.explode.frameCount == undefined) {
				// Iniciamos la cuenta de frames
				entry.explode.frameCount = 1;
				// Reproducimos el sonido de la explosion
				sound.playExplosion();
			}
			// Si no se ha llegado al final de la animacion
			if (entry.explode.frameCount < 10 && entry.keepExploding) {
				// Recorremos todas las letras de la entrada del menu
				for (var i = 0; i < entry.children.length; i++) {
					// Recorremos todos los cubos de cada letra
					for (var j = 0; j < entry.children[i].children.length; j++) {
						// Movemos el cubo en la direccion de su vector aleatorio correspondiente
						if (entry.explode.imploding == 1) {
							entry.children[i].children[j].position.addSelf(entry.children[i].children[j].randVec);
						} else {
							entry.children[i].children[j].position.subSelf(entry.children[i].children[j].randVec);
						}
						// Giramos el cubo
						entry.children[i].children[j].rotation.x += 0.4 * entry.explode.imploding;
						entry.children[i].children[j].rotation.y += 0.4 * entry.explode.imploding;
					}
				}
				// Incrementamos el numero de frames de la animacion que se han mostrado
				entry.explode.frameCount++;
				// Si la figura tiene animacion de implosion y todavia no ha sucedido, reiniciamos la cuenta y activamos
				// el flag
				if (entry.implode && entry.explode.frameCount == 10 && entry.explode.imploding == 1) {
					entry.explode.frameCount = 1;
					entry.explode.imploding = -1;
				}
				// Llamamos a esta misma funcion pero con un retardo de 50 milisegundos
				setTimeout(exploding, 50);
			} else {
				document.getElementById('canvas').removeEventListener('click', stopExplosion, false);
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
		exploding();
		document.getElementById('canvas').addEventListener('click', stopExplosion, false);
	}
}

/**
 * Asigna a la entrada de texto indicada un par de metodos ".changeEntryColor()" y ".restoreEntryColor()", que al ser
 * ejecutados cambiaran o restauraran respectivamente los colores de la entrada
 * 
 * @param Object3D:entry
 *            objeto 3D al que se le registraran las funciones de cambio de color.
 */
ThreeDUtils.createChangeColorsEvent = function(entry) {
	entry.changeEntryColor = function() {
		entry.children[0].children[0].material.materials[4].color.setHex(Math.random() * 0xffffff);
		entry.material.wireframe = true;
		entry.material.wireframeLinewidth = 10;
	}
	entry.restoreEntryColor = function() {
		entry.children[0].children[0].material.materials[4].color.setHex(entry.frontColor);
		entry.material.wireframe = false;
		entry.material.wireframeLinewidth = 1;
	}

}