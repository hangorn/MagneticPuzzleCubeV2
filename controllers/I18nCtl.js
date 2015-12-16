/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: JsonCtl.js
 *  Sinopsis: clase que iniciara la internacionalizacion de la aplicacion
 *
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 16-12-2015
 *  Versión: 0.1
 *  */

var i18n = require('i18n');

i18n.configure({
	// fijamos los idiomas admitidos, ingles por defecto
	locales : [ 'en', 'es' ],
	defaultLocale : 'en',

	// no permitimos que se actualice solo con los valores de las claves
	updateFiles : false,

	// cookie en la que se guardara el idioma actual
	cookie : 'locale',

	// directorio donde se almacenaran los ficheros de idioma
	directory : __dirname + '/../locales'
});

module.exports = function(req, res, next) {
	i18n.init(req, res);
	return next();
};