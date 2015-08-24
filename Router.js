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

/***********************************************************************************************************************
 * Peticiones de datos JSON
 **********************************************************************************************************************/

// JSON con los datos de los niveles
router.get('/data/Levels.json', jsonCtl.getJson);

module.exports = router;