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
      result[i] = "correct";
      usedPositions[i] = true;
      secretLetters[i] = null;
    }
  }

  // Paso 2: Verificar letras en posición incorrecta
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

// Actualizar el tablero
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

// Manejar entrada del teclado
document.addEventListener("keydown", async (event) => {
  const key = event.key.toUpperCase();

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
    if (currentCell < 5) {
      statusMessage.textContent = "La palabra debe tener 5 letras.";
      return;
    }

    const inputWord = Array.from(row.children).map(cell => cell.textContent).join("");

    // **Nueva validación: Verificar si la palabra existe**
    const exists = await isWordValid(inputWord);
    if (!exists) {
      statusMessage.textContent = "Palabra inexistente.";
      return;
    }

    const result = validateWord(inputWord);
    updateBoard(inputWord, result);

    if (inputWord === secretWord) {
      statusMessage.textContent = "¡Felicidades! Adivinaste la palabra.";
      document.removeEventListener("keydown", arguments.callee);
    } else if (currentRow >= 6) {
      statusMessage.textContent = `¡Perdiste! La palabra era: ${secretWord}`;
      document.removeEventListener("keydown", arguments.callee);
    }
    return;
  }

  if (currentCell < 5) {
    const cell = row.children[currentCell];
    cell.textContent = key;
    currentCell++;
  }
});

// Obtener la palabra inicial
fetchWord();
