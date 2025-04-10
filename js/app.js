import Series from "./models/series.js"
import Score from "./models/score.js"
import DBService from "./services/db-service.js"
import DragDropHandler from "./ui/drag-drop-handler.js"
import TestRenderer from "./ui/test-renderer.js"
import formatTime from "./utils/formatTime.js"
import CollectionUtils from "./services/collection-utils.js"

const App = (() => {
  let testActual = null
  let indexSerieActual = 0
  let puntuacio = 0
  let tempsRestant = 0
  let timerInterval = null
  let isSubmittingScore = false // Flag to prevent double submission

  const historialAccions = CollectionUtils.createStack()
  const accionsPendents = CollectionUtils.createQueue()
  const elementsDOM = new Map()
  const testsCompletats = new Set()

  const guardarHistorialEnWebStorage = () => {
    try {
      const historial = historialAccions.getItems()
      localStorage.setItem("historialAccions", JSON.stringify(historial))
    } catch (error) {}
  }

  const guardarProgresTest = () => {
    if (testActual) {
      const progres = {
        testId: testActual.id,
        indexSerieActual,
        puntuacio,
        tempsRestant,
      }
      sessionStorage.setItem("progresTest", JSON.stringify(progres))
    }
  }

  const restaurarProgresTest = () => {
    try {
      const progresJSON = sessionStorage.getItem("progresTest")
      if (progresJSON) {
        const progres = JSON.parse(progresJSON)
        if (testActual && testActual.id === progres.testId) {
          indexSerieActual = progres.indexSerieActual
          puntuacio = progres.puntuacio
          tempsRestant = progres.tempsRestant
        }
      }
    } catch (error) {}
  }

  function elementExists(selector) {
    return document.querySelector(selector) !== null
  }

  const registrarAccio = (accio) => {
    const timestamp = new Date().toISOString()
    historialAccions.push({ accio, timestamp })
    guardarHistorialEnWebStorage()
  }

  const afegirAccioPendent = (accio) => {
    accionsPendents.enqueue(accio)
  }

  const processarAccionsPendents = () => {
    while (!accionsPendents.isEmpty()) {
      const accio = accionsPendents.dequeue()
      accio()
    }
  }

  const generarFuncioFeedback = (tipus) => {
    const cosFuncio = `
            return function(missatge) {
                const alerta = document.getElementById('alerta-feedback');
                const titolElement = document.getElementById('titol-feedback');
                const missatgeElement = document.getElementById('missatge-feedback');
                
                if (!alerta || !titolElement || !missatgeElement) return;
                
                titolElement.textContent = missatge;
                missatgeElement.textContent = tipus === 'exit' ? 'Bé fet!' : 'Resposta incorrecta, torna-ho a provar.';
                
                alerta.classList.remove('amagat', 'exit', 'error');
                alerta.classList.add(tipus);
                
                setTimeout(() => {
                    alerta.classList.add('amagat');
                    setTimeout(() => {
                        alerta.classList.remove(tipus);
                    }, 300);
                }, 2000);
                
                registrarAccio('Mostrat feedback: ' + missatge);
            }
        `

    return new Function("tipus", "registrarAccio", cosFuncio)(tipus, registrarAccio)
  }

  const mostrarFeedbackExit = generarFuncioFeedback("exit")
  const mostrarFeedbackError = generarFuncioFeedback("error")

  return {
    init: async function () {
      try {
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", () => {
            this.setupUI()
          })
        } else {
          this.setupUI()
        }
      } catch (error) {}
    },

    setupUI: function () {
      const elements = [
        "llista-tests",
        "llista-puntuacions",
        "btn-retorna",
        "btn-retorna-puntuacio",
        "btn-barreja",
        "formulari-puntuacio",
      ]

      elements.forEach((id) => {
        const element = document.getElementById(id)
        if (element) {
          elementsDOM.set(id, element)
        }
      })

      this.carregarTests()
      this.carregarPuntuacions()
      this.configurarEsdeveniments()

      processarAccionsPendents()
      registrarAccio("Aplicació inicialitzada")
    },

    carregarTests: async function () {
      try {
        const llistaTests = elementsDOM.get("llista-tests") || document.getElementById("llista-tests")
        if (!llistaTests) return

        const tests = await DBService.getTests()
        llistaTests.innerHTML = ""

        if (tests.length === 0) {
          llistaTests.innerHTML = '<div class="no-data">No hi ha tests disponibles</div>'
          return
        }

        const testElements = tests.map((test) => {
          const div = document.createElement("div")
          div.className = "test-item"
          div.textContent = test.nom
          div.addEventListener("click", () => this.iniciarTest(test))
          return div
        })

        testElements.forEach((element) => llistaTests.appendChild(element))
        registrarAccio("Tests carregats")
      } catch (error) {
        const llistaTests = elementsDOM.get("llista-tests") || document.getElementById("llista-tests")
        if (llistaTests) {
          llistaTests.innerHTML = '<div class="error">Error en carregar els tests</div>'
        }
      }
    },

    carregarPuntuacions: async () => {
      try {
        const llistaPuntuacions = elementsDOM.get("llista-puntuacions") || document.getElementById("llista-puntuacions")
        if (!llistaPuntuacions) return

        const puntuacions = await DBService.getHighScores()

        if (puntuacions.length === 0) {
          llistaPuntuacions.innerHTML = '<div class="no-data">Encara no hi ha puntuacions</div>'
          return
        }

        const puntuacionsOrdenades = CollectionUtils.filter(puntuacions, (p) => p.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 10)

        const htmlPuntuacions = CollectionUtils.map(
          puntuacionsOrdenades,
          (p) => `
                    <div class="puntuacio-item">
                        <span class="nom">${p.nomJugador}</span>
                        <span class="puntuacio">${p.score}</span>
                    </div>
                `,
        ).join("")

        llistaPuntuacions.innerHTML = htmlPuntuacions
        registrarAccio("Puntuacions carregades")
      } catch (error) {
        const llistaPuntuacions = elementsDOM.get("llista-puntuacions") || document.getElementById("llista-puntuacions")
        if (llistaPuntuacions) {
          llistaPuntuacions.innerHTML = '<div class="error">Error en carregar les puntuacions</div>'
        }
      }
    },

    configurarEsdeveniments: function () {
      const btnRetorna = elementsDOM.get("btn-retorna") || document.getElementById("btn-retorna")
      if (btnRetorna) {
        btnRetorna.addEventListener("click", () => {
          this.mostrarPantalla("pantalla-bienvinguda")
          if (timerInterval) {
            clearInterval(timerInterval)
          }
          sessionStorage.removeItem("progresTest")
          registrarAccio("Tornat a la pantalla principal")
        })
      }

      const btnRetornaPuntuacio =
        elementsDOM.get("btn-retorna-puntuacio") || document.getElementById("btn-retorna-puntuacio")
      if (btnRetornaPuntuacio) {
        btnRetornaPuntuacio.addEventListener("click", () => {
          this.mostrarPantalla("pantalla-bienvinguda")
          sessionStorage.removeItem("progresTest")
          registrarAccio("Tornat a la pantalla principal des de puntuació")
        })
      }

      const btnBarreja = elementsDOM.get("btn-barreja") || document.getElementById("btn-barreja")
      if (btnBarreja) {
        btnBarreja.addEventListener("click", () => {
          this.barrejarOpcions()
          registrarAccio("Opcions barrejades")
        })
      }

      const formulariPuntuacio =
        elementsDOM.get("formulari-puntuacio") || document.getElementById("formulari-puntuacio")
      if (formulariPuntuacio) {
        formulariPuntuacio.addEventListener("submit", (e) => {
          e.preventDefault()
          // Prevent double submission
          if (!isSubmittingScore) {
            this.desarPuntuacio()
          }
        })
      }
    },

    mostrarPantalla: (pantallaId) => {
      const pantalles = document.querySelectorAll(".pantalla")
      if (pantalles.length === 0) return

      pantalles.forEach((p) => p.classList.add("amagat"))

      const pantallaAMostrar = document.getElementById(pantallaId)
      if (pantallaAMostrar) {
        pantallaAMostrar.classList.remove("amagat")
        registrarAccio(`Pantalla mostrada: ${pantallaId}`)
      }
    },

    iniciarTest: function (test) {
      testActual = test
      indexSerieActual = 0
      puntuacio = 0
      tempsRestant = test.timeLimit

      if (timerInterval) {
        clearInterval(timerInterval)
      }

      restaurarProgresTest()

      this.mostrarPantalla("pantalla-test")
      this.mostrarSerieActual()
      this.iniciarTemporitzador()

      registrarAccio(`Test iniciat: ${test.nom}`)
    },

    mostrarSerieActual: function () {
      if (!testActual || !testActual.series || indexSerieActual >= testActual.series.length) return

      const serie = testActual.series[indexSerieActual]

      if (!serie.validateAnswer) {
        Object.setPrototypeOf(serie, Series.prototype)
      }

      const contenedorSerie = document.getElementById("contenidor-serie")
      const contenedorOpcions = document.getElementById("contenidor-opcions")

      if (!contenedorSerie || !contenedorOpcions) return

      contenedorSerie.innerHTML = ""
      contenedorOpcions.innerHTML = ""
      contenedorSerie.appendChild(TestRenderer.renderSeries(serie))
      contenedorOpcions.appendChild(TestRenderer.renderOptions(serie.options, DragDropHandler.handleDragStart))

      DragDropHandler.init(document.querySelectorAll(".empty-slot"), this.processarDrop.bind(this))

      const nomTest = document.getElementById("nom-test")
      const puntuacioActual = document.getElementById("puntuacio-actual")
      const serieActual = document.getElementById("serie-actual")
      const totalSeries = document.getElementById("total-series")

      if (nomTest) nomTest.textContent = testActual.nom
      if (puntuacioActual) puntuacioActual.textContent = puntuacio
      if (serieActual) serieActual.textContent = indexSerieActual + 1
      if (totalSeries) totalSeries.textContent = testActual.series.length

      const progressFill = document.getElementById("progress-fill")
      if (progressFill) {
        const percentatge = ((indexSerieActual + 1) / testActual.series.length) * 100
        progressFill.style.width = `${percentatge}%`
      }

      guardarProgresTest()
      registrarAccio(`Sèrie mostrada: ${indexSerieActual + 1}/${testActual.series.length}`)
    },

    processarDrop: function (figureId, dropZone) {
      if (!testActual || !testActual.series || indexSerieActual >= testActual.series.length) return

      const serie = testActual.series[indexSerieActual]

      if (!serie.validateAnswer) {
        Object.setPrototypeOf(serie, Series.prototype)
      }

      const correcte = serie.validateAnswer(figureId)

      const figuraDragged = document.querySelector(`[data-figure-id="${figureId}"]`)
      if (figuraDragged) {
        dropZone.textContent = figuraDragged.textContent
        dropZone.classList.add(correcte ? "correct" : "incorrect")
      }

      if (correcte) {
        puntuacio += 100
        const puntuacioActual = document.getElementById("puntuacio-actual")
        if (puntuacioActual) puntuacioActual.textContent = puntuacio

        mostrarFeedbackExit("Correcte!")

        setTimeout(() => {
          this.progresarASerieSeguent()
        }, 1000)

        registrarAccio(`Resposta correcta a la sèrie ${indexSerieActual + 1}`)
      } else {
        mostrarFeedbackError("Incorrecte, torna-ho a provar!")

        setTimeout(() => {
          dropZone.textContent = "?"
          dropZone.classList.remove("incorrect")
        }, 1500)

        registrarAccio(`Resposta incorrecta a la sèrie ${indexSerieActual + 1}`)
      }
    },

    progresarASerieSeguent: function () {
      indexSerieActual++
      if (indexSerieActual < testActual.series.length) {
        this.mostrarSerieActual()
      } else {
        this.finalitzarTest()
      }
    },

    finalitzarTest: function () {
      if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
      }

      const puntuacioFinal = document.getElementById("puntuacio-final")
      const tempsInvertit = document.getElementById("temps-invertit")

      if (puntuacioFinal) puntuacioFinal.textContent = puntuacio
      if (tempsInvertit && testActual) {
        tempsInvertit.textContent = formatTime(testActual.timeLimit - tempsRestant)
      }

      if (testActual) {
        sessionStorage.removeItem("progresTest")
      }

      this.mostrarPantalla("pantalla-puntuacio")

      if (testActual) {
        testsCompletats.add(testActual.id)
        registrarAccio(`Test completat: ${testActual.nom} amb puntuació ${puntuacio}`)
      }
    },

    iniciarTemporitzador: function () {
      if (!testActual) return

      const tempsRestantElement = document.getElementById("temps-restant")
      if (!tempsRestantElement) return

      tempsRestantElement.textContent = formatTime(tempsRestant)

      timerInterval = setInterval(() => {
        tempsRestant--
        tempsRestantElement.textContent = formatTime(tempsRestant)
        guardarProgresTest()

        if (tempsRestant <= 0) {
          this.finalitzarTest()
        }
      }, 1000)

      registrarAccio(`Temporitzador iniciat: ${formatTime(tempsRestant)}`)
    },

    barrejarOpcions: () => {
      if (!testActual || !testActual.series || indexSerieActual >= testActual.series.length) return

      const serie = testActual.series[indexSerieActual]
      serie.shuffleOptions()

      const contenedorOpcions = document.getElementById("contenidor-opcions")
      if (!contenedorOpcions) return

      contenedorOpcions.innerHTML = ""
      contenedorOpcions.appendChild(TestRenderer.renderOptions(serie.options, DragDropHandler.handleDragStart))

      registrarAccio("Opcions barrejades")
    },

    mostrarFeedback: (titol, tipus) => {
      const alerta = document.getElementById("alerta-feedback")
      const titolElement = document.getElementById("titol-feedback")
      const missatgeElement = document.getElementById("missatge-feedback")

      if (!alerta || !titolElement || !missatgeElement) return

      titolElement.textContent = titol
      missatgeElement.textContent = tipus === "exit" ? "Bé fet!" : "Resposta incorrecta, torna-ho a provar."

      alerta.classList.remove("amagat", "exit", "error")
      alerta.classList.add(tipus)

      setTimeout(() => {
        alerta.classList.add("amagat")
        setTimeout(() => {
          alerta.classList.remove(tipus)
        }, 300)
      }, 2000)

      registrarAccio(`Feedback mostrat: ${titol}`)
    },

    desarPuntuacio: async function () {
      isSubmittingScore = true // Set flag to prevent double submission

      const inputNom = document.getElementById("nom-jugador")
      if (!inputNom) {
        isSubmittingScore = false
        return
      }

      const nomJugador = inputNom.value.trim()
      const nameRegex = /^[a-zA-Z0-9]+(?:\s[a-zA-Z0-9]+)*$/
      if (!nameRegex.test(nomJugador)) {
        alert("El nom només pot contenir lletres, números i espais. Torna-ho a provar.")
        isSubmittingScore = false
        return
      }

      if (!nomJugador) {
        alert("Si us plau, introdueix el teu nom")
        isSubmittingScore = false
        return
      }

      if (!testActual) {
        isSubmittingScore = false
        return
      }

      const scoreObj = new Score(nomJugador, puntuacio, testActual.id)
      try {
        await DBService.addScore(scoreObj)

        const missatgeDesar = document.getElementById("missatge-desar")
        if (missatgeDesar) {
          missatgeDesar.classList.remove("amagat")
          setTimeout(() => {
            missatgeDesar.classList.add("amagat")
          }, 3000)
        }

        await this.carregarPuntuacions()
        inputNom.value = ""

        setTimeout(() => {
          this.mostrarPantalla("pantalla-bienvinguda")
          isSubmittingScore = false // Reset flag after completion
        }, 3000)

        registrarAccio(`Puntuació desada: ${nomJugador} - ${puntuacio}`)
      } catch (error) {
        alert("Error en desar la puntuació. Torna-ho a provar.")
        isSubmittingScore = false // Reset flag on error
      }
    },

    getHistorialAccions: () => historialAccions.getItems(),
    getTestsCompletats: () => testsCompletats,
  }
})()

export default App

