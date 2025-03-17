const DB_NAME = 'FigureSeriesDB';
const DB_VERSION = 1;

const DBService = {
  db: null,

  init: function() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;

        if (!db.objectStoreNames.contains('tests')) {
          db.createObjectStore('tests', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('scores')) {
          const store = db.createObjectStore('scores', { 
            keyPath: 'id',
            autoIncrement: true 
          });
          store.createIndex('testId', 'testId', { unique: false });
        }
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve();
      };

      request.onerror = (e) => reject(e.target.error);
    });
  },

  addTest: function(test) {
    return this._performTransaction('tests', 'readwrite', store => {
      return store.put(test);
    });
  },

  getTests: function() {
    return this._performTransaction('tests', 'readonly', store => {
      return store.getAll();
    });
  },

  

  addScore: function(score) {
    return this._performTransaction('scores', 'readwrite', store => {
      return store.add(score);
    });
  },

  getHighScores: function(testId) {
    return this._performTransaction('scores', 'readonly', store => {
      const index = store.index('testId');
      return testId ? index.getAll(testId) : store.getAll();
    });
  },

  _performTransaction: function(storeName, mode, operation) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      const request = operation(store);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
};
