/**
 * Mòdul per renderitzar la interfície dels tests.
 * @namespace
 */
const TestRenderer = {
    /**
     * Renderitza una sèrie de figures.
     * @param {Series} series La sèrie a renderitzar.
     * @return {HTMLElement} Element HTML amb la sèrie renderitzada.
     */
    renderSeries: function(series) {
        const container = document.createElement('div');
        container.className = 'series';
        // Renderitza cada figura de la seqüència
        series.sequence.forEach(figure => {
            const elem = document.createElement('div');
            elem.className = 'figure';
            elem.textContent = figure.imatge;
            elem.title = figure.nom;
            container.appendChild(elem);
        });
        // Afegeix una casella buida per fer el drop
        const emptySlot = document.createElement('div');
        emptySlot.className = 'empty-slot';
        emptySlot.textContent = '?';
        container.appendChild(emptySlot);
        return container;
    },
    /**
     * Renderitza les opcions per seleccionar.
     * @param {Figure[]} options Llista de figures com a opcions.
     * @param {Function} dragHandler Funció que gestiona l'esdeveniment dragstart.
     * @return {HTMLElement} Element HTML amb les opcions renderitzades.
     */
    renderOptions: function(options, dragHandler) {
        const container = document.createElement('div');
        container.className = 'options';
        options.forEach(figure => {
            const elem = document.createElement('div');
            elem.className = 'option';
            elem.textContent = figure.imatge;
            elem.title = figure.nom;
            elem.draggable = true;
            elem.dataset.figureId = figure.id;
            elem.addEventListener('dragstart', dragHandler);
            container.appendChild(elem);
        });
        return container;
    }
};

export default TestRenderer;