import BaseModel from "./base-model.js"

class Series extends BaseModel {
  constructor(id, sequence, options, correctPosition) {
    super(id)
    this.sequence = sequence
    this.options = options
    this.correctPosition = correctPosition
  }

  validateAnswer(figureId) {
    return this.options[this.correctPosition].id === figureId
  }

  getCorrectFigure() {
    return this.options[this.correctPosition]
  }

  shuffleOptions() {
    for (let i = this.options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[this.options[i], this.options[j]] = [this.options[j], this.options[i]]
    }
  }
}

export default Series

