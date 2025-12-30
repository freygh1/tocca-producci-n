/**
 * EDITOR.JS
 * Controlador principal del editor visual
 * Maneja drag & drop, selección de bloques, edición y sincronización
 */

import Storage from './storage.js';
import Renderer from './renderer.js';
import Parser from './parser.js';

console.log('✅ Editor.js cargado');

class Editor {
    constructor() {
        // Estado del editor
        this.blocks = [];
        this.selectedBlock = null;
        this.draggedElement = null;
        this.history = [];
        this.historyIndex = -1;
        this.currentPage = null; // Página actual siendo editada
        
        // Referencias DOM
        this.canvas = document.getElementById('canvas');
        this.propertiesPanel = document.getElementById('properties-panel');
        this.propertiesSubtitle = document.getElementById('properties-subtitle');
        
        // Inicializar
        this.init();
    }

    /**
     * Inicializa el editor
     */
    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.renderCanvas();
        
        console.log('✅ Editor inicializado');
    }

    /**
     * Configura todos los event listeners
     */
    setupEventListeners() {
        // Drag & Drop desde sidebar
        document.querySelectorAll('.block-item').forEach(item => {
            item.addEventListener('dragstart', (e) => this.handleDragStart(e));
            item.addEventListener('dragend', (e) => this.handleDragEnd(e));
        });

        // Drop zone en canvas
        this.canvas.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.canvas.addEventListener('drop', (e) => this.handleDrop(e));

        // Botones de header
        document.getElementById('btn-load-page').addEventListener('click', () => this.showPageSelector());
        document.getElementById('btn-export').addEventListener('click', () => this.exportPage());
        document.getElementById('btn-save').addEventListener('click', () => this.saveChanges());
        document.getElementById('btn-preview').addEventListener('click', () => this.showPreview());
        
        // Botones de toolbar
        document.getElementById('btn-undo').addEventListener('click', () => this.undo());
        document.getElementById('btn-redo').addEventListener('click', () => this.redo());
        document.getElementById('btn-clear').addEventListener('click', () => this.clearAll());
        
        // Modales
        document.getElementById('modal-close').addEventListener('click', () => this.closePreview());
        document.getElementById('page-modal-close').addEventListener('click', () => this.closePageSelector());
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) {
                    this.closePreview();
                    this.closePageSelector();
                }
            });
        });

        // Click fuera del canvas para deseleccionar
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.canvas-block') && !e.target.closest('.sidebar-right')) {
                this.deselectBlock();
            }
        });
    }

    /**
     * Muestra selector de páginas para cargar
     */
    async showPageSelector() {
        console.log('📂 Abriendo selector de páginas...');
        const modal = document.getElementById('page-selector-modal');
        const pageList = document.getElementById('page-list');
        
        pageList.innerHTML = '<p style="text-align:center;color:#6b7280;">Cargando páginas disponibles...</p>';
        modal.classList.add('active');
        
        try {
            console.log('🔍 Buscando páginas con Parser.loadToccaPages()');
            const pages = await Parser.loadToccaPages();
            console.log('✅ Páginas encontradas:', pages);
            
            if (pages.length === 0) {
                pageList.innerHTML = '<p style="text-align:center;color:#6b7280;">No se encontraron páginas disponibles</p>';
                return;
            }
            
            pageList.innerHTML = pages.map(page => `
                <div class="page-list-item" data-url="${page.url}" data-file="${page.file}">
                    <div class="page-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                        </svg>
                    </div>
                    <div class="page-info">
                        <span class="page-name">${page.name}</span>
                        <span class="page-file">${page.file}</span>
                    </div>
                    <button class="btn-load-page" data-url="${page.url}" data-file="${page.file}" data-name="${page.name}">
                        Cargar
                    </button>
                </div>
            `).join('');
            
            // Event listeners para botones de cargar
            pageList.querySelectorAll('.btn-load-page').forEach(btn => {
                btn.addEventListener('click', () => {
                    const url = btn.dataset.url;
                    const file = btn.dataset.file;
                    const name = btn.dataset.name;
                    this.loadPageFromUrl(url, file, name);
                });
            });
            
        } catch (error) {
            pageList.innerHTML = `<p style="text-align:center;color:#e74c3c;">Error: ${error.message}</p>`;
        }
    }

    /**
     * Carga una página desde URL
     */
    async loadPageFromUrl(url, filename, pageName) {
        try {
            this.showNotification('Cargando página...', 'warning');
            
            const blocks = await Parser.loadPage(url);
            
            if (blocks.length === 0) {
                // Si no se detectaron bloques, extraer contenido editable
                const response = await fetch(url);
                const html = await response.text();
                this.blocks = Parser.extractEditableContent(html);
            } else {
                this.blocks = blocks;
            }
            
            this.currentPage = {
                filename: filename,
                name: pageName,
                url: url
            };
            
            this.saveHistory();
            this.renderCanvas();
            this.closePageSelector();
            this.updateHeaderTitle(pageName);
            
            this.showNotification(`✓ ${pageName} cargada - ${this.blocks.length} bloques detectados`, 'success');
            
        } catch (error) {
            this.showNotification('✗ Error al cargar página', 'error');
            console.error(error);
        }
    }

    /**
     * Cierra el selector de páginas
     */
    closePageSelector() {
        const modal = document.getElementById('page-selector-modal');
        modal.classList.remove('active');
    }

    /**
     * Actualiza el título del header con la página actual
     */
    updateHeaderTitle(pageName) {
        const subtitle = document.querySelector('.header-subtitle');
        if (pageName) {
            subtitle.textContent = `Editando: ${pageName}`;
        } else {
            subtitle.textContent = 'Editor Visual';
        }
    }

    /**
     * Exporta la página editada
     */
    exportPage() {
        if (this.blocks.length === 0) {
            this.showNotification('No hay contenido para exportar', 'warning');
            return;
        }
        
        const html = Renderer.renderToHTML(this.blocks);
        const filename = this.currentPage ? this.currentPage.filename : 'landing.html';
        
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification(`✓ ${filename} exportada`, 'success');
    }

    /**
     * Carga datos desde storage
     */
    loadFromStorage() {
        const data = Storage.load();
        this.blocks = data.blocks || [];
        
        if (data.lastModified) {
            console.log('📦 Datos cargados desde:', new Date(data.lastModified).toLocaleString());
        }
    }

    /**
     * Renderiza todos los bloques en el canvas
     */
    renderCanvas() {
        // Limpiar canvas
        this.canvas.innerHTML = '';
        
        if (this.blocks.length === 0) {
            this.canvas.innerHTML = `
                <div class="canvas-placeholder">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <line x1="12" y1="8" x2="12" y2="16"/>
                        <line x1="8" y1="12" x2="16" y2="12"/>
                    </svg>
                    <p>Arrastra bloques aquí para comenzar</p>
                </div>
            `;
            return;
        }

        // Renderizar cada bloque
        this.blocks.forEach((block, index) => {
            const blockElement = this.createBlockElement(block, index);
            this.canvas.appendChild(blockElement);
        });
    }

    /**
     * Crea un elemento DOM para un bloque
     */
    createBlockElement(block, index) {
        const div = document.createElement('div');
        div.className = 'canvas-block';
        div.dataset.blockId = block.id;
        div.dataset.blockIndex = index;
        div.draggable = true;

        // Drag handle
        div.innerHTML = `
            <div class="drag-handle">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="9" y1="5" x2="9" y2="19"/>
                    <line x1="15" y1="5" x2="15" y2="19"/>
                </svg>
            </div>
            <div class="block-toolbar">
                <button class="btn-move-up" title="Mover arriba">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="18 15 12 9 6 15"/>
                    </svg>
                </button>
                <button class="btn-move-down" title="Mover abajo">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </button>
                <button class="btn-duplicate" title="Duplicar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                    </svg>
                </button>
                <button class="btn-delete" title="Eliminar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                </button>
            </div>
            <div class="block-content block-content-${block.type}">
                ${this.renderBlockContent(block)}
            </div>
        `;

        // Event listeners
        div.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectBlock(block.id);
        });

        div.addEventListener('dragstart', (e) => this.handleBlockDragStart(e, index));
        div.addEventListener('dragend', (e) => this.handleBlockDragEnd(e));

        // Botones de toolbar
        div.querySelector('.btn-move-up').addEventListener('click', (e) => {
            e.stopPropagation();
            this.moveBlock(index, index - 1);
        });

        div.querySelector('.btn-move-down').addEventListener('click', (e) => {
            e.stopPropagation();
            this.moveBlock(index, index + 1);
        });

        div.querySelector('.btn-duplicate').addEventListener('click', (e) => {
            e.stopPropagation();
            this.duplicateBlock(index);
        });

        div.querySelector('.btn-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteBlock(index);
        });

        return div;
    }

    /**
     * Renderiza el contenido visual de un bloque
     */
    renderBlockContent(block) {
        const renderers = {
            'text': this.renderTextContent,
            'image': this.renderImageContent,
            'button': this.renderButtonContent,
            'section': this.renderSectionContent
        };

        const renderer = renderers[block.type];
        return renderer ? renderer.call(this, block) : 'Tipo desconocido';
    }

    renderTextContent(block) {
        const props = block.properties;
        const tag = props.tag || 'p';
        const content = props.content || 'Haz clic para editar este texto';
        
        return `<${tag} contenteditable="true" data-property="content" style="color: ${props.textColor || '#333'}; font-size: ${props.fontSize || 16}px; text-align: ${props.textAlign || 'left'};">${content}</${tag}>`;
    }

    renderImageContent(block) {
        const props = block.properties;
        
        if (!props.src) {
            return `
                <div class="image-upload-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <p>Selecciona este bloque y sube una imagen</p>
                </div>
            `;
        }

        return `<img src="${props.src}" alt="${props.alt || ''}" style="max-width: 100%; border-radius: ${props.borderRadius || 0}px;">`;
    }

    renderButtonContent(block) {
        const props = block.properties;
        const style = `
            background: ${props.backgroundColor || '#4A9A92'};
            color: ${props.textColor || '#ffffff'};
            padding: ${props.paddingVertical || 12}px ${props.paddingHorizontal || 24}px;
            border-radius: ${props.borderRadius || 8}px;
            font-size: ${props.fontSize || 16}px;
            font-weight: ${props.fontWeight || 600};
        `;
        
        return `<button style="${style}">${props.text || 'Botón'}</button>`;
    }

    renderSectionContent(block) {
        const props = block.properties;
        const style = `
            background: ${props.backgroundColor || '#f9fafb'};
            padding: ${props.paddingTop || 40}px ${props.paddingLeft || 20}px ${props.paddingBottom || 40}px ${props.paddingRight || 20}px;
            min-height: 100px;
        `;
        
        return `<div style="${style}"><p style="color: #6b7280; text-align: center;">Contenedor de sección - Selecciona para editar</p></div>`;
    }

    /**
     * Maneja el inicio del drag desde sidebar
     */
    handleDragStart(e) {
        const blockType = e.target.closest('.block-item').dataset.blockType;
        e.dataTransfer.setData('blockType', blockType);
        e.dataTransfer.effectAllowed = 'copy';
    }

    handleDragEnd(e) {
        // Limpieza si es necesario
    }

    /**
     * Maneja dragover en canvas
     */
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }

    /**
     * Maneja drop en canvas
     */
    handleDrop(e) {
        e.preventDefault();
        
        const blockType = e.dataTransfer.getData('blockType');
        if (blockType) {
            this.addBlock(blockType);
        }
    }

    /**
     * Maneja drag de bloques existentes para reordenar
     */
    handleBlockDragStart(e, index) {
        this.draggedIndex = index;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    }

    handleBlockDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    /**
     * Agrega un nuevo bloque al canvas
     */
    addBlock(type) {
        const newBlock = this.createBlockData(type);
        this.blocks.push(newBlock);
        this.saveHistory();
        this.renderCanvas();
        this.selectBlock(newBlock.id);
        
        this.showNotification('Bloque agregado', 'success');
    }

    /**
     * Crea los datos iniciales de un bloque
     */
    createBlockData(type) {
        const id = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const templates = {
            'text': {
                id,
                type: 'text',
                properties: {
                    tag: 'p',
                    content: 'Escribe tu texto aquí',
                    textColor: '#333333',
                    fontSize: 16,
                    textAlign: 'left',
                    fontWeight: 'normal',
                    marginTop: 0,
                    marginBottom: 16,
                    paddingTop: 0,
                    paddingBottom: 0
                }
            },
            'image': {
                id,
                type: 'image',
                properties: {
                    src: '',
                    alt: '',
                    width: '100%',
                    maxWidth: 800,
                    borderRadius: 8,
                    alignment: 'center',
                    marginTop: 16,
                    marginBottom: 16
                }
            },
            'button': {
                id,
                type: 'button',
                properties: {
                    text: 'Haz clic aquí',
                    link: '#',
                    backgroundColor: '#4A9A92',
                    textColor: '#ffffff',
                    fontSize: 16,
                    fontWeight: '600',
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderRadius: 8,
                    alignment: 'center',
                    openNewTab: false,
                    marginTop: 16,
                    marginBottom: 16
                }
            },
            'section': {
                id,
                type: 'section',
                properties: {
                    backgroundColor: '#f9fafb',
                    paddingTop: 40,
                    paddingBottom: 40,
                    paddingLeft: 20,
                    paddingRight: 20,
                    maxWidth: 1200,
                    marginTop: 0,
                    marginBottom: 0,
                    content: ''
                }
            }
        };

        return templates[type] || templates['text'];
    }

    /**
     * Selecciona un bloque
     */
    selectBlock(blockId) {
        // Deseleccionar anterior
        document.querySelectorAll('.canvas-block').forEach(el => el.classList.remove('selected'));
        
        // Seleccionar nuevo
        const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
        if (blockElement) {
            blockElement.classList.add('selected');
        }

        // Actualizar estado y panel
        this.selectedBlock = this.blocks.find(b => b.id === blockId);
        this.renderPropertiesPanel();
    }

    /**
     * Deselecciona el bloque actual
     */
    deselectBlock() {
        document.querySelectorAll('.canvas-block').forEach(el => el.classList.remove('selected'));
        this.selectedBlock = null;
        this.renderPropertiesPanel();
    }

    /**
     * Renderiza el panel de propiedades
     */
    renderPropertiesPanel() {
        if (!this.selectedBlock) {
            this.propertiesSubtitle.textContent = 'Selecciona un bloque';
            this.propertiesPanel.innerHTML = `
                <div class="no-selection">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                        <path d="M2 17l10 5 10-5"/>
                        <path d="M2 12l10 5 10-5"/>
                    </svg>
                    <p>Selecciona un bloque para editar sus propiedades</p>
                </div>
            `;
            return;
        }

        const block = this.selectedBlock;
        this.propertiesSubtitle.textContent = `Editando: ${this.getBlockTypeName(block.type)}`;

        const propertyRenderers = {
            'text': this.renderTextProperties,
            'image': this.renderImageProperties,
            'button': this.renderButtonProperties,
            'section': this.renderSectionProperties
        };

        const renderer = propertyRenderers[block.type];
        if (renderer) {
            this.propertiesPanel.innerHTML = renderer.call(this, block);
            this.setupPropertyListeners();
        }
    }

    /**
     * Renderiza propiedades de bloque de texto
     */
    renderTextProperties(block) {
        const props = block.properties;
        
        return `
            <div class="property-group">
                <label class="property-label">Tipo de texto</label>
                <select class="property-select" data-property="tag">
                    <option value="p" ${props.tag === 'p' ? 'selected' : ''}>Párrafo</option>
                    <option value="h1" ${props.tag === 'h1' ? 'selected' : ''}>Título 1</option>
                    <option value="h2" ${props.tag === 'h2' ? 'selected' : ''}>Título 2</option>
                    <option value="h3" ${props.tag === 'h3' ? 'selected' : ''}>Título 3</option>
                </select>
            </div>

            <div class="property-group">
                <label class="property-label">Color del texto</label>
                <input type="color" class="property-input property-color" data-property="textColor" value="${props.textColor || '#333333'}">
            </div>

            <div class="property-group">
                <label class="property-label">Tamaño (px)</label>
                <input type="number" class="property-input" data-property="fontSize" value="${props.fontSize || 16}" min="10" max="72">
            </div>

            <div class="property-group">
                <label class="property-label">Alineación</label>
                <select class="property-select" data-property="textAlign">
                    <option value="left" ${props.textAlign === 'left' ? 'selected' : ''}>Izquierda</option>
                    <option value="center" ${props.textAlign === 'center' ? 'selected' : ''}>Centro</option>
                    <option value="right" ${props.textAlign === 'right' ? 'selected' : ''}>Derecha</option>
                </select>
            </div>

            <div class="property-group">
                <label class="property-label">Peso de fuente</label>
                <select class="property-select" data-property="fontWeight">
                    <option value="normal" ${props.fontWeight === 'normal' ? 'selected' : ''}>Normal</option>
                    <option value="600" ${props.fontWeight === '600' ? 'selected' : ''}>Semi-Bold</option>
                    <option value="bold" ${props.fontWeight === 'bold' ? 'selected' : ''}>Bold</option>
                </select>
            </div>

            <div class="divider"></div>

            <div class="property-group">
                <label class="property-label">Márgenes (px)</label>
                <div class="property-row">
                    <input type="number" class="property-input" placeholder="Superior" data-property="marginTop" value="${props.marginTop || 0}" min="0">
                    <input type="number" class="property-input" placeholder="Inferior" data-property="marginBottom" value="${props.marginBottom || 16}" min="0">
                </div>
            </div>
        `;
    }

    /**
     * Renderiza propiedades de bloque de imagen
     */
    renderImageProperties(block) {
        const props = block.properties;
        
        return `
            <div class="property-group">
                <label class="property-label">Imagen</label>
                <input type="file" class="property-input" accept="image/*" id="image-upload">
                <p class="property-helper">O pega una URL de imagen abajo</p>
            </div>

            <div class="property-group">
                <label class="property-label">URL de imagen</label>
                <input type="text" class="property-input" data-property="src" value="${props.src || ''}" placeholder="https://...">
            </div>

            <div class="property-group">
                <label class="property-label">Texto alternativo</label>
                <input type="text" class="property-input" data-property="alt" value="${props.alt || ''}" placeholder="Descripción de la imagen">
            </div>

            <div class="property-group">
                <label class="property-label">Ancho máximo (px)</label>
                <input type="number" class="property-input" data-property="maxWidth" value="${props.maxWidth || 800}" min="100" max="2000">
            </div>

            <div class="property-group">
                <label class="property-label">Radio de borde (px)</label>
                <input type="number" class="property-input" data-property="borderRadius" value="${props.borderRadius || 8}" min="0" max="50">
            </div>

            <div class="property-group">
                <label class="property-label">Alineación</label>
                <select class="property-select" data-property="alignment">
                    <option value="left" ${props.alignment === 'left' ? 'selected' : ''}>Izquierda</option>
                    <option value="center" ${props.alignment === 'center' ? 'selected' : ''}>Centro</option>
                    <option value="right" ${props.alignment === 'right' ? 'selected' : ''}>Derecha</option>
                </select>
            </div>

            <div class="divider"></div>

            <div class="property-group">
                <label class="property-label">Márgenes (px)</label>
                <div class="property-row">
                    <input type="number" class="property-input" placeholder="Superior" data-property="marginTop" value="${props.marginTop || 16}" min="0">
                    <input type="number" class="property-input" placeholder="Inferior" data-property="marginBottom" value="${props.marginBottom || 16}" min="0">
                </div>
            </div>
        `;
    }

    /**
     * Renderiza propiedades de bloque de botón
     */
    renderButtonProperties(block) {
        const props = block.properties;
        
        return `
            <div class="property-group">
                <label class="property-label">Texto del botón</label>
                <input type="text" class="property-input" data-property="text" value="${props.text || ''}" placeholder="Haz clic aquí">
            </div>

            <div class="property-group">
                <label class="property-label">Enlace</label>
                <input type="text" class="property-input" data-property="link" value="${props.link || '#'}" placeholder="https://...">
                <label style="display: flex; align-items: center; gap: 8px; margin-top: 8px; font-size: 13px;">
                    <input type="checkbox" data-property="openNewTab" ${props.openNewTab ? 'checked' : ''}>
                    Abrir en nueva pestaña
                </label>
            </div>

            <div class="divider"></div>

            <div class="property-group">
                <label class="property-label">Color de fondo</label>
                <input type="color" class="property-input property-color" data-property="backgroundColor" value="${props.backgroundColor || '#4A9A92'}">
            </div>

            <div class="property-group">
                <label class="property-label">Color del texto</label>
                <input type="color" class="property-input property-color" data-property="textColor" value="${props.textColor || '#ffffff'}">
            </div>

            <div class="property-group">
                <label class="property-label">Tamaño de fuente (px)</label>
                <input type="number" class="property-input" data-property="fontSize" value="${props.fontSize || 16}" min="12" max="32">
            </div>

            <div class="property-group">
                <label class="property-label">Radio de borde (px)</label>
                <input type="number" class="property-input" data-property="borderRadius" value="${props.borderRadius || 8}" min="0" max="50">
            </div>

            <div class="property-group">
                <label class="property-label">Padding (px)</label>
                <div class="property-row">
                    <input type="number" class="property-input" placeholder="Vertical" data-property="paddingVertical" value="${props.paddingVertical || 12}" min="0">
                    <input type="number" class="property-input" placeholder="Horizontal" data-property="paddingHorizontal" value="${props.paddingHorizontal || 24}" min="0">
                </div>
            </div>

            <div class="property-group">
                <label class="property-label">Alineación</label>
                <select class="property-select" data-property="alignment">
                    <option value="left" ${props.alignment === 'left' ? 'selected' : ''}>Izquierda</option>
                    <option value="center" ${props.alignment === 'center' ? 'selected' : ''}>Centro</option>
                    <option value="right" ${props.alignment === 'right' ? 'selected' : ''}>Derecha</option>
                </select>
            </div>

            <div class="divider"></div>

            <div class="property-group">
                <label class="property-label">Márgenes (px)</label>
                <div class="property-row">
                    <input type="number" class="property-input" placeholder="Superior" data-property="marginTop" value="${props.marginTop || 16}" min="0">
                    <input type="number" class="property-input" placeholder="Inferior" data-property="marginBottom" value="${props.marginBottom || 16}" min="0">
                </div>
            </div>
        `;
    }

    /**
     * Renderiza propiedades de bloque de sección
     */
    renderSectionProperties(block) {
        const props = block.properties;
        
        return `
            <div class="property-group">
                <label class="property-label">Color de fondo</label>
                <input type="color" class="property-input property-color" data-property="backgroundColor" value="${props.backgroundColor || '#f9fafb'}">
            </div>

            <div class="property-group">
                <label class="property-label">Ancho máximo (px)</label>
                <input type="number" class="property-input" data-property="maxWidth" value="${props.maxWidth || 1200}" min="400" max="1920">
            </div>

            <div class="divider"></div>

            <div class="property-group">
                <label class="property-label">Padding (px)</label>
                <div class="property-row">
                    <input type="number" class="property-input" placeholder="Superior" data-property="paddingTop" value="${props.paddingTop || 40}" min="0">
                    <input type="number" class="property-input" placeholder="Inferior" data-property="paddingBottom" value="${props.paddingBottom || 40}" min="0">
                </div>
                <div class="property-row" style="margin-top: 8px;">
                    <input type="number" class="property-input" placeholder="Izquierda" data-property="paddingLeft" value="${props.paddingLeft || 20}" min="0">
                    <input type="number" class="property-input" placeholder="Derecha" data-property="paddingRight" value="${props.paddingRight || 20}" min="0">
                </div>
            </div>

            <div class="property-group">
                <label class="property-label">Márgenes (px)</label>
                <div class="property-row">
                    <input type="number" class="property-input" placeholder="Superior" data-property="marginTop" value="${props.marginTop || 0}" min="0">
                    <input type="number" class="property-input" placeholder="Inferior" data-property="marginBottom" value="${props.marginBottom || 0}" min="0">
                </div>
            </div>
        `;
    }

    /**
     * Configura listeners para inputs del panel de propiedades
     */
    setupPropertyListeners() {
        // Inputs generales
        this.propertiesPanel.querySelectorAll('[data-property]').forEach(input => {
            const propertyName = input.dataset.property;
            
            // Diferentes eventos según el tipo
            const eventType = input.type === 'checkbox' ? 'change' : 'input';
            
            input.addEventListener(eventType, (e) => {
                const value = input.type === 'checkbox' ? input.checked : input.value;
                this.updateBlockProperty(propertyName, value);
            });
        });

        // Upload de imagen
        const imageUpload = document.getElementById('image-upload');
        if (imageUpload) {
            imageUpload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handleImageUpload(file);
                }
            });
        }

        // Contenido editable en canvas
        const contentEditables = document.querySelectorAll('.canvas-block.selected [contenteditable]');
        contentEditables.forEach(el => {
            el.addEventListener('input', (e) => {
                const property = e.target.dataset.property;
                if (property) {
                    this.updateBlockProperty(property, e.target.innerHTML);
                }
            });
        });
    }

    /**
     * Actualiza una propiedad del bloque seleccionado
     */
    updateBlockProperty(propertyName, value) {
        if (!this.selectedBlock) return;

        // Convertir a número si es necesario
        if (['fontSize', 'marginTop', 'marginBottom', 'paddingTop', 'paddingBottom', 
             'paddingLeft', 'paddingRight', 'borderRadius', 'maxWidth', 
             'paddingVertical', 'paddingHorizontal'].includes(propertyName)) {
            value = parseInt(value) || 0;
        }

        this.selectedBlock.properties[propertyName] = value;
        
        // Re-renderizar el bloque específico
        const blockElement = document.querySelector(`[data-block-id="${this.selectedBlock.id}"]`);
        if (blockElement) {
            const contentDiv = blockElement.querySelector('.block-content');
            contentDiv.innerHTML = this.renderBlockContent(this.selectedBlock);
            
            // Reseleccionar
            blockElement.classList.add('selected');
        }
    }

    /**
     * Maneja la subida de imágenes
     */
    handleImageUpload(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const imageData = e.target.result;
            this.updateBlockProperty('src', imageData);
            
            // Actualizar el input de URL
            const urlInput = this.propertiesPanel.querySelector('[data-property="src"]');
            if (urlInput) {
                urlInput.value = imageData;
            }
            
            this.showNotification('Imagen cargada', 'success');
        };
        
        reader.readAsDataURL(file);
    }

    /**
     * Mueve un bloque a una nueva posición
     */
    moveBlock(fromIndex, toIndex) {
        if (toIndex < 0 || toIndex >= this.blocks.length) return;
        
        const [block] = this.blocks.splice(fromIndex, 1);
        this.blocks.splice(toIndex, 0, block);
        
        this.saveHistory();
        this.renderCanvas();
        this.selectBlock(block.id);
    }

    /**
     * Duplica un bloque
     */
    duplicateBlock(index) {
        const original = this.blocks[index];
        const duplicate = JSON.parse(JSON.stringify(original));
        duplicate.id = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        this.blocks.splice(index + 1, 0, duplicate);
        this.saveHistory();
        this.renderCanvas();
        this.selectBlock(duplicate.id);
        
        this.showNotification('Bloque duplicado', 'success');
    }

    /**
     * Elimina un bloque
     */
    deleteBlock(index) {
        if (!confirm('¿Estás segura de eliminar este bloque?')) return;
        
        this.blocks.splice(index, 1);
        this.saveHistory();
        this.renderCanvas();
        this.deselectBlock();
        
        this.showNotification('Bloque eliminado', 'success');
    }

    /**
     * Limpia todo el canvas
     */
    clearAll() {
        if (!confirm('¿Estás segura de eliminar todos los bloques?')) return;
        
        this.blocks = [];
        this.saveHistory();
        this.renderCanvas();
        this.deselectBlock();
        
        this.showNotification('Canvas limpiado', 'success');
    }

    /**
     * Guarda cambios
     */
    saveChanges() {
        const result = Storage.save(this.blocks);
        
        if (result.success) {
            this.showNotification('✓ Cambios guardados', 'success');
        } else {
            this.showNotification('✗ Error al guardar', 'error');
        }
    }

    /**
     * Muestra vista previa
     */
    showPreview() {
        const modal = document.getElementById('preview-modal');
        const iframe = document.getElementById('preview-frame');
        
        const html = Renderer.renderToHTML(this.blocks);
        
        iframe.srcdoc = html;
        modal.classList.add('active');
    }

    /**
     * Cierra vista previa
     */
    closePreview() {
        const modal = document.getElementById('preview-modal');
        modal.classList.remove('active');
    }

    /**
     * Undo
     */
    undo() {
        // Implementación simplificada - puedes expandirla
        this.showNotification('Función en desarrollo', 'warning');
    }

    /**
     * Redo
     */
    redo() {
        // Implementación simplificada - puedes expandirla
        this.showNotification('Función en desarrollo', 'warning');
    }

    /**
     * Guarda snapshot en historial
     */
    saveHistory() {
        Storage.addToHistory(this.blocks);
    }

    /**
     * Muestra notificación
     */
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    /**
     * Obtiene nombre legible del tipo de bloque
     */
    getBlockTypeName(type) {
        const names = {
            'text': 'Texto',
            'image': 'Imagen',
            'button': 'Botón',
            'section': 'Sección'
        };
        return names[type] || type;
    }
}

// Inicializar editor cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.editor = new Editor();
});
