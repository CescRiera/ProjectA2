const DragDropHandler = {
  init: (dropZones, onDrop) => {
    if (!dropZones || dropZones.length === 0) return

    dropZones.forEach((zone) => {
      zone.addEventListener("dragover", (e) => {
        e.preventDefault()
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

  handleDragStart: (e) => {
    e.dataTransfer.setData("text/plain", e.target.dataset.figureId)
    e.dataTransfer.effectAllowed = "move"
    e.target.classList.add("dragging")

    const removeDraggingClass = () => {
      e.target.classList.remove("dragging")
      e.target.removeEventListener("dragend", removeDraggingClass)
    }

    e.target.addEventListener("dragend", removeDraggingClass)
  },
}

export default DragDropHandler

