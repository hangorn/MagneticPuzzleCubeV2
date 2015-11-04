/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: HelpController.js
 *  Sinopsis: Clase controlador que se encargará de manejar lo eventos en menu de ayuda.
 *  
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 03-09-2015
 *  */

/*
 *  CLASE HELPCONTROLLER
 *  */
function HelpController(backAction) {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	// Contenedor HTML con la vista
	var view;
	// Datos de de los botones, para poder intercambiarlos
	var buttonsData = [];

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase HelpController. Cuando este cargado mostrara la vista de la ayuda
	 * 
	 * @param Callback:backAction
	 *            accion que se ejecutara al pulsar el boton de atras
	 */

	// Creamos un contenedor
	view = document.createElement('div');
	// Cargamos la vista en el contenedor y cuando se cargue la mostramos
	addDynamicComponent("menu/helpForm.html", view, function() {
		show();
	});

	/*******************************************************************************************************************
	 * Métodos Privados
	 ******************************************************************************************************************/

	/**
	 * Metodo que se ejecutara cuando se haga click en un boton del menu de ayuda
	 * 
	 * @param EventObject:event
	 *            caracteristicas del evento lanzado.
	 */
	function onMenuClick(event) {
		var sections = view.getElementsByClassName("menuContainer")[0].children;
		// Ocultamos todas las secciones
		for (var i = 0; i < sections.length; i++) {
			sections[i].classList.add("hide");
		}
		// Mostramos la seccion correspondiente al boton
		sections[event.target.index].classList.remove("hide");
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
	 * Metodo que en funcion de las opciones mostrara unos controles u otros.
	 */
	function checkOptions() {
		var movButton = view.getElementsByClassName("movButton");
		var rotButton = view.getElementsByClassName("rotButton");

		// Guardamos en un objeto temporal los datos de ambos botones, en la primera posicion los datos del boton de
		// mover, y en la segunda del de rotar
		if (buttonsData.length == 0) {
			buttonsData[0] = {
				src : movButton[0].src,
				alt : movButton[0].alt
			};
			buttonsData[1] = {
				src : rotButton[0].src,
				alt : rotButton[0].alt
			};
		}
		// Transformamos la opciones de movimiento en 1 o 0, ya que el boton derecho toma el valor 2
		var option = ov.getOptions().getMovOpt() ? 1 : 0;
		// Recorremos los botones, y en funcion de las opciones habra que cambiarlos:
		// El boton de mover sera acorde al valor de la opcion (opcion 0 => dato en 0, opcion 2 => dato en 1), pero el
		// boton de rotar sera el opuesto (opcion 0 => dato en 1, opcion 2 => dato en 0)
		for (var i = 0; i < movButton.length; i++) {
			movButton[i].alt = buttonsData[option].alt;
			movButton[i].src = buttonsData[option].src;
		}
		for (var i = 0; i < rotButton.length; i++) {
			rotButton[i].alt = buttonsData[(option + 1) % 2].alt;
			rotButton[i].src = buttonsData[(option + 1) % 2].src;
		}
	}

	/**
	 * Método que elimina el controlador. Lo único que hace es eliminar los manejadores de eventos que tiene registrados
	 */
	function remove() {
		// Dejamos de escuchar eventos de los botones
		var buttons = view.getElementsByClassName("rightContainer")[0].children;
		for (var i = 0; i < buttons.length; i++) {
			buttons[i].removeEventListener('click', onMenuClick, false);
		}
		// Desactivamos el evento del boton de atras
		view.getElementsByTagName('form')[0].back.removeEventListener('click', onMenuBack, false);
	}

	/**
	 * Método que habilita el controlador. Registra los eventos necesarios
	 */
	function enable() {
		// Activamos los eventos de los botones
		var buttons = view.getElementsByClassName("rightContainer")[0].children;
		for (var i = 0; i < buttons.length; i++) {
			buttons[i].index = i;
			buttons[i].addEventListener('click', onMenuClick, false);
		}
		// Activamos el evento del boton de atras
		view.getElementsByTagName('form')[0].back.addEventListener('click', onMenuBack, false);
	}

	function show() {
		// Mostramos la vista
		document.body.appendChild(view);

		checkOptions();

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
