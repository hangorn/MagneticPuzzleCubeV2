/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: ScoresController.js
 *  Sinopsis: Clase controlador que se encargará de manejar lo eventos de las puntuaciones.
 *  
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 12-05-2013
 *  Versión: 0.1
 *  */

/*
 *  CLASE SCORESCONTROLLER
 *  */
function ScoresController(backAction) {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	// Contenedor HTML con la vista
	var view;

	// Arrays con los componentes DOM (divs) de las pestañas de modos y submodos
	var modesContainer;
	var submodesContainer;

	// Ultima pestaña seleccionada de los modos
	var lastModeSelected;
	// Ultima pestaña seleccionada de los submodos
	var lastSubmodeSelected;

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase ScoresController
	 * 
	 * @param Callback:backAction
	 *            accion que se ejecutara al pulsar el boton de atras
	 */

	// Creamos un contenedor
	view = document.createElement('div');
	// Cargamos la vista en el contenedor y cuando se cargue la mostramos
	addDynamicComponent("menu/scoresForm.html", view, function() {
		init();
		show();
		showMode(0);
	});

	/*******************************************************************************************************************
	 * Métodos Privados
	 ******************************************************************************************************************/

	/**
	 * Realiza las operaciones necesarias para arrancar la vista. Genera indentificadores para cada pestaña de modo y
	 * submodo
	 */
	function init() {
		// Obtenemos los componentes de las pestañas de modos y submodos
		modesContainer = view.getElementsByClassName('modesContainer')[0].children;
		submodesContainer = view.getElementsByClassName('submodesContainer')[0].children;
		// Guardamos los ids de los modos
		for (var i = 0; i < modesContainer.length; i++) {
			modesContainer[i].id = i;
		}
		// Guardamos los ids de los submodos
		for (var i = 0; i < submodesContainer.length; i++) {
			for (var j = 0; j < submodesContainer[i].children.length; j++) {
				submodesContainer[i].children[j].id = j;
			}
		}
	}

	/**
	 * Método para mostrar los submodos del modo indicado, tambien se mostraran las puntuaciones del primer submodo.
	 * 
	 * @param Integer:mode
	 *            indice con el modo a mostrar.
	 */
	function showMode(mode) {
		// Comprobamos que sea un modo correcto o que no este ya seleccionado
		if (mode < 0 || mode >= modesContainer.length || (lastModeSelected != undefined && mode == lastModeSelected)) {
			return;
		}

		// Cambiamos el estilo de la pestaña seleccionada
		modesContainer[mode].classList.add("selectedTab");

		// Si habia otro seleccionado lo deseleccionamos y ocultamos sus submodos
		if (lastModeSelected != undefined) {
			modesContainer[lastModeSelected].classList.remove("selectedTab");
			submodesContainer[lastModeSelected].children[lastSubmodeSelected].classList.remove("selectedTab");
			submodesContainer[lastModeSelected].classList.add("hide");
		}
		// Mostramos los submodos del seleccionado
		submodesContainer[mode].classList.remove("hide");
		// Guardamos el nuevo modo
		lastModeSelected = mode;
		// Mostramos el primer submodo
		showSubmode(0);
	}

	/**
	 * Método para seleccionar el submodo indicado y sus puntuaciones
	 * 
	 * @param Integer:submode
	 *            indice con el submodo a mostrar.
	 */
	function showSubmode(submode) {
		// Comprobamos que sea un submodo correcto o que no este ya seleccionado
		if (submode < 0 || submode >= submodesContainer[lastModeSelected].children.length) {
			return;
		}
		// Marcamos el modo seleccionado
		submodesContainer[lastModeSelected].children[submode].classList.add("selectedTab");
		// Si habia otro seleccionado lo deseleccionamos y si no es el mismo y si existe
		if (lastSubmodeSelected != undefined && lastSubmodeSelected != submode
				&& lastSubmodeSelected < submodesContainer[lastModeSelected].children.length) {
			submodesContainer[lastModeSelected].children[lastSubmodeSelected].classList.remove("selectedTab");
		}
		// Guardamos el nuevo submodo
		lastSubmodeSelected = submode;

		// Si no tenemos conexion con el servidor la creamos
		if (socket == undefined) {
			socket = new Socket();
		}
		// Le decimos al servidor que nos proporcione las puntuaciones cuando se consigan se mostraran
		ajaxRequest("data/Scores.json?mode=" + lastModeSelected + "&submode=" + lastSubmodeSelected, function(scores) {
			showScores(JSON.parse(scores));
		});

		// Y mostramos una imagen de cargando
		showLoadingImg(true);
	}

	/**
	 * Método para mostrar las puntuaciones suministradas
	 * 
	 * @param Score[]:scores
	 *            array con objetos que contienen la información de las puntuaciones.
	 */
	function showScores(scores) {
		var table = view.getElementsByClassName("menuContainer")[0].getElementsByTagName("tbody")[0];
		// Borramos todo lo que tubiera la tabla
		while (table.firstChild) {
			table.removeChild(table.firstChild);
		}
		for (var i = 0; i < scores.length; i++) {
			table.appendChild(buildScore(scores[i]));
		}
		// Mostramos la tabla y ocultamos la imagen de cargando
		showLoadingImg(false);
	}

	/**
	 * Método para crear una entrada de una puntuacion
	 * 
	 * @param Score:score
	 *            objeto que contiene la información de la puntuación.
	 */
	function buildScore(score) {
		// Creamos una fila para la puntuacion
		var row = document.createElement('tr');

		// Creamos una funcion para crear un dato de la puntuacion
		var makeData = function(data) {
			var cell = document.createElement('td');
			cell.innerHTML = data;
			return cell;
		}
		// Si no es un modo multijugador
		if (score.mode != 4) {
			// Añadimos el nombre
			row.appendChild(makeData(score.name));
		} else {
			var n;
			var names = score.name.split("#");
			// Si es el modo cooperativo
			if (score.submode == 0 || score.submode == 1) {
				n = names[0] + ' & ' + names[1];
			}
			// Si es el modo multijugador cooperativo
			else if (score.submode == 2 || score.submode == 3) {
				n = '<span style="color:#00aa00">' + names[0] + '</span> vs <span style="color:#ff0000">' + names[1]
						+ '</span>';
			}
			// Añadimos el nombre
			row.appendChild(makeData(n));
		}
		// Si es el modo supervivencia
		if (score.mode == 3) {
			// Mostramos los puzzles solucionados
			row.appendChild(makeData("" + score.score + (score.score == 1 ? " puzzle" : " puzzles")));
		} else {
			// Calculamos la puntuacion
			var sc = "";
			var sec = score.score % 60;
			if (sec < 10) {
				sec = '0' + sec;
			}
			var min = Math.floor(score.score / 60) % 60;
			if (min < 10) {
				min = '0' + min;
			}
			var hour = Math.floor(score.score / 3600);
			if (hour != 0) {
				sc += hour + ":";
			}
			sc += min + ":" + sec;
			// Añadimos la puntuacion
			row.appendChild(makeData(sc));
		}
		// Añadimos la fecha
		row.appendChild(makeData(spanishDate(new Date(Date.parse(score.date)))));

		return row;
	}

	/**
	 * Metodo para mostrar u ocultar la imagen de cargando o la tabla.
	 * 
	 * @param Boolean:show
	 *            flag para mostrar la imagen o la tabla. true->imagen, false->tabla
	 */
	function showLoadingImg(show) {
		var container = view.getElementsByClassName("menuContainer")[0];
		if (show) {
			// Mostramos imagen y ocultamos tabla
			container.getElementsByTagName("img")[0].classList.remove("hide");
			container.getElementsByTagName("table")[0].classList.add("hide");
		} else {
			// Mostramos tabla y ocultamos imagen
			container.getElementsByTagName("img")[0].classList.add("hide");
			container.getElementsByTagName("table")[0].classList.remove("hide");
		}
	}

	/**
	 * Metodo que se ejecutara cuando se haga click en le boton de atras
	 */
	function onMenuBack() {
		// Ocultamos la vista y ejecutamos la accion de atras que nos hayan indicado
		hide();
		backAction();
	}

	/**
	 * Manejador del evento de pulsación en un modo
	 * 
	 * @param EventObject:event
	 *            caracteristicas del evento lanzado.
	 */
	function onModeClick(event) {
		// Mostramos el modo seleccionado
		showMode(event.currentTarget.id);
	}

	/**
	 * Manejador del evento de pulsación en un submodo
	 * 
	 * @param EventObject:event
	 *            caracteristicas del evento lanzado.
	 */
	function onSubmodeClick(event) {
		// Mostramos el modo seleccionado
		showSubmode(event.currentTarget.id);
	}

	/**
	 * Método que elimina el controlador. Lo único que hace es eliminar los manejadores de eventos que tiene registrados
	 */
	function remove() {
		// Registramos los eventos de seleccion de los modos
		for (var i = 0; i < modesContainer.length; i++) {
			modesContainer[i].removeEventListener('click', onModeClick, false);

		}

		// Registramos los eventos de seleccion de los submodos
		for (var i = 0; i < submodesContainer.length; i++) {
			for (var j = 0; j < submodesContainer[i].children.length; j++) {
				submodesContainer[i].children[j].removeEventListener('click', onSubmodeClick, false);
			}
		}
		// Desactivamos el evento del boton de atras
		view.getElementsByTagName('form')[0].back.removeEventListener('click', onMenuBack, false);
	}

	/**
	 * Método que habilita el controlador. Registra los eventos necesarios
	 */
	function enable() {
		// Registramos los eventos de seleccion de los modos
		for (var i = 0; i < modesContainer.length; i++) {
			modesContainer[i].addEventListener('click', onModeClick, false);
		}

		// Registramos los eventos de seleccion de los submodos
		for (var i = 0; i < submodesContainer.length; i++) {
			for (var j = 0; j < submodesContainer[i].children.length; j++) {
				submodesContainer[i].children[j].addEventListener('click', onSubmodeClick, false);
			}
		}
		// Activamos el evento del boton de atras
		view.getElementsByTagName('form')[0].back.addEventListener('click', onMenuBack, false);
	}

	function show() {
		// Mostramos la vista
		document.body.appendChild(view);
		// Activamos el controlador
		enable();
	}

	function hide() {
		// Desactivamos el controlador
		remove();
		// Ocultamos la vista
		document.body.removeChild(view);
	}

	/*******************************************************************************************************************
	 * Métodos Públicos
	 ******************************************************************************************************************/

	this.show = show;
}

/***********************************************************************************************************************
 * Métodos estáticos
 **********************************************************************************************************************/

/**
 * Método para mostrar el diálogo para guardar una puntuación
 * 
 * @param String:text->
 *            texto que se mostrará en el diálogo.
 * @param Integer:score
 *            puntuación obtenida.
 * @param Integer:mode
 *            modo en el que se ha conseguido la puntuación.
 * @param Integer:submode
 *            submodo en el que se ha conseguido la puntuación.
 */
var saveScoreCont;
ScoresController.saveScoreDialog = function(text, score, mode, submode) {
	// Si el cuadro de dialogo no esta creado lo creamos
	if (!saveScoreCont) {
		// Creamos un contenedor para todos los elementos del dialogo
		saveScoreCont = document.createElement('div');
		addDynamicComponent("html/saveScoreForm.html", saveScoreCont, function() {
			// Definimos la funcion para cuando se pulse el boton
			saveScoreCont.getElementsByClassName("saveDialogCancel")[0].onclick = function() {
				// Ocultamos el dialogo
				document.body.removeChild(saveScoreCont);
			}
			ScoresController.saveScoreDialog(text, score, mode, submode);
		});
	} else {
		// Mostramos el dialogo
		document.body.appendChild(saveScoreCont);
		// Mostramos el mensaje saveDialogText
		saveScoreCont.getElementsByClassName("saveDialogText")[0].innerHTML = text;
		// Redefinimos la funcion para cuando se pulse el boton de guarda puntuacion
		// para que lo haga con los nuevos datos y no con los antiguos
		saveScoreCont.getElementsByClassName("saveDialogOK")[0].onclick = function() {
			// Obtenemos el nombre
			var name = saveScoreCont.getElementsByClassName("saveDialogInput")[0].value || "Anonimo";
			// Si no tenemos conexion con el servidor la creamos
			if (socket == undefined) {
				socket = new Socket();
			}
			// Le decimos al servidor que guarde la puntuacion
			socket.saveScore(name, score, mode, submode);

			// Ocultamos el dialogo
			document.body.removeChild(saveScoreCont);
		}
	}
}