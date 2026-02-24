// 8-Bit CSS Icon Builder - JavaScript

// 16 typische 8-Bit Retro-Farben (C64/NES inspiriert)
const COLORS = [
    { name: 'Schwarz', hex: '#000000' },
    { name: 'Weiß', hex: '#FFFFFF' },
    { name: 'Dunkelgrau', hex: '#6C6C6C' },
    { name: 'Hellgrau', hex: '#9D9D9D' },
    { name: 'Rot', hex: '#B41E18' },
    { name: 'Orange', hex: '#D27D00' },
    { name: 'Gelb', hex: '#F0E040' },
    { name: 'Hellgrün', hex: '#70CC00' },
    { name: 'Dunkelgrün', hex: '#00A800' },
    { name: 'Cyan', hex: '#00CCCC' },
    { name: 'Hellblau', hex: '#5CA8E4' },
    { name: 'Blau', hex: '#3C44A4' },
    { name: 'Lila', hex: '#883088' },
    { name: 'Pink', hex: '#E850A8' },
    { name: 'Braun', hex: '#6C3C00' },
    { name: 'Beige', hex: '#D4A878' }
];

const EMPTY_COLOR = '#1a1a2e';
const TOOLS = { PEN: 'pen', LINE: 'line', RECT: 'rect', CIRCLE: 'circle' };

// Zustand
let gridSize = 16;
let currentColor = COLORS[4].hex;
let currentTool = TOOLS.PEN;
let isMouseDown = false;
let pixelData = createEmptyGrid(gridSize);

// Shape-Drawing Zustand
let shapeStartRow = null;
let shapeStartCol = null;
let previewPixels = []; // Temporäre Vorschau während des Zeichnens

// Leeres Grid erstellen
function createEmptyGrid(size) {
    return Array(size).fill(null).map(() => Array(size).fill(null));
}

// DOM Elemente
const colorPalette = document.getElementById('colorPalette');
const currentColorPreview = document.getElementById('currentColorPreview');
const pixelGrid = document.getElementById('pixelGrid');
const clearBtn = document.getElementById('clearBtn');
const fillBtn = document.getElementById('fillBtn');
const size8Btn = document.getElementById('size8Btn');
const size16Btn = document.getElementById('size16Btn');
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');
const cssOutput = document.getElementById('cssOutput');
const classNameInput = document.getElementById('className');
const preview1x = document.getElementById('preview1x');
const preview2x = document.getElementById('preview2x');
const preview4x = document.getElementById('preview4x');
const cssModal = document.getElementById('cssModal');
const closeModal = document.getElementById('closeModal');

// Tool Buttons
const toolPen = document.getElementById('toolPen');
const toolLine = document.getElementById('toolLine');
const toolRect = document.getElementById('toolRect');
const toolCircle = document.getElementById('toolCircle');

// Initialisierung
function init() {
    createColorPalette();
    createPixelGrid();
    setupEventListeners();
    updateCurrentColorPreview();
    updatePreviewLabels();
}

// Farbpalette erstellen
function createColorPalette() {
    COLORS.forEach((color, index) => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = color.hex;
        swatch.title = color.name;
        swatch.dataset.color = color.hex;
        
        if (color.hex === currentColor) {
            swatch.classList.add('selected');
        }
        
        swatch.addEventListener('click', () => selectColor(color.hex, swatch));
        colorPalette.appendChild(swatch);
    });
}

// Farbe auswählen
function selectColor(hex, swatch) {
    currentColor = hex;
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
    swatch.classList.add('selected');
    updateCurrentColorPreview();
}

// Tool auswählen
function selectTool(tool) {
    currentTool = tool;
    document.querySelectorAll('.toolbar-btn').forEach(btn => btn.classList.remove('active'));
    
    switch(tool) {
        case TOOLS.PEN: toolPen.classList.add('active'); break;
        case TOOLS.LINE: toolLine.classList.add('active'); break;
        case TOOLS.RECT: toolRect.classList.add('active'); break;
        case TOOLS.CIRCLE: toolCircle.classList.add('active'); break;
    }
}

// Aktuelle Farbe Vorschau aktualisieren
function updateCurrentColorPreview() {
    currentColorPreview.style.backgroundColor = currentColor;
}

// Pixel Grid erstellen
function createPixelGrid() {
    pixelGrid.innerHTML = '';
    pixelGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const pixel = document.createElement('div');
            pixel.className = 'pixel';
            pixel.dataset.row = row;
            pixel.dataset.col = col;
            
            const existingColor = pixelData[row] && pixelData[row][col];
            if (existingColor) {
                pixel.style.backgroundColor = existingColor;
            }
            
            pixel.addEventListener('mousedown', (e) => handleMouseDown(e, row, col));
            pixel.addEventListener('mouseenter', (e) => handleMouseMove(e, row, col));
            pixel.addEventListener('touchstart', (e) => handleTouchStart(e, row, col));
            pixel.addEventListener('touchmove', handleTouchMove);
            
            pixelGrid.appendChild(pixel);
        }
    }
}

// Mouse Down Handler
function handleMouseDown(e, row, col) {
    e.preventDefault();
    isMouseDown = true;
    
    if (currentTool === TOOLS.PEN) {
        togglePixel(row, col);
    } else {
        // Shape-Tools: Startpunkt setzen
        shapeStartRow = row;
        shapeStartCol = col;
        previewPixels = [];
    }
}

// Mouse Move Handler
function handleMouseMove(e, row, col) {
    if (!isMouseDown) return;
    
    if (currentTool === TOOLS.PEN) {
        setPixel(row, col, currentColor);
    } else {
        // Shape-Tools: Vorschau aktualisieren
        clearPreview();
        const shapePixels = calculateShape(shapeStartRow, shapeStartCol, row, col);
        showPreview(shapePixels);
    }
}

// Mouse Up Handler
function handleMouseUp(e) {
    if (!isMouseDown) return;
    
    if (currentTool !== TOOLS.PEN && shapeStartRow !== null) {
        // Shape finalisieren
        clearPreview();
        
        // Endposition aus dem letzten Element unter der Maus holen
        const element = document.elementFromPoint(e.clientX, e.clientY);
        if (element && element.classList.contains('pixel')) {
            const endRow = parseInt(element.dataset.row);
            const endCol = parseInt(element.dataset.col);
            const shapePixels = calculateShape(shapeStartRow, shapeStartCol, endRow, endCol);
            
            // Shape permanent zeichnen
            shapePixels.forEach(([r, c]) => {
                if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
                    setPixelDirect(r, c, currentColor);
                }
            });
        }
    }
    
    isMouseDown = false;
    shapeStartRow = null;
    shapeStartCol = null;
    previewPixels = [];
    updatePreview();
}

// Touch Handler
function handleTouchStart(e, row, col) {
    e.preventDefault();
    handleMouseDown(e, row, col);
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element && element.classList.contains('pixel')) {
        const row = parseInt(element.dataset.row);
        const col = parseInt(element.dataset.col);
        handleMouseMove(e, row, col);
    }
}

// Shape berechnen
function calculateShape(startRow, startCol, endRow, endCol) {
    const pixels = [];
    
    switch(currentTool) {
        case TOOLS.LINE:
            return calculateLine(startCol, startRow, endCol, endRow);
        case TOOLS.RECT:
            return calculateRect(startRow, startCol, endRow, endCol);
        case TOOLS.CIRCLE:
            return calculateCircle(startRow, startCol, endRow, endCol);
        default:
            return pixels;
    }
}

// Bresenham's Line Algorithm
function calculateLine(x0, y0, x1, y1) {
    const pixels = [];
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    
    while (true) {
        pixels.push([y0, x0]); // [row, col]
        
        if (x0 === x1 && y0 === y1) break;
        
        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x0 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y0 += sy;
        }
    }
    
    return pixels;
}

// Rechteck berechnen
function calculateRect(startRow, startCol, endRow, endCol) {
    const pixels = [];
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);
    const minCol = Math.min(startCol, endCol);
    const maxCol = Math.max(startCol, endCol);
    
    // Obere und untere Kante
    for (let col = minCol; col <= maxCol; col++) {
        pixels.push([minRow, col]);
        pixels.push([maxRow, col]);
    }
    
    // Linke und rechte Kante
    for (let row = minRow + 1; row < maxRow; row++) {
        pixels.push([row, minCol]);
        pixels.push([row, maxCol]);
    }
    
    return pixels;
}

// Midpoint Circle Algorithm (Bresenham)
function calculateCircle(startRow, startCol, endRow, endCol) {
    const pixels = [];
    
    // Radius berechnen
    const dx = endCol - startCol;
    const dy = endRow - startRow;
    const radius = Math.round(Math.sqrt(dx * dx + dy * dy));
    
    if (radius === 0) {
        pixels.push([startRow, startCol]);
        return pixels;
    }
    
    let x = radius;
    let y = 0;
    let err = 0;
    
    while (x >= y) {
        // 8 Oktanten
        pixels.push([startRow + y, startCol + x]);
        pixels.push([startRow + x, startCol + y]);
        pixels.push([startRow + x, startCol - y]);
        pixels.push([startRow + y, startCol - x]);
        pixels.push([startRow - y, startCol - x]);
        pixels.push([startRow - x, startCol - y]);
        pixels.push([startRow - x, startCol + y]);
        pixels.push([startRow - y, startCol + x]);
        
        y++;
        if (err <= 0) {
            err += 2 * y + 1;
        }
        if (err > 0) {
            x--;
            err -= 2 * x + 1;
        }
    }
    
    return pixels;
}

// Vorschau anzeigen (temporär) - mit Highlight auch auf gefärbten Pixeln
function showPreview(pixels) {
    previewPixels = pixels;
    pixels.forEach(([row, col]) => {
        if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
            const pixel = pixelGrid.children[row * gridSize + col];
            if (pixel) {
                // Speichere die originale Farbe für clearPreview
                if (!pixel.dataset.originalBg) {
                    pixel.dataset.originalBg = pixel.style.backgroundColor || EMPTY_COLOR;
                }
                
                // Zeige die aktuelle Zeichenfarbe
                pixel.style.backgroundColor = currentColor;
                
                // Highlight-Effekt: Rahmen + leichtes Pulsieren
                pixel.style.outline = '2px solid white';
                pixel.style.outlineOffset = '-2px';
                pixel.style.zIndex = '10';
                pixel.classList.add('preview-highlight');
            }
        }
    });
}

// Vorschau löschen - Highlight entfernen und originale Farbe wiederherstellen
function clearPreview() {
    previewPixels.forEach(([row, col]) => {
        if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
            const pixel = pixelGrid.children[row * gridSize + col];
            if (pixel) {
                // Highlight-Styles entfernen
                pixel.style.outline = '';
                pixel.style.outlineOffset = '';
                pixel.style.zIndex = '';
                pixel.classList.remove('preview-highlight');
                
                // Originale Farbe wiederherstellen
                if (pixel.dataset.originalBg) {
                    pixel.style.backgroundColor = pixelData[row][col] || EMPTY_COLOR;
                    delete pixel.dataset.originalBg;
                } else if (!pixelData[row][col]) {
                    pixel.style.backgroundColor = EMPTY_COLOR;
                }
            }
        }
    });
    previewPixels = [];
}

// Grid-Größe ändern
function setGridSize(newSize) {
    if (newSize === gridSize) return;
    
    const oldData = pixelData;
    const oldSize = gridSize;
    
    gridSize = newSize;
    pixelData = createEmptyGrid(gridSize);
    
    const copySize = Math.min(oldSize, newSize);
    for (let row = 0; row < copySize; row++) {
        for (let col = 0; col < copySize; col++) {
            if (oldData[row] && oldData[row][col]) {
                pixelData[row][col] = oldData[row][col];
            }
        }
    }
    
    createPixelGrid();
    updatePreview();
    updatePreviewLabels();
    
    size8Btn.classList.toggle('active', gridSize === 8);
    size16Btn.classList.toggle('active', gridSize === 16);
}

// Vorschau-Labels aktualisieren
function updatePreviewLabels() {
    const baseSize = gridSize;
    document.querySelector('.preview-item:nth-child(1) span').textContent = `1x (${baseSize}px)`;
    document.querySelector('.preview-item:nth-child(2) span').textContent = `2x (${baseSize * 2}px)`;
    document.querySelector('.preview-item:nth-child(3) span').textContent = `4x (${baseSize * 4}px)`;
}

// Pixel toggle (an/aus)
function togglePixel(row, col) {
    const currentPixelColor = pixelData[row][col];
    
    if (currentPixelColor === currentColor) {
        setPixel(row, col, null);
    } else {
        setPixel(row, col, currentColor);
    }
}

// Pixel setzen mit Update
function setPixel(row, col, color) {
    setPixelDirect(row, col, color);
    updatePreview();
}

// Pixel setzen ohne Update (für Batch-Operationen)
function setPixelDirect(row, col, color) {
    const pixel = pixelGrid.children[row * gridSize + col];
    pixelData[row][col] = color;
    pixel.style.backgroundColor = color || EMPTY_COLOR;
    pixel.style.opacity = '1';
}

// Pixel-Größe für die Vorschau und Export
const PIXEL_SIZE = 1; // 1px pro Pixel-Einheit

// Vorschau aktualisieren - CSS Pixel Art Technik
// Element ist 1px, positioniert bei (-1px,-1px) damit Shadow-Offset (1,1) auf Container (0,0) fällt
function updatePreview() {
    const scales = [
        { el: preview1x, scale: 1 },
        { el: preview2x, scale: 2 },
        { el: preview4x, scale: 4 }
    ];
    
    scales.forEach(({ el, scale }) => {
        const ps = PIXEL_SIZE * scale;
        const shadow = generateBoxShadow(ps);
        
        // Icon-Preview Element: 1 Pixel-Einheit groß, verschoben um -1 Einheit
        el.style.width = `${ps}px`;
        el.style.height = `${ps}px`;
        el.style.backgroundColor = 'transparent';
        el.style.boxShadow = shadow || 'none';
        el.style.transform = 'none';
        el.style.position = 'absolute';
        el.style.top = `${-ps}px`;
        el.style.left = `${-ps}px`;
        
        // Preview-Box Container: exakte Icon-Größe mit overflow hidden
        const box = el.parentElement;
        box.style.width = `${gridSize * ps}px`;
        box.style.height = `${gridSize * ps}px`;
        box.style.overflow = 'hidden';
    });
}

// Box-Shadow CSS generieren mit konfigurierbarer Pixel-Größe
// Offset bei 1 starten, da box-shadow 0px 0px unter dem Element liegt und unsichtbar ist
function generateBoxShadow(pixelSize = 1) {
    const shadows = [];
    
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const color = pixelData[row][col];
            if (color) {
                const x = (col + 1) * pixelSize;
                const y = (row + 1) * pixelSize;
                shadows.push(`${x}px ${y}px 0 0 ${color}`);
            }
        }
    }
    
    return shadows.length > 0 ? shadows.join(',\n    ') : null;
}

// CSS Code generieren - echtes 16x16 oder 8x8 Pixel Icon
// Verwendet ::after für die Pixel-Art, damit das Element die volle
// Icon-Größe hat und in display:flex/grid Layouts korrekt funktioniert
function generateCSS() {
    console.log('generateCSS aufgerufen');
    const className = classNameInput.value.trim() || 'my-icon';
    const boxShadow = generateBoxShadow(1);
    
    // Prüfen ob es überhaupt Pixel gibt
    if (!boxShadow) {
        cssOutput.textContent = '/* Male zuerst einige Pixel! */';
        cssModal.classList.add('active');
        return;
    }
    
    const css = `.${className} {
    width: ${gridSize}px;
    height: ${gridSize}px;
    position: relative;
    overflow: hidden;
}

.${className}::after {
    content: '';
    position: absolute;
    top: -1px;
    left: -1px;
    width: 1px;
    height: 1px;
    background: transparent;
    box-shadow:
    ${boxShadow};
}

/* ${gridSize}x${gridSize} Pixel Icon */

/* Verwendung:
   <div class="${className}"></div>
   
   Skalierung mit transform: scale(2), scale(4), etc.
*/`;
    
    cssOutput.textContent = css;
    cssModal.classList.add('active');
}

// Modal schließen
function closeModalFunc() {
    cssModal.classList.remove('active');
}

// ========== CSS IMPORT PARSER ==========

// CSS box-shadow parsen und in pixelData laden
function parseCSS(cssText) {
    // box-shadow: extrahieren (aus ::after oder direkt)
    const boxShadowMatch = cssText.match(/box-shadow:\s*([\s\S]*?);/);
    if (!boxShadowMatch) {
        alert('Kein box-shadow gefunden im CSS!');
        return false;
    }
    
    const boxShadowValue = boxShadowMatch[1];
    
    // Größe aus width/height erkennen (falls vorhanden)
    const sizeMatch = cssText.match(/width:\s*(\d+)px/);
    const detectedSize = sizeMatch ? parseInt(sizeMatch[1]) : null;
    
    // Alle Pixel-Shadows parsen: "Xpx Ypx 0 0 #COLOR" oder "Xpx Ypx 0 #COLOR"
    // Format: offsetX offsetY blur spread? color
    const shadowRegex = /(\d+)px\s+(\d+)px\s+0(?:\s+0)?\s+(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|rgba?\([^)]+\))/g;
    
    let match;
    const pixels = [];
    let maxX = 0;
    let maxY = 0;
    
    while ((match = shadowRegex.exec(boxShadowValue)) !== null) {
        const x = parseInt(match[1]); // col + 1 (wegen offset)
        const y = parseInt(match[2]); // row + 1
        const color = match[3].toUpperCase();
        
        // Offset korrigieren (unser Export verwendet col+1, row+1)
        const col = x - 1;
        const row = y - 1;
        
        if (col >= 0 && row >= 0) {
            pixels.push({ row, col, color });
            maxX = Math.max(maxX, col);
            maxY = Math.max(maxY, row);
        }
    }
    
    if (pixels.length === 0) {
        alert('Keine Pixel im box-shadow gefunden!');
        return false;
    }
    
    // Grid-Größe bestimmen
    const neededSize = Math.max(maxX + 1, maxY + 1);
    const newSize = detectedSize || (neededSize <= 8 ? 8 : 16);
    
    // Grid-Größe setzen falls nötig
    if (newSize !== gridSize) {
        setGridSize(newSize);
    }
    
    // Grid leeren
    pixelData = createEmptyGrid(gridSize);
    
    // Pixel setzen
    pixels.forEach(({ row, col, color }) => {
        if (row < gridSize && col < gridSize) {
            // Farbe normalisieren (3-stellig zu 6-stellig)
            let normalizedColor = color;
            if (color.length === 4) {
                normalizedColor = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
            }
            pixelData[row][col] = normalizedColor;
        }
    });
    
    // Grid neu rendern
    createPixelGrid();
    updatePreview();
    
    return true;
}

// Import Modal öffnen
function openImportModal() {
    const importModal = document.getElementById('importModal');
    const importTextarea = document.getElementById('importTextarea');
    importTextarea.value = '';
    importModal.classList.add('active');
}

// Import Modal schließen
function closeImportModal() {
    const importModal = document.getElementById('importModal');
    importModal.classList.remove('active');
}

// CSS importieren
function importCSS() {
    const importTextarea = document.getElementById('importTextarea');
    const cssText = importTextarea.value.trim();
    
    if (!cssText) {
        alert('Bitte CSS Code einfügen!');
        return;
    }
    
    if (parseCSS(cssText)) {
        closeImportModal();
    }
}

// Event Listeners
function setupEventListeners() {
    // Global Mouse Up
    document.addEventListener('mouseup', handleMouseUp);
    
    // Tool Selection
    toolPen.addEventListener('click', () => selectTool(TOOLS.PEN));
    toolLine.addEventListener('click', () => selectTool(TOOLS.LINE));
    toolRect.addEventListener('click', () => selectTool(TOOLS.RECT));
    toolCircle.addEventListener('click', () => selectTool(TOOLS.CIRCLE));
    
    // Grid löschen
    clearBtn.addEventListener('click', () => {
        pixelData = createEmptyGrid(gridSize);
        document.querySelectorAll('.pixel').forEach(pixel => {
            pixel.style.backgroundColor = EMPTY_COLOR;
        });
        updatePreview();
    });
    
    // Mit Farbe füllen
    fillBtn.addEventListener('click', () => {
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                pixelData[row][col] = currentColor;
            }
        }
        document.querySelectorAll('.pixel').forEach(pixel => {
            pixel.style.backgroundColor = currentColor;
        });
        updatePreview();
    });
    
    // Grid-Größe ändern
    size8Btn.addEventListener('click', () => setGridSize(8));
    size16Btn.addEventListener('click', () => setGridSize(16));
    
    // CSS generieren
    console.log('generateBtn Element:', generateBtn);
    generateBtn.addEventListener('click', () => {
        console.log('Button geklickt!');
        generateCSS();
    });
    
    // Modal schließen
    closeModal.addEventListener('click', closeModalFunc);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModalFunc();
    });
    
    cssModal.addEventListener('click', (e) => {
        if (e.target === cssModal) closeModalFunc();
    });
    
    // CSS kopieren
    copyBtn.addEventListener('click', () => {
        const text = cssOutput.textContent;
        if (text && text !== '/* Male zuerst einige Pixel! */') {
            navigator.clipboard.writeText(text).then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = '✓ Kopiert!';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            }).catch(err => {
                console.error('Kopieren fehlgeschlagen:', err);
            });
        }
    });
    
    // Import Modal
    const importBtn = document.getElementById('importBtn');
    const closeImportModalBtn = document.getElementById('closeImportModal');
    const doImportBtn = document.getElementById('doImportBtn');
    const importModal = document.getElementById('importModal');
    
    console.log('Import Button:', importBtn);
    
    if (importBtn) {
        importBtn.addEventListener('click', openImportModal);
    }
    if (closeImportModalBtn) {
        closeImportModalBtn.addEventListener('click', closeImportModal);
    }
    if (doImportBtn) {
        doImportBtn.addEventListener('click', importCSS);
    }
    if (importModal) {
        importModal.addEventListener('click', (e) => {
            if (e.target === importModal) closeImportModal();
        });
    }
}

// App starten
document.addEventListener('DOMContentLoaded', init);