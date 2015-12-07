/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: MenuCtl.js
 *  Sinopsis: clase que gestionara los menus, principalmente de renderizar los componentes HTML
 *
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 26-08-2015
 *  Versión: 0.1
 *  */

exports.getMenu = function(req, res) {
	var template = "menu/commonsLayout.ejs";
	var data = {
		menu : req.url.replace(".html", ".ejs").replace("/menu/", "")
	};
	// Si es la vista de los niveles necesitamos los datos de los niveles
	if (req.url.indexOf("levelsModeForm") != -1) {
		data.levelsData = require("../public/data/Levels.json").data;
	} else if (req.url.indexOf("createServerModeForm") != -1) {
		data.levelsData = require("../public/data/MultiplayerLevels.json").data;
	}
	// Si es la vista de buscar partidas multijugador, ayuda, puntuaciones, opciones, no podemos usar la plantilla comun
	if (req.url.indexOf("Mode") == -1) {
		template = req.url.replace(".html", ".ejs").replace("/menu", "menu");
	}
	res.render(template, data);
}