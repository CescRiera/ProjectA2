const SampleData = (() => {
    const figures = [
      new Figure('f1', 'Square', '■', { color: 'red', size: 'medium' }),
      new Figure('f2', 'Circle', '●', { color: 'blue', size: 'small' }),
      new Figure('f3', 'Triangle', '▲', { color: 'green', size: 'large' })
    ];
  
    // For simplicity, we use the same figure for sequence and options.
    const series1 = new Series('s1', 
      [figures[0]],    // sequence: the pattern (could be more figures)
      figures,         // options: all available figures
      0                // correctPosition: assume first option is correct
    );
  
    const test1 = new Test('t1', 'Basic Shapes', [series1], 60);
  
    return {
      initialize: async function() {
        await DBService.init();
        await DBService.addTest(test1);
      }
    };
  })();
  