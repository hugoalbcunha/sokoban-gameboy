# 🎮 Sokoban 8-Bit — Game Boy Color Edition

Um jogo de quebra-cabeça clássico no estilo **Sokoban** totalmente recriado com estética autêntica de **8 bits** dos consoles portáteis **Game Boy / Game Boy Color**, construído com **Phaser 3**.

---

## ✨ Telas e Recursos do Jogo

1. **Tela de Início (Title Screen):**
   - Ilustração retrô em pixel art do protagonista erguendo uma caixa de madeira acima da cabeça.
   - Menu navegável: **INÍCIO** e **OPÇÕES** (navegue com as setas e confirme com Enter/Espaço/Botão A).
2. **Tela de Opções Completa (Volume, Brilho e Retorno):**
   - Menu com seleção vertical (**▲ Cima / ▼ Baixo**) entre os itens:
     - **VOLUME DO SOM**: ajuste exclusivamente para **◀ Esquerda (Diminuir)** e **▶ Direita (Aumentar)** com indicador de blocos `[■■■■■■■□□□] 70%`.
     - **BRILHO DA TELA**: ajuste para **◀ Esquerda (Diminuir)** e **▶ Direita (Aumentar)** com efeito visual de tela LCD em tempo real `[■■■■■□□□□□] 100%`.
     - **VOLTAR AO INÍCIO**: opção interativa para retornar à Tela de Início ao pressionar **Enter** / **Botão A** (ou a qualquer momento via tecla **Backspace** / **Botão B**).
   - Botões táteis `[-]` e `[+]` na tela para clique com o mouse ou toque mobile.
3. **6 Fases 100% Solucionáveis e Verificadas:**
   - Todas as 6 fases foram testadas e validadas matematicamente através de algoritmo BFS.
   - Puzzles clássicos baseados nas coleções *Boxxle* e *Microban*.
   - Ao concluir uma fase, o jogo não interrompe com janelas/modais externos: uma **tela de carregamento retrô em 8 bits** com barra de progresso `[■■■■■.....]` e caixa saltitante é exibida rapidamente e leva o jogador **direto à próxima fase**!
   - Sistema de Desfazer (`Undo`) ilimitado com a tecla **Backspace** / Botão **B**.
4. **Chave Lateral de RESET (Estilo Liga/Desliga Game Boy):**
   - Chave física tátil na lateral esquerda da carcaça do console virtual, reproduzindo o clássico botão de ligar/desligar do Game Boy (com atalho pela tecla **R**), para reiniciar a fase atual instantaneamente com efeito sonoro 8-bit.
5. **Encerramento Comemorativo ao Zerar o Jogo:**
   - Mensagem de parabéns na tela.
   - O personagem pula duas vezes de alegria.
   - O personagem faz o sinal de vitória com os dedos (**✌️ V**).
   - Fanfarra triunfante de encerramento e retorno automático para a Tela de Início.
6. **Paleta Dupla (Color vs Clássico DMG):**
   - Alterne instantaneamente entre o modo **Game Boy Color** e a paleta clássica **monocromática verde de 4 tons do Game Boy de 1989** pelo botão no visor ou tecla **C**.

---

## ⌨️ Controles

| Ação | Teclado | Game Boy Virtual / Mouse |
| :--- | :--- | :--- |
| **Mover Protagonista / Navegar Menus** | **Setas Direcionais** (`▲`, `▼`, `◀`, `▶`) | Cruz Direcional (D-Pad) |
| **Confirmar / Avançar / Menus** | **Enter** | Botão **A** (CONFIRMAR) |
| **Voltar Telas / Desfazer Movimento (Undo)** | **Backspace** | Botão **B** (VOLTAR) |
| **Reiniciar Jogo (Voltar ao Início)** | Tecla `R` | Chave Lateral **RESET** (Liga/Desliga) |
| **Alternar Paleta (Color / DMG)** | Tecla `C` | Botão **COLOR / MONO** no visor |
| **Menu de Seleção de Fases** | — | Botão **SELECT** |
| **Instruções / Ajuda** | — | Botão **START** |
| **Alternar Áudio Chiptune** | — | Botão **CHIP / MUTE** no visor |

---

## 🚀 Como Executar

Basta abrir o arquivo [index.html](file:///d:/PROJETOS/jogo_teste/index.html) diretamente no seu navegador.
