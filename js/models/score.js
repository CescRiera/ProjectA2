/**
 * Representa la puntuació d'un jugador en un test.
 * @constructor
 * @param {string} nomJugador Nom del jugador.
 * @param {number} score Puntuació obtinguda.
 * @param {string} testId Identificador del test.
 */
function Score(nomJugador, score, testId) {
    this.nomJugador = nomJugador;
    this.score = score;
    this.testId = testId;
}

export default Score;