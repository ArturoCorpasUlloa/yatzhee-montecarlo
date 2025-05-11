// --- Configuración de categorías de Yatzhee ---
const CATEGORIAS = [
  'Unos', 'Doses', 'Treses', 'Cuatros', 'Cincos', 'Seises',
  'Trío', 'Póker', 'Full', 'Escalera Pequeña', 'Escalera Grande', 'Yatzhee', 'Chance'
];
const TOTAL_CATEGORIAS = CATEGORIAS.length; // Más fácil de referenciar

const NUM_DICE = 5;
const MAX_ROLLS = 3;
const NUM_PLAYERS = 2;

let dice = [1, 1, 1, 1, 1];
let selected = [false, false, false, false, false];
let currentPlayer = 0;
let rollsLeft = MAX_ROLLS;
let scores = [
  Array(TOTAL_CATEGORIAS).fill(null),
  Array(TOTAL_CATEGORIAS).fill(null)
];
let usedCategories = [
  Array(TOTAL_CATEGORIAS).fill(false),
  Array(TOTAL_CATEGORIAS).fill(false)
];

// Referencias a elementos del DOM
const diceContainer = document.getElementById('dice-container');
const rollBtn = document.getElementById('roll-btn');
const rerollBtn = document.getElementById('reroll-btn');
const endTurnBtn = document.getElementById('end-turn-btn');
const message = document.getElementById('message');
const score1 = document.getElementById('score1');
const score2 = document.getElementById('score2');
const player1 = document.getElementById('player1');
const player2 = document.getElementById('player2');
const scoreTableBody = document.querySelector('#score-table tbody');

// NUEVAS referencias para la información del turno
const turnInfo1 = document.getElementById('turn-info1');
const turnInfo2 = document.getElementById('turn-info2');

// --- Funciones del juego ---

function renderDice() {
  diceContainer.innerHTML = '';
  for (let i = 0; i < NUM_DICE; i++) {
    const die = document.createElement('div');
    die.className = 'die' + (selected[i] ? ' selected' : '');
    die.textContent = dice[i];
    die.onclick = () => {
      if (rollsLeft < MAX_ROLLS && rollsLeft > 0) {
        selected[i] = !selected[i];
        renderDice();
      }
    };
    diceContainer.appendChild(die);
  }
}

function animateRoll(callback) {
  let frames = 15;
  let interval = setInterval(() => {
    for (let i = 0; i < NUM_DICE; i++) {
      if (selected[i]) {
        dice[i] = Math.floor(Math.random() * 6) + 1;
        diceContainer.children[i].classList.add('rolling');
        diceContainer.children[i].textContent = dice[i];
      }
    }
    frames--;
    if (frames === 0) {
      clearInterval(interval);
      for (let i = 0; i < NUM_DICE; i++) {
        diceContainer.children[i].classList.remove('rolling');
      }
      selected = [false, false, false, false, false];
      callback();
    }
  }, 40);
}

// NUEVA FUNCIÓN para actualizar la información del turno
function updateTurnInfo() {
  const turnsPlayedP1 = usedCategories[0].filter(used => used).length;
  const turnsPlayedP2 = usedCategories[1].filter(used => used).length;

  // El turno actual es el número de categorías llenas + 1, a menos que todas estén llenas
  const currentTurnP1 = Math.min(turnsPlayedP1 + 1, TOTAL_CATEGORIAS);
  const currentTurnP2 = Math.min(turnsPlayedP2 + 1, TOTAL_CATEGORIAS);

  turnInfo1.textContent = `Turno ${currentTurnP1}/${TOTAL_CATEGORIAS}`;
  turnInfo2.textContent = `Turno ${currentTurnP2}/${TOTAL_CATEGORIAS}`;
}


function startTurn() {
  rollsLeft = MAX_ROLLS;
  selected = [false, false, false, false, false];
  message.textContent = `Turno del Jugador ${currentPlayer + 1}. Lanza los dados.`;
  rollBtn.disabled = false;
  rerollBtn.disabled = true;
  endTurnBtn.disabled = true;
  renderDice();
  updateActivePlayer();
  renderScoreTable();
  updateTurnInfo(); // MODIFICADO: Llamar para actualizar info del turno
}

function updateActivePlayer() {
  player1.classList.toggle('active', currentPlayer === 0);
  player2.classList.toggle('active', currentPlayer === 1);
}

rollBtn.onclick = () => {
  rollBtn.disabled = true;
  selected = [true, true, true, true, true];
  animateRoll(() => {
    rollsLeft--;
    rerollBtn.disabled = false;
    endTurnBtn.disabled = false;
    message.textContent = `Lanzamientos restantes: ${rollsLeft}. Selecciona dados para volver a lanzar o elige una categoría.`;
    renderDice();
    if (rollsLeft === 0) {
      rerollBtn.disabled = true;
      message.textContent = 'No quedan lanzamientos. Elige una categoría.';
    }
    renderScoreTable();
  });
};

rerollBtn.onclick = () => {
  if (!selected.some(s => s === true)) {
    message.textContent = "Debes seleccionar al menos un dado para volver a lanzar.";
    return;
  }

  if (rollsLeft > 0) {
    rerollBtn.disabled = true;
    animateRoll(() => {
      rollsLeft--;
      rerollBtn.disabled = (rollsLeft === 0);
      message.textContent = `Lanzamientos restantes: ${rollsLeft}.`;
      if (rollsLeft > 0) {
          message.textContent += ` Selecciona dados para volver a lanzar o elige una categoría.`;
      }
      renderDice();
      if (rollsLeft === 0) {
        rollBtn.disabled = true;
        message.textContent = 'No quedan lanzamientos. Elige una categoría.';
      }
      renderScoreTable();
    });
  }
};

endTurnBtn.onclick = () => {
  if (rollsLeft < MAX_ROLLS) {
    message.textContent = 'Elige una categoría para puntuar.';
  } else {
    message.textContent = 'Debes lanzar los dados al menos una vez.';
  }
};

function renderScoreTable() {
  scoreTableBody.innerHTML = '';
  for (let i = 0; i < TOTAL_CATEGORIAS; i++) {
    const tr = document.createElement('tr');
    const tdCat = document.createElement('td');
    tdCat.textContent = CATEGORIAS[i];
    tr.appendChild(tdCat);
    for (let j = 0; j < NUM_PLAYERS; j++) {
      const td = document.createElement('td');
      if (scores[j][i] !== null) {
        td.textContent = scores[j][i];
      } else if (j === currentPlayer && rollsLeft < MAX_ROLLS) {
        if (!usedCategories[j][i]) {
          td.classList.add('selectable');
          td.style.cursor = 'pointer';
          td.onclick = () => seleccionarCategoria(i);
          td.textContent = calcularPuntuacion(i, dice);
        }
      }
      if (usedCategories[j][i]) td.classList.add('selected');
      tr.appendChild(td);
    }
    scoreTableBody.appendChild(tr);
  }
  score1.textContent = scores[0].reduce((a, b) => a + (b || 0), 0);
  score2.textContent = scores[1].reduce((a, b) => a + (b || 0), 0);
}

function seleccionarCategoria(catIdx) {
  if (usedCategories[currentPlayer][catIdx]) return;
  if (rollsLeft === MAX_ROLLS) {
      message.textContent = "Debes lanzar los dados al menos una vez antes de puntuar.";
      return;
  }
  const puntos = calcularPuntuacion(catIdx, dice);
  scores[currentPlayer][catIdx] = puntos;
  usedCategories[currentPlayer][catIdx] = true;
  message.textContent = `Jugador ${currentPlayer + 1} anotó ${puntos} puntos en ${CATEGORIAS[catIdx]}`;

  // Actualizar la información del turno DESPUÉS de marcar la categoría como usada
  updateTurnInfo(); // MODIFICADO

  renderScoreTable();

  rollBtn.disabled = true;
  rerollBtn.disabled = true;
  endTurnBtn.disabled = true;

  setTimeout(() => {
    if (finDelJuego()) {
      mostrarGanador();
    } else {
      currentPlayer = (currentPlayer + 1) % NUM_PLAYERS;
      startTurn(); // startTurn ya llama a updateTurnInfo, así que se actualizará para el nuevo jugador
    }
  }, 1200);
}

function finDelJuego() {
  return usedCategories.every(playerCats => playerCats.every(catUsed => catUsed));
}

function mostrarGanador() {
  const total1 = scores[0].reduce((a, b) => a + (b || 0), 0);
  const total2 = scores[1].reduce((a, b) => a + (b || 0), 0);
  if (total1 > total2) {
    message.textContent = '¡Jugador 1 gana!';
  } else if (total2 > total1) {
    message.textContent = '¡Jugador 2 gana!';
  } else {
    message.textContent = '¡Empate!';
  }
  rollBtn.disabled = true;
  rerollBtn.disabled = true;
  endTurnBtn.disabled = true;
  // Asegurar que la info del turno muestre el final si es necesario
  updateTurnInfo();
}

function contarDados(valor, dados) {
  return dados.filter(d => d === valor).length;
}

function calcularPuntuacion(catIdx, dados) {
  const counts = Array(7).fill(0);
  for (let d of dados) counts[d]++;

  const uniqueDice = Array.from(new Set(dados)).sort((a, b) => a - b);

  switch (CATEGORIAS[catIdx]) {
    case 'Unos': return contarDados(1, dados) * 1;
    case 'Doses': return contarDados(2, dados) * 2;
    case 'Treses': return contarDados(3, dados) * 3;
    case 'Cuatros': return contarDados(4, dados) * 4;
    case 'Cincos': return contarDados(5, dados) * 5;
    case 'Seises': return contarDados(6, dados) * 6;
    case 'Trío':
      return counts.some(c => c >= 3) ? sumaDados(dados) : 0;
    case 'Póker':
      return counts.some(c => c >= 4) ? sumaDados(dados) : 0;
    case 'Full':
      return (counts.includes(3) && counts.includes(2)) || counts.some(c => c === 5) ? 25 : 0;
    case 'Escalera Pequeña':
      if (uniqueDice.length < 4) return 0;
      if ((uniqueDice.includes(1) && uniqueDice.includes(2) && uniqueDice.includes(3) && uniqueDice.includes(4)) ||
          (uniqueDice.includes(2) && uniqueDice.includes(3) && uniqueDice.includes(4) && uniqueDice.includes(5)) ||
          (uniqueDice.includes(3) && uniqueDice.includes(4) && uniqueDice.includes(5) && uniqueDice.includes(6))) {
        return 30;
      }
      return 0;
    case 'Escalera Grande':
      if (uniqueDice.length < 5) return 0;
      if ((uniqueDice.join('').includes('12345')) || (uniqueDice.join('').includes('23456'))) {
        return 40;
      }
      return 0;
    case 'Yatzhee':
      return counts.some(c => c === 5) ? 50 : 0;
    case 'Chance':
      return sumaDados(dados);
    default: return 0;
  }
}

function sumaDados(dados) {
  return dados.reduce((a, b) => a + b, 0);
}

window.onload = () => {
  startTurn();
};