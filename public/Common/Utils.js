/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: Utils.js
 *  Sinopsis: Fichero con funciones auxiliares.
 *
 *  Autor: Vaquero Marcos, Javier
 *  Autor: Stephane Roucheray
 *  Fecha: 23-12-2012
 *  Versión: 0.1
 *  */

/*****************************************
 *  Funciones Varias
 *****************************************/

/**
 * Función que compara vectores de tres componenetes X, Y, Z. Primero compara X, si son iguales compara Y, y si también
 * son iguales compara Z.
 * 
 * @param Vector3:a
 *            primer vector de tres elementos a comparar.
 * @param Vector3:b
 *            segundo vector de tres elementos a comparar.
 * @return Integer -1=menor que, 1=mayor que, 0=igual.
 */
function compareVector3(a, b) {
	if (a.x < b.x) {// X menor que
		return -1;
	} else if (a.x > b.x) {// X mayor que
		return 1;
	} else if (a.y < b.y) {// X igual Y menor que
		return -1;
	} else if (a.y > b.y) {// X igual Y mayor que
		return 1;
	} else if (a.z < b.z) {// X Y igual Z menor que
		return -1;
	} else if (a.z > b.z) {// X Y igual Z mayor que
		return 1;
	} else {
		// X Y Z iguales
		return 0;
	}
}

/**
 * Función que aproxima a la potencia de dos más cercana
 * 
 * @param Float:number
 *            entero que se aproximará a la potencia de dos más cercana.
 * @return Integer entero aproximado a la potencia de dos mas cercana.
 */
function round2Power(number) {
	var logarithm, rounded, power;
	logarithm = Math.log(number) / Math.log(2);
	power = Math.round(logarithm);
	rounded = Math.pow(2, power);
	return rounded;
}

/**
 * Función que aproxima al angulo multiplo de 90 grados / Pi/2 radianes mas cercano
 * 
 * @param Float:angle
 *            ángulo en radianes que se aproximará al multiplo de 90 grados / Pi/2 radianes mas cercano.
 * @return Float ángulo aproximado al multiplo de 90 grados / Pi/2 radianes mas cercano.
 */
function roundAngle(angle) {
	var div, rounded;
	div = angle / (Math.PI / 2);
	rounded = (Math.PI / 2) * Math.round(div);
	return rounded;
}

/**
 * Función que convierte grados en radianes
 * 
 * @param Float:degrees
 *            ángulo que se convertirá en radianes.
 * @return Float ángulo pasado a radianes.
 */
function deg2Rad(degrees) {
	return degrees * Math.PI / 180;
}
/**
 * Función que convierte radianes en grados
 * 
 * @param Float:rad
 *            ángulo que se convertirá en grados.
 * @return Float ángulo pasado a grados.
 */
function rad2Deg(rad) {
	return rad / Math.PI * 180;
}

/**
 * Función para cargar texturas. Basada en la función THREE.ImageUtils.loadTexture
 * 
 * @param String:path
 *            ruta en la que se encuentra la imagen a cargar en la textura.
 * @param Callback:f
 *            funcion que se lanzará cuando se cargue la imagen
 * @return Texture textura de la imagen suministrada.
 */
function loadTexture(path, f) {
	var image = new Image(), texture = new THREE.Texture(image);
	image.onload = function() {
		texture.needsUpdate = true;
		if (f) {
			f();
		}
	};
	image.crossOrigin = 'anonymous';
	image.src = path;

	return texture;
}

/**
 * Función para combertir una imagen en una cadena de texto codificada en base 64
 * 
 * @param Image:image->
 *            imagen a codificar.
 * @return String imagen codificada en base 64.
 */
function imageToBase64(image) {
	// Creamos un canvas
	var canvas = document.createElement("canvas");
	// Si la imagen es demasido grande la reducimos
	if (image.height > 256) {
		canvas.width = 256 * image.width / image.height;
		canvas.height = 256;
	} else {
		canvas.width = image.width;
		canvas.height = image.height;
	}
	// Introducimos la imagen en el canvas
	var ctx = canvas.getContext("2d");
	ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
	// Obtenemos la imagen codificada
	var dataURL = canvas.toDataURL("image/png");
	// Suministramos solo los datos, no la cabecera
	return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}

/**
 * Función para combertir una cadena de texto codificada en base 64 en una imagen
 * 
 * @param String:base64->
 *            cadena de texto a decodificar.
 * @return Image imagen codificada en base 64.
 */
function base64ToImage(base64) {
	// Creamos una imagen
	var i = document.createElement('img');
	// Indicamos los datos añadiendoles la cabecera necesaria
	i.src = "data:image/png;base64," + base64;
	return i;
}

/**
 * Función para ordenar el array suministrado de forma aleatoria.
 * 
 * @param Array:array
 *            array a ordenar de forma aleatoria.
 * @Autor: Stephane Roucheray (http://sroucheray.org/blog/2009/11/array-sort-should-not-be-used-to-shuffle-an-array/)
 */
function shuffle(array) {
	var i = array.length, j, temp;
	if (i == 0) {
		return;
	}
	while (--i) {
		j = Math.floor(Math.random() * (i + 1));
		temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
}

/**
 * Función que calcula un numéro aleatorio entre 0 y 1 ambos exclusive, sin repetir con el anterior. Se utilizará para
 * crear colores aleatorios.
 * 
 * @return Float decimal entre 0 y 1, ambos exclusive, que se utilizará para crear un color.
 */
function randomColor() {
	var rand = Math.random();
	// Comprobamos que el color no sea igual que el anterior o similar
	if (Math.abs(randomColor.r - rand) < 0.2) {
		var sum;
		if (randomColor.r > rand) {
			sum = -0.2;
		} else {
			sum = 0.2;
		}

		if ((rand + sum) >= 1 && randomColor.r < rand) {
			rand = randomColor.r = rand - 1 + sum;
		} else if ((rand + sum) <= 0 && randomColor.r > rand) {
			rand = randomColor.r = rand + 1 + sum;
		} else {
			rand = randomColor.r = rand + sum;
		}
	} else {
		randomColor.r = rand; // Guardamos el color en una variable estatica para la siguiente llamada al metodo
	}

	return rand;
}

/**
 * Función que transforma un objeto de la clase Date en una cadena con la fecha en español. Entradas:
 * 
 * @param Date:d
 *            objeto de la clase Date con los datos de la fecha que se transformará.
 * @return String cadena de caracteres con la fecha en español.
 */
function spanishDate(d) {
	var weekday = [ "Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado" ];
	var monthname = [ "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre",
			"Octubre", "Noviembre", "Diciembre" ];
	return weekday[d.getDay()] + " " + d.getDate() + " de " + monthname[d.getMonth()] + " de " + d.getFullYear()
			+ " a las " + (d.getHours() < 10 ? "0" : "") + d.getHours() + ":" + (d.getMinutes() < 10 ? "0" : "")
			+ d.getMinutes();
}

/**
 * Función para realizar una peticion GET asincrona AJAX. Se le debe proporcionar tanto la URL donde realizar la
 * peticion, como una función de rellamada con un parametro que se ejecutara cuando se reciba la respuesta
 * 
 * @param String:url
 *            URL donde realizar la peticion
 * @param Callback:callback
 *            función de rellamada que se ejecutara cuando se reciba la respuesta, recibe como un parametro el texto de
 *            la respuesta
 */
function ajaxRequest(url, callback) {
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		if (request.readyState == 4 && request.status == 200) {
			callback(request.responseText);
		}
	}
	request.open("GET", url, true);
	request.send();

}

/**
 * Función para añadir a un objeto del DOM un componente hijo de manera dinamica. Se realizara una peticion GET
 * asincrona AJAX para obtener el codigo del hijo y añadirlo en un contenedor (DIV) al elemento indicado. No se borra el
 * contenido del elemento, simplemente se añade un "div" al final.
 * 
 * @param String:url
 *            URL donde realizar la peticion
 * @param DOMobject:domElement
 *            elemento al que se le añadira el elemento
 * @param Callback:callback
 *            función de rellamada opcional que se ejecutara cuando se cargue el componente
 * 
 */
function addDynamicComponent(url, domElement, callback) {
	// Si no es un elemento DOM, salimos
	if (!domElement.appendChild) {
		return;
	}
	ajaxRequest(url, function(resp) {
		var div = document.createElement('div');
		div.innerHTML = resp;
		domElement.appendChild(div);
		if (callback) {
			callback();
		}
	});
}