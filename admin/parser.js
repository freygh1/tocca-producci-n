/**
 * PARSER.JS
 * Analiza HTML existente y lo convierte en bloques editables
 * Permite importar páginas actuales de Tocca al editor
 */

class Parser {
    /**
     * Parsea un documento HTML completo y extrae bloques
     * @param {String} html - HTML completo de la página
     * @returns {Array} - Array de bloques
     */
    static parseHTML(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const blocks = [];

        // Buscar en el main o body
        const mainContent = doc.querySelector('main') || doc.body;
        
        if (!mainContent) {
            console.warn('No se encontró contenido principal');
            return blocks;
        }

        // Parsear elementos hijos recursivamente
        this.parseElement(mainContent, blocks);

        return blocks;
    }

    /**
     * Parsea un elemento y sus hijos
     */
    static parseElement(element, blocks, depth = 0) {
        // Ignorar scripts, styles, nav, header, footer
        const ignoreTags = ['SCRIPT', 'STYLE', 'NAV', 'HEADER', 'FOOTER', 'ASIDE'];
        
        Array.from(element.children).forEach(child => {
            if (ignoreTags.includes(child.tagName)) return;

            // Detectar tipo de bloque basado en estructura
            const block = this.detectBlockType(child);
            
            if (block) {
                blocks.push(block);
            } else if (child.children.length > 0) {
                // Si no es un bloque reconocido, parsear sus hijos
                this.parseElement(child, blocks, depth + 1);
            }
        });
    }

    /**
     * Detecta el tipo de bloque según el elemento
     */
    static detectBlockType(element) {
        const tag = element.tagName.toLowerCase();
        
        // Bloque de imagen
        if (tag === 'img') {
            return this.parseImageBlock(element);
        }
        
        // Contiene solo una imagen
        const img = element.querySelector('img:only-child');
        if (img) {
            return this.parseImageBlock(img, element);
        }

        // Bloque de botón/enlace
        const link = element.querySelector('a.btn-primary-large, a.btn-secondary-large, button');
        if (link && this.isButtonLike(element)) {
            return this.parseButtonBlock(link);
        }

        // Bloque de texto (títulos y párrafos)
        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'].includes(tag)) {
            return this.parseTextBlock(element);
        }

        // Sección/contenedor
        if (tag === 'section' || element.classList.contains('section')) {
            return this.parseSectionBlock(element);
        }

        return null;
    }

    /**
     * Verifica si un elemento es un botón
     */
    static isButtonLike(element) {
        const text = element.textContent.trim();
        const hasButton = element.querySelector('a, button');
        return hasButton && text.length < 100; // Los botones son cortos
    }

    /**
     * Parsea bloque de texto
     */
    static parseTextBlock(element) {
        const tag = element.tagName.toLowerCase();
        const styles = window.getComputedStyle(element);
        
        return {
            id: this.generateId(),
            type: 'text',
            properties: {
                tag: tag,
                content: element.innerHTML,
                textColor: this.rgbToHex(styles.color) || '#333333',
                fontSize: parseInt(styles.fontSize) || 16,
                textAlign: styles.textAlign || 'left',
                fontWeight: styles.fontWeight === 'bold' || parseInt(styles.fontWeight) >= 600 ? 'bold' : 'normal',
                marginTop: parseInt(styles.marginTop) || 0,
                marginBottom: parseInt(styles.marginBottom) || 16,
                paddingTop: parseInt(styles.paddingTop) || 0,
                paddingBottom: parseInt(styles.paddingBottom) || 0
            }
        };
    }

    /**
     * Parsea bloque de imagen
     */
    static parseImageBlock(img, container = null) {
        const element = container || img;
        const styles = window.getComputedStyle(element);
        
        return {
            id: this.generateId(),
            type: 'image',
            properties: {
                src: img.src || img.getAttribute('src'),
                alt: img.alt || '',
                width: '100%',
                maxWidth: parseInt(img.style.maxWidth) || 800,
                borderRadius: parseInt(styles.borderRadius) || 0,
                alignment: styles.textAlign || 'center',
                marginTop: parseInt(styles.marginTop) || 16,
                marginBottom: parseInt(styles.marginBottom) || 16
            }
        };
    }

    /**
     * Parsea bloque de botón
     */
    static parseButtonBlock(link) {
        const styles = window.getComputedStyle(link);
        const container = link.closest('div');
        const containerStyles = container ? window.getComputedStyle(container) : null;
        
        return {
            id: this.generateId(),
            type: 'button',
            properties: {
                text: link.textContent.trim(),
                link: link.href || '#',
                backgroundColor: this.rgbToHex(styles.backgroundColor) || '#4A9A92',
                textColor: this.rgbToHex(styles.color) || '#ffffff',
                fontSize: parseInt(styles.fontSize) || 16,
                fontWeight: styles.fontWeight === 'bold' || parseInt(styles.fontWeight) >= 600 ? '600' : 'normal',
                paddingVertical: parseInt(styles.paddingTop) || 12,
                paddingHorizontal: parseInt(styles.paddingLeft) || 24,
                borderRadius: parseInt(styles.borderRadius) || 8,
                alignment: containerStyles ? containerStyles.textAlign : 'center',
                openNewTab: link.target === '_blank',
                marginTop: containerStyles ? parseInt(containerStyles.marginTop) || 16 : 16,
                marginBottom: containerStyles ? parseInt(containerStyles.marginBottom) || 16 : 16
            }
        };
    }

    /**
     * Parsea bloque de sección
     */
    static parseSectionBlock(section) {
        const styles = window.getComputedStyle(section);
        
        return {
            id: this.generateId(),
            type: 'section',
            properties: {
                backgroundColor: this.rgbToHex(styles.backgroundColor) || 'transparent',
                paddingTop: parseInt(styles.paddingTop) || 40,
                paddingBottom: parseInt(styles.paddingBottom) || 40,
                paddingLeft: parseInt(styles.paddingLeft) || 20,
                paddingRight: parseInt(styles.paddingRight) || 20,
                maxWidth: 1200,
                marginTop: parseInt(styles.marginTop) || 0,
                marginBottom: parseInt(styles.marginBottom) || 0,
                content: section.innerHTML
            }
        };
    }

    /**
     * Carga y parsea una página existente desde URL
     */
    static async loadPage(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Error cargando página');
            
            const html = await response.text();
            return this.parseHTML(html);
        } catch (error) {
            console.error('Error al cargar página:', error);
            throw error;
        }
    }

    /**
     * Carga páginas de Tocca disponibles
     */
    static async loadToccaPages() {
        console.log('🔎 Parser.loadToccaPages() iniciado');
        const pages = [
            { name: 'Página Principal', url: '../index.html', file: 'index.html' },
            { name: 'Signature Journey', url: '../the_signature_journey.html', file: 'the_signature_journey.html' },
            { name: 'Bespoke Journey', url: '../the_bespoke_journey.html', file: 'the_bespoke_journey.html' },
            { name: 'FAQ', url: '../faq.html', file: 'faq.html' },
            { name: 'Amalfi Journey', url: '../amalfi-journey.html', file: 'amalfi-journey.html' }
        ];

        const availablePages = [];

        for (const page of pages) {
            try {
                console.log(`  Verificando: ${page.name} (${page.url})`);
                const response = await fetch(page.url, { method: 'HEAD' });
                if (response.ok) {
                    console.log(`    ✅ ${page.name} disponible`);
                    availablePages.push(page);
                } else {
                    console.log(`    ❌ ${page.name} no encontrada (${response.status})`);
                }
            } catch (error) {
                console.log(`    ❌ ${page.name} error: ${error.message}`);
            }
        }

        console.log(`📊 Total páginas disponibles: ${availablePages.length}`);
        return availablePages;
    }

    /**
     * Extrae contenido específico de secciones importantes
     */
    static extractSectionContent(html, sectionId) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const section = doc.getElementById(sectionId);
        
        if (!section) return null;
        
        const blocks = [];
        this.parseElement(section, blocks);
        return blocks;
    }

    /**
     * Convierte RGB a Hex
     */
    static rgbToHex(rgb) {
        if (!rgb) return null;
        if (rgb.startsWith('#')) return rgb;
        
        const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/);
        if (!match) return null;
        
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    /**
     * Genera ID único para bloques
     */
    static generateId() {
        return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Analiza la estructura de una página y sugiere bloques
     */
    static analyzePage(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        return {
            title: doc.querySelector('title')?.textContent || 'Sin título',
            sections: doc.querySelectorAll('section').length,
            images: doc.querySelectorAll('img').length,
            buttons: doc.querySelectorAll('a, button').length,
            headings: {
                h1: doc.querySelectorAll('h1').length,
                h2: doc.querySelectorAll('h2').length,
                h3: doc.querySelectorAll('h3').length
            }
        };
    }

    /**
     * Extrae solo el contenido editable (ignora header, footer, nav)
     */
    static extractEditableContent(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Remover elementos no editables
        const removeSelectors = [
            'header.main-header',
            'nav.navbar',
            'footer',
            'script',
            'style',
            '.back-to-top',
            '.home-button',
            '.contact-menu',
            '#requestModal',
            '#preview-modal'
        ];
        
        removeSelectors.forEach(selector => {
            doc.querySelectorAll(selector).forEach(el => el.remove());
        });
        
        // Obtener contenido principal
        const main = doc.querySelector('main');
        if (main) {
            const blocks = [];
            this.parseElement(main, blocks);
            return blocks;
        }
        
        return [];
    }
}

// Exportar para uso en módulos
export default Parser;
