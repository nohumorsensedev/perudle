// Variables para controlar el estado del juego
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

// Validar si la palabra existe en la base de datos
async function isWordValid(word) {
  const response = await fetch(`/validate/${word}`);
  const data = await response.json();
  return data.exists;
}

// Validar la palabra ingresada
function validateWord(inputWord) {
  const result = [];
  const secretLetters = secretWord.split('');
  const usedPositions = Array(secretWord.length).fill(false);

  // Paso 1: Verificar letras correctas
  for (let i = 0; i < inputWord.length; i++) {
    if (inputWord[i] === secretWord[i]) {
      result[i] = "correct"; // Letra en posición correcta
      usedPositions[i] = true;
      secretLetters[i] = null;
    }
  }

  // Paso 2: Verificar letras presentes pero en posición incorrecta
  for (let i = 0; i < inputWord.length; i++) {
    if (!result[i]) { // Solo si no está marcada como correcta
      const index = secretLetters.indexOf(inputWord[i]);
      if (index !== -1 && !usedPositions[index]) {
        result[i] = "present"; // Letra en posición incorrecta
        usedPositions[index] = true;
        secretLetters[index] = null;
      } else {
        result[i] = "absent"; // Letra no existe
      }
    }
  }
  return result;
}

// Actualizar el tablero
function updateBoard(inputWord, result) {
  const row = board.children[currentRow];
  for (let i = 0; i < inputWord.length; i++) {
    const cell = row.children[i];
    cell.textContent = inputWord[i];
    cell.classList.add(result[i]); // Añadir clase (correct, present, absent)
  }
  currentRow++;
  currentCell = 0;
}

// Procesar entrada del teclado
async function handleKeyPress(key) {
  key = key.toUpperCase();

  // Validar entrada válida
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

    // Obtener palabra ingresada
    const inputWord = Array.from(row.children).map(cell => cell.textContent).join("");

    // Validar si la palabra existe
    const exists = await isWordValid(inputWord);
    if (!exists) {
      statusMessage.textContent = "Palabra inexistente.";
      return;
    }

    // Validar palabra
    const result = validateWord(inputWord);
    updateBoard(inputWord, result);

    // Verificar si ganó
    if (inputWord === secretWord) {
      statusMessage.textContent = "¡Felicidades! Adivinaste la palabra.";
      disableInput(); // Bloquear más entradas
    } else if (currentRow >= 6) {
      statusMessage.textContent = `¡Perdiste! La palabra era: ${secretWord}`;
      disableInput(); // Bloquear más entradas
    }
    return;
  }

  if (currentCell < secretWord.length) {
    const cell = row.children[currentCell];
    cell.textContent = key;
    currentCell++;
  }
}

// Deshabilitar teclado
function disableInput() {
  document.removeEventListener("keydown", keyboardInput);
}

// Manejar teclado físico
function keyboardInput(event) {
  handleKeyPress(event.key);
}

// Manejar teclado virtual
const keys = document.querySelectorAll(".key");
keys.forEach((key) => {
  key.addEventListener("click", () => {
    const keyValue = key.textContent.toUpperCase();

    if (keyValue === "⌫") {
      handleKeyPress("BACKSPACE");
    } else if (keyValue === "ENTER") {
      handleKeyPress("ENTER");
    } else {
      handleKeyPress(keyValue);
    }
  });
});

// Activar teclados
document.removeEventListener("keydown", keyboardInput);
document.addEventListener("keydown", keyboardInput);

// Obtener palabra inicial
fetchWord();
