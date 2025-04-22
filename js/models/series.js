import BaseModel from "./base-model.js"

class Series extends BaseModel {
  constructor(id, sequence, options, correctPosition) {
    super(id)
    this.sequence = sequence
    this.options = options
    this.correctPosition = correctPosition
  }

  validateAnswer(figureId) {
    // Special case for comic series 2, solution should be figuresComic[3]
    if (this.id === "sC2") {
      return figureId === this.options[3].id
    }
    return this.options[this.correctPosition].id === figureId
  }

  getCorrectFigure() {
    // Special case for comic series 2, solution should be figuresComic[3]
    if (this.id === "sC2") {
      return this.options[3]
    }
    return this.options[this.correctPosition]
  }

  shuffleOptions() {
    // Save the correct figure before shuffling
    const correctFigure = this.id === "sC2" ? this.options[3] : this.options[this.correctPosition]
    
    // Shuffle the options array
    for (let i = this.options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[this.options[i], this.options[j]] = [this.options[j], this.options[i]]
    }
    
    // Find the new position of the correct figure
    this.correctPosition = this.options.findIndex(option => option.id === correctFigure.id)
  }
}

export default Series

