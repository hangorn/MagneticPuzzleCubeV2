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

/***********************************************************************************************************************
 * Funciones Varias
 **********************************************************************************************************************/

var Utils = {};

/**
 * Función que compara vectores de tres componenetes X, Y, Z. Primero compara X, si son iguales compara Y, y si también
 * son iguales compara Z.
 * 
 * @param Vector3:a
 *            primer vector de tres elementos a comparar.
 * @param Vector3:b
 *            segundo vector de tres elementos a comparar.
 * @returns Integer -1=menor que, 1=mayor que, 0=igual.
 */
Utils.compareVector3 = function(a, b) {
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
 * @returns Integer entero aproximado a la potencia de dos mas cercana.
 */
Utils.round2Power = function(number) {
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
 * @returns Float ángulo aproximado al multiplo de 90 grados / Pi/2 radianes mas cercano.
 */
Utils.roundAngle = function(angle) {
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
 * @returns Float ángulo pasado a radianes.
 */
Utils.deg2Rad = function(degrees) {
	return degrees * Math.PI / 180;
}
/**
 * Función que convierte radianes en grados
 * 
 * @param Float:rad
 *            ángulo que se convertirá en grados.
 * @returns Float ángulo pasado a grados.
 */
Utils.rad2Deg = function(rad) {
	return rad / Math.PI * 180;
}

/**
 * Función para cargar texturas. Basada en la función THREE.ImageUtils.loadTexture
 * 
 * @param String:path
 *            ruta en la que se encuentra la imagen a cargar en la textura.
 * @param Callback:f
 *            funcion que se lanzará cuando se cargue la imagen
 * @returns Texture textura de la imagen suministrada.
 */
Utils.loadTexture = function(path, f) {
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
 * @param Image:image
 *            imagen a codificar.
 * @returns String imagen codificada en base 64.
 */
Utils.imageToBase64 = function(image) {
	// Creamos un canvas
	var canvas = document.createElement('canvas');
	// Si la imagen es demasido grande la reducimos
	if (image.height > 256) {
		canvas.width = 256 * image.width / image.height;
		canvas.height = 256;
	} else {
		canvas.width = image.width;
		canvas.height = image.height;
	}
	// Introducimos la imagen en el canvas
	var ctx = canvas.getContext('2d');
	ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
	// Obtenemos la imagen codificada
	var dataURL = canvas.toDataURL('image/png');
	// Suministramos solo los datos, no la cabecera
	return dataURL.replace(/^data:image\/(png|jpg);base64,/, '');
}

/**
 * Función para combertir una cadena de texto codificada en base 64 en una imagen
 * 
 * @param String:base64
 *            cadena de texto a decodificar.
 * @param Callback:onloadCallback
 *            si se recibe esta funcion de rellamada opcional, se fijara como manejador del evento onload
 * @returns Image imagen codificada en base 64.
 */
Utils.base64ToImage = function(base64, onloadCallback) {
	// Creamos una imagen
	var i = new Image();
	i.crossOrigin = 'anonymous';
	if (onloadCallback) {
		i.onload = onloadCallback;
	}
	// Indicamos los datos añadiendoles la cabecera necesaria
	i.src = 'data:image/png;base64,' + base64;
	return i;
}

/**
 * Metodo para cargar en memoria todas las imagenes que se le pasen codificadas en base 64. Cuando acaba la carga de
 * todas las imagenes ejecutar la funcion de rellamada que se le indique, pasandole a esta funcion como unico parametro
 * un array con una textura por cada imagen cargada.
 * 
 * @param String[]:base64Imgs
 *            array de imagenes codificadas en base 64
 * @param Callback:callback
 *            funcion de rellamada que se ejecutara cuando todas las imagenes se hayan cargado. Esta funcion recibira
 *            como unico parametro una array de texturas, una por cada imagen cargada: THREE.Texture
 */
Utils.loadAllBase64Imgs = function(base64Imgs, callback) {
	var count = base64Imgs.length;
	var loaded = 0;
	var imgs = [];
	var onload = function() {
		loaded++;
		if (loaded == count) {
			callback(imgs);
		}
	}
	for (var i = 0; i < count; i++) {
		var img = Utils.base64ToImage(base64Imgs[i], onload);
		imgs.push(new THREE.Texture(img));
	}
}

/**
 * Función para ordenar el array suministrado de forma aleatoria.
 * 
 * @param Array:array
 *            array a ordenar de forma aleatoria.
 * @Autor: Stephane Roucheray (http://sroucheray.org/blog/2009/11/array-sort-should-not-be-used-to-shuffle-an-array/)
 */
Utils.shuffle = function(array) {
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
 * @returns Float decimal entre 0 y 1, ambos exclusive, que se utilizará para crear un color.
 */
Utils.randomColor = function() {
	var rand = Math.random();
	// Comprobamos que el color no sea igual que el anterior o similar
	if (Math.abs(Utils.randomColor.r - rand) < 0.2) {
		var sum;
		if (Utils.randomColor.r > rand) {
			sum = -0.2;
		} else {
			sum = 0.2;
		}

		if ((rand + sum) >= 1 && Utils.randomColor.r < rand) {
			rand = Utils.randomColor.r = rand - 1 + sum;
		} else if ((rand + sum) <= 0 && Utils.randomColor.r > rand) {
			rand = Utils.randomColor.r = rand + 1 + sum;
		} else {
			rand = Utils.randomColor.r = rand + sum;
		}
	} else {
		Utils.randomColor.r = rand; // Guardamos el color en una variable estatica para la siguiente llamada al metodo
	}

	return rand;
}

/**
 * Función que transforma un objeto de la clase Date en una cadena con la fecha en español. Entradas:
 * 
 * @param Date:d
 *            objeto de la clase Date con los datos de la fecha que se transformará.
 * @returns String cadena de caracteres con la fecha en español.
 */
Utils.spanishDate = function(d) {
	var weekday = [ __["words.sunday"], __["words.monday"], __["words.tuesday"], __["words.wednesday"],
			__["words.thursday"], __["words.friday"], __["words.saturday"] ];
	var monthname = [ __["words.january"], __["words.february"], __["words.march"], __["words.april"], __["words.may"],
			__["words.june"], __["words.july"], __["words.august"], __["words.september"], __["words.october"],
			__["words.november"], __["words.december"] ];
	return weekday[d.getDay()] + " " + d.getDate() + __["words.dateConnective"] + monthname[d.getMonth()]
			+ __["words.dateConnective"] + d.getFullYear() + __["words.timeConnective"]
			+ (d.getHours() < 10 ? "0" : "") + d.getHours() + ":" + (d.getMinutes() < 10 ? "0" : "") + d.getMinutes();
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
Utils.ajaxRequest = function(url, callback) {
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		if (request.readyState == 4 && request.status == 200) {
			callback(request.responseText);
		}
	}
	request.open('GET', url, true);
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
Utils.addDynamicComponent = function(url, domElement, callback) {
	// Si no es un elemento DOM, salimos
	if (!domElement.appendChild) {
		return;
	}
	Utils.ajaxRequest(url, function(resp) {
		var div = document.createElement('div');
		div.innerHTML = resp;
		domElement.appendChild(div);
		if (callback) {
			callback();
		}
	});
}