const TestRenderer = {
    renderSeries: function(series) {
        const container = document.createElement('div');
        container.className = 'series';
      
        series.sequence.forEach((figure, index) => {
          const item = document.createElement('div');
          item.className = 'series-item';
          
          if (index === series.correctPosition) {
            item.classList.add('empty-slot');
            item.dataset.acceptsDrop = true;
            // Ensure the drop zone is visible
            item.textContent = 'Drop Here';
          } else {
            item.textContent = figure.image;
          }
          
          container.appendChild(item);
        });
      
        return container;
      },
      
      
      renderOptions: function(options, onDragStart) {
        const container = document.createElement('div');
        
        options.forEach(option => {
          const div = document.createElement('div');
          div.className = 'option';
          div.draggable = true;
          div.textContent = option.image;
          div.dataset.figureId = option.id;
          
          div.addEventListener('dragstart', onDragStart);
          container.appendChild(div);
        });
      
        return container;
      }
      
      
  };
  