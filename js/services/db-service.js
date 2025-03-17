import Series from '../models/series.js';

/**
 * Servei per gestionar IndexedDB.
 * @namespace
 */
const DBService = {
    db: null,
    /**
     * Inicialitza la base de dades IndexedDB.
     * @returns {Promise}
     */
    init: function() {
        return new Promise((resolve, reject) => {
            let request = indexedDB.open("TestDB", 1);
            request.onerror = function(e) {
                console.error("Error en obrir la BD", e);
                reject(e);
            };
            request.onsuccess = (e) => {
                this.db = e.target.result;
                resolve();
            };
            request.onupgradeneeded = (e) => {
                let db = e.target.result;
                if (!db.objectStoreNames.contains("tests")) {
                    db.createObjectStore("tests", { keyPath: "id" });
                }
                if (!db.objectStoreNames.contains("scores")) {
                    db.createObjectStore("scores", { autoIncrement: true });
                }
            };
        });
    },
    /**
     * Desa un test a la base de dades.
     * @param {Test} test Objecte test.
     * @returns {Promise}
     */
    addTest: function(test) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error("Database not initialized"));
                return;
            }
            let transaction = this.db.transaction(["tests"], "readwrite");
            let store = transaction.objectStore("tests");
            let request = store.put(test); // Using put instead of add to overwrite if exists
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e);
        });
    },
    /**
     * Recupera tots els tests.
     * @returns {Promise<Test[]>}
     */
    getTests: function() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error("Database not initialized"));
                return;
            }
            let transaction = this.db.transaction(["tests"], "readonly");
            let store = transaction.objectStore("tests");
            let request = store.getAll();
            request.onsuccess = (e) => {
                // Restaurar els prototips dels objectes recuperats
                const tests = e.target.result;
                tests.forEach(test => {
                    // Restaurar el prototip de les sèries
                    if (test.series && Array.isArray(test.series)) {
                        test.series.forEach(serie => {
                            Object.setPrototypeOf(serie, Series.prototype);
                        });
                    }
                });
                resolve(tests);
            };
            request.onerror = (e) => reject(e);
        });
    },
    /**
     * Desa una puntuació a la base de dades.
     * @param {Score} scoreObj Objecte puntuació.
     * @returns {Promise}
     */
    addScore: function(scoreObj) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error("Database not initialized"));
                return;
            }
            let transaction = this.db.transaction(["scores"], "readwrite");
            let store = transaction.objectStore("scores");
            let request = store.add(scoreObj);
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e);
        });
    },
    /**
     * Recupera totes les puntuacions.
     * @returns {Promise<Score[]>}
     */
    getHighScores: function() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error("Database not initialized"));
                return;
            }
            let transaction = this.db.transaction(["scores"], "readonly");
            let store = transaction.objectStore("scores");
            let request = store.getAll();
            request.onsuccess = (e) => resolve(e.target.result);
            request.onerror = (e) => reject(e);
        });
    }
};

export default DBService;