const DragDropHandler = {
    init: function(dropZones, onDrop) {
      dropZones.forEach(zone => {
        zone.addEventListener('dragover', function(e) {
          e.preventDefault(); // Allow drop
        });
        zone.addEventListener('drop', function(e) {
          e.preventDefault();
          const figureId = e.dataTransfer.getData('text/plain');
          console.log('Drop event fired. Data:', figureId, 'Drop Zone:', e.currentTarget);
          onDrop(figureId, e.currentTarget);
        });
      });
    },
  
    handleDragStart: function(e) {
      console.log('Drag started for figureId:', e.target.dataset.figureId);
      e.dataTransfer.setData('text/plain', e.target.dataset.figureId);
    },
  
  
  
    handleDragOver: function(e) {
      // Always prevent default to allow dropping
      e.preventDefault();
    },
  
    handleDrop: function(figureId, dropZone) {
        console.log('Handle drop called with figureId:', figureId);
        const series = currentTest.series[currentSeriesIndex];
        const isValid = series.validateAnswer(figureId);
        console.log('Answer valid:', isValid);
        if (isValid) {
          score += 100;
          this.showFeedback('Correct!', 'success');
          this.progressToNextSeries();
        } else {
          this.showFeedback('Try Again!', 'error');
        }
      },
      
  };
  