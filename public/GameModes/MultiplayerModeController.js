/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: MultiplayerModeController.js
 *  Sinopsis: Clase del controlador del modo clásico.
 *  
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 06-05-2013
 *  Versión: 0.1
 *  */

/*
 *  CLASE MULTIPLAYERMODECONTROLLER
 *  */
function MultiplayerModeController(ty, mats, iniPos, iniRot) {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	// Tipo de partida multijugador
	this.type;
	// Flag para saber si se ha empezado a jugar
	this.running = false;

	// Render y escena donde se mostraran los movimientos del otro jugador
	this.otherPlayerRenderCont;
	this.otherPlayerScene;
	// Puzzle del otro jugador
	this.otherPlayerPuzzle;
	// Metodo para animar y renderizar el puzzle del otro jugador
	this.otherPlayerAnimation;
	this.otherPlayerAnimationStopped;

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase MultiplayerModeController
	 * 
	 * @param Integer:ty
	 *            tipo de puzzle multijugador.
	 * @param Material[]:mats
	 *            array con los materiales a usar para crear el puzzle.
	 * @param Vector3[]:iniPos
	 *            posiciones iniciales de los cubos, si no estan definidas nos encargaremos nosotros de crearlas.
	 * @param Vector3[]:iniRot
	 *            rotaciones iniciales de los cubos, si no estan definidas nos encargaremos nosotros de crearlas.
	 */

	this.type = ty;
	this.iniPos = iniPos;
	this.iniRot = iniRot;
	// Calculamos el numero de cubos para pasarselos a la clase padre (niveles pares -> 2, niveles impares -> 3)
	var numC = this.type % 2 + 2;
	// Llamamos al constructor de la clase padre (ClassicModeController)
	ClassicModeController.call(this, numC, mats);

	/*******************************************************************************************************************
	 * Métodos Privados
	 ******************************************************************************************************************/

}

/***********************************************************************************************************************
 * Heredamos de ClassicModeController
 **********************************************************************************************************************/
MultiplayerModeController.prototype = Object.create(ClassicModeController.prototype);
MultiplayerModeController.prototype.constructor = MultiplayerModeController;

/***********************************************************************************************************************
 * Métodos Protected (para usar herencia)
 **********************************************************************************************************************/

/**
 * Método para iniciar el render y la escena en la que se mostrarán los movimientos del otro jugador.
 */
MultiplayerModeController.prototype.initOtherPlayerRender = function() {
	// Creamos una escena
	this.otherPlayerScene = new THREE.Scene();
	// Creamos una camara, la movemos hacia atras
	var camera = new THREE.PerspectiveCamera(30, 11 / 5, 1, 5000);
	camera.position.z = 3000;

	this.otherPlayerRenderCont = document.createElement('div');
	this.otherPlayerRenderCont.id = 'otherPlayerRenderContainer';

	// Creamos el render y fijamos su tamaño
	var otherPlayerRender = new THREE.WebGLRenderer();
	otherPlayerRender.setSize(windowWidth / 3, windowHeight * 0.4);
	// Introduciomos el render en el contenedor
	otherPlayerRender.domElement.id = 'otherPlayerRender';
	this.otherPlayerRenderCont.appendChild(otherPlayerRender.domElement);
	// Cuando se redimensiona la pantalla
	this.otherPlayerRenderCont.onresize = function() {
		// Guardamos el nuevo tamaño de ventana
		windowHeight = window.innerHeight;
		windowWidth = window.innerWidth;
		// Cambiamos el tamaño del render
		otherPlayerRender.setSize(windowWidth / 3, windowHeight * 0.4);
	}
	var ctl = this;
	this.otherPlayerAnimation = function() {
		// Hacemos una peticion para animacion
		if (!ctl.otherPlayerAnimationStopped) {
			requestAnimationFrame(ctl.otherPlayerAnimation);
		}
		// Renderizamos la escena
		otherPlayerRender.render(ctl.otherPlayerScene, camera);
	}
}

/**
 * Método para iniciar puzzle que se mostrará del otro jugador
 */
MultiplayerModeController.prototype.initOtherPlayerPuzzle = function() {
	// Creamos el puzzle
	var materials = [];
	for (var i = 0; i < this.materials.length; i++) {
		var texture = new THREE.Texture(this.materials[i].map.image);
		texture.needsUpdate = true;
		materials.push(new THREE.MeshBasicMaterial({
			map : texture
		}));
	}
	this.otherPlayerPuzzle = new MultiplayerPuzzle(this.numberOfCubes, materials);
	// Obtenemos las posiciones y rotaciones iniciales
	var initialPositions = this.puzzle.getInitialPositions();
	var initialRotations = this.puzzle.getInitialRotations();
	// Colocamos las figuras en sus posiciones y rotaciones iniciales
	for (var i = 0; i < this.otherPlayerPuzzle.getPuzzleCubes().length; i++) {
		this.otherPlayerPuzzle.getPuzzleCubes()[i].position.copy(initialPositions[i]);
		this.otherPlayerPuzzle.getPuzzleCubes()[i].rotation.copy(initialRotations[i]);
	}

	// Creamos un cuadrado para delimitar el area del puzzle
	var geometry = new THREE.Geometry();
	var vertice;
	vertice = new THREE.Vector3(-this.otherPlayerPuzzle.getPuzzleAreaSize() / 2, -this.otherPlayerPuzzle
			.getPuzzleAreaSize() / 2, 0);
	geometry.vertices.push(vertice);
	vertice = new THREE.Vector3(this.otherPlayerPuzzle.getPuzzleAreaSize() / 2, -this.otherPlayerPuzzle
			.getPuzzleAreaSize() / 2, 0);
	geometry.vertices.push(vertice);
	vertice = new THREE.Vector3(this.otherPlayerPuzzle.getPuzzleAreaSize() / 2, this.otherPlayerPuzzle
			.getPuzzleAreaSize() / 2, 0);
	geometry.vertices.push(vertice);
	vertice = new THREE.Vector3(-this.otherPlayerPuzzle.getPuzzleAreaSize() / 2, this.otherPlayerPuzzle
			.getPuzzleAreaSize() / 2, 0);
	geometry.vertices.push(vertice);
	vertice = new THREE.Vector3(-this.otherPlayerPuzzle.getPuzzleAreaSize() / 2, -this.otherPlayerPuzzle
			.getPuzzleAreaSize() / 2, 0);
	geometry.vertices.push(vertice);
	var puzzleArea = new THREE.Line(geometry, new THREE.LineBasicMaterial({
		color : 0xff0000
	}));

	// Añadimos todos los objetos a la escena
	// Añadimos los cubos a la escena
	for (var i = 0; i < this.otherPlayerPuzzle.getPuzzleCubes().length; i++) {
		// Si no estan encajados en el puzzle
		if (this.otherPlayerPuzzle.getPuzzleCubes()[i].parent != this.otherPlayerPuzzle.getPuzzle()) {
			this.otherPlayerScene.add(this.otherPlayerPuzzle.getPuzzleCubes()[i]);
		}
	}
	// Añadimos el puzzle
	this.otherPlayerScene.add(this.otherPlayerPuzzle.getPuzzle());
	// Añadimos el indicador del area del puzzle
	this.otherPlayerScene.add(puzzleArea);
}

/**
 * Realiza las operaciones necesarias para arrancar el modo de juego
 */
MultiplayerModeController.prototype.init = function() {
	// Creamos la vista del puzzle
	container.appendChild(renderer.domElement);
	var ctl = this;
	this.puzzle = new MultiplayerPuzzleController(this.numberOfCubes, function() {
		socket.solvedGame();
	}, this.materials, this.type, this.iniPos, this.iniRot);
	// Ocultamos el puzzle, ya que se iniciara oculta y para mostrarla habra que indicarselo
	this.puzzle.hide();
	// Si es el modo contrareloj
	if (this.type == 2 || this.type == 3) {
		// Iniciamos tanto el render como otro puzzle para mostrar lo que hace el otro jugador
		this.initOtherPlayerRender();
		this.initOtherPlayerPuzzle();
	}

	// Creamos el reloj para cronometrar el tiempo, pero no iniciamos la cuenta ni lo9 mostramos
	this.clock = new Clock(0);
	// Le decimos al socket que esta clase es la que tiene que procesar las acciones
	socket.setController(this);
};

/**
 * Método que se ejecutará cuando el servidor diga que se ha terminado el puzzle.
 * 
 * @param Integer:time
 *            tiempo en segundos invertido en resolver el puzzle.
 * @param Boolean:winner
 *            booleano para indicar si el cliente es el ganador o no, si no se trata del modo contrareloj se ignorará.
 */
MultiplayerModeController.prototype.finish = function(time, winner) {
	var clockTime = this.clock.finish();
	// Si nuestro tiempo es distinto del del servidor
	if (clockTime != time) {
		// Actualizamos nuestro tiempo
		var d = time - clockTime;
		this.clock.addTime(d);
		this.clock.start();
		this.clock.finish();
	}
	this.finished = true;
	var sec = time % 60;
	var min = Math.floor(time / 60) % 60;
	var hour = Math.floor(time / 3600);
	// Obtenemos el mensaje en funcion del modo de juego
	var text;
	// Si se trata del modo cooperativo
	if (this.type == 0 || this.type == 1) {
		sound.playFinal();
		text = "Enhorabuena!!! Habeis solucionado el puzzle! en ";
	}
	// Si se trata del modo contrareloj
	if (this.type == 2 || this.type == 3) {
		// Si se ha ganado la partida
		if (winner) {
			sound.playFinal();
			text = "Enhorabuena!!! Has conseguido solucionar el puzzle antes que el otro jugagador! en ";
		} else {
			sound.playExplosion();
			text = "Lo sentimos. El otro jugador ha solucionado el puzzle antes en ";
		}
	}
	// Añadimos el tiempo
	if (hour != 0) {
		text += hour + " horas, ";
	}
	text += min + " minutos y " + sec + " segundos";
	// Mostramos el dialogo para guardar la puntuacion
	ScoresController.saveScoreDialog(text, time, 4, this.type);
};

/**
 * Manejador del evento de pulsación del botón de ir al menu principal
 * 
 * @param EventObject:event->
 *            caracteristicas del evento lanzado.
 */
MultiplayerModeController.prototype.onMenuClick = function(event) {
	// Confirmamos que se desea salir
	if (confirm("Esta seguro que desea salir?")) {
		this.hide();
		menuCtl.show(0);
		// Si el puzzle esta resuelto
		if (!this.puzzle.isDone()) {
			socket.finishedGame();
		}
	}
};

/**
 * Método para mostrar en la interfaz todos los elementos de la vista
 */
MultiplayerModeController.prototype.show = function() {
	document.body.appendChild(this.clock.getDomElement());
	// Si no se ha acabado el tiempo activamos el reloj
	if (!this.finished) {
		this.clock.start();
	}
	container.appendChild(renderer.domElement);
	// Mostramos el puzzle
	this.puzzle.show();
	// Si se trata de una partida contrareloj
	if (this.type == 2 || this.type == 3) {
		document.body.appendChild(this.otherPlayerRenderCont);
		this.otherPlayerAnimationStopped = false;
		this.otherPlayerAnimation();
	}
	// Mostramos la interfaz en el cuerpo del documento HTML
	document.body.appendChild(this.view);
	// Activamos las acciones
	this.enable();
};

/**
 * Método para eliminar de la interfaz todos los elementos de la vista, ocultarlos
 */
MultiplayerModeController.prototype.hide = function() {
	if (this.clock.getDomElement().parentNode == document.body) {
		document.body.removeChild(this.clock.getDomElement());
	}
	// Ocultamos el puzzle
	this.puzzle.hide();
	// Si se trata de una partida contrareloj
	if (this.type == 2 || this.type == 3) {
		document.body.removeChild(this.otherPlayerRenderCont);
		this.otherPlayerAnimationStopped = true;
	}
	// Borramos la interfaz del cuerpo del documento HTML
	if (this.view.parentNode == document.body) {
		document.body.removeChild(this.view);
	}
	// Deshabilitamos el controlador asociado
	this.remove();
	if (renderer.domElement.parentNode == container) {
		container.removeChild(renderer.domElement);
	}
};

/**
 * Devuelve una lista de los botones a mostrar y su accion asociada con el formato [{button, action}, {button,action},
 * ...]. Internamente tambien ocultara los botones que no sean necesarios.
 * 
 */
MultiplayerModeController.prototype.getButtonsWithActions = function() {
	// Ocultamos los botones de mostrar soluciones, solucion, colocar pieza, siguiente, anterior, reiniciar y pausa, no
	// se usan en este modo
	this.form.removeChild(this.form.showSolutions);
	this.form.removeChild(this.form.showSolution);
	this.form.removeChild(this.form.placeCube);
	this.form.removeChild(this.form.next);
	this.form.removeChild(this.form.previous);
	this.form.removeChild(this.form.restart);
	this.form.removeChild(this.form.pause);
	// Ocultamos toda la vista, ya que se iniciara oculta y para mostrarla habra que indicarselo
	document.body.removeChild(this.view);
	var ctl = this;
	// Creamos funciones anonimas por que si no javascript se piensa que "this" es "window" dentro de las funciones
	return [ {
		button : this.form.menu,
		action : function(event) {
			ctl.onMenuClick();
		}
	}, {
		button : this.form.options,
		action : function(event) {
			ctl.onOptionsClick();
		}
	} ];
};

/**
 * Método para obtener las posiciones iniciales de las piezas del puzzle
 */
MultiplayerModeController.prototype.getInitialPositions = function() {
	return this.puzzle.getInitialPositions();
}

/**
 * Método para obtener las rotaciones iniciales de las piezas del puzzle
 */
MultiplayerModeController.prototype.getInitialRotations = function() {
	return this.puzzle.getInitialRotations();
}

/**
 * Método que se ejecutará cuando el otro jugador mueva una pieza
 * 
 * @param Integer:ID
 *            ID de la pieza a mover.
 * @param Vector3:pos
 *            vector de 3 elementos con la nueva posición de la pieza.
 */
MultiplayerModeController.prototype.otherMovePiece = function(ID, pos) {
	// Si el tipo de partida es cooperativa
	if (this.type == 0 || this.type == 1) {
		this.puzzle.movePiece(ID, pos);
	}
	// Si se trata de una partida contrareloj
	if (this.type == 2 || this.type == 3) {
		this.otherPlayerPuzzle.getPuzzleCubes()[ID - 1].position.copy(pos);
	}
}

/**
 * Método que se ejecutará cuando el otro jugador gire una pieza
 * 
 * @param Integer:ID
 *            ID de la pieza a girar.
 * @param Vector3:rot
 *            vector de 3 elementos con la nueva rotación de la pieza.
 */
MultiplayerModeController.prototype.otherRotatePiece = function(ID, rot) {
	// Si el tipo de partida es cooperativa
	if (this.type == 0 || this.type == 1) {
		this.puzzle.rotatePiece(ID, rot);
	}
	// Si se trata de una partida contrareloj
	if (this.type == 2 || this.type == 3) {
		if (ID == 0) {
			this.otherPlayerPuzzle.getPuzzle().rotation.copy(rot)
		} else {
			this.otherPlayerPuzzle.getPuzzleCubes()[ID - 1].rotation.copy(rot);
		}
	}
}

/**
 * Método que se ejecutará cuando el otro jugador introduzca una pieza en el puzzle
 * 
 * @param Integer:ID
 *            ID de la pieza a girar.
 * @param Boolean:isPlaced
 *            booleano para indicar si el cubo es colocado o sacado del puzzle.
 * @param Vector3:pos
 *            vector de 3 elementos con la nueva posición de la pieza.
 * @param Vector3:rot
 *            vector de 3 elementos con la nueva rotación de la pieza.
 */
MultiplayerModeController.prototype.otherPlacedPiece = function(ID, isPlaced, pos, rot) {
	// Si el tipo de partida es cooperativa
	if (this.type == 0 || this.type == 1) {
		// Si la pieza ha sido introducida en el puzzle
		if (isPlaced) {
			// Introducimos la pieza en el puzzle
			this.puzzle.putInPiece(ID, pos, rot);
		} else {
			// Si la pieza ha sido sacada del puzzle
			// Sacamos la pieza del puzzle
			this.puzzle.putOutPiece(ID, pos, rot);
		}
	}
	// Si se trata de una partida contrareloj
	if (this.type == 2 || this.type == 3) {
		// Si la pieza ha sido introducida en el puzzle
		if (isPlaced) {
			// Introducimos la pieza en el puzzle
			var cube = this.otherPlayerPuzzle.getPuzzleCubes()[ID - 1];
			// Colocamos el cubo en la posicion y rotacion indicadas
			cube.position.copy(pos);
			cube.rotation.copy(rot);
			// Introducimos la figura en el puzzle
			this.otherPlayerPuzzle.getPuzzle().add(cube);
		}
		// Si la pieza ha sido sacada del puzzle
		else {
			var cube = this.otherPlayerPuzzle.getPuzzleCubes()[ID - 1];
			// Colocamos el cubo en la posicion y rotacion indicadas
			cube.position.copy(pos);
			cube.rotation.copy(rot);
			// Introducimos la figura en la escena, con lo cual se eliminara del puzzle
			this.otherPlayerScene.add(cube);
		}
	}
}

/**
 * Método que se ejecutará cuando el otro jugador seleccione una pieza del puzzle
 * 
 * @param Integer:ID
 *            ID de la pieza a seleccionar.
 * @param Boolean:isSelected
 *            booleano para indicar si el cubo es seleccionado o deseleccionado.
 */
MultiplayerModeController.prototype.otherSelectedPiece = function(ID, isSelected) {
	// Si el tipo de partida es cooperativa
	if (this.type == 0 || this.type == 1) {
		if (isSelected) {
			this.puzzle.markShape(ID);
		} else {
			this.puzzle.unmarkShape(ID);
		}
	}
}

/**
 * Método para soltar una pieza que el jugador haya seleccionado
 * 
 * @param Integer:ID
 *            ID de la pieza a girar.
 */
MultiplayerModeController.prototype.releasePiece = function(ID) {
	this.puzzle.releasePiece(ID);
}

/**
 * Método que se ejecutará cuando el servidor indique que se ha resuelto el puzzle.
 * 
 * @param Integer:time
 *            tiempo en segundos invertido en resolver el puzzle.
 * @param Boolean:winner
 *            booleano para indicar si el cliente es el ganador o no, si no se trata del modo contrareloj se ignorará.
 */
MultiplayerModeController.prototype.solvedPuzzle = function(time, winner) {
	// Indicamos al puzzle que esta resuelto
	this.puzzle.setDone();
	// Realizamos la accion para cuando se termine el puzzle
	this.finish(time, winner);
}
