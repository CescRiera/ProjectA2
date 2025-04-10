/**
 * Utilitats per treballar amb col·leccions (arrays, maps, sets)
 * @namespace
 */
const CollectionUtils = {
  /**
   * Crea i retorna un Map a partir d'un array d'objectes
   * @param {Array} array - Array d'objectes
   * @param {string} keyProp - Propietat a utilitzar com a clau
   * @returns {Map} - Map creat
   */
  arrayToMap(array, keyProp) {
    return new Map(array.map((item) => [item[keyProp], item]))
  },

  /**
   * Crea i retorna un Set a partir d'un array
   * @param {Array} array - Array d'elements
   * @returns {Set} - Set creat
   */
  arrayToSet(array) {
    return new Set(array)
  },

  /**
   * Implementa una estructura de dades de Pila (Stack) LIFO
   * @returns {Object} - Objecte amb mètodes de pila
   */
  createStack() {
    const items = []
    return {
      push: (element) => items.push(element),
      pop: () => items.pop(),
      peek: () => items[items.length - 1],
      isEmpty: () => items.length === 0,
      size: () => items.length,
      clear: () => (items.length = 0),
      getItems: () => [...items], // Retorna una còpia
    }
  },

  /**
   * Implementa una estructura de dades de Cua (Queue) FIFO
   * @returns {Object} - Objecte amb mètodes de cua
   */
  createQueue() {
    const items = []
    return {
      enqueue: (element) => items.push(element),
      dequeue: () => items.shift(),
      front: () => items[0],
      isEmpty: () => items.length === 0,
      size: () => items.length,
      clear: () => (items.length = 0),
      getItems: () => [...items], // Retorna una còpia
    }
  },

  /**
   * Filtra un   segons una funció de predicat
   * @param {Array} array - Array a filtrar
   * @param {Function} predicateFn - Funció de predicat
   * @returns {Array} - Array filtrat
   */
  filter(array, predicateFn) {
    return array.filter(predicateFn)
  },

  /**
   * Transforma un array aplicant una funció a cada element
   * @param {Array} array - Array a transformar
   * @param {Function} mapFn - Funció de transformació
   * @returns {Array} - Array transformat
   */
  map(array, mapFn) {
    return array.map(mapFn)
  },

  /**
   * Redueix un array a un únic valor
   * @param {Array} array - Array a reduir
   * @param {Function} reduceFn - Funció reductora
   * @param {*} initialValue - Valor inicial
   * @returns {*} - Resultat de la reducció
   */
  reduce(array, reduceFn, initialValue) {
    return array.reduce(reduceFn, initialValue)
  },
}

export default CollectionUtils

