/**
 * RENDERER.JS
 * Convierte el JSON de bloques en HTML limpio para la landing page final
 * Genera código semántico y optimizado para producción
 */

class Renderer {
    /**
     * Renderiza un array de bloques a HTML completo
     * @param {Array} blocks - Array de objetos de bloques
     * @returns {String} - HTML completo de la página
     */
    static renderToHTML(blocks) {
        const blockHTML = blocks.map(block => this.renderBlock(block)).join('\n');
        
        return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tocca Amalfi Coast</title>
    <style>
        ${this.getBaseStyles()}
    </style>
</head>
<body>
    <main class="landing-page">
        ${blockHTML}
    </main>
</body>
</html>`;
    }

    /**
     * Renderiza un bloque individual
     * @param {Object} block - Objeto de bloque con tipo y propiedades
     * @returns {String} - HTML del bloque
     */
    static renderBlock(block) {
        const renderers = {
            'text': this.renderTextBlock,
            'image': this.renderImageBlock,
            'button': this.renderButtonBlock,
            'section': this.renderSectionBlock
        };

        const renderer = renderers[block.type];
        if (!renderer) {
            console.warn(`Unknown block type: ${block.type}`);
            return '';
        }

        return renderer.call(this, block);
    }

    /**
     * Renderiza bloque de texto
     */
    static renderTextBlock(block) {
        const props = block.properties;
        const tag = props.tag || 'p';
        const styles = this.buildStyles({
            color: props.textColor,
            fontSize: props.fontSize ? `${props.fontSize}px` : null,
            textAlign: props.textAlign,
            fontWeight: props.fontWeight,
            marginTop: props.marginTop ? `${props.marginTop}px` : null,
            marginBottom: props.marginBottom ? `${props.marginBottom}px` : null,
            paddingTop: props.paddingTop ? `${props.paddingTop}px` : null,
            paddingBottom: props.paddingBottom ? `${props.paddingBottom}px` : null
        });

        return `<${tag} class="text-block" style="${styles}">${props.content || 'Tu texto aquí'}</${tag}>`;
    }

    /**
     * Renderiza bloque de imagen
     */
    static renderImageBlock(block) {
        const props = block.properties;
        
        if (!props.src) {
            return `<div class="image-block image-placeholder">
                <p>Imagen no disponible</p>
            </div>`;
        }

        const styles = this.buildStyles({
            width: props.width || '100%',
            maxWidth: props.maxWidth ? `${props.maxWidth}px` : null,
            marginTop: props.marginTop ? `${props.marginTop}px` : null,
            marginBottom: props.marginBottom ? `${props.marginBottom}px` : null,
            textAlign: props.alignment || 'center'
        });

        const imgStyles = this.buildStyles({
            borderRadius: props.borderRadius ? `${props.borderRadius}px` : null
        });

        return `<div class="image-block" style="${styles}">
            <img src="${props.src}" alt="${props.alt || ''}" style="${imgStyles}" loading="lazy">
        </div>`;
    }

    /**
     * Renderiza bloque de botón
     */
    static renderButtonBlock(block) {
        const props = block.properties;
        
        const containerStyles = this.buildStyles({
            textAlign: props.alignment || 'center',
            marginTop: props.marginTop ? `${props.marginTop}px` : null,
            marginBottom: props.marginBottom ? `${props.marginBottom}px` : null
        });

        const btnStyles = this.buildStyles({
            backgroundColor: props.backgroundColor || '#4A9A92',
            color: props.textColor || '#ffffff',
            fontSize: props.fontSize ? `${props.fontSize}px` : '16px',
            padding: `${props.paddingVertical || 12}px ${props.paddingHorizontal || 24}px`,
            borderRadius: props.borderRadius ? `${props.borderRadius}px` : '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: props.fontWeight || '600',
            textDecoration: 'none',
            display: 'inline-block',
            transition: 'all 0.3s ease'
        });

        const href = props.link || '#';
        const text = props.text || 'Click aquí';
        const target = props.openNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';

        return `<div class="button-block" style="${containerStyles}">
            <a href="${href}" style="${btnStyles}"${target}>${text}</a>
        </div>`;
    }

    /**
     * Renderiza bloque de sección
     */
    static renderSectionBlock(block) {
        const props = block.properties;
        
        const styles = this.buildStyles({
            backgroundColor: props.backgroundColor,
            paddingTop: props.paddingTop ? `${props.paddingTop}px` : '40px',
            paddingBottom: props.paddingBottom ? `${props.paddingBottom}px` : '40px',
            paddingLeft: props.paddingLeft ? `${props.paddingLeft}px` : '20px',
            paddingRight: props.paddingRight ? `${props.paddingRight}px` : '20px',
            marginTop: props.marginTop ? `${props.marginTop}px` : null,
            marginBottom: props.marginBottom ? `${props.marginBottom}px` : null
        });

        const content = props.content || '<p>Contenido de sección</p>';

        return `<section class="section-block" style="${styles}">
            <div class="section-content" style="max-width: ${props.maxWidth || 1200}px; margin: 0 auto;">
                ${content}
            </div>
        </section>`;
    }

    /**
     * Construye string de estilos CSS inline desde objeto
     * @param {Object} styles - Objeto con propiedades CSS
     * @returns {String} - String de estilos CSS
     */
    static buildStyles(styles) {
        return Object.entries(styles)
            .filter(([, value]) => value !== null && value !== undefined)
            .map(([key, value]) => {
                // Convertir camelCase a kebab-case
                const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                return `${cssKey}: ${value}`;
            })
            .join('; ');
    }

    /**
     * Retorna los estilos base para la landing page
     * @returns {String} - CSS base
     */
    static getBaseStyles() {
        return `
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                color: #333;
            }
            
            .landing-page {
                width: 100%;
                overflow-x: hidden;
            }
            
            .text-block {
                margin: 0;
            }
            
            .image-block img {
                max-width: 100%;
                height: auto;
                display: block;
            }
            
            .image-placeholder {
                background: #f3f4f6;
                padding: 40px;
                text-align: center;
                color: #9ca3af;
                border-radius: 8px;
            }
            
            .button-block a:hover {
                opacity: 0.9;
                transform: translateY(-2px);
            }
            
            .section-block {
                width: 100%;
            }
            
            @media (max-width: 768px) {
                .text-block {
                    font-size: 14px;
                }
                
                .button-block a {
                    font-size: 14px;
                    padding: 10px 20px;
                }
                
                .section-block {
                    padding-left: 16px;
                    padding-right: 16px;
                }
            }
        `;
    }

    /**
     * Renderiza una vista previa en un elemento DOM
     * @param {Array} blocks
     * @param {HTMLElement} container
     */
    static renderPreview(blocks, container) {
        const html = blocks.map(block => this.renderBlock(block)).join('\n');
        container.innerHTML = html;
    }
}

// Exportar para uso en módulos
export default Renderer;
