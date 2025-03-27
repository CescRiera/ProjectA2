import Series from "../models/series.js"

const DBService = {
  db: null,
  init: function () {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("TestDB", 1)
      request.onerror = (e) => {
        console.error("Error en obrir la BD", e)
        reject(e)
      }
      request.onsuccess = (e) => {
        this.db = e.target.result
        resolve()
      }
      request.onupgradeneeded = (e) => {
        const db = e.target.result
        if (!db.objectStoreNames.contains("tests")) {
          db.createObjectStore("tests", { keyPath: "id" })
        }
        if (!db.objectStoreNames.contains("scores")) {
          db.createObjectStore("scores", { autoIncrement: true })
        }
      }
    })
  },
  addTest: function (test) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"))
        return
      }
      const transaction = this.db.transaction(["tests"], "readwrite")
      const store = transaction.objectStore("tests")
      const request = store.put(test)
      request.onsuccess = () => resolve()
      request.onerror = (e) => reject(e)
    })
  },
  getTests: function () {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"))
        return
      }
      const transaction = this.db.transaction(["tests"], "readonly")
      const store = transaction.objectStore("tests")
      const request = store.getAll()
      request.onsuccess = (e) => {
        const tests = e.target.result
        tests.forEach((test) => {
          if (test.series && Array.isArray(test.series)) {
            test.series.forEach((serie) => {
              Object.setPrototypeOf(serie, Series.prototype)
            })
          }
        })
        resolve(tests)
      }
      request.onerror = (e) => reject(e)
    })
  },
  addScore: function (scoreObj) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"))
        return
      }
      const transaction = this.db.transaction(["scores"], "readwrite")
      const store = transaction.objectStore("scores")
      const request = store.add(scoreObj)
      request.onsuccess = () => resolve()
      request.onerror = (e) => reject(e)
    })
  },
  getHighScores: function () {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not initialized"))
        return
      }
      const transaction = this.db.transaction(["scores"], "readonly")
      const store = transaction.objectStore("scores")
      const request = store.getAll()
      request.onsuccess = (e) => resolve(e.target.result)
      request.onerror = (e) => reject(e)
    })
  },
}

export default DBService

