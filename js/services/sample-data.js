import Figure from '../models/figure.js';
import Series from '../models/series.js';
import Test from '../models/test.js';
import DBService from '../services/db-service.js';

/**
 * Mòdul per inicialitzar tests predefinits.
 * @namespace
 */
const SampleData = (function() {
    // Figures basades en personatges de còmic
    const figuresComic = [
        new Figure('p1', 'Iron Man', '🦾', { color: 'vermell', poder: 'tecnològic' }),
        new Figure('p2', 'Captain America', '🛡️', { color: 'blau', lideratge: 'alt' }),
        new Figure('p3', 'Thor', '⚡', { poder: 'diví', arma: 'martell' }),
        new Figure('p4', 'Hulk', '💚', { força: 'alta', estat: 'enfadat' })
    ];
    // Figures basades en personatges d'animació
    const figuresAnimat = [
        new Figure('a1', 'Bob Esponja', '🧽', { color: 'groc', personalitat: 'optimista' }),
        new Figure('a2', 'Patric', '🐙', { color: 'rosa', intel·ligència: 'limitada' }),
        new Figure('a3', 'Calamarsa', '🦑', { habilitats: 'multitasking', velocitat: 'alta' })
    ];

    // Sèries per al test de còmics
    const seriesComic1 = new Series(
        'sC1',
        [figuresComic[0], figuresComic[1]],
        figuresComic,
        0  // La resposta correcta és Iron Man
    );
    const seriesComic2 = new Series(
        'sC2',
        [figuresComic[2], figuresComic[3]],
        figuresComic,
        1  // La resposta correcta és Hulk
    );
    const testComic = new Test('tComic', 'Superherois de Còmic', [seriesComic1, seriesComic2], 90);

    // Sèries per al test d'animació
    const seriesAnimat1 = new Series(
        'sA1',
        [figuresAnimat[0]],
        figuresAnimat,
        0  // Resposta: Bob Esponja
    );
    const seriesAnimat2 = new Series(
        'sA2',
        [figuresAnimat[1], figuresAnimat[2]],
        figuresAnimat,
        1  // Resposta: Calamarsa
    );
    const testAnimat = new Test('tAnimat', 'Personatges d\'Animació', [seriesAnimat1, seriesAnimat2], 60);

    return {
        /**
         * Inicialitza la BD i desa els tests predefinits.
         * @returns {Promise}
         */
        initialize: async function() {
            try {
                await DBService.init();
                await DBService.addTest(testComic);
                await DBService.addTest(testAnimat);
                console.log("Sample data initialized successfully");
            } catch (error) {
                console.error("Error initializing sample data:", error);
            }
        }
    };
})();

export default SampleData;