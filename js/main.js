import SampleData from './services/sample-data.js';
import App from './app.js';

/**
 * @fileOverview Aplicació de tests de sèries de figures.
 * Aquest projecte utilitza HTML5 i JavaScript (vanilla) per generar tests basats en sèries de figures.
 * Es fa servir POO basada en prototips amb JSDoc per documentar el codi.
 * La lògica inclou la gestió de Drag & Drop (API HTML5), un temporitzador, i l'emmagatzematge de dades
 * (tests i puntuacions) en indexedDB.
 * 
 * Nota: Els WebFonts s'inclouen a l'HTML per millorar la tipografia.
 */

// Inicialitzar les dades de mostra i després l'aplicació
async function initializeApp() {
    try {
        await SampleData.initialize();
        App.init();
    } catch (error) {
        console.error("Error initializing application:", error);
    }
}

// Inicialitzar l'aplicació quan es carregui el document
document.addEventListener('DOMContentLoaded', function() {
    console.log("Document loaded, initializing app...");
    initializeApp();
});

// Alternativa per inicialitzar l'aplicació si el document ja està carregat
if (document.readyState !== 'loading') {
    console.log("Document already loaded, initializing app...");
    initializeApp();
}