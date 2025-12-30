/**
 * STORAGE.JS
 * Maneja la persistencia de datos usando localStorage
 * Simula un backend simple para guardar/cargar el contenido
 */

const STORAGE_KEY = 'tocca_landing_data';
const HISTORY_KEY = 'tocca_landing_history';
const MAX_HISTORY = 50;

class Storage {
    /**
     * Guarda el estado completo de la landing page
     * @param {Array} blocks - Array de objetos de bloques
     */
    static save(blocks) {
        try {
            const data = {
                blocks: blocks,
                lastModified: new Date().toISOString(),
                version: '1.0'
            };
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            
            // Agregar al historial
            this.addToHistory(blocks);
            
            return { success: true };
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Carga el estado guardado
     * @returns {Object} - Objeto con blocks y metadata
     */
    static load() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            
            if (!data) {
                return { blocks: [], lastModified: null };
            }
            
            const parsed = JSON.parse(data);
            return {
                blocks: parsed.blocks || [],
                lastModified: parsed.lastModified,
                version: parsed.version
            };
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return { blocks: [], lastModified: null };
        }
    }

    /**
     * Limpia todo el storage
     */
    static clear() {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(HISTORY_KEY);
    }

    /**
     * Exporta los datos como JSON descargable
     * @param {Array} blocks
     */
    static exportJSON(blocks) {
        const data = {
            blocks: blocks,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tocca-landing-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Importa datos desde un archivo JSON
     * @param {File} file
     * @returns {Promise}
     */
    static importJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    resolve(data.blocks || []);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    }

    /**
     * Agrega un snapshot al historial (para undo/redo)
     * @param {Array} blocks
     */
    static addToHistory(blocks) {
        try {
            let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
            
            // Agregar nuevo estado
            history.push({
                blocks: JSON.parse(JSON.stringify(blocks)), // Deep clone
                timestamp: Date.now()
            });
            
            // Limitar el tamaño del historial
            if (history.length > MAX_HISTORY) {
                history = history.slice(-MAX_HISTORY);
            }
            
            localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        } catch (error) {
            console.error('Error adding to history:', error);
        }
    }

    /**
     * Obtiene el historial completo
     * @returns {Array}
     */
    static getHistory() {
        try {
            return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
        } catch (error) {
            console.error('Error getting history:', error);
            return [];
        }
    }

    /**
     * Limpia el historial
     */
    static clearHistory() {
        localStorage.removeItem(HISTORY_KEY);
    }
}

// Exportar para uso en módulos
export default Storage;
