import BaseModel from "./base-model.js"

/**
 * Representa la puntuació d'un jugador en un test.
 * Hereda de BaseModel para implementar herencia.
 * @extends BaseModel
 */
class Score extends BaseModel {
  /**
   * @constructor
   * @param {string} nomJugador Nom del jugador.
   * @param {number} score Puntuació obtinguda.
   * @param {string} testId Identificador del test.
   */
  constructor(nomJugador, score, testId) {
    super(crypto.randomUUID()) // Generamos un ID único
    this.nomJugador = nomJugador
    this.score = score
    this.testId = testId
    this.date = new Date()
  }

  /**
   * Calcula el percentatge d'èxit basat en una puntuació màxima
   * @param {number} maxScore - Puntuació màxima possible
   * @returns {number} - Percentatge d'èxit (0-100)
   */
  getSuccessPercentage(maxScore) {
    return Math.round((this.score / maxScore) * 100)
  }

  /**
   * Retorna la data de la puntuació en format llegible
   * @returns {string} - Data formada
   */
  getFormattedDate() {
    return this.date.toLocaleDateString()
  }
}

export default Score

