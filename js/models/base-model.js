/**
 * Clase base para todos los modelos de la aplicación.
 * Implementa funcionalidad común para todos los modelos.
 * @class
 */
class BaseModel {
    /**
     * @constructor
     * @param {string} id - Identificador único del modelo
     */
    constructor(id) {
      this.id = id
      this.createdAt = new Date()
    }
  
    /**
     * Retorna una representación en string del modelo
     * @returns {string} - Representación del modelo
     */
    toString() {
      return `Model ${this.constructor.name} with ID: ${this.id}`
    }
  
    /**
     * Valida si el modelo tiene un ID válido
     * @returns {boolean} - True si el ID es válido
     */
    isValid() {
      return Boolean(this.id)
    }
  }
  
  export default BaseModel
  
  