/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: ThreeDUtils.js
 *  Sinopsis: Fichero con funciones auxiliares relaccionadas con graficos 3D.
 *
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 11-12-2015
 *  Versión: 0.1
 *  */

/***********************************************************************************************************************
 * Funciones Varias
 **********************************************************************************************************************/

var ThreeDUtils = {};

/**
 * Funcion para calcular si los objectos indicados son estan en la posicion del raton. Se encarga de iniciar y gestionar
 * todas las clases que sean necesarias.
 * 
 * @param THREE.Vector2|THREE.Vector3:mouse
 *            vector 2D para las coordenadas del raton ya tranformadas (con el eje de coordenadas en el centro de la
 *            pantalla). Tambien acepta un vector de tres coordendas. Si no se recibe un valor se utilizaran las
 *            coordenadas recibidas en la llamada anterior a este metodo
 * @param Object3D[]:objects
 *            objetos 3D con los que se comprobara si la posicion del raton coincide. Si no se recibe ningun objeto, se
 *            comprobara en que punto esta el raton en un plano paralelo a la pantalla y en Z=0, de modo que siempre se
 *            ejecutara la funcion de rellamada "onIntersect"
 * @param String:changePointer
 *            estilo CSS del cursor que se fijara si hay algun objeto en la posicion del raton, si no hay objecto si
 *            fijara el cursor por defecto. Si no se recibe un valor, no se cambiara el cursor
 * @param Callback:onIntersect
 *            funcion de rellamada que se ejecutara si hay algun objeto en la posicion. Esta recibira un parametro con
 *            la informacion de la interseccion: distancia, punto, cara del objeto, el objecto en si, ... En caso de que
 *            haya mas de un objeto en la posicion del raton, solo se tendra en cuenta el mas cercano a la camara
 * @param Callback:onNotIntersect
 *            funcion de rellamada que se ejecutara si no hay algun objeto en la posicion
 */
ThreeDUtils.intersectObjects = function(mouse, objects, changePointer, onIntersect, onNotIntersect) {
	// Si no estan iniciados los objectos necesarios, los creamos
	if (!ThreeDUtils.ray) {
		// Proyector para realizar operaciones
		ThreeDUtils.projector = new THREE.Projector();
		// Rayo que realizará las operaciones de intersección con origen en la posicion de la camara
		ThreeDUtils.ray = new THREE.Raycaster(camera.position);
		// Plano para hacer calculos
		ThreeDUtils.plane = new THREE.Mesh(new THREE.PlaneGeometry(10000, 10000, 8, 8), new THREE.MeshBasicMaterial({
			color : 0x000000,
			transparent : true,
			wireframe : true
		}));
		// Hacemos que no sea visible, es para funcionamiento interno, no para mostrarlo
		ThreeDUtils.plane.visible = false;
	}

	// Si recibimos la posicion del raton, cambiamos la direccion del ray
	if (mouse) {
		if (mouse instanceof THREE.Vector2) {
			// Creamos un vector en la direccion del raton hacia la escena
			var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
			ThreeDUtils.projector.unprojectVector(vector, camera);
		} else if (mouse instanceof THREE.Vector3) {
			var vector = new THREE.Vector3().copy(mouse);
			vector.z = 0;
		}
		ThreeDUtils.ray.ray.direction = vector.subSelf(camera.position).normalize();
	}
	// Si recibimos objectos, contra estos, si no contra el plano
	if (objects) {
		var intersects = ThreeDUtils.ray.intersectObjects(objects);
	} else {
		var intersects = ThreeDUtils.ray.intersectObject(ThreeDUtils.plane);
	}
	// Si hay objetos
	if (intersects.length > 0) {
		if (changePointer) {
			// Cambiamos al cursor indicado
			container.style.cursor = changePointer;
		}
		if (onIntersect) {
			onIntersect(intersects[0]);
		}
	} else {
		if (changePointer) {
			// Usamos el cursor por defecto
			container.style.cursor = 'auto';
		}
		if (onNotIntersect) {
			onNotIntersect();
		}
	}

}