/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: DataAccessObject.js
 *  Sinopsis: clase que proveerá la información consistente a sus clientes,
 *          utilizando el patrón DAO.
 *
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 13-05-2013
 *  Versión: 0.1
 *  */

/*
 *  CLASE DATAACCESSOBJECT
 *  */

DataAccessObject = function() {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	var credentials;
	try {
		credentials = require('./Credentials.js');
	} catch (e) {}
	// Cliente con el cual nos conectaremos a la base de datos
	var mongoClient = require('mongodb').MongoClient;
	// Base de datos que se utilizará con MongoDB
	var database;

	var orderModes = [ 1, 1, -1, -1, 1 ];
	var modes = [ 0, 1, 2, 3, 4 ];
	var submodes = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ];

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase DataAccessObject.
	 */

	/*******************************************************************************************************************
	 * Métodos Privados
	 ******************************************************************************************************************/

	/**
	 * Método para conectarse a la base de datos. Si ya existe una conexion, usa esta, si no la crea. Se le puede pasar
	 * una funcion de rellamada, que se ejecutara cuando se
	 * 
	 * @param Callback:callback
	 *            función de rellamada opcional que se ejecutará cuando establezca la conexion.
	 */
	function connect(callback) {
		// Si ya esta establecida la conexion, ejecutamos la accion directamente
		if (database) {
			if (callback) {
				callback();
			}
			return;
		}
		// Si no hay fichero de configuracion, lo cogemos de variables de entorno
		if(!credentials) {
			credentials = {
					DB_USER : process.env.DB_USER,
					DB_PWD : process.env.DB_PWD
			};
		}
		// URI de acceso con el formato: mongodb://[username:password@]host[:port][/[database]
		var url = 'mongodb://' + credentials.DB_USER + ':' + credentials.DB_PWD + '@ds035633.mlab.com:35633/magpcdb';
		mongoClient.connect(url, function(err, db) {
			// Si hay error los registramos y salimos
			if (err) {
				console.error(err);
				return;
			}
			console.log("Connected correctly to server");
			database = db;
			if (callback) {
				callback();
			}
		});
	}

	/**
	 * Método para obtener una colección (tabla). Para ello se conecta primero a la base de datos
	 * 
	 * @param String:name
	 *            nombre de la coleccion a buscar.
	 * @param Callback:callback
	 *            función de rellamada que se ejecutará cuando se obtenga la colección.
	 */
	function getCollection(name, callback) {
		connect(function() {
			database.collection(name, function(error, collection) {
				if (error) {
					console.log(error);
				}
				callback(collection);
			});
		});
	}

	/*******************************************************************************************************************
	 * Métodos Públicos
	 ******************************************************************************************************************/

	/**
	 * Método para obtener las puntuaciones de un determinado modo y submodo de la base de datos.
	 * 
	 * @param Integer:mode
	 *            modo del que se quieren obtener las puntuaciones.
	 * @param Integer:submode
	 *            submodo del que se quieren obtener las puntuaciones.
	 * @param Callback:callback
	 *            función de rellamada que se ejecutará cuando se consigan las puntuaciones para enviarselas al cliente.
	 */
	this.getScores = function(mo, sub, callback) {
		// Obtenemos la coleccion (tabla) de las puntuaciones
		getCollection('scores', function(collection) {
			// Buscamos las puntuaciones del modo y submodo solicitado
			collection.find({
				mode : modes[mo],
				submode : submodes[sub]
			}, {
				sort : [ [ 'score', orderModes[mo] ], [ 'date', -1 ] ]
			}).toArray(function(error, array) {
				if (error) {
					console.error('db.collection.find::error', error);
				}
				callback(array);
				console.log("Served " + array.length + " elements for mode " + mo + "  " + sub);
			});
		});
	}

	/**
	 * Método para obtener las puntuaciones de un determinado modo y submodo de la base de datos.
	 * 
	 * @param Data:data
	 *            objeto que contendrá los datos de la puntuación a guardar : nombre, puntuación, fecha, modo y submodo.
	 */
	this.saveScore = function(data) {
		// Obtenemos la coleccion (tabla) de las puntuaciones
		getCollection('scores', function(collection) {
			// Insertamos el documento (puntuacion) en la coleccion (tabla)
			collection.insertOne({
				name : data.name,
				score : data.score,
				date : data.date,
				mode : data.mode,
				submode : data.submode
			}, function(error, result) {
				if (error) {
					console.error("cant save score", error);
				} else {
					console.log("score saved by " + data.name + " with " + data.score + "    ");
				}
				console.log(data);
			});
		});
	}
}

// Exportamos la clase DAO para que pueda ser usada exteriormente en
// el lado del servidor
module.exports = new DataAccessObject();
