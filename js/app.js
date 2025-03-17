import Series from './models/series.js';
import Score from './models/score.js';
import DBService from './services/db-service.js';
import DragDropHandler from './ui/drag-drop-handler.js';
import TestRenderer from './ui/test-renderer.js';
import formatTime from './utils/formatTime.js';

/**
 * Mòdul principal de l'aplicació.
 * @namespace
 */
const App = (function() {
    let testActual = null;
    let indexSerieActual = 0;
    let puntuacio = 0;
    let tempsRestant = 0;
    let timerInterval = null;

    /**
     * Verifica si existeix un element del DOM
     * @param {string} selector - El selector CSS de l'element
     * @returns {boolean} - Retorna true si l'element existeix
     */
    function elementExists(selector) {
        return document.querySelector(selector) !== null;
    }

    return {
        /**
         * Inicialitza l'aplicació.
         */
        init: async function() {
            try {
                console.log("Initializing application...");
                
                // Esperar a que el DOM estigui completament carregat
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', () => {
                        this.setupUI();
                    });
                } else {
                    this.setupUI();
                }
            } catch (error) {
                console.error("Error initializing application:", error);
            }
        },
        /**
         * Configura la interfície d'usuari després de carregar el DOM
         */
        setupUI: function() {
            console.log("Setting up UI...");
            this.carregarTests();
            this.carregarPuntuacions();
            this.configurarEsdeveniments();
        },

        /**
         * Carrega i mostra la llista de tests disponibles.
         */
        carregarTests: async function() {
            try {
                const llistaTests = document.getElementById('llista-tests');
                if (!llistaTests) {
                    console.error("Element 'llista-tests' not found in the DOM");
                    return;
                }
                
                const tests = await DBService.getTests();
                llistaTests.innerHTML = '';
                
                if (tests.length === 0) {
                    llistaTests.innerHTML = '<div class="no-data">No hi ha tests disponibles</div>';
                    return;
                }
                
                tests.forEach(test => {
                    const div = document.createElement('div');
                    div.className = 'test-item';
                    div.textContent = test.nom;
                    div.addEventListener('click', () => this.iniciarTest(test));
                    llistaTests.appendChild(div);
                });
            } catch (error) {
                console.error("Error loading tests:", error);
                const llistaTests = document.getElementById('llista-tests');
                if (llistaTests) {
                    llistaTests.innerHTML = '<div class="error">Error en carregar els tests</div>';
                }
            }
        },

        /**
         * Carrega i mostra el rànquing de puntuacions.
         */
        carregarPuntuacions: async function() {
            try {
                const llistaPuntuacions = document.getElementById('llista-puntuacions');
                if (!llistaPuntuacions) {
                    console.error("Element 'llista-puntuacions' not found in the DOM");
                    return;
                }
                
                const puntuacions = await DBService.getHighScores();
                
                if (puntuacions.length === 0) {
                    llistaPuntuacions.innerHTML = '<div class="no-data">Encara no hi ha puntuacions</div>';
                    return;
                }
                
                const ordenat = puntuacions.sort((a, b) => b.score - a.score).slice(0, 10);
                llistaPuntuacions.innerHTML = ordenat.map(p => `
                    <div class="puntuacio-item">
                        <span class="nom">${p.nomJugador}</span>
                        <span class="puntuacio">${p.score}</span>
                    </div>
                `).join('');
            } catch (error) {
                console.error("Error loading scores:", error);
                const llistaPuntuacions = document.getElementById('llista-puntuacions');
                if (llistaPuntuacions) {
                    llistaPuntuacions.innerHTML = '<div class="error">Error en carregar les puntuacions</div>';
                }
            }
        },

        /**
         * Configura els esdeveniments dels elements de la interfície.
         */
        configurarEsdeveniments: function() {
            const btnRetorna = document.getElementById('btn-retorna');
            if (btnRetorna) {
                btnRetorna.addEventListener('click', () => {
                    this.mostrarPantalla('pantalla-bienvinguda');
                    // Atura el temporitzador si està actiu
                    if (timerInterval) {
                        clearInterval(timerInterval);
                    }
                });
            } else {
                console.warn("Element 'btn-retorna' not found");
            }
            
            const btnRetornaPuntuacio = document.getElementById('btn-retorna-puntuacio');
            if (btnRetornaPuntuacio) {
                btnRetornaPuntuacio.addEventListener('click', () => {
                    this.mostrarPantalla('pantalla-bienvinguda');
                });
            }
            
            const btnBarreja = document.getElementById('btn-barreja');
            if (btnBarreja) {
                btnBarreja.addEventListener('click', () => {
                    this.barrejarOpcions();
                });
            } else {
                console.warn("Element 'btn-barreja' not found");
            }
            
            const formulariPuntuacio = document.getElementById('formulari-puntuacio');
            if (formulariPuntuacio) {
                formulariPuntuacio.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.desarPuntuacio();
                });
            } else {
                console.warn("Element 'formulari-puntuacio' not found");
            }
        },

        /**
         * Mostra la pantalla indicada.
         * @param {string} pantallaId Identificador de la pantalla.
         */
        mostrarPantalla: function(pantallaId) {
            const pantalles = document.querySelectorAll('.pantalla');
            if (pantalles.length === 0) {
                console.error("No elements with class 'pantalla' found");
                return;
            }
            
            pantalles.forEach(p => p.classList.add('amagat'));
            
            const pantallaAMostrar = document.getElementById(pantallaId);
            if (pantallaAMostrar) {
                pantallaAMostrar.classList.remove('amagat');
            } else {
                console.error(`Element with id '${pantallaId}' not found`);
            }
        },

        /**
         * Inicia el test seleccionat.
         * @param {Test} test Test seleccionat.
         */
        iniciarTest: function(test) {
            testActual = test;
            indexSerieActual = 0;
            puntuacio = 0;
            tempsRestant = test.timeLimit;
            
            // Aturar qualsevol temporitzador anterior si existeix
            if (timerInterval) {
                clearInterval(timerInterval);
            }
            
            this.mostrarPantalla('pantalla-test');
            this.mostrarSerieActual();
            this.iniciarTemporitzador();
        },

        /**
         * Mostra la sèrie actual del test.
         */
        mostrarSerieActual: function() {
            if (!testActual || !testActual.series || indexSerieActual >= testActual.series.length) {
                console.error("Invalid test or series index");
                return;
            }
            
            const serie = testActual.series[indexSerieActual];
            
            // Assegurar-se que la sèrie té el prototip correcte
            if (!serie.validateAnswer) {
                Object.setPrototypeOf(serie, Series.prototype);
            }
            
            const contenedorSerie = document.getElementById('contenidor-serie');
            const contenedorOpcions = document.getElementById('contenidor-opcions');
            
            if (!contenedorSerie || !contenedorOpcions) {
                console.error("Required containers not found");
                return;
            }
            
            contenedorSerie.innerHTML = '';
            contenedorOpcions.innerHTML = '';
            contenedorSerie.appendChild(TestRenderer.renderSeries(serie));
            contenedorOpcions.appendChild(TestRenderer.renderOptions(serie.options, DragDropHandler.handleDragStart));
            
            DragDropHandler.init(document.querySelectorAll('.empty-slot'), this.processarDrop.bind(this));
            
            // Actualitza els comptadors i informació
            const nomTest = document.getElementById('nom-test');
            const puntuacioActual = document.getElementById('puntuacio-actual');
            const serieActual = document.getElementById('serie-actual');
            const totalSeries = document.getElementById('total-series');
            
            if (nomTest) nomTest.textContent = testActual.nom;
            if (puntuacioActual) puntuacioActual.textContent = puntuacio;
            if (serieActual) serieActual.textContent = indexSerieActual + 1;
            if (totalSeries) totalSeries.textContent = testActual.series.length;
        },

        /**
         * Processa l'esdeveniment de drop en la casella de resposta.
         * @param {string} figureId Identificador de la figura.
         * @param {HTMLElement} dropZone Element on s'ha fet el drop.
         */
        processarDrop: function(figureId, dropZone) {
            if (!testActual || !testActual.series || indexSerieActual >= testActual.series.length) {
                console.error("Invalid test state during drop processing");
                return;
            }
            
            const serie = testActual.series[indexSerieActual];
            
            // Verificar i restaurar el prototip si és necessari
            if (!serie.validateAnswer) {
                Object.setPrototypeOf(serie, Series.prototype);
            }
            
            const correcte = serie.validateAnswer(figureId);
            
            // Actualitza visualment la zona de drop amb la figura seleccionada
            const figuraDragged = document.querySelector(`[data-figure-id="${figureId}"]`);
            if (figuraDragged) {
                dropZone.textContent = figuraDragged.textContent;
                dropZone.classList.add(correcte ? 'correct' : 'incorrect');
            }
            
            if (correcte) {
                puntuacio += 100;
                const puntuacioActual = document.getElementById('puntuacio-actual');
                if (puntuacioActual) puntuacioActual.textContent = puntuacio;
                
                this.mostrarFeedback('Correcte!', 'exit');
                
                // Donar temps per veure el feedback abans de continuar
                setTimeout(() => {
                    this.progresarASerieSeguent();
                }, 1000);
            } else {
                this.mostrarFeedback('Incorrecte, torna-ho a provar!', 'error');
                
                // Netejar la zona de drop després d'un moment
                setTimeout(() => {
                    dropZone.textContent = '?';
                    dropZone.classList.remove('incorrect');
                }, 1500);
            }
        },

        /**
         * Progrés a la següent sèrie o finalitza el test si s'han acabat.
         */
        progresarASerieSeguent: function() {
            indexSerieActual++;
            if (indexSerieActual < testActual.series.length) {
                this.mostrarSerieActual();
            } else {
                this.finalitzarTest();
            }
        },

        /**
         * Finalitza el test, atura el temporitzador i mostra la pantalla de puntuació.
         */
        finalitzarTest: function() {
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
            
            const puntuacioFinal = document.getElementById('puntuacio-final');
            const tempsInvertit = document.getElementById('temps-invertit');
            
            if (puntuacioFinal) puntuacioFinal.textContent = puntuacio;
            if (tempsInvertit && testActual) {
                tempsInvertit.textContent = formatTime(testActual.timeLimit - tempsRestant);
            }
            
            this.mostrarPantalla('pantalla-puntuacio');
        },

        /**
         * Inicia el temporitzador del test.
         */
        iniciarTemporitzador: function() {
            if (!testActual) {
                console.error("Cannot start timer: no active test");
                return;
            }
            
            const tempsRestantElement = document.getElementById('temps-restant');
            if (!tempsRestantElement) {
                console.error("Element 'temps-restant' not found");
                return;
            }
            
            // Actualitzar immediatament per primera vegada
            tempsRestantElement.textContent = formatTime(tempsRestant);
            
            timerInterval = setInterval(() => {
                tempsRestant--;
                tempsRestantElement.textContent = formatTime(tempsRestant);
                
                if (tempsRestant <= 0) {
                    this.finalitzarTest();
                }
            }, 1000);
        },

        /**
         * Barreja les opcions de la sèrie actual.
         */
        barrejarOpcions: function() {
            if (!testActual || !testActual.series || indexSerieActual >= testActual.series.length) {
                console.error("Cannot shuffle options: invalid test state");
                return;
            }
            
            const serie = testActual.series[indexSerieActual];
            
            // Algoritme de Fisher-Yates per barrejar
            for (let i = serie.options.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [serie.options[i], serie.options[j]] = [serie.options[j], serie.options[i]];
            }
            
            const contenedorOpcions = document.getElementById('contenidor-opcions');
            if (!contenedorOpcions) {
                console.error("Element 'contenidor-opcions' not found");
                return;
            }
            
            contenedorOpcions.innerHTML = '';
            contenedorOpcions.appendChild(TestRenderer.renderOptions(serie.options, DragDropHandler.handleDragStart));
        },

        /**
         * Mostra un missatge de feedback temporal.
         * @param {string} titol Títol del missatge.
         * @param {string} tipus Tipus del missatge ('exit' o 'error').
         */
        mostrarFeedback: function(titol, tipus) {
            const alerta = document.getElementById('alerta-feedback');
            const titolElement = document.getElementById('titol-feedback');
            const missatgeElement = document.getElementById('missatge-feedback');
            
            if (!alerta || !titolElement || !missatgeElement) {
                console.error("Feedback elements not found");
                return;
            }
            
            titolElement.textContent = titol;
            missatgeElement.textContent = tipus === 'exit' ? 'Bé fet!' : 'Resposta incorrecta, torna-ho a provar.';
            
            // Afegir classe CSS segons el tipus de feedback
            alerta.classList.remove('amagat', 'exit', 'error');
            alerta.classList.add(tipus);
            
            // Mostrar i després amagar
            setTimeout(() => {
                alerta.classList.add('amagat');
                setTimeout(() => {
                    alerta.classList.remove(tipus);
                }, 300);
            }, 2000);
        },

        /**
         * Desa la puntuació del jugador a la base de dades.
         */
        desarPuntuacio: async function() {
            const inputNom = document.getElementById('nom-jugador');
            if (!inputNom) {
                console.error("Element 'nom-jugador' not found");
                return;
            }
            
            const nomJugador = inputNom.value.trim();
            if (!nomJugador) {
                alert("Si us plau, introdueix el teu nom");
                return;
            }
            
            if (!testActual) {
                console.error("Cannot save score: no active test");
                return;
            }
            
            const scoreObj = new Score(nomJugador, puntuacio, testActual.id);
            try {
                await DBService.addScore(scoreObj);
                
                const missatgeDesar = document.getElementById('missatge-desar');
                if (missatgeDesar) {
                    missatgeDesar.classList.remove('amagat');
                    setTimeout(() => {
                        missatgeDesar.classList.add('amagat');
                    }, 3000);
                }
                
                await this.carregarPuntuacions();
                
                // Netejar el formulari
                inputNom.value = '';
                
                // Opcional: tornar a la pantalla principal després d'un temps
                setTimeout(() => {
                    this.mostrarPantalla('pantalla-bienvinguda');
                }, 3000);
                
            } catch (error) {
                console.error("Error saving score:", error);
                alert("Error en desar la puntuació. Torna-ho a provar.");
            }
        }
    }; // Final del return del mòdul App
})(); // Final de la IIFE del mòdul App

export default App;