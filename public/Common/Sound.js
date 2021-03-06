/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: Sound.js
 *  Sinopsis: Clase que manejará los sonidos de la aplicación.
 *  
 *  Autor: Vaquero Marcos, Javier
 *  Autor: Thomas Sturm (http://www.storiesinflight.com/html5/audio.html)
 *  Fecha: 27-02-2013
 *  Versión: 0.2
 *  Fecha: 21-02-2013
 *  Versión: 0.1
 *  */

/*
 *  CLASE SOUND
 *  */
function Sound() {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	// Flag para saber si el sonido esta activado
	var enabled = localStorage.magPuzCubSound === 'false' ? false : true;
	// Canales para sonido
	var numChannels = 5;
	var channels = [];

	// Elemento html para mostrar el icono de sonido activado/desactivado
	var soundIcon;
	// Icono que indicará que el sonido está desactivado
	var notSoundIcon;

	// Sonido de pieza encajada
	var placedSound;
	// Sonido de pieza bien encajada
	var rightSound;
	// Sonido de pieza mal encajada
	var wrongSound;
	// Sonido final
	var finalSound;
	// Sonido de movimiento en el menu
	var movedSound;
	// Sonido de explosion al seleccionar un elemento del menu
	var explosionSound;

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase Sound
	 */

	// Creamos el icono de sonido
	// Creamos un contenedor y los situamos de manera que no interfiera con el resto de elementos
	iconSound = document.createElement('div');
	// Creamos la imagen con el icono de sonido
	var img = document.createElement('img');
	img.src = 'img/sound.png';
	img.onclick = onSoundClick; // Registramos la funcion al hacer click
	img.className = 'soundComponent';
	iconSound.appendChild(img); // Añadimos la imagen al contenedor
	// Creamos la imagen el el icono de no sonido
	notSoundIcon = document.createElement('img');
	notSoundIcon.className = 'soundComponent';
	notSoundIcon.src = 'img/notSound.png';
	notSoundIcon.onclick = onSoundClick; // Registramos la funcion al hacer click
	if (enabled) {
		// Si el sonido esta activado no mostramos el icono de sonido desactivado
		notSoundIcon.style.display = 'none';
	}
	iconSound.appendChild(notSoundIcon); // Añadimos la imagen al contenedor
	document.body.appendChild(iconSound); // Añadimos el contenedor a la pagina

	// Iniciamos los canales para el sonido
	for (var i = 0; i < numChannels; i++) {
		channels[i] = [];
		channels[i].channel = -1;
		channels[i].finished = -1;
	}

	// Creamos el sonido de figura colocada
	placedSound = loadAudio('place');
	// Creamos el sonido de pieza bien encajada
	rightSound = loadAudio('rigth');
	// Creamos el sonido de pieza mal encajada
	wrongSound = loadAudio('wrong');
	// Creamos el sonido de movimiento en el menu
	movedSound = loadAudio('move');
	// Creamos el sonido final
	finalSound = loadAudio('final');
	// Creamos el sonido de explosion al seleccionar un elemento del menu
	explosionSound = loadAudio('explosion');

	/*******************************************************************************************************************
	 * Métodos Privados
	 ******************************************************************************************************************/

	/**
	 * Método para cargar el archivo de audio indicado, se debe suministrar solo el nombre del fichero, sin extension,
	 * ya que se cargara tanto con extensión WAV como MP3, se supondrá que el fichero se encuentra en la carpeta
	 * "/audio/".
	 * 
	 * @param string:file
	 *            cadena de caracteres con el nombre del fichero de audio.
	 * @returns audio objeto del DOM del tipo audio creado con los datos especificados.
	 */
	function loadAudio(file) {
		// Creamos el objeto del DOM audio
		var s = document.createElement('audio');
		s.id = 'movedSound';
		s.preload = 'auto';
		// Le añadimos el recurso WAV
		var source = document.createElement('source');
		source.src = 'audio/' + file + '.wav';
		source.type = 'audio/wav';
		s.appendChild(source);
		// Le añadimos el recurso MP3
		var source = document.createElement('source');
		source.src = 'audio/' + file + '.mp3';
		source.type = 'audio/mpeg';
		s.appendChild(source);
		return s;
	}

	/**
	 * Método que se ejecutará cada vez que se haga click en el icono de sonido
	 */
	function onSoundClick() {
		if (enabled) {
			// Mostramos el icono de no sonido
			notSoundIcon.style.display = 'block';
			// Recorremos todos los canales para silenciarlos
			for (var i = 0; i < channels.length; i++) {
				// Si se esta utilizando el canal
				thistime = new Date();
				if (channels[i].finished > thistime.getTime()) {
					channels[i].channel.pause();
				}
				channels[i].channel.channel = -1;
				channels[i].channel.finished = -1;
			}
		} else {
			// Ocultamos el icono de no sonido
			notSoundIcon.style.display = 'none';
		}
		enabled = !enabled;
		localStorage.magPuzCubSound = enabled;
	}

	/**
	 * Método que añade un canal al grupo de canales para el sonido
	 */
	function addChannel() {
		// Creamos un canal
		channel = [];
		channel.channel = -1;
		channel.finished = -1;
		// Lo añadimos al grupo de canales
		channels.push(channel);
	}

	/**
	 * Método para reproducir el sonido indicado
	 * 
	 * @param Audio:sound
	 *            objeto de la clase audio que será reproducido
	 */
	function playSound(sound) {
		// Si no esta activado el sonido no reproducimos nada
		if (!enabled) {
			return;
		}

		// Buscamos un canal libre
		var now = new Date().getTime();
		for (var i = 0; i < channels.length; i++) {
			if (channels[i].finished < now) {
				break;
			}
		}
		// Si llegamos hasta aqui es que no hay canales libres
		if (i == channels.length) {
			// Añadimos un canal
			addChannel();
		}
		// Guardamos la duracion del audio
		channels[i].finished = now + sound.duration * 1000;
		// Guardamos el sonido en el canal
		channels[i].channel = sound.cloneNode(true);
		// Reproducimos el canal
		channels[i].channel.play();
	}

	/*******************************************************************************************************************
	 * Métodos Públicos
	 ******************************************************************************************************************/

	/**
	 * Método que reproducirá el sonido de pieza encajada correctamente en el puzzle
	 */
	this.playRigthPlaced = function() {
		playSound(placedSound);
		if (getOptions().audioHelp) {
			playSound(rightSound);
		}
	}

	/**
	 * Método que reproducirá el sonido de pieza encajada erróneamente en el puzzle
	 */
	this.playWrongPlaced = function() {
		playSound(placedSound);
		if (getOptions().audioHelp) {
			playSound(wrongSound);
		}
	}

	/**
	 * Método que reproducirá el sonido de puzzle acabado
	 */
	this.playFinal = function() {
		playSound(finalSound);
	}

	/**
	 * Método que reproducirá el sonido de pieza encajada en el puzzle
	 */
	this.playMoved = function() {
		playSound(movedSound);
	}

	/**
	 * Método que reproducirá el sonido de explosión al seleccionar una entrada del menú.
	 */
	this.playExplosion = function() {
		playSound(explosionSound);
	}

}
