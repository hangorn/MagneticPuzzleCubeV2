/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: index.js
 *  Sinopsis: archivo que se ejecutará en el servidor utilizando node.js, y con su framework Express.
 *  Se encarga de poner a punto el servidor y activar los sockets.
 *
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 28-04-2013
 *  Versión: 0.1
 *  */

/***********************************************************************************************************************
 * Creamos tanto el servidor como los sockets
 **********************************************************************************************************************/

var gameport;

var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var path = require('path');

var socketCtl = require('./controllers/SocketCtl');

/***********************************************************************************************************************
 * Ponemos en marcha el servidor
 **********************************************************************************************************************/

// Comprobamos si estamos utilizando nodejitsu
if (process.env.SUBDOMAIN == 'magneticube') {
	gameport = 80;
} else {
	gameport = 8080;
}

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Para el resto de peticiones delegamos en el enrutador
app.use('/', require('./Router'));
// La mayoria de los recursos se obtendran estaticamente del directorio publico
app.use(express.static(path.join(__dirname, 'public')));

//Hacemos que el servidor escuche en el puerto indicado
server.listen(gameport);
console.log('\t :: Express :: Listening on port ' + gameport);

/***********************************************************************************************************************
 * Ponemos en marcha los sockets
 **********************************************************************************************************************/

// Creamos una instancia de socket.io usando el servidor
var io = require('socket.io')(server);

// Creamos el manejador del evento de conexion, es decir cuando se conecta un
// cliente
io.on('connection', socketCtl.onConnect);