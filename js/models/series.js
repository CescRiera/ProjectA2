class Series {
    constructor(id, sequence, options, correctPosition) {
      this.id = id;
      this.sequence = sequence; // Array of Figure objects for the pattern
      this.options = options;   // Array of Figure objects to choose from
      this.correctPosition = correctPosition; // The index where the correct answer goes
    }
    
    // Check if the dragged figureId matches the correct figure at the designated position.
    validateAnswer(figureId) {
      return this.options[this.correctPosition].id === figureId;
    }
  }
  