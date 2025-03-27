import BaseModel from "./base-model.js"

/**
 * Representa una figura.
 * Hereda de BaseModel para implementar herencia.
 * @extends BaseModel
 */
class Figure extends BaseModel {
  /**
   * @constructor
   * @param {string} id Identificador único de la figura.
   * @param {string} nom Nom de la figura.
   * @param {string} imatge Representació visual (pot ser un emoji, imatge, etc.).
   * @param {Object} propietats Conjunt de propietats (p.ex. color, mida, poder, etc.).
   */
  constructor(id, nom, imatge, propietats) {
    super(id) // Llamada al constructor de la clase padre
    this.nom = nom
    this.imatge = imatge
    this.propietats = propietats
  }

  /**
   * Retorna una descripción de la figura
   * @returns {string} - Descripción de la figura
   */
  getDescription() {
    return `${this.nom} (${this.imatge})`
  }

  /**
   * Comprueba si la figura tiene una propiedad específica
   * @param {string} propName - Nombre de la propiedad
   * @returns {boolean} - True si tiene la propiedad
   */
  hasProperty(propName) {
    return this.propietats && propName in this.propietats
  }
}

export default Figure

