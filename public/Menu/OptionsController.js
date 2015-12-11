/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: OptionsController.js
 *  Sinopsis: Clase controlador que se encargará de manejar lo eventos de las opciones.
 *  
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 03-03-2013
 *  Versión: 0.1
 *  */

/*
 *  CLASE OPTIONSCONTROLLER
 *  */
function OptionsController(endAct, opts) {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	// Contenedor HTML con la vista
	var view;
	// Formulario con todos los cotroles
	var form;

	// Accción que se ejecutará al finalizar la selección de opciones, tanto
	// con cancelar como con aceptar
	var endAction;
	// Datos con las opciones seleccionadas
	var options;

	// Valor de la sensibilidad antes de cambiarla para corregir valores incorrectos
	var previousSensivility;

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase OptionsController
	 * 
	 * @param Callback:endAct
	 *            función de rellamada que se ejecutará al terminar con las opciones tanto aceptar como cancelar, de
	 *            esta forma se mostrará el estado anterior, sea cual sea.
	 */

	options = opts;
	// Creamos un contenedor
	view = document.createElement('div');
	// Cargamos la vista en el contenedor y cuando se cargue la mostramos
	addDynamicComponent('menu/optionsForm.html', view, function() {
		form = view.getElementsByTagName('form')[0];
		show(endAct);
	});

	/*******************************************************************************************************************
	 * Métodos Privados
	 ******************************************************************************************************************/

	/**
	 * Manejador del evento de cambio en el slide de la sensibilidad
	 * 
	 * @param EventObject:event->
	 *            caracteristicas del evento lanzado.
	 */
	function onSensitivitySlideChange(event) {
		// Actualizamos el texto y guardamos la sensibilidad
		previousSensivility = form.sensitivityText.value = event.target.value;
	}

	/**
	 * Manejador del evento de cambio en el texto de la sensibilidad
	 * 
	 * @param EventObject:event->
	 *            caracteristicas del evento lanzado.
	 */
	function onSensitivityTextChange(event) {
		// Comprobamos que el texto introducido sea un valor valido
		if (parseFloat(event.target.value) != NaN && parseFloat(event.target.value) <= form.sensitivityText.max
				&& parseFloat(event.target.value) >= form.sensitivityText.min) {
			previousSensivility = form.sensitivitySlide.value = event.target.value;
		} else {
			event.target.value = form.sensitivitySlide.value = previousSensivility;
		}
	}

	/**
	 * Manejador del evento de cambio en la seleccion del botón de giro
	 * 
	 * @param EventObject:event->
	 *            caracteristicas del evento lanzado.
	 */
	function onMovOptChange(event) {
		// Comprobamos si el elemento seleccionado es el boton izquierdo
		if (event.target == form.movOpt[0]) {
			// Seleccionamos el boton derecho para el giro
			form.rotOpt[1].checked = true;
		}
		// Si no es el izquierdo, entonces es el derecho
		else {
			// Seleccionamos el boton derecho para el giro
			form.rotOpt[0].checked = true;
		}
	}

	/**
	 * Manejador del evento de cambio en la seleccion del botón de movimiento
	 * 
	 * @param EventObject:event->
	 *            caracteristicas del evento lanzado.
	 */
	function onRotOptChange(event) {
		// Comprobamos si el elemento seleccionado es el boton izquierdo
		if (event.target == form.rotOpt[0]) {
			// Seleccionamos el boton derecho para el giro
			form.movOpt[1].checked = true;
		}
		// Si no es el izquierdo, entonces es el derecho
		else {
			// Seleccionamos el boton derecho para el giro
			form.movOpt[0].checked = true;
		}
	}

	/**
	 * Manejador del evento de pulsación del botón de cancelar
	 * 
	 * @param EventObject:event->
	 *            caracteristicas del evento lanzado.
	 */
	function onCancelClick(event) {
		// Ocultamos la vista
		hide();
		// Ejecutamos la acción suministrada
		endAction();
	}

	/**
	 * Manejador del evento de pulsación del botón de aceptar
	 * 
	 * @param EventObject:event->
	 *            caracteristicas del evento lanzado.
	 */
	function onAcceptClick(event) {
		// Ocultamos la vista
		hide();
		// Guardamos las opciones
		saveOptions();
		// Ejecutamos la acción suministrada
		endAction();
	}

	/**
	 * Método para guardar las opciones en el objeto Options
	 * 
	 * @param EventObject:event->
	 *            caracteristicas del evento lanzado.
	 */
	function saveOptions() {
		// Guardamos la sensibilidad
		options.sensitivity = form.sensitivitySlide.value;
		// Guardamos si estará activada la ayudo con sonidos
		options.audioHelp = form.audioHelpCheck.checked;
		// Guardamos las opciones de los botones del raton
		// Si esta seleccionado el boton izquierdo como control de movimiento, y por tanto
		// el boton derecho como control de giro
		if (form.movOpt[0].checked) {
			// Guardamos el boton de movimiento
			options.movButton = 0;
			// Guardamos el boton de giro
			options.rotButton = 2;
		} else {
			// Guardamos el boton de movimiento
			options.movButton = 2;
			// Guardamos el boton de giro
			options.rotButton = 0;
		}
		localStorage.magPuzCubOptions = JSON.stringify(options);
	}

	/**
	 * Método que habilita el controlador. Registra los eventos necesarios
	 * 
	 * @param Callback:endAct
	 *            función de rellamada que se ejecutará al terminar con las opciones tanto aceptar como cancelar, de
	 *            esta forma se mostrará el estado anterior, sea cual sea.
	 */
	function enable(endAct) {
		// Guardamos la accion que se ejecutará al finalizar
		endAction = endAct;

		// Registramos el evento de modificacion del slide de la sensibilidad
		form.sensitivitySlide.addEventListener('change', onSensitivitySlideChange, false);
		// Registramos el evento de modificacion del texto de la sensibilidad
		form.sensitivityText.addEventListener('change', onSensitivityTextChange, false);
		// Registramos el evento de modificacion de la seleccion del boton de movimiento
		form.movOpt[0].addEventListener('change', onMovOptChange, false);
		form.movOpt[1].addEventListener('change', onMovOptChange, false);
		// Registramos el evento de modificacion de la seleccion del boton de movimiento
		form.rotOpt[0].addEventListener('change', onRotOptChange, false);
		form.rotOpt[1].addEventListener('change', onRotOptChange, false);
		// Registramos el evento de la pulsación del boton de cancelar
		form.cancel.addEventListener('click', onCancelClick, false);
		// Registramos el evento de la pulsación del boton de aceptar
		form.accept.addEventListener('click', onAcceptClick, false);

		// Iniciamos los elementos con los valores por defecto de las opciones
		form.sensitivitySlide.value = options.sensitivity;
		form.sensitivityText.value = options.sensitivity;
		previousSensivility = options.sensitivity;
		form.audioHelpCheck.checked = options.audioHelp;
		if (options.movButton == 0) {
			form.movOpt[0].checked = true;
		} else {
			form.movOpt[1].checked = true;
		}
		if (options.rotButton == 0) {
			form.rotOpt[0].checked = true;
		} else {
			form.rotOpt[1].checked = true;
		}
	}

	/**
	 * Método que elimina el controlador. Lo único que hace es eliminar los manejadores de eventos que tiene registrados
	 */
	function remove(endAct) {
		// Eliminamos los receptores de eventos de los botones
		form.sensitivitySlide.removeEventListener('change', onSensitivitySlideChange, false);
		form.sensitivityText.removeEventListener('change', onSensitivityTextChange, false);
		form.movOpt[0].removeEventListener('change', onMovOptChange, false);
		form.movOpt[1].removeEventListener('change', onMovOptChange, false);
		form.rotOpt[0].removeEventListener('change', onRotOptChange, false);
		form.rotOpt[1].removeEventListener('change', onRotOptChange, false);
		form.cancel.removeEventListener('click', onCancelClick, false);
		form.accept.removeEventListener('click', onAcceptClick, false);
	}

	function show(endAct) {
		// Mostramos la vista
		document.body.appendChild(view);
		// Activamos el controlador
		enable(endAct);

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
var options;
getOptions = function() {
	if(!options) {
		if(localStorage.magPuzCubOptions) {
			options = JSON.parse(localStorage.magPuzCubOptions);
		} else {
			options = new Options();
		}
	}
	return options;
}

/**
 * Muestra el dialgo de opciones, se encarga de crear el controlador si es necesario.
 * 
 * @param Callback:endAct
 *            función de rellamada que se ejecutará al terminar con las opciones tanto aceptar como cancelar, de esta
 *            forma se mostrará el estado anterior, sea cual sea.
 */
var instance;
OptionsController.show = function(endAct) {
	if (instance) {
		instance.show(endAct);
	} else {
		instance = new OptionsController(endAct, getOptions());
	}
}