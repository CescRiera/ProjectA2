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
    init: (dropZones, onDrop) => {
      if (!dropZones || dropZones.length === 0) {
        console.warn("No drop zones found to initialize")
        return
      }
  
      // Utilitzem forEach amb arrow function
      dropZones.forEach((zone) => {
        zone.addEventListener("dragover", (e) => {
          e.preventDefault() // Permet el drop
          e.dataTransfer.dropEffect = "move"
        })
  
        zone.addEventListener("dragenter", (e) => {
          e.preventDefault()
          e.currentTarget.classList.add("drag-over")
        })
  
        zone.addEventListener("dragleave", (e) => {
          e.currentTarget.classList.remove("drag-over")
        })
  
        zone.addEventListener("drop", (e) => {
          e.preventDefault()
          e.currentTarget.classList.remove("drag-over")
          const figureId = e.dataTransfer.getData("text/plain")
          onDrop(figureId, e.currentTarget)
        })
      })
    },
  
    /**
     * Gestiona l'inici del drag.
     * @param {Event} e Esdeveniment dragstart.
     */
    handleDragStart: (e) => {
      e.dataTransfer.setData("text/plain", e.target.dataset.figureId)
      e.dataTransfer.effectAllowed = "move"
      e.target.classList.add("dragging")
  
      // Eliminar la classe 'dragging' quan es completi o cancel·li l'arrossegament
      const removeDraggingClass = () => {
        e.target.classList.remove("dragging")
        e.target.removeEventListener("dragend", removeDraggingClass)
      }
  
      e.target.addEventListener("dragend", removeDraggingClass)
    },
  }
  
  export default DragDropHandler
  
  