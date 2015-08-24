/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: JsonCtl.js
 *  Sinopsis: clase que gestionara las peticiones de ficheros JSON, principalente se encarga de la traduccion
 *
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 23-08-2015
 *  Versión: 0.1
 *  */
var I18N = "i18n";

exports.getJson = function(req, res) {
	// Primero obtenemos el fichero JSON
	var json = require("../public" + req.url);
	// Creamos una funcion para recorrer todos los atributos del objeto JSON y poder transformarlos
	var iterate = function(obj, newObj) {
		for ( var property in obj) {
			if (obj.hasOwnProperty(property)) {
				// Si es un objeto seguimos iterando sobre el
				if (typeof obj[property] == "object") {
					// Si en el nuevo objeto todavia no se ha creado el contenido de la propiedad, la creamos
					newObj[property] = newObj[property] || {};
					iterate(obj[property], newObj[property]);
				} else {
					if (property.indexOf(I18N) == 0 && property.lastIndexOf(I18N)) {
						var newProperty = property.slice(I18N.length, property.length);
						newObj[newProperty] = __(obj[property]);
					} else {
						newObj[property] = obj[property];
					}
				}
			}
		}
	}
	var translatedJSON = {};
	iterate(json, translatedJSON);
	res.json(translatedJSON);
}

// TODO borrar este metodo cuando se soperte i18n
function __(str) {
	return str.toUpperCase(str);
}