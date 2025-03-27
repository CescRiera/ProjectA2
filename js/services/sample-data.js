import Figure from "../models/figure.js"
import Series from "../models/series.js"
import Test from "../models/test.js"
import DBService from "../services/db-service.js"
import CollectionUtils from "./collection-utils.js"

const SampleData = (() => {
  const figuresComic = [
    new Figure("p1", "Iron Man", "🦾", { color: "vermell", poder: "tecnològic" }),
    new Figure("p2", "Captain America", "🛡️", { color: "blau", lideratge: "alt" }),
    new Figure("p3", "Thor", "⚡", { poder: "diví", arma: "martell" }),
    new Figure("p4", "Hulk", "💚", { força: "alta", estat: "enfadat" }),
  ]

  const figuresAnimat = [
    new Figure("a1", "Bob Esponja", "🧽", { color: "groc", personalitat: "optimista" }),
    new Figure("a2", "Patric", "🐙", { color: "rosa", intel·ligència: "limitada" }),
    new Figure("a3", "Calamarsa", "🦑", { habilitats: "multitasking", velocitat: "alta" }),
  ]

  const figuresMap = CollectionUtils.arrayToMap([...figuresComic, ...figuresAnimat], "id")

  const categoriesSet = CollectionUtils.arrayToSet(["còmic", "animació"])

  const actionsStack = CollectionUtils.createStack()

  const tasksQueue = CollectionUtils.createQueue()

  const seriesComic1 = new Series(
    "sC1",
    [figuresComic[0], figuresComic[1], figuresComic[0], figuresComic[1]],
    figuresComic,
    0,
  )
  const seriesComic2 = new Series(
    "sC2",
    [figuresComic[2], figuresComic[3], figuresComic[3], figuresComic[3], figuresComic[2], figuresComic[3]],
    figuresComic,
    3,
  )
  const testComic = new Test("tComic", "Superherois de Còmic", [seriesComic1, seriesComic2], 90)

  const seriesAnimat1 = new Series("sA1", [figuresAnimat[0]], figuresAnimat, 0)
  const seriesAnimat2 = new Series("sA2", [figuresAnimat[1], figuresAnimat[2]], figuresAnimat, 1)
  const testAnimat = new Test("tAnimat", "Personatges d'Animació", [seriesAnimat1, seriesAnimat2], 60)

  const shortTests = CollectionUtils.filter([testComic, testAnimat], (test) => test.timeLimit < 120)

  const totalTime = CollectionUtils.reduce([testComic, testAnimat], (acc, test) => acc + test.timeLimit, 0)

  tasksQueue.enqueue(() => console.log("Inicialitzant dades de mostra..."))
  tasksQueue.enqueue(() => console.log("Carregant figures..."))
  tasksQueue.enqueue(() => console.log("Carregant tests..."))

  return {
    initialize: async () => {
      try {
        while (!tasksQueue.isEmpty()) {
          const task = tasksQueue.dequeue()
          task()
          actionsStack.push(`Task executed at ${new Date().toISOString()}`)
        }

        await DBService.init()
        await DBService.addTest(testComic)
        await DBService.addTest(testAnimat)

        for (const category of categoriesSet) {
          console.log(`Categoria carregada: ${category}`)
        }

        for (const key in figuresComic[0].propietats) {
          console.log(`Propietat de figura: ${key}`)
        }

        console.log("Sample data initialized successfully")
        console.log(`Total time for all tests: ${totalTime} seconds`)

        console.log("Last action:", actionsStack.peek())
      } catch (error) {
        console.error("Error initializing sample data:", error)
      }
    },

    getFiguresMap() {
      return figuresMap
    },

    getCategoriesSet() {
      return categoriesSet
    },
  }
})()

export default SampleData

