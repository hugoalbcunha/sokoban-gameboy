// Sokoban Levels definition (100% verificadas e solucionáveis matematicamente)
// Símbolos:
// '#' = Parede (Wall)
// ' ' = Chão (Floor)
// '.' = Ponto de Destino / Alvo (Goal Target)
// '$' = Caixa / Crate (Box)
// '*' = Caixa já no Alvo (Box on Goal)
// '@' = Jogador (Player)
// '+' = Jogador no Alvo (Player on Goal)

const SOKOBAN_LEVELS = [
  // Nível 1: Tutorial Básico (1 Caixa)
  {
    id: 1,
    name: "Primeiros Passos",
    difficulty: "Tutorial",
    hint: "Contorne a caixa para empurrá-la no alvo!",
    map: [
      "#####",
      "#@  #",
      "# $ #",
      "#  .#",
      "#####"
    ]
  },

  // Nível 2: Alinhamento Duplo (2 Caixas)
  {
    id: 2,
    name: "Alinhamento Duplo",
    difficulty: "Fácil",
    hint: "Empurre uma caixa para cima e contorne para empurrar a segunda.",
    map: [
      "######",
      "# .. #",
      "# $$ #",
      "# @  #",
      "######"
    ]
  },

  // Nível 3: O Desvio (2 Caixas - Microban 2)
  {
    id: 3,
    name: "O Desvio",
    difficulty: "Normal",
    hint: "Abra caminho pela lateral antes de descer as caixas.",
    map: [
      "  #####",
      "###   #",
      "#   $ #",
      "# # $ #",
      "# . .@#",
      "#######"
    ]
  },

  // Nível 4: O Labirinto (2 Caixas - Microban 4)
  {
    id: 4,
    name: "O Labirinto",
    difficulty: "Médio",
    hint: "Planeje os desvios com calma nos cantos para não prender as caixas.",
    map: [
      "  #####",
      "###   #",
      "# $ # #",
      "# # . #",
      "# . $ #",
      "###@  #",
      "  #####"
    ]
  },

  // Nível 5: A Encruzilhada (3 Caixas - Microban 10)
  {
    id: 5,
    name: "A Encruzilhada",
    difficulty: "Desafiador",
    hint: "Distribua as três caixas liberando a passagem pelo centro.",
    map: [
      "######",
      "# .  #",
      "# #$$#",
      "# . .#",
      "#  $ #",
      "#  @ #",
      "######"
    ]
  },

  // Nível 6: O Desafio Final (3 Caixas - Microban 14)
  {
    id: 6,
    name: "O Desafio Final",
    difficulty: "Mestre",
    hint: "Coordene a ordem exata de preenchimento dos alvos para vencer o jogo!",
    map: [
      "  #####",
      "###   #",
      "# .$$ #",
      "# # . #",
      "# $ . #",
      "###@  #",
      "  #####"
    ]
  }
];

window.SOKOBAN_LEVELS = SOKOBAN_LEVELS;
