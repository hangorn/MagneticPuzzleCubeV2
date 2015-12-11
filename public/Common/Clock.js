/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: Clock.js
 *  Sinopsis: Clase que realizará las operaciones necesarias de un reloj/cronometro.
 *  
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 14-01-2013
 *  Versión: 0.2
 *  Fecha: 13-01-2013
 *  Versión: 0.1
 *  */

/*
 *  CLASE CLOCK
 *  */
function Clock(iniT, cb) {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	// Elemento html que representará el reloj
	var domElement;
	var text;
	// Contador de javascript
	var timeO;
	// Función callback que se lanzará cuando se termine el tiempo en la cuenta regresiva
	var callback;

	// Momento en el que se empezo a contar
	var startTime;
	// Tiempo que se lleva contando antes de pausar el reloj (acumulado)
	var accruedTime = 0;
	// Tiempo inicial, si es un cronometro de cuenta regresiva sera positivo con el valor inicial,
	// si unicamente se cronometra el tiempo sera 0
	var initialTime;
	// Flag para saber si el reloj esta detenido/pausado
	var stopped = true;

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase Clock
	 * 
	 * @param Float:iniT
	 *            tiempo con el que se iniciará el cronometro, si el valor es mayor que cero se realizará una cuenta
	 *            regresiva desde el valor proporcionado hasta cero; si el valor es cero o menor se iniciará una cuenta
	 *            progresiva empezando en cero.
	 * @param Callback:cb
	 *            función de rellamada que se ejecutará en el caso de que sea un cronometro de cuenta regresiva al
	 *            llegar a cero.
	 */

	if (iniT > 0) {
		initialTime = iniT;
	} else {
		initialTime = 0;
	}
	callback = cb || function() {
		return;
	};

	// Creamos un contenedor para poder centrarlo
	domElement = document.createElement('div');
	domElement.className = 'clockComponentContainer';
	// Cremos el componente donde se mostrara el texto
	text = document.createElement('input');
	text.type = 'text';
	text.readOnly = 'readOnly';
	text.value = getHours(initialTime) + " : " + getMinutes(initialTime) + " : " + getSeconds(initialTime);
	text.className = 'clockComponent';
	domElement.appendChild(text);
	// Desactivamos la seleccion de texto, y la interaccion con el raton en general para el reloj
	text.onmousedown = function() {
		return false;
	};

	/*******************************************************************************************************************
	 * Métodos Privados
	 ******************************************************************************************************************/

	/**
	 * Método para iniciar la cuenta del reloj
	 */
	function launch() {
		if (!stopped) {
			// Obtenemos la diferencia de tiempo entre el momento actual y en el que se empezo, es decir el tiempo que se
			// lleva contando en segundos sin decimales
			var elapsed = Math.round((Date.now() - startTime) / 1000);
			// Si es un cronometro normal
			if (initialTime == 0) {
				showTime(accruedTime + elapsed);
			}
			// Si es un cronometro de cuenta regresiva
			else {
				// Si no se ha acabado el tiempo
				if (initialTime > accruedTime + elapsed) {
					showTime(initialTime - (accruedTime + elapsed));
				} else {
					showTime(0);
					stopped = true;
					accruedTime += Math.round((Date.now() - startTime) / 1000);
					clearTimeout(timeO);
					callback();
				}
			}
			timeO = setTimeout(launch, 490);
		}
	}

	/**
	 * Método que muestra en el reloj el tiempo indicado
	 * 
	 * @param Integer:time
	 *            tiempo que se mostrará en el reloj en segundos.
	 */
	function showTime(time) {
		text.value = getHours(time) + " : " + getMinutes(time) + " : " + getSeconds(time);
	}

	/**
	 * Método para conseguir los segundos
	 * 
	 * @param Integer:time
	 *            tiempo del que se extraeran los segundos.
	 * @returns String cadena de texto con los segundos con dos digitos.
	 */
	function getSeconds(time) {
		var sec = time % 60;
		if (sec < 10) {
			return "0" + sec;
		} else {
			return "" + sec;
		}
	}

	/**
	 * Método para conseguir los minutos
	 * 
	 * @param Integer:time
	 *            tiempo del que se extraeran los minutos.
	 * @returns String cadena de texto con los minutos con dos digitos.
	 */
	function getMinutes(time) {
		var min = Math.floor(time / 60) % 60;
		if (min < 10) {
			return "0" + min;
		} else {
			return "" + min;
		}
	}

	/**
	 * Método para conseguir las horas
	 * 
	 * @param Integer:time
	 *            tiempo del que se extraeran las horas.
	 * @returns String cadena de texto con las horas con dos digitos como mínimo.
	 */
	function getHours(time) {
		var hour = Math.floor(time / 3600);
		if (hour < 10) {
			return "0" + hour;
		} else {
			return "" + hour;
		}
	}

	/*******************************************************************************************************************
	 * Métodos Públicos
	 ******************************************************************************************************************/

	/**
	 * Método para conseguir el elemento html que representa el reloj
	 */
	this.getDomElement = function() {
		return domElement;
	}

	/**
	 * Método para comenzar o retomar la cuenta del reloj
	 */
	this.start = function() {
		if (stopped) {
			startTime = Date.now();
		}
		stopped = false;
		launch();
	}

	/**
	 * Método para parar la cuenta del reloj
	 */
	this.pause = function() {
		if (!stopped) {
			accruedTime += Math.round((Date.now() - startTime) / 1000);
		}
		stopped = true;
		clearTimeout(timeO);
	}

	/**
	 * Método para obtener el tiempo total transcurrido y terminar de contar
	 */
	this.finish = function() {
		this.pause();
		// Si es un cronometro normal
		if (initialTime == 0) {
			return accruedTime;
		} else {
			// Si es un cronometro de cuenta regresiva
			return initialTime - accruedTime;
		}
	}

	/**
	 * Método para añadir tiempo al tiempo cronometrado, si el cronometro es regresivo lo disminuirá
	 * 
	 * @param Integer:timeToAdd
	 *            tiempo a añadir.
	 */
	this.addTime = function(timeToAdd) {
		accruedTime += timeToAdd;
	}

}
