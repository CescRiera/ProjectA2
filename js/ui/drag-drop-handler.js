/**
 * Mòdul per gestionar el Drag & Drop.
 * @namespace
 */
const DragDropHandler = {
    /**
     * Inicialitza els drop zones per permetre el drag and drop.
     * @param {NodeList} dropZones Conjunt d'elements que actuaran com a zones de drop.
     * @param {Function} onDrop Funció callback que s'executarà en realitzar un drop.
     */
    init: function(dropZones, onDrop) {
        if (!dropZones || dropZones.length === 0) {
            console.warn("No drop zones found to initialize");
            return;
        }
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', function(e) {
                e.preventDefault(); // Permet el drop
                e.dataTransfer.dropEffect = 'move';
            });
            zone.addEventListener('dragenter', function(e) {
                e.preventDefault();
                this.classList.add('drag-over');
            });
            zone.addEventListener('dragleave', function() {
                this.classList.remove('drag-over');
            });
            zone.addEventListener('drop', function(e) {
                e.preventDefault();
                this.classList.remove('drag-over');
                const figureId = e.dataTransfer.getData('text/plain');
                onDrop(figureId, e.currentTarget);
            });
        });
    },
    /**
     * Gestiona l'inici del drag.
     * @param {Event} e Esdeveniment dragstart.
     */
    handleDragStart: function(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.figureId);
        e.dataTransfer.effectAllowed = 'move';
        e.target.classList.add('dragging');
        
        // Eliminar la classe 'dragging' quan es completi o cancel·li l'arrossegament
        const removeDraggingClass = () => {
            e.target.classList.remove('dragging');
            e.target.removeEventListener('dragend', removeDraggingClass);
        };
        e.target.addEventListener('dragend', removeDraggingClass);
    }
};

export default DragDropHandler;