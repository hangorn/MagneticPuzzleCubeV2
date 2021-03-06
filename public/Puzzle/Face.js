/*
 *  Copyright (c) 2013-2015 Javier Vaquero <javi_salamanca@hotmail.com>
 *
 *  See the file license.txt for copying permission.
 *
 */

/*
 *  Nombre: Face.js
 *  Sinopsis: Clase del modelo que se encargará de la lógica de negocio de cada cara de una pieza.
 *  El orden de las caras para todas las operaciones (incluidos los arrays) será el siguiente:
 *  1 derecha
 *  2 izquierda
 *  3 arriba
 *  4 abajo
 *  5 delante
 *  6 detras
 *
 *  Autor: Vaquero Marcos, Javier
 *  Fecha: 22-12-2012
 *  Versión: 0.2
 *  Fecha: 20-12-2012
 *  Versión: 0.1
 *  */

/*
 *  CLASE FACE
 *  */
function Face(pos, indexImg, indexSectionX, indexSectionY, rot) {

	/*******************************************************************************************************************
	 * Atributos (son privados, no se podrá acceder a ellos fuera de la clase)
	 ******************************************************************************************************************/

	// Posición en el cubo de la cara de acuerdo con los establecido arriba
	var position;
	// Índice de la imagen que contiene la cara
	var img;
	// Vector de dos elementos que contiene la sección de la imagen
	var section;
	// Rotación en grados de la sección
	var rotation;

	/*******************************************************************************************************************
	 * Constructor
	 ******************************************************************************************************************/
	/**
	 * Constructor de la clase Face
	 * 
	 * @param Integer:pos
	 *            posicion en el cubo de la cara: 1=derecha, 2=izquierda, 3=superior, 4=inferior, 5=delantera,
	 *            6=trasera.
	 * @param Integer:indexImg
	 *            índice de la imagen que contiene la cara.
	 * @param Integer:indexSectionX
	 *            elementos x del vector que contiene la sección de la imagen.
	 * @param Integer:indexSectionY
	 *            elementos y del vector que contiene la sección de la imagen.
	 * @param Integer:rot
	 *            rotación en grados de la sección
	 */
	position = pos;
	img = indexImg;
	section = new THREE.Vector2(indexSectionX, indexSectionY);
	rotation = rot;

	/*******************************************************************************************************************
	 * Métodos Públicos
	 ******************************************************************************************************************/

	/**
	 * Método que devuelve índice de la imagen que contiene la cara
	 * 
	 * @returns Integer índice de la imagen que contiene la cara.
	 */
	this.getImg = function() {
		return img;
	}

	/**
	 * Método que devuelve el vector de dos elementos que contiene la sección de la imagen
	 * 
	 * @returns Vector2 vector de dos elementos que contiene la sección de la imagen.
	 */
	this.getSection = function() {
		return section;
	}

	/**
	 * Método que obtiene si las coordenadas suministradas son iguales que la sección de la cara
	 * 
	 * @param Integer:x
	 *            Coordenada x que se comparará.
	 * @param Integer:y
	 *            Coordenada y que se comparará.
	 * @returns Boolean true si las coordenadas suministradas son iguales que la sección de la cara, false si no.
	 */
	this.compareSection = function(x, y) {
		if (x == section.x && y == section.y) {
			return true;
		}
		return false;
	}

	/**
	 * Método que determina si dos secciones son contiguas, es decir van una al lado de la otra en la imagen
	 * 
	 * @param Vector2:sect
	 *            Sección que se comparará.
	 * @returns Boolean true si las secciones son contiguas y false si no.
	 */
	this.isNextSection = function(sect) {
		// Calculamos las diferencias entre las coordenadas de las secciones
		var difX = Math.abs(section.x - sect.x);
		var difY = Math.abs(section.y - sect.y);
		// Si estan muy alejadas
		if (difX > 1 || difY > 1) {
			return false;
		}
		// Si es la diagonal
		if (difX == 1 && difY == 1) {
			return false;
		}

		return true;
	}

	/**
	 * Método que devuelve la rotación en grados de la sección
	 * 
	 * @returns Float rotación en grados de la sección.
	 */
	this.getRot = function() {
		return rotation;
	}

}