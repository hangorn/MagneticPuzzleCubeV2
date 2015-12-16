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
var I18N = 'i18n';

/**
 * Traduce un JSOn: todos los valores cuya clave empiece por 'i18n' se sustituyen mediante el modulo de
 * intenacionalizacion (i18n) por su valor asociado en los ficheros de idioma
 * 
 * @param res
 *            respuesta de node.js de donde se sacara el idioma
 * @param json
 *            objeto json ya parseado, en realidad es un objeto normal
 * @return json traducido
 */
var translateJson = function(res, json) {
	// Creamos una funcion para recorrer todos los atributos del objeto JSON y poder transformarlos
	var iterate = function(obj, newObj) {
		for ( var property in obj) {
			if (obj.hasOwnProperty(property)) {
				// Si es un objeto seguimos iterando sobre el
				if (typeof obj[property] == 'object') {
					// Si en el nuevo objeto todavia no se ha creado el contenido de la propiedad, la creamos,
					// comprobando si es un array
					newObj[property] = newObj[property]
							|| (Object.prototype.toString.call(obj[property]) === '[object Array]' ? [] : {});
					iterate(obj[property], newObj[property]);
				} else {
					if (property.indexOf(I18N) == 0) {
						var newProperty = property.slice(I18N.length, property.length);
						newObj[newProperty] = res.__(obj[property]);
					} else {
						newObj[property] = obj[property];
					}
				}
			}
		}
	}
	var translatedJSON = {};
	iterate(json, translatedJSON);
	return translatedJSON;
}
// Exportamos la funcion de traduccion para que pueda ser usada en otros modulos
exports.translateJson = translateJson;

/**
 * Metodo para gestionar una peticion de un JSON, que se traducira previamente antes de generar la respuesta
 * 
 * @param req
 *            peticion de node.js
 * @param res
 *            respuesta de node.js
 */
exports.getJson = function(req, res) {
	// Primero obtenemos el fichero JSON
	var json = require('../public' + req.url);
	var translatedJSON = translateJson(res, json);
	res.json(translatedJSON);
}

/**
 * Método para enviar al cliente la información de las puntuaciones del modo solicitado. Se han de recibir dos
 * parametros indicando el modo y el submodo.
 * 
 * @param req
 *            peticion de node.js
 * @param res
 *            respuesta de node.js
 */
exports.getScores = function(req, res) {
	// Obtenemos los parametros de la consulta
	var mode = req.query.mode;
	var submode = req.query.submode;
	// Si no se reciben los parametros, no devolvemos puntuaciones
	if (!mode || !submode) {
		res.json({});
	}
	// inicamos el DAO
	var dao = require('../dal/DataAccessObject.js');
	// Obtenemos las puntuaciones solicitadas
	dao.getScores(mode, submode, function(scores) {
		// Enviamos la respuesta con los datos al cliente
		res.json(scores);
	});
}