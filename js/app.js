const App = (() => {
  let currentTest = null;
  let currentSeriesIndex = 0;
  let score = 0;
  let timeRemaining = 0;
  let timerInterval = null;

  return {
    init: async function() {
      await SampleData.initialize();
      this.loadTests();
      this.loadHighScores();
      this.setupEventListeners();
    },

    loadHighScores: async function() {
      const highScoresContainer = document.getElementById('high-scores');
      try {
        // Optionally pass a testId if you want scores for a particular test
        const scores = await DBService.getHighScores();
        const sorted = scores.sort((a, b) => b.score - a.score).slice(0, 10);
        highScoresContainer.innerHTML = sorted.map(s => `
          <div class="score-item">
            <span class="name">${s.playerName}</span>
            <span class="score">${s.score}</span>
          </div>
        `).join('');
      } catch (error) {
        highScoresContainer.innerHTML = `<div class="error">Error loading scores</div>`;
        console.error('Error loading scores:', error);
      }
    },

    setupEventListeners: function() {
      document.getElementById('return-btn').addEventListener('click', () => {
        this.showScreen('welcome-screen');
      });
      
      document.getElementById('shuffle-btn').addEventListener('click', () => {
        this.shuffleOptions();
      });

      document.getElementById('score-form').addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveScore();
      });
    },

    showScreen: function(screenId) {
      document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
      });
      document.getElementById(screenId).classList.remove('hidden');
    },

    loadTests: async function() {
        let tests = await DBService.getTests();
      
        // Rehydrate each test and its series so that class methods are available
        tests = tests.map(test => {
          // Rehydrate each series inside the test
          const rehydratedSeries = test.series.map(s => {
            // Rehydrate figures in sequence and options
            const rehydratedSequence = s.sequence.map(f => new Figure(f.id, f.name, f.image, f.properties));
            const rehydratedOptions = s.options.map(f => new Figure(f.id, f.name, f.image, f.properties));
            return new Series(s.id, rehydratedSequence, rehydratedOptions, s.correctPosition);
          });
          return new Test(test.id, test.name, rehydratedSeries, test.timeLimit);
        });
      
        const testList = document.getElementById('test-list');
        testList.innerHTML = ''; // Clear the loading text
        tests.forEach(test => {
          const div = document.createElement('div');
          div.className = 'test-item';
          div.textContent = test.name;
          div.addEventListener('click', () => this.startTest(test));
          testList.appendChild(div);
        });
      },
      

    startTest: function(test) {
      currentTest = test;
      currentSeriesIndex = 0;
      score = 0;
      timeRemaining = test.timeLimit;
      
      this.showScreen('test-screen');
      this.showCurrentSeries();
      this.startTimer();
    },

    showCurrentSeries: function() {
      const series = currentTest.series[currentSeriesIndex];
      const seriesContainer = document.getElementById('series-container');
      const optionsContainer = document.getElementById('options-container');
      
      seriesContainer.innerHTML = '';
      optionsContainer.innerHTML = '';
      
      // Render the current series (pattern)
      seriesContainer.appendChild(TestRenderer.renderSeries(series));
      // Render the options for the user to drag
      optionsContainer.appendChild(TestRenderer.renderOptions(series.options, DragDropHandler.handleDragStart));
      
      // Initialize drag and drop for the empty slot(s)
      DragDropHandler.init(
        document.querySelectorAll('.empty-slot'),
        this.handleDrop.bind(this)
      );
      
      // Update test header info (name, progress, score)
      document.getElementById('test-name').textContent = currentTest.name;
      document.getElementById('current-score').textContent = score;
      document.getElementById('current-series').textContent = currentSeriesIndex + 1;
      document.getElementById('total-series').textContent = currentTest.series.length;
    },

    handleDrop: function(figureId, dropZone) {
      const series = currentTest.series[currentSeriesIndex];
      const isValid = series.validateAnswer(figureId);
      if (isValid) {
        score += 100;
        this.showFeedback('Correct!', 'success');
        this.progressToNextSeries();
      } else {
        this.showFeedback('Try Again!', 'error');
      }
    },

    progressToNextSeries: function() {
      currentSeriesIndex++;
      if (currentSeriesIndex < currentTest.series.length) {
        this.showCurrentSeries();
      } else {
        this.finishTest();
      }
    },

    finishTest: function() {
      clearInterval(timerInterval);
      // Update final score and time spent on score screen
      document.getElementById('final-score').textContent = score;
      // Here we calculate time spent (for example, initial timeLimit minus timeRemaining)
      document.getElementById('time-spent').textContent = formatTime(currentTest.timeLimit - timeRemaining);
      this.showScreen('score-screen');
    },

    startTimer: function() {
      timerInterval = setInterval(() => {
        timeRemaining--;
        document.getElementById('timer-display').textContent = formatTime(timeRemaining);
        if (timeRemaining <= 0) {
          this.finishTest();
        }
      }, 1000);
    },

    shuffleOptions: function() {
      const series = currentTest.series[currentSeriesIndex];
      const options = series.options;
      // Fisher–Yates Shuffle Algorithm
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
      const optionsContainer = document.getElementById('options-container');
      optionsContainer.innerHTML = '';
      optionsContainer.appendChild(
        TestRenderer.renderOptions(options, DragDropHandler.handleDragStart)
      );
    },

    showFeedback: function(title, type) {
      const feedbackAlert = document.getElementById('feedback-alert');
      const feedbackTitle = document.getElementById('feedback-title');
      const feedbackMessage = document.getElementById('feedback-message');
      
      feedbackTitle.textContent = title;
      feedbackMessage.textContent = type === 'success' ? 'Well done!' : 'Incorrect answer, please try again.';
      
      feedbackAlert.classList.remove('hidden');
      setTimeout(() => {
        feedbackAlert.classList.add('hidden');
      }, 2000);
    },

    saveScore: async function() {
      const playerNameInput = document.getElementById('player-name');
      const playerName = playerNameInput.value.trim();
      if (!playerName) return;
      const scoreObj = new Score(playerName, score, currentTest.id);
      try {
        await DBService.addScore(scoreObj);
        document.getElementById('save-success').classList.remove('hidden');
        // Optionally update the high scores list
        this.loadHighScores();
      } catch (error) {
        console.error('Error saving score:', error);
      }
    }
  };
})();

// Utility: Format seconds as mm:ss
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

document.addEventListener('DOMContentLoaded', () => App.init());
