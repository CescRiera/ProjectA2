import BaseModel from "./base-model.js"

/**
 * Representa un test.
 * Hereda de BaseModel para implementar herencia.
 * @extends BaseModel
 */
class Test extends BaseModel {
  /**
   * @constructor
   * @param {string} id Identificador del test.
   * @param {string} nom Nom del test.
   * @param {Series[]} series Llista de sèries que componen el test.
   * @param {number} timeLimit Temps límit per resoldre el test (en segons).
   */
  constructor(id, nom, series, timeLimit) {
    super(id) // Llamada al constructor de la clase padre
    this.nom = nom
    this.series = series
    this.timeLimit = timeLimit
  }

  /**
   * Obtiene la duración del test en formato legible
   * @returns {string} - Duración formateada
   */
  getFormattedDuration() {
    const minutes = Math.floor(this.timeLimit / 60)
    const seconds = this.timeLimit % 60
    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`
  }

  /**
   * Calcula la puntuación máxima posible del test
   * @returns {number} - Puntuación máxima
   */
  getMaxScore() {
    return this.series.length * 100
  }

  /**
   * Barreja totes les sèries del test
   * Implementación de método para usar en polimorfismo
   */
  shuffleAllSeries() {
    this.series.forEach((serie) => {
      // Polimorfismo: llamamos al método shuffleOptions de cada serie
      if (serie.shuffleOptions) {
        serie.shuffleOptions()
      }
    })
  }
}

export default Test

