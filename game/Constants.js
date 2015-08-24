/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: Constantes.js
 *  Sinopsis: clase que mantiene una serie de valores constantes
 *
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 15-08-2015
 *  Versión: 0.1
 *  */

/***********************************************************************************************************************
 * Tipos de partidas
 **********************************************************************************************************************/
// Modos de juego
exports.MODO_CLASICO = 0;
exports.MODO_NIVELES = 1;
exports.MODO_CONTRARELOJ = 2;
exports.MODO_SUPERVIVENCIA = 3;
exports.MODO_MULTIJUGADOR = 4;
// Submodos multijugador
exports.SUBMODO_COOPERATIVO_8 = 0;
exports.SUBMODO_COOPERATIVO_27 = 1;
exports.SUBMODO_CONTRARELOJ_8 = 2;
exports.SUBMODO_CONTRARELOJ_27 = 3;

exports.isCooperativo = function(mode) {
	if (mode == SUBMODO_COOPERATIVO_8 || mode == SUBMODO_COOPERATIVO_27) {
		return true;
	}
	return false;
}
