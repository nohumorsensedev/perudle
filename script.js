let secretWord = '';
let currentRow = 0;
let currentCell = 0;

// Elementos del DOM
const board = document.getElementById("board");
const statusMessage = document.getElementById("status-message");

// Obtener la palabra secreta
async function fetchWord() {
  const response = await fetch('/word');
  const data = await response.json();
  secretWord = data.word.toUpperCase();
  console.log(secretWord); // Para depurar

  // Crear tablero dinámico según longitud de la palabra
  createBoard(secretWord.length);
}

// Crear tablero dinámico
function createBoard(length) {
  board.innerHTML = ''; // Limpiar el tablero
  for (let i = 0; i < 6; i++) {
    const row = document.createElement("div");
    row.classList.add("row");
    for (let j = 0; j < length; j++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      row.appendChild(cell);
    }
    board.appendChild(row);
  }
}

// Validar palabra
async function isWordValid(word) {
  const response = await fetch(`/validate/${word}`);
  const data = await response.json();
  return data.exists;
}

function validateWord(inputWord) {
  const result = [];
  const secretLetters = secretWord.split('');
  const usedPositions = Array(secretWord.length).fill(false);

  for (let i = 0; i < inputWord.length; i++) {
    if (inputWord[i] === secretWord[i]) {
      result[i] = "correct";
      usedPositions[i] = true;
      secretLetters[i] = null;
    }
  }

  for (let i = 0; i < inputWord.length; i++) {
    if (!result[i]) {
      const index = secretLetters.indexOf(inputWord[i]);
      if (index !== -1 && !usedPositions[index]) {
        result[i] = "present";
        usedPositions[index] = true;
        secretLetters[index] = null;
      } else {
        result[i] = "absent";
      }
    }
  }
  return result;
}

// Actualizar tablero
function updateBoard(inputWord, result) {
  const row = board.children[currentRow];
  for (let i = 0; i < inputWord.length; i++) {
    const cell = row.children[i];
    cell.textContent = inputWord[i];
    cell.classList.add(result[i]);
  }
  currentRow++;
  currentCell = 0;
}

// Entrada del teclado
async function handleKeyPress(key) {
  key = key.toUpperCase();
  if (!/^[A-ZÑ]$/.test(key) && key !== "BACKSPACE" && key !== "ENTER") return;

  const row = board.children[currentRow];

  if (key === "BACKSPACE") {
    if (currentCell > 0) {
      currentCell--;
      const cell = row.children[currentCell];
      cell.textContent = "";
    }
    return;
  }

  if (key === "ENTER") {
    if (currentCell < secretWord.length) {
      statusMessage.textContent = `La palabra debe tener ${secretWord.length} letras.`;
      return;
    }

    const inputWord = Array.from(row.children).map(cell => cell.textContent).join("");
    const exists = await isWordValid(inputWord);

    if (!exists) {
      statusMessage.textContent = "Palabra inexistente.";
      return;
    }

    const result = validateWord(inputWord);
    updateBoard(inputWord, result);

    if (inputWord === secretWord) {
      statusMessage.textContent = "¡Felicidades! Adivinaste la palabra.";
    } else if (currentRow >= 6) {
      statusMessage.textContent = `¡Perdiste! La palabra era: ${secretWord}`;
    }
    return;
  }

  if (currentCell < secretWord.length) {
    const cell = row.children[currentCell];
    cell.textContent = key;
    currentCell++;
  }
}

document.addEventListener("keydown", (event) => handleKeyPress(event.key));
fetchWord();
