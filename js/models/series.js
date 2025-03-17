/**
 * Representa una sèrie de figures.
 * @constructor
 * @param {string} id Identificador de la sèrie.
 * @param {Figure[]} sequence Seqüència de figures que formen el patró.
 * @param {Figure[]} options Opcions de figures per triar.
 * @param {number} correctPosition Índex de la figura correcta dins de l'array options.
 */
function Series(id, sequence, options, correctPosition) {
    this.id = id;
    this.sequence = sequence;
    this.options = options;
    this.correctPosition = correctPosition;
}

/**
 * Valida la resposta de la sèrie.
 * @param {string} figureId Identificador de la figura seleccionada.
 * @return {boolean} Retorna true si la resposta és correcta.
 */
Series.prototype.validateAnswer = function(figureId) {
    return this.options[this.correctPosition].id === figureId;
};

export default Series;