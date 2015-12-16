/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: ComponentsCtl.js
 *  Sinopsis: clase que gestionara las peticiones de componentes HTML
 *
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 16-12-2015
 *  Versión: 0.1
 *  */

module.exports = function(req, res, next) {
	var template = req.url.replace('.html', '.ejs').replace('/html/', 'components/');
	res.render(template);
	next();
}