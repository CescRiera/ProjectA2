/**
 * Representa una figura.
 * @constructor
 * @param {string} id Identificador únic de la figura.
 * @param {string} nom Nom de la figura.
 * @param {string} imatge Representació visual (pot ser un emoji, imatge, etc.).
 * @param {Object} propietats Conjunt de propietats (p.ex. color, mida, poder, etc.).
 */
function Figure(id, nom, imatge, propietats) {
    this.id = id;
    this.nom = nom;
    this.imatge = imatge;
    this.propietats = propietats;
}

export default Figure;