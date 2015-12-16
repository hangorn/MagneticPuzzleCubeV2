/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: Router.js
 *  Sinopsis: clase que se encargara de distribuir y delegar todas las peticiones que se reciban por HTTP
 *
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 23-08-2015
 *  Versión: 0.1
 *  */

var router = require('express').Router();

var jsonCtl = require('./controllers/JsonCtl');
var menuCtl = require('./controllers/MenuCtl');
var compCtl = require('./controllers/ComponentsCtl');

/***********************************************************************************************************************
 * Peticiones de datos JSON
 **********************************************************************************************************************/

// JSON con los datos de los niveles
router.get('/data/Menu.json', jsonCtl.getJson);
router.get('/data/Scores.json', jsonCtl.getScores);
router.get('/menu/*.html', menuCtl.getMenu);
router.get('/html/*.html', compCtl);
router.get('/lang/:locale', function(req, res) {
	res.cookie('locale', req.params.locale);
	res.redirect('back');
});

module.exports = router;