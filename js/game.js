// Sokoban 8-Bit — Game Boy Color & Game Boy Classic Edition (Phaser 3)

// 1. Trava global de rolagem e navegação para setas, espaço e backspace
window.addEventListener('keydown', (e) => {
  const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Backspace'];
  if (keys.includes(e.code) || keys.includes(e.key) || ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'space', 'backspace'].includes(e.key.toLowerCase())) {
    e.preventDefault();
  }
}, { passive: false });

// Helper para obter status da paleta
function isColorModeActive() {
  return localStorage.getItem('sokoban_color_mode') !== 'false';
}

function getTexKey(baseKey) {
  return (isColorModeActive() ? 'gb_' : 'dmg_') + baseKey;
}

// Helpers de Controle de Brilho da Tela LCD
function getScreenBrightness() {
  const saved = localStorage.getItem('sokoban_brightness');
  if (saved !== null) {
    const val = parseFloat(saved);
    if (!isNaN(val)) return Math.max(0.5, Math.min(1.5, Math.round(val * 10) / 10));
  }
  return 1.0;
}

function setScreenBrightness(val) {
  const clamped = Math.max(0.5, Math.min(1.5, Math.round(val * 10) / 10));
  localStorage.setItem('sokoban_brightness', clamped.toFixed(1));
  applyDOMBrightness(clamped);
  return clamped;
}

function applyDOMBrightness(val) {
  const b = (typeof val === 'number') ? val : getScreenBrightness();
  const screenEl = document.querySelector('.gb-lcd-screen');
  if (screenEl) {
    screenEl.style.filter = `brightness(${b})`;
  }
}

// -------------------------------------------------------------
// TEXTURAS 8-BIT COMPARTILHADAS (GBC & DMG)
// -------------------------------------------------------------
function generateGlobalTextures(scene) {
  if (scene.textures.exists('gb_floor')) return;

  const drawPixels = (key, pixelGrid, colorMap, width = 16, height = 16) => {
    const canvas = scene.textures.createCanvas(key, width, height);
    const ctx = canvas.getContext();
    ctx.imageSmoothingEnabled = false;

    for (let y = 0; y < height; y++) {
      const row = pixelGrid[y] || '';
      for (let x = 0; x < width; x++) {
        const char = row[x] || ' ';
        const color = colorMap[char];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    canvas.refresh();
  };

  const grids = {
    floor: [
      "1222222222222221","2333333333333332","2322222222222232","2323333333333232",
      "2323222222223232","2323233333323232","2323232222323232","2323232332323232",
      "2323232332323232","2323232222323232","2323233333323232","2323222222223232",
      "2323333333333232","2322222222222232","2333333333333332","1222222222222221"
    ],
    wall: [
      "0000000000000000","0333333303333330","0322222103222220","0222221102222210",
      "0111111101111110","0000000000000000","0333033333330330","0221032222210210",
      "0211022222110110","0111011111110110","0000000000000000","0333333303333330",
      "0322222103222220","0222221102222210","0111111101111110","0000000000000000"
    ],
    target: [
      "................","....00000000....","...0222222220...","..022......220..",
      ".022..0000..220.",".02..033330..20.",".02.03311330.20.",".02.03111130.20.",
      ".02.03111130.20.",".02.03311330.20.",".02..033330..20.",".022..0000..220..",
      "..022......220...","...0222222220...","....00000000....","................"
    ],
    box: [
      "0000000000000000","0333333333333320","0322111111112210","0323211111123210",
      "0312321111232110","0311232112321110","0311123223211110","0311112332111110",
      "0311112332111110","0311123223211110","0311232112321110","0312321111232110",
      "0323211111123210","0322111111112210","0211111111111110","0000000000000000"
    ],
    box_on_target: [
      "0000000000000000","0333333333333320","0322222222222210","0320000000000210",
      "0320333333300210","0320322222300210","0320323332300210","0320323032300210",
      "0320323032300210","0320323332300210","0320322222300210","0320000000000210",
      "0322222222222210","0322222222222210","0211111111111110","0000000000000000"
    ],
    player_down: [
      ".....000000.....","....03333330....","...0333333330...","...0222222220...",
      "...0233333320...","...0444444440...","..043044440340..","..040044440040..",
      "..044444444440..","...0441111440...","....01111110....","...0211221120...",
      "..022112211220..","..020111111020..","...0.011110.0...",".....00..00....."
    ],
    player_up: [
      ".....000000.....","....03333330....","...0333333330...","...0222222220...",
      "...0222222220...","...0444444440...","..044444444440..","..044444444440..",
      "...0444444440...","....01111110....","...0211111120...","..022111111220..",
      "..020111111020..","...0.011110.0...",".....01..10.....",".....00..00....."
    ],
    player_left: [
      ".....00000......","....0333330.....","...033333330....","..0002222220....",
      ".03332222220....","....04444440....","...0430444440...","...0400444440...",
      "....04444440....","....01111110....","...0211111120...","..0221122110....",
      "..0201111110....","...0.011110.....","....001..10.....","....00...00....."
    ],
    player_right: [
      "......00000.....",".....0333330....","....033333330...","....0222222000..",
      "....02222223330.","....04444440....","...0444440340...","...0444440040...",
      "....04444440....","....01111110....","...0211111120...","....0112211220..",
      "....0111111020..",".....011110.0...",".....01..100....",".....00...00...."
    ],
    // Personagem Carregando Caixa (16x24) para a Tela de Início
    player_carry: [
      "0000000000000000",
      "0333333333333320",
      "0322111111112210",
      "0323211111123210",
      "0311232222321110",
      "0311112332111110",
      "0323211111123210",
      "0211111111111110",
      "0000444004440000",
      "....04400440....",
      "...0333333330...",
      "...0222222220...",
      "...0444444440...",
      "..043044440340..",
      "..040044440040..",
      "...0444444440...",
      "....01111110....",
      "...0211221120...",
      "..022112211220..",
      "..020111111020..",
      "...0.011110.0...",
      ".....01..10.....",
      ".....00..00.....",
      "................"
    ],
    // Personagem Sinal de Vitória ✌️ (16x20)
    player_victory: [
      ".0000......0000.",
      ".0440......0440.",
      ".04040....04040.",
      "..0440....0440..",
      "...0440..0440...",
      "....04400440....",
      "...0333333330...",
      "...0222222220...",
      "...0444444440...",
      "..043044440340..",
      "..040044440040..",
      "...0444004440...",
      "....01111110....",
      "...0211221120...",
      "..022112211220..",
      "..020111111020..",
      "...0.011110.0...",
      ".....01..10.....",
      ".....00..00.....",
      "................"
    ]
  };

  // 1. PALETA GBC (Color)
  const gbcP = {
    floor: { '1': '#1e2430', '2': '#283040', '3': '#343e52' },
    wall: { '0': '#080c14', '1': '#5c2c16', '2': '#8a4020', '3': '#b86034' },
    target: { '0': '#080c14', '1': '#f59e0b', '2': '#78350f', '3': '#fde68a' },
    box: { '0': '#080c14', '1': '#854d0e', '2': '#ca8a04', '3': '#fef08a' },
    box_on_target: { '0': '#080c14', '1': '#065f46', '2': '#059669', '3': '#6ee7b7' },
    player: { '0': '#080c14', '1': '#2563eb', '2': '#dc2626', '3': '#f87171', '4': '#fed7aa' }
  };

  drawPixels('gb_floor', grids.floor, gbcP.floor);
  drawPixels('gb_wall', grids.wall, gbcP.wall);
  drawPixels('gb_target', grids.target, gbcP.target);
  drawPixels('gb_box', grids.box, gbcP.box);
  drawPixels('gb_box_on_target', grids.box_on_target, gbcP.box_on_target);
  drawPixels('gb_player_down', grids.player_down, gbcP.player);
  drawPixels('gb_player_up', grids.player_up, { ...gbcP.player, '4': '#b45309' });
  drawPixels('gb_player_left', grids.player_left, gbcP.player);
  drawPixels('gb_player_right', grids.player_right, gbcP.player);
  drawPixels('gb_player_carry', grids.player_carry, gbcP.player, 16, 24);
  drawPixels('gb_player_victory', grids.player_victory, gbcP.player, 16, 20);

  // 2. PALETA GAME BOY CLÁSSICO (DMG 4-Shades Verde)
  const dmgP = {
    floor: { '1': '#306230', '2': '#8bac0f', '3': '#9bbc0f' },
    wall: { '0': '#0f380f', '1': '#0f380f', '2': '#306230', '3': '#8bac0f' },
    target: { '0': '#0f380f', '1': '#306230', '2': '#8bac0f', '3': '#9bbc0f' },
    box: { '0': '#0f380f', '1': '#306230', '2': '#8bac0f', '3': '#9bbc0f' },
    box_on_target: { '0': '#0f380f', '1': '#0f380f', '2': '#9bbc0f', '3': '#8bac0f' },
    player: { '0': '#0f380f', '1': '#306230', '2': '#0f380f', '3': '#8bac0f', '4': '#9bbc0f' }
  };

  drawPixels('dmg_floor', grids.floor, dmgP.floor);
  drawPixels('dmg_wall', grids.wall, dmgP.wall);
  drawPixels('dmg_target', grids.target, dmgP.target);
  drawPixels('dmg_box', grids.box, dmgP.box);
  drawPixels('dmg_box_on_target', grids.box_on_target, dmgP.box_on_target);
  drawPixels('dmg_player_down', grids.player_down, dmgP.player);
  drawPixels('dmg_player_up', grids.player_up, { ...dmgP.player, '4': '#306230' });
  drawPixels('dmg_player_left', grids.player_left, dmgP.player);
  drawPixels('dmg_player_right', grids.player_right, dmgP.player);
  drawPixels('dmg_player_carry', grids.player_carry, dmgP.player, 16, 24);
  drawPixels('dmg_player_victory', grids.player_victory, dmgP.player, 16, 20);
}


// -------------------------------------------------------------
// CENA 1: TELA DE INÍCIO (TITLE SCENE)
// -------------------------------------------------------------
class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
    this.selectedOption = 0; // 0 = INÍCIO, 1 = OPÇÕES
  }

  init() {
    this.selectedOption = 0;
  }

  preload() {
    generateGlobalTextures(this);
  }

  create() {
    // Garante que o cursor comece sempre em INÍCIO (opção 0)
    this.selectedOption = 0;

    // Esconde HUD na tela de título
    const hud = document.getElementById('game-hud');
    if (hud) hud.classList.add('hidden');

    this.updateBackground();

    // Título SOKOBAN
    const titleText = this.add.text(128, 38, 'SOKOBAN', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '22px',
      color: isColorModeActive() ? '#fbbf24' : '#0f380f',
      align: 'center'
    }).setOrigin(0.5);

    // Subtítulo
    this.add.text(128, 60, isColorModeActive() ? 'COLOR EDITION' : 'DMG CLASSIC', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: isColorModeActive() ? '#4ade80' : '#306230',
      align: 'center'
    }).setOrigin(0.5);

    // Personagem Carregando a Caixa (Pixel Art no Centro)
    this.carrySprite = this.add.image(128, 114, getTexKey('player_carry'))
      .setDisplaySize(38, 57);

    // Animação sutil de respiro / elevação do personagem carregando
    this.tweens.add({
      targets: this.carrySprite,
      y: 110,
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Opções do Menu
    this.options = [
      { text: 'INÍCIO', y: 178, action: () => this.startGame() },
      { text: 'OPÇÕES', y: 206, action: () => this.openOptions() }
    ];

    this.optionTexts = [];
    this.options.forEach((opt, index) => {
      const txt = this.add.text(128, opt.y, opt.text, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '11px',
        color: this.getTextColor(index === 0),
        align: 'center'
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      txt.on('pointerdown', () => {
        this.selectedOption = index;
        this.updateMenuVisuals();
        opt.action();
      });

      this.optionTexts.push(txt);
    });

    // Cursor Indicador (▶) posicionado exatamente em INÍCIO (opção 0)
    this.cursor = this.add.text(78, this.options[0].y, '▶', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: isColorModeActive() ? '#f59e0b' : '#0f380f'
    }).setOrigin(0.5);

    // Cursor piscante
    this.tweens.add({
      targets: this.cursor,
      alpha: 0.2,
      duration: 350,
      yoyo: true,
      repeat: -1
    });

    // Instrução no rodapé
    this.add.text(128, 238, '▲/▼ MOVER   ENTER: CONFIRMAR', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      color: isColorModeActive() ? '#9ca3af' : '#306230'
    }).setOrigin(0.5);

    // Controles por teclado (Setas navegam, Enter confirma, R reinicia para INÍCIO)
    this.input.keyboard.on('keydown', (event) => {
      const key = event.key.toLowerCase();
      if (key === 'arrowup' || key === 'w') {
        event.preventDefault();
        this.changeOption(-1);
      } else if (key === 'arrowdown' || key === 's') {
        event.preventDefault();
        this.changeOption(1);
      } else if (key === 'enter' || key === ' ' || key === 'a') {
        event.preventDefault();
        this.options[this.selectedOption].action();
      } else if (key === 'c') {
        event.preventDefault();
        this.toggleColorPalette();
      } else if (key === 'r') {
        event.preventDefault();
        window.soundManager.playReset();
        this.selectedOption = 0;
        this.updateMenuVisuals();
      }
    });

    // Força o estado visual para garantir cursor em INÍCIO
    this.updateMenuVisuals();
    this.bindConsoleButtons();
  }

  updateBackground() {
    this.cameras.main.setBackgroundColor(isColorModeActive() ? '#0b0f0b' : '#8bac0f');
  }

  getTextColor(isSelected) {
    if (isColorModeActive()) {
      return isSelected ? '#fbbf24' : '#e5e7eb';
    } else {
      return isSelected ? '#0f380f' : '#306230';
    }
  }

  changeOption(delta) {
    this.selectedOption = (this.selectedOption + delta + this.options.length) % this.options.length;
    window.soundManager.playBlip();
    this.updateMenuVisuals();
  }

  updateMenuVisuals() {
    this.optionTexts.forEach((txt, idx) => {
      txt.setColor(this.getTextColor(idx === this.selectedOption));
    });
    this.cursor.setY(this.options[this.selectedOption].y);
  }

  startGame() {
    window.soundManager.playBlip();
    this.scene.start('SokobanScene');
  }

  openOptions() {
    window.soundManager.playBlip();
    this.scene.start('OptionsScene');
  }

  toggleColorPalette() {
    const isColor = isColorModeActive();
    localStorage.setItem('sokoban_color_mode', !isColor);
    applyDOMColorMode();
    this.scene.restart();
  }

  bindConsoleButtons() {
    // D-Pad e Botões A/B/RESET
    const upBtn = document.querySelector('.dpad-up');
    const downBtn = document.querySelector('.dpad-down');
    const aBtn = document.getElementById('btn-confirm') || document.getElementById('btn-restart');
    const bBtn = document.getElementById('btn-undo');
    const resetBtn = document.getElementById('btn-reset');
    const resetMount = document.querySelector('.gb-side-switch-mount');

    if (upBtn) upBtn.onclick = () => this.changeOption(-1);
    if (downBtn) downBtn.onclick = () => this.changeOption(1);
    if (aBtn) aBtn.onclick = () => this.options[this.selectedOption].action();
    const doReset = () => {
      window.soundManager.playReset();
      this.selectedOption = 0;
      this.updateMenuVisuals();
    };
    if (resetBtn) resetBtn.onclick = doReset;
    if (resetMount) resetMount.onclick = (e) => {
      if (e.target !== resetBtn) doReset();
    };
  }
}


// -------------------------------------------------------------
// CENA 2: TELA DE OPÇÕES (OPTIONS SCENE)
// -------------------------------------------------------------
class OptionsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'OptionsScene' });
    this.menuIndex = 0; // 0 = Volume, 1 = Brilho, 2 = Voltar
  }

  create() {
    this.updateBackground();
    this.menuIndex = 0;

    // Título OPÇÕES
    this.add.text(128, 28, '-- OPÇÕES --', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: isColorModeActive() ? '#fbbf24' : '#0f380f'
    }).setOrigin(0.5);

    this.add.text(128, 42, '------------------', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: isColorModeActive() ? '#4b5563' : '#306230'
    }).setOrigin(0.5);

    // --- ITEM 0: VOLUME DO SOM ---
    this.volLabel = this.add.text(128, 64, 'VOLUME DO SOM', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: this.getTextColor(0)
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.volLabel.on('pointerdown', () => this.selectMenu(0));

    // Botões táteis [-] e [+] para Volume
    this.volMinusBtn = this.add.text(42, 84, '[-]', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: isColorModeActive() ? '#ef4444' : '#0f380f'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.volMinusBtn.on('pointerdown', () => { this.selectMenu(0); this.adjustVolume(-0.1); });

    this.volumeBarText = this.add.text(128, 84, this.getVolumeMeterString(), {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: isColorModeActive() ? '#fcd34d' : '#0f380f'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.volumeBarText.on('pointerdown', () => this.selectMenu(0));

    this.volPlusBtn = this.add.text(214, 84, '[+]', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: isColorModeActive() ? '#10b981' : '#0f380f'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.volPlusBtn.on('pointerdown', () => { this.selectMenu(0); this.adjustVolume(0.1); });

    // --- ITEM 1: BRILHO DA TELA ---
    this.brightLabel = this.add.text(128, 114, 'BRILHO DA TELA', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: this.getTextColor(1)
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.brightLabel.on('pointerdown', () => this.selectMenu(1));

    // Botões táteis [-] e [+] para Brilho
    this.brightMinusBtn = this.add.text(42, 134, '[-]', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: isColorModeActive() ? '#ef4444' : '#0f380f'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.brightMinusBtn.on('pointerdown', () => { this.selectMenu(1); this.adjustBrightness(-0.1); });

    this.brightBarText = this.add.text(128, 134, this.getBrightnessMeterString(), {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: isColorModeActive() ? '#fcd34d' : '#0f380f'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.brightBarText.on('pointerdown', () => this.selectMenu(1));

    this.brightPlusBtn = this.add.text(214, 134, '[+]', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: isColorModeActive() ? '#10b981' : '#0f380f'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.brightPlusBtn.on('pointerdown', () => { this.selectMenu(1); this.adjustBrightness(0.1); });

    // --- ITEM 2: VOLTAR AO INÍCIO ---
    this.backOptionText = this.add.text(128, 172, 'VOLTAR AO INÍCIO', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: this.getTextColor(2)
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.backOptionText.on('pointerdown', () => {
      this.selectMenu(2);
      this.goBack();
    });

    // Cursor retrô indicador de seleção (▶)
    this.cursor = this.add.text(30, 64, '▶', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: isColorModeActive() ? '#fbbf24' : '#0f380f'
    }).setOrigin(0.5);

    // Instruções de rodapé
    this.add.text(128, 220, '▲/▼ SELECIONAR ITEM\n◀/▶ AJUSTAR | ENTER: OK', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: isColorModeActive() ? '#9ca3af' : '#306230',
      align: 'center',
      lineSpacing: 5
    }).setOrigin(0.5);

    this.updateSelectionVisuals();

    // Teclado:
    // Setas CIMA e BAIXO navegam exclusivamente entre as opções!
    // Setas ESQUERDA e DIREITA alteram o volume / brilho!
    // Enter confirma (ou volta se em 'Voltar ao início')
    // Backspace / B / Escape volta imediatamente
    this.input.keyboard.on('keydown', (event) => {
      const key = event.key.toLowerCase();
      if (key === 'arrowup' || key === 'w') {
        event.preventDefault();
        this.changeMenu(-1);
      } else if (key === 'arrowdown' || key === 's') {
        event.preventDefault();
        this.changeMenu(1);
      } else if (key === 'arrowleft' || key === 'a') {
        event.preventDefault();
        if (this.menuIndex === 0) this.adjustVolume(-0.1);
        else if (this.menuIndex === 1) this.adjustBrightness(-0.1);
      } else if (key === 'arrowright' || key === 'd') {
        event.preventDefault();
        if (this.menuIndex === 0) this.adjustVolume(0.1);
        else if (this.menuIndex === 1) this.adjustBrightness(0.1);
      } else if (key === 'enter' || key === ' ') {
        event.preventDefault();
        if (this.menuIndex === 2) {
          this.goBack();
        } else {
          window.soundManager.playBlip();
        }
      } else if (key === 'backspace' || key === 'escape' || key === 'b') {
        event.preventDefault();
        this.goBack();
      } else if (key === 'c') {
        event.preventDefault();
        const isColor = isColorModeActive();
        localStorage.setItem('sokoban_color_mode', !isColor);
        applyDOMColorMode();
        this.scene.restart();
      }
    });

    this.bindConsoleButtons();
  }

  updateBackground() {
    this.cameras.main.setBackgroundColor(isColorModeActive() ? '#0b0f0b' : '#8bac0f');
  }

  getTextColor(itemIndex) {
    const isSelected = (this.menuIndex === itemIndex);
    if (isColorModeActive()) {
      return isSelected ? '#fbbf24' : '#9ca3af';
    } else {
      return isSelected ? '#0f380f' : '#306230';
    }
  }

  updateSelectionVisuals() {
    this.volLabel.setColor(this.getTextColor(0));
    this.brightLabel.setColor(this.getTextColor(1));
    this.backOptionText.setColor(this.getTextColor(2));

    const cursorY = [64, 114, 172][this.menuIndex];
    this.cursor.setY(cursorY);
    this.cursor.setColor(isColorModeActive() ? '#fbbf24' : '#0f380f');
  }

  changeMenu(delta) {
    this.menuIndex = (this.menuIndex + delta + 3) % 3;
    window.soundManager.playBlip();
    this.updateSelectionVisuals();
  }

  selectMenu(idx) {
    if (this.menuIndex !== idx) {
      this.menuIndex = idx;
      window.soundManager.playBlip();
      this.updateSelectionVisuals();
    }
  }

  getVolumeMeterString() {
    const vol = window.soundManager.getVolume();
    const totalBlocks = 8;
    const filledBlocks = Math.round(vol * totalBlocks);
    const emptyBlocks = totalBlocks - filledBlocks;
    const bar = '■'.repeat(filledBlocks) + '□'.repeat(emptyBlocks);
    const percent = Math.round(vol * 100);
    return `[${bar}] ${percent}%`;
  }

  adjustVolume(delta) {
    window.soundManager.changeVolume(delta);
    this.volumeBarText.setText(this.getVolumeMeterString());
  }

  getBrightnessMeterString() {
    const b = getScreenBrightness();
    const percent = Math.round(b * 100);
    const totalBlocks = 8;
    const steps = Math.round(((b - 0.5) / 0.5) * totalBlocks);
    const clampedSteps = Math.max(0, Math.min(totalBlocks, steps));
    const bar = '■'.repeat(clampedSteps) + '□'.repeat(totalBlocks - clampedSteps);
    return `[${bar}] ${percent}%`;
  }

  adjustBrightness(delta) {
    const cur = getScreenBrightness();
    setScreenBrightness(cur + delta);
    window.soundManager.playBlip();
    this.brightBarText.setText(this.getBrightnessMeterString());
  }

  goBack() {
    window.soundManager.playBlip();
    this.scene.start('TitleScene');
  }

  bindConsoleButtons() {
    const upBtn = document.querySelector('.dpad-up');
    const downBtn = document.querySelector('.dpad-down');
    const rightBtn = document.querySelector('.dpad-right');
    const leftBtn = document.querySelector('.dpad-left');
    const bBtn = document.getElementById('btn-undo');
    const aBtn = document.getElementById('btn-confirm') || document.getElementById('btn-restart');
    const resetBtn = document.getElementById('btn-reset');
    const resetMount = document.querySelector('.gb-side-switch-mount');

    if (upBtn) upBtn.onclick = () => this.changeMenu(-1);
    if (downBtn) downBtn.onclick = () => this.changeMenu(1);
    if (leftBtn) leftBtn.onclick = () => {
      if (this.menuIndex === 0) this.adjustVolume(-0.1);
      else if (this.menuIndex === 1) this.adjustBrightness(-0.1);
    };
    if (rightBtn) rightBtn.onclick = () => {
      if (this.menuIndex === 0) this.adjustVolume(0.1);
      else if (this.menuIndex === 1) this.adjustBrightness(0.1);
    };
    if (bBtn) bBtn.onclick = () => this.goBack();
    if (aBtn) aBtn.onclick = () => {
      if (this.menuIndex === 2) {
        this.goBack();
      } else {
        window.soundManager.playBlip();
      }
    };
    const doReset = () => {
      window.soundManager.playReset();
      this.goBack();
    };
    if (resetBtn) resetBtn.onclick = doReset;
    if (resetMount) resetMount.onclick = (e) => {
      if (e.target !== resetBtn) doReset();
    };
  }
}


// -------------------------------------------------------------
// CENA 3: JOGO PRINCIPAL (SOKOBAN SCENE)
// -------------------------------------------------------------
class SokobanScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SokobanScene' });
    this.currentLevelIndex = 0;
    this.movesCount = 0;
    this.pushesCount = 0;
    this.isMoving = false;
    this.undoStack = [];
    this.boxes = [];
    this.targets = [];
    this.walls = [];
    this.floors = [];
    this.playerSprite = null;
    this.playerPos = { x: 0, y: 0 };
    this.playerDir = 'down';
    this.tileSize = 24;
    this.offsetX = 0;
    this.offsetY = 0;
  }

  init(data) {
    if (data && typeof data.level === 'number') {
      this.currentLevelIndex = data.level;
    }
  }

  create() {
    // Exibe HUD durante o jogo
    const hud = document.getElementById('game-hud');
    if (hud) hud.classList.remove('hidden');

    this.input.keyboard.on('keydown', (event) => {
      const key = event.key.toLowerCase();
      const modalLevel = document.getElementById('modal-level-select');
      const modalInfo = document.getElementById('modal-info');
      const isModalOpen = (modalLevel && !modalLevel.classList.contains('hidden')) || (modalInfo && !modalInfo.classList.contains('hidden'));

      // Movimentação principal exclusivamente pelas SETAS (e suporte a WASD)
      if (key === 'arrowup' || key === 'w') { event.preventDefault(); if (!isModalOpen) this.tryMove(0, -1, 'up'); }
      else if (key === 'arrowdown' || key === 's') { event.preventDefault(); if (!isModalOpen) this.tryMove(0, 1, 'down'); }
      else if (key === 'arrowleft' || key === 'a') { event.preventDefault(); if (!isModalOpen) this.tryMove(-1, 0, 'left'); }
      else if (key === 'arrowright' || key === 'd') { event.preventDefault(); if (!isModalOpen) this.tryMove(1, 0, 'right'); }
      // Botão VOLTAR / DESFAZER = BACKSPACE (e suporte a Z / B)
      else if (key === 'backspace' || key === 'z' || key === 'u' || key === 'b') {
        event.preventDefault();
        if (isModalOpen) {
          if (modalLevel) modalLevel.classList.add('hidden');
          if (modalInfo) modalInfo.classList.add('hidden');
          return;
        }
        this.undo();
      }
      // Botão RESET DO CONSOLE = TECLA R (Voltar à tela de início)
      else if (key === 'r') {
        event.preventDefault();
        this.resetToTitle();
      }
      // Botão CONFIRMAR = ENTER (Fechar modais abertos)
      else if (key === 'enter') {
        event.preventDefault();
        if (isModalOpen) {
          if (modalLevel) modalLevel.classList.add('hidden');
          if (modalInfo) modalInfo.classList.add('hidden');
          return;
        }
      }
      else if (key === 'c') { event.preventDefault(); this.toggleColorMode(); }
      else if (key === 'escape') {
        event.preventDefault();
        if (isModalOpen) {
          if (modalLevel) modalLevel.classList.add('hidden');
          if (modalInfo) modalInfo.classList.add('hidden');
          return;
        }
        this.returnToTitle();
      }
    });

    this.loadSavedProgress();
    this.initLevel(this.currentLevelIndex);
    this.bindUIEvents();
    this.applyColorMode();
  }

  toggleColorMode() {
    const isColor = isColorModeActive();
    localStorage.setItem('sokoban_color_mode', !isColor);
    applyDOMColorMode();
    this.applyColorMode();
  }

  applyColorMode() {
    this.cameras.main.setBackgroundColor(isColorModeActive() ? '#0b0f0b' : '#8bac0f');

    if (this.walls) {
      this.walls.forEach(w => { if (w.sprite) w.sprite.setTexture(getTexKey('wall')); });
    }
    if (this.floors) {
      this.floors.forEach(f => f.setTexture(getTexKey('floor')));
    }
    if (this.targets) {
      this.targets.forEach(t => { if (t.sprite) t.sprite.setTexture(getTexKey('target')); });
    }
    if (this.playerSprite) {
      this.playerSprite.setTexture(getTexKey('player_' + this.playerDir));
    }
    this.updateTargetStatuses();
  }

  initLevel(levelIndex) {
    if (levelIndex < 0 || levelIndex >= window.SOKOBAN_LEVELS.length) {
      levelIndex = 0;
    }
    this.currentLevelIndex = levelIndex;
    const levelData = window.SOKOBAN_LEVELS[levelIndex];

    this.movesCount = 0;
    this.pushesCount = 0;
    this.undoStack = [];
    this.isMoving = false;
    this.playerDir = 'down';

    if (this.levelGroup) {
      this.levelGroup.destroy(true);
    }
    this.levelGroup = this.add.group();
    this.boxes = [];
    this.targets = [];
    this.walls = [];
    this.floors = [];

    const map = levelData.map;
    const rows = map.length;
    let cols = 0;
    for (let r = 0; r < rows; r++) {
      if (map[r].length > cols) cols = map[r].length;
    }

    const gameW = this.sys.game.config.width;
    const gameH = this.sys.game.config.height;

    const maxTileW = Math.floor((gameW - 8) / cols);
    const maxTileH = Math.floor((gameH - 8) / rows);
    this.tileSize = Math.max(16, Math.min(32, Math.min(maxTileW, maxTileH)));

    this.offsetX = Math.floor((gameW - (cols * this.tileSize)) / 2);
    this.offsetY = Math.floor((gameH - (rows * this.tileSize)) / 2);

    for (let y = 0; y < rows; y++) {
      const line = map[y];
      for (let x = 0; x < line.length; x++) {
        const char = line[x];
        const px = this.offsetX + x * this.tileSize + this.tileSize / 2;
        const py = this.offsetY + y * this.tileSize + this.tileSize / 2;

        if (char === ' ') continue;

        if (char !== '#') {
          const floor = this.add.image(px, py, getTexKey('floor'))
            .setDisplaySize(this.tileSize, this.tileSize);
          this.levelGroup.add(floor);
          this.floors.push(floor);
        }

        if (char === '#') {
          const wall = this.add.image(px, py, getTexKey('wall'))
            .setDisplaySize(this.tileSize, this.tileSize);
          this.levelGroup.add(wall);
          this.walls.push({ x, y, sprite: wall });
        } else if (char === '.') {
          const target = this.add.image(px, py, getTexKey('target'))
            .setDisplaySize(this.tileSize, this.tileSize);
          this.levelGroup.add(target);
          this.targets.push({ x, y, sprite: target });
        } else if (char === '$') {
          const box = this.add.image(px, py, getTexKey('box'))
            .setDisplaySize(this.tileSize, this.tileSize)
            .setDepth(10);
          this.levelGroup.add(box);
          this.boxes.push({ x, y, sprite: box });
        } else if (char === '*') {
          const target = this.add.image(px, py, getTexKey('target'))
            .setDisplaySize(this.tileSize, this.tileSize);
          this.levelGroup.add(target);
          this.targets.push({ x, y, sprite: target });

          const box = this.add.image(px, py, getTexKey('box_on_target'))
            .setDisplaySize(this.tileSize, this.tileSize)
            .setDepth(10);
          this.levelGroup.add(box);
          this.boxes.push({ x, y, sprite: box });
        } else if (char === '@') {
          this.playerPos = { x, y };
        } else if (char === '+') {
          const target = this.add.image(px, py, getTexKey('target'))
            .setDisplaySize(this.tileSize, this.tileSize);
          this.levelGroup.add(target);
          this.targets.push({ x, y, sprite: target });
          this.playerPos = { x, y };
        }
      }
    }

    const playerPxX = this.offsetX + this.playerPos.x * this.tileSize + this.tileSize / 2;
    const playerPxY = this.offsetY + this.playerPos.y * this.tileSize + this.tileSize / 2;
    this.playerSprite = this.add.image(playerPxX, playerPxY, getTexKey('player_down'))
      .setDisplaySize(this.tileSize, this.tileSize)
      .setDepth(20);
    this.levelGroup.add(this.playerSprite);

    this.updateTargetStatuses();
    this.updateUI();
  }

  isWall(x, y) {
    return this.walls.some(w => w.x === x && w.y === y);
  }

  getBox(x, y) {
    return this.boxes.find(b => b.x === x && b.y === y) || null;
  }

  isTarget(x, y) {
    return this.targets.some(t => t.x === x && t.y === y);
  }

  updateTargetStatuses() {
    let completedCount = 0;
    this.boxes.forEach(box => {
      const onTarget = this.isTarget(box.x, box.y);
      if (onTarget) {
        completedCount++;
        box.sprite.setTexture(getTexKey('box_on_target'));
      } else {
        box.sprite.setTexture(getTexKey('box'));
      }
    });
    return completedCount;
  }

  tryMove(dx, dy, dirName) {
    if (this.isMoving) return;

    this.playerDir = dirName;
    this.playerSprite.setTexture(getTexKey(`player_${dirName}`));

    const newX = this.playerPos.x + dx;
    const newY = this.playerPos.y + dy;

    if (this.isWall(newX, newY)) {
      return;
    }

    const box = this.getBox(newX, newY);
    if (box) {
      const boxNewX = box.x + dx;
      const boxNewY = box.y + dy;

      if (this.isWall(boxNewX, boxNewY) || this.getBox(boxNewX, boxNewY)) {
        return;
      }

      this.pushUndoState();
      this.isMoving = true;
      box.x = boxNewX;
      box.y = boxNewY;
      this.pushesCount++;
      this.movesCount++;

      const destBoxPxX = this.offsetX + boxNewX * this.tileSize + this.tileSize / 2;
      const destBoxPxY = this.offsetY + boxNewY * this.tileSize + this.tileSize / 2;

      this.tweens.add({
        targets: box.sprite,
        x: destBoxPxX,
        y: destBoxPxY,
        duration: 90,
        ease: 'Linear',
        onComplete: () => {
          const isNowOnTarget = this.isTarget(boxNewX, boxNewY);
          if (isNowOnTarget) {
            box.sprite.setTexture(getTexKey('box_on_target'));
            window.soundManager.playTarget();
          } else {
            box.sprite.setTexture(getTexKey('box'));
            window.soundManager.playPush();
          }
          this.updateTargetStatuses();
          this.checkWinCondition();
        }
      });

      this.playerPos.x = newX;
      this.playerPos.y = newY;
      const destPlayerPxX = this.offsetX + newX * this.tileSize + this.tileSize / 2;
      const destPlayerPxY = this.offsetY + newY * this.tileSize + this.tileSize / 2;

      this.tweens.add({
        targets: this.playerSprite,
        x: destPlayerPxX,
        y: destPlayerPxY,
        duration: 90,
        ease: 'Linear',
        onComplete: () => {
          this.isMoving = false;
          this.updateUI();
        }
      });

    } else {
      this.pushUndoState();
      this.isMoving = true;
      this.movesCount++;
      this.playerPos.x = newX;
      this.playerPos.y = newY;

      const destPlayerPxX = this.offsetX + newX * this.tileSize + this.tileSize / 2;
      const destPlayerPxY = this.offsetY + newY * this.tileSize + this.tileSize / 2;

      window.soundManager.playMove();

      this.tweens.add({
        targets: this.playerSprite,
        x: destPlayerPxX,
        y: destPlayerPxY,
        duration: 70,
        ease: 'Linear',
        onComplete: () => {
          this.isMoving = false;
          this.updateUI();
        }
      });
    }
  }

  pushUndoState() {
    this.undoStack.push({
      player: { x: this.playerPos.x, y: this.playerPos.y },
      dir: this.playerDir,
      boxes: this.boxes.map(b => ({ x: b.x, y: b.y })),
      moves: this.movesCount,
      pushes: this.pushesCount
    });
  }

  undo() {
    if (this.isMoving || this.undoStack.length === 0) return;

    const prevState = this.undoStack.pop();
    this.playerPos = { x: prevState.player.x, y: prevState.player.y };
    this.playerDir = prevState.dir || 'down';
    this.playerSprite.setTexture(getTexKey(`player_${this.playerDir}`));
    this.movesCount = prevState.moves;
    this.pushesCount = prevState.pushes;

    const playerPxX = this.offsetX + this.playerPos.x * this.tileSize + this.tileSize / 2;
    const playerPxY = this.offsetY + this.playerPos.y * this.tileSize + this.tileSize / 2;
    this.playerSprite.setPosition(playerPxX, playerPxY);

    prevState.boxes.forEach((bState, i) => {
      const box = this.boxes[i];
      box.x = bState.x;
      box.y = bState.y;
      const boxPxX = this.offsetX + box.x * this.tileSize + this.tileSize / 2;
      const boxPxY = this.offsetY + box.y * this.tileSize + this.tileSize / 2;
      box.sprite.setPosition(boxPxX, boxPxY);
    });

    this.updateTargetStatuses();
    this.updateUI();
    window.soundManager.playUndo();
  }

  restartLevel() {
    if (this.isMoving) return;
    window.soundManager.playReset();
    this.initLevel(this.currentLevelIndex);
  }

  resetToTitle() {
    window.soundManager.playReset();
    const modalLevel = document.getElementById('modal-level-select');
    const modalInfo = document.getElementById('modal-info');
    if (modalLevel) modalLevel.classList.add('hidden');
    if (modalInfo) modalInfo.classList.add('hidden');
    const hud = document.getElementById('game-hud');
    if (hud) hud.classList.add('hidden');
    this.scene.start('TitleScene');
  }

  returnToTitle() {
    const hud = document.getElementById('game-hud');
    if (hud) hud.classList.add('hidden');
    this.scene.start('TitleScene');
  }

  checkWinCondition() {
    const allCompleted = this.boxes.every(b => this.isTarget(b.x, b.y));
    if (allCompleted) {
      window.soundManager.playWin();

      const isFinalLevel = (this.currentLevelIndex === window.SOKOBAN_LEVELS.length - 1);

      if (isFinalLevel) {
        // ZEROU O JOGO! Transição para a Cena de Encerramento (EndingScene)
        this.time.delayedCall(500, () => {
          this.scene.start('EndingScene');
        });
      } else {
        // Salva progresso da próxima fase
        const unlocked = parseInt(localStorage.getItem('sokoban_unlocked') || '1', 10);
        if (this.currentLevelIndex + 2 > unlocked) {
          localStorage.setItem('sokoban_unlocked', Math.min(window.SOKOBAN_LEVELS.length, this.currentLevelIndex + 2));
        }

        // Transição DIRETA para a tela de carregamento 8-bit sem modal
        this.time.delayedCall(400, () => {
          this.scene.start('LoadingScene', {
            nextLevel: this.currentLevelIndex + 1,
            completedLevel: this.currentLevelIndex
          });
        });
      }
    }
  }

  updateUI() {
    const pad = (num, size = 3) => {
      let s = num + "";
      while (s.length < size) s = "0" + s;
      return s;
    };

    document.getElementById('stat-level').textContent = `${this.currentLevelIndex + 1}/${window.SOKOBAN_LEVELS.length}`;
    document.getElementById('stat-moves').textContent = pad(this.movesCount);
    document.getElementById('stat-pushes').textContent = pad(this.pushesCount);

    const completed = this.boxes.filter(b => this.isTarget(b.x, b.y)).length;
    document.getElementById('stat-targets').textContent = `${completed}/${this.targets.length}`;
  }

  loadSavedProgress() {
    const unlocked = parseInt(localStorage.getItem('sokoban_unlocked') || '1', 10);
    this.unlockedLevels = unlocked;
  }

  bindUIEvents() {
    // Action buttons (B = Undo, A = Confirm/Close Modal, RESET = Voltar à Tela de Início)
    const undoBtn = document.getElementById('btn-undo');
    const confirmBtn = document.getElementById('btn-confirm') || document.getElementById('btn-restart');
    const resetBtn = document.getElementById('btn-reset');
    const resetMount = document.querySelector('.gb-side-switch-mount');

    if (undoBtn) undoBtn.onclick = () => this.undo();
    if (confirmBtn) {
      confirmBtn.onclick = () => {
        const modalLevel = document.getElementById('modal-level-select');
        const modalInfo = document.getElementById('modal-info');
        if (modalLevel && !modalLevel.classList.contains('hidden')) modalLevel.classList.add('hidden');
        if (modalInfo && !modalInfo.classList.contains('hidden')) modalInfo.classList.add('hidden');
      };
    }
    if (resetBtn) resetBtn.onclick = () => this.resetToTitle();
    if (resetMount) resetMount.onclick = (e) => {
      if (e.target !== resetBtn) this.resetToTitle();
    };

    // D-Pad clicks / touches
    const dirs = {
      '.dpad-up': [0, -1, 'up'],
      '.dpad-down': [0, 1, 'down'],
      '.dpad-left': [-1, 0, 'left'],
      '.dpad-right': [1, 0, 'right']
    };
    for (const [selector, [dx, dy, dir]] of Object.entries(dirs)) {
      const el = document.querySelector(selector);
      if (el) el.onclick = () => this.tryMove(dx, dy, dir);
    }

    // Select button -> Level select modal
    const modalLevel = document.getElementById('modal-level-select');
    const levelGrid = document.getElementById('level-grid');

    document.getElementById('btn-level-select').onclick = () => {
      levelGrid.innerHTML = '';
      const unlocked = parseInt(localStorage.getItem('sokoban_unlocked') || '1', 10);

      window.SOKOBAN_LEVELS.forEach((lvl, idx) => {
        const btn = document.createElement('button');
        btn.className = 'retro-level-btn';
        if (idx === this.currentLevelIndex) btn.classList.add('active');
        if (idx + 1 > unlocked) {
          btn.classList.add('locked');
          btn.textContent = `LV${idx + 1} 🔒`;
        } else {
          btn.textContent = `LV ${idx + 1}`;
          btn.onclick = () => {
            this.initLevel(idx);
            modalLevel.classList.add('hidden');
          };
        }
        levelGrid.appendChild(btn);
      });
      modalLevel.classList.remove('hidden');
    };

    document.getElementById('btn-close-levels').onclick = () => {
      modalLevel.classList.add('hidden');
    };

    // Start button -> Info modal
    const modalInfo = document.getElementById('modal-info');
    document.getElementById('btn-info').onclick = () => {
      const currentLevel = window.SOKOBAN_LEVELS[this.currentLevelIndex];
      const infoTitle = modalInfo.querySelector('.retro-title');
      const infoTexts = modalInfo.querySelectorAll('.retro-text');
      if (infoTitle) infoTitle.textContent = `LV ${this.currentLevelIndex + 1}: ${currentLevel.name.toUpperCase()}`;
      if (infoTexts && infoTexts[0]) infoTexts[0].textContent = currentLevel.hint.toUpperCase();
      modalInfo.classList.remove('hidden');
    };
    document.getElementById('btn-close-info').onclick = () => {
      modalInfo.classList.add('hidden');
    };
  }
}


// -------------------------------------------------------------
// CENA DE CARREGAMENTO 8-BIT (LOADING SCENE)
// -------------------------------------------------------------
class LoadingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LoadingScene' });
  }

  init(data) {
    this.nextLevelIndex = (data && typeof data.nextLevel === 'number') ? data.nextLevel : 0;
    this.completedLevelIndex = (data && typeof data.completedLevel === 'number') ? data.completedLevel : 0;
  }

  create() {
    // Esconde HUD durante o carregamento
    const hud = document.getElementById('game-hud');
    if (hud) hud.classList.add('hidden');

    this.cameras.main.setBackgroundColor(isColorModeActive() ? '#0b0f0b' : '#8bac0f');

    // Título Superior
    this.add.text(128, 38, '★ FASE CONCLUÍDA! ★', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: isColorModeActive() ? '#fbbf24' : '#0f380f',
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(128, 56, '------------------', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: isColorModeActive() ? '#4b5563' : '#306230',
      align: 'center'
    }).setOrigin(0.5);

    // Caixa de madeira 8-bit saltitando no centro
    const crate = this.add.image(128, 100, getTexKey('box_on_target'))
      .setDisplaySize(38, 38);

    this.tweens.add({
      targets: crate,
      y: 88,
      duration: 260,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Texto CARREGANDO...
    this.add.text(128, 142, 'CARREGANDO...', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: isColorModeActive() ? '#4ade80' : '#0f380f',
      align: 'center'
    }).setOrigin(0.5);

    // Informação da Próxima Fase
    const nextLevelData = window.SOKOBAN_LEVELS[this.nextLevelIndex];
    const nextName = nextLevelData ? nextLevelData.name.toUpperCase() : '';
    this.add.text(128, 168, `PROXIMA: FASE ${this.nextLevelIndex + 1}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: isColorModeActive() ? '#e5e7eb' : '#306230',
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(128, 186, `"${nextName}"`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: isColorModeActive() ? '#fcd34d' : '#0f380f',
      align: 'center'
    }).setOrigin(0.5);

    // Barra de Progresso Retrô 8-bit [■■■■■.....]
    const totalSteps = 8;
    this.barText = this.add.text(128, 220, `[${'.'.repeat(totalSteps)}]`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: isColorModeActive() ? '#fbbf24' : '#0f380f',
      align: 'center'
    }).setOrigin(0.5);

    let step = 0;
    const stepDuration = 120; // 8 * 120ms = ~960ms de carregamento (rápido e fluído)

    this.time.addEvent({
      delay: stepDuration,
      repeat: totalSteps - 1,
      callback: () => {
        step++;
        const filled = '■'.repeat(step);
        const empty = '.'.repeat(totalSteps - step);
        this.barText.setText(`[${filled}${empty}]`);

        if (step % 2 === 0) {
          window.soundManager.playBlip();
        }

        if (step >= totalSteps) {
          this.time.delayedCall(160, () => {
            this.scene.start('SokobanScene', { level: this.nextLevelIndex });
          });
        }
      }
    });

    const resetBtn = document.getElementById('btn-reset');
    const resetMount = document.querySelector('.gb-side-switch-mount');
    const doReset = () => {
      window.soundManager.playReset();
      this.scene.start('TitleScene');
    };
    if (resetBtn) resetBtn.onclick = doReset;
    if (resetMount) resetMount.onclick = (e) => {
      if (e.target !== resetBtn) doReset();
    };
    this.input.keyboard.on('keydown', (event) => {
      if (event.key.toLowerCase() === 'r') {
        event.preventDefault();
        window.soundManager.playReset();
        this.scene.start('TitleScene');
      }
    });
  }
}


// -------------------------------------------------------------
// CENA 4: ENCERRAMENTO / ZEROU O JOGO (ENDING SCENE)
// -------------------------------------------------------------
class EndingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndingScene' });
  }

  create() {
    // Esconde HUD na tela de encerramento
    const hud = document.getElementById('game-hud');
    if (hud) hud.classList.add('hidden');

    this.cameras.main.setBackgroundColor(isColorModeActive() ? '#0b0f0b' : '#8bac0f');

    // Mensagem de Parabéns ao Jogador
    const congratsText = this.add.text(128, 32, '★ PARABÉNS! ★', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: isColorModeActive() ? '#fbbf24' : '#0f380f',
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(128, 56, 'VOCÊ ZEROU O JOGO!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: isColorModeActive() ? '#4ade80' : '#306230',
      align: 'center'
    }).setOrigin(0.5);

    // Sprite do Personagem (Centralizado no Chão)
    const groundY = 145;
    this.hero = this.add.image(128, groundY, getTexKey('player_down'))
      .setDisplaySize(36, 36);

    // Texto de rodapé (aparecerá após a animação de vitória)
    this.promptText = this.add.text(128, 224, 'ENTER: RECOMEÇAR', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: isColorModeActive() ? '#9ca3af' : '#306230',
      align: 'center'
    }).setOrigin(0.5).setAlpha(0);

    // EXECUTAR SEQUÊNCIA DE ANIMAÇÃO:
    // 1. Pulo 1
    // 2. Pulo 2
    // 3. Sinal de Vitória com os Dedos ✌️ + Fanfarra
    // 4. Retorno à Tela de Início
    this.time.delayedCall(400, () => {
      this.executeVictorySequence(groundY);
    });
  }

  executeVictorySequence(groundY) {
    // PULO 1
    window.soundManager.playJump();
    this.hero.setTexture(getTexKey('player_up'));

    this.tweens.add({
      targets: this.hero,
      y: groundY - 26,
      duration: 220,
      ease: 'Cubic.easeOut',
      yoyo: true,
      onYoyo: () => {
        this.hero.setTexture(getTexKey('player_down'));
      },
      onComplete: () => {
        // Pausa breve entre os pulos
        this.time.delayedCall(120, () => {
          // PULO 2
          window.soundManager.playJump();
          this.hero.setTexture(getTexKey('player_up'));

          this.tweens.add({
            targets: this.hero,
            y: groundY - 26,
            duration: 220,
            ease: 'Cubic.easeOut',
            yoyo: true,
            onYoyo: () => {
              this.hero.setTexture(getTexKey('player_down'));
            },
            onComplete: () => {
              // SINAL DE VITÓRIA COM OS DEDOS (✌️)
              this.time.delayedCall(150, () => {
                this.showVictoryPose(groundY);
              });
            }
          });
        });
      }
    });
  }

  showVictoryPose(groundY) {
    // Troca para o sprite comemorativo com os dedos fazendo sinal de vitória ✌️
    this.hero.setTexture(getTexKey('player_victory'));
    this.hero.setDisplaySize(36, 45); // Ajuste proporcional da altura com braços levantados
    this.hero.setY(groundY - 4);

    // Toca a grande fanfarra de encerramento
    window.soundManager.playGrandFinale();

    // Efeito de confetes / estrelas piscantes
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const dist = Phaser.Math.Between(40, 80);
      const star = this.add.text(128, groundY - 10, '★', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: isColorModeActive() ? '#fbbf24' : '#0f380f'
      }).setOrigin(0.5);

      this.tweens.add({
        targets: star,
        x: 128 + Math.cos(angle) * dist,
        y: groundY - 10 + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.3,
        duration: 900 + i * 40,
        ease: 'Cubic.easeOut',
        onComplete: () => star.destroy()
      });
    }

    // Exibe texto para voltar e pisca
    this.tweens.add({
      targets: this.promptText,
      alpha: 1,
      duration: 500
    });

    // Permite ao jogador pressionar qualquer tecla/clicar para voltar à tela de início
    const backToTitle = () => {
      window.soundManager.playReset();
      this.scene.start('TitleScene');
    };

    const resetBtn = document.getElementById('btn-reset');
    const resetMount = document.querySelector('.gb-side-switch-mount');
    if (resetBtn) resetBtn.onclick = backToTitle;
    if (resetMount) resetMount.onclick = (e) => {
      if (e.target !== resetBtn) backToTitle();
    };

    this.input.keyboard.once('keydown', backToTitle);
    this.input.once('pointerdown', backToTitle);

    // Timer de retorno automático após 6.5 segundos
    this.time.delayedCall(6500, backToTitle);
  }
}


// -------------------------------------------------------------
// SINCRONIZAÇÃO DA PALETA NO DOM
// -------------------------------------------------------------
function applyDOMColorMode() {
  const isColor = isColorModeActive();
  const consoleEl = document.querySelector('.gb-console');
  const colorBtn = document.getElementById('btn-color-mode');
  const badge = document.getElementById('screen-badge');

  if (isColor) {
    if (consoleEl) consoleEl.classList.remove('dmg-mode');
    document.body.classList.remove('dmg-mode-active');
    if (colorBtn) {
      colorBtn.textContent = '🎨 COLOR: ON';
      colorBtn.classList.add('btn-color-active');
    }
    if (badge) badge.textContent = 'GBC 8-BIT';
  } else {
    if (consoleEl) consoleEl.classList.add('dmg-mode');
    document.body.classList.add('dmg-mode-active');
    if (colorBtn) {
      colorBtn.textContent = '📟 MONO: DMG';
      colorBtn.classList.remove('btn-color-active');
    }
    if (badge) badge.textContent = 'DMG 4-SHADE';
  }
}


// -------------------------------------------------------------
// INICIALIZAÇÃO PHASER
// -------------------------------------------------------------
const config = {
  type: Phaser.AUTO,
  parent: 'phaser-mount',
  width: 256,
  height: 256,
  backgroundColor: isColorModeActive() ? '#0b0f0b' : '#8bac0f',
  pixelArt: true,
  roundPixels: true,
  render: {
    antialias: false,
    pixelArt: true,
    roundPixels: true
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [TitleScene, OptionsScene, SokobanScene, LoadingScene, EndingScene]
};

window.onload = () => {
  applyDOMColorMode();
  applyDOMBrightness();

  // Botão de alternância COLOR / DMG no topo do visor
  const colorBtn = document.getElementById('btn-color-mode');
  if (colorBtn) {
    colorBtn.onclick = () => {
      const isColor = isColorModeActive();
      localStorage.setItem('sokoban_color_mode', !isColor);
      applyDOMColorMode();
      // Reinicia a cena ativa para aplicar a paleta
      const currentScene = window.game.scene.getScenes(true)[0];
      if (currentScene) currentScene.scene.restart();
    };
  }

  // Som toggle
  const soundBtn = document.getElementById('btn-sound');
  if (soundBtn) {
    soundBtn.textContent = window.soundManager.isMuted() ? '🔇 MUTE' : '🔊 CHIP';
    soundBtn.onclick = () => {
      const isMuted = window.soundManager.toggleMute();
      soundBtn.textContent = isMuted ? '🔇 MUTE' : '🔊 CHIP';
    };
  }

  // Previne rolagem acidental da página ao pressionar setas ou espaço
  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
  }, { passive: false });

  // Atualiza escala do Phaser dinamicamente ao redimensionar a janela
  window.addEventListener('resize', () => {
    if (window.game && window.game.scale) {
      window.game.scale.refresh();
    }
  });

  window.game = new Phaser.Game(config);
};
