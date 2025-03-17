/**
 * Representa un test.
 * @constructor
 * @param {string} id Identificador del test.
 * @param {string} nom Nom del test.
 * @param {Series[]} series Llista de sèries que componen el test.
 * @param {number} timeLimit Temps límit per resoldre el test (en segons).
 */
function Test(id, nom, series, timeLimit) {
    this.id = id;
    this.nom = nom;
    this.series = series;
    this.timeLimit = timeLimit;
}

export default Test;