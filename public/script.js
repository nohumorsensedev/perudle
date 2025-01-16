// Variables para el juego
let secretWord = '';
let currentRow = 0;
let currentCell = 0;

// Elementos del DOM
const board = document.getElementById("board");
const statusMessage = document.getElementById("status-message");

// Obtener palabra secreta del servidor
async function fetchWord() {
  const response = await fetch('/word'); // Obtener palabra desde el servidor
  const data = await response.json();
  secretWord = data.word.toUpperCase(); // Convertir en mayúsculas
  console.log(secretWord); // Para depuración

  createBoard(secretWord.length); // Crear el tablero dinámico
}

// Crear tablero dinámico según longitud de la palabra
function createBoard(length) {
  board.innerHTML = ''; // Limpiar tablero

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

// Validar si la palabra existe
async function isWordValid(word) {
  const response = await fetch(`/validate/${word}`);
  const data = await response.json();
  return data.exists; // Devuelve true o false
}

// Validar letras en la palabra
function validateWord(inputWord) {
  const result = [];
  const secretLetters = secretWord.split('');
  const usedPositions = Array(secretWord.length).fill(false);

  // Comprobar letras en posición correcta (verde)
  for (let i = 0; i < inputWord.length; i++) {
    if (inputWord[i] === secretWord[i]) {
      result[i] = "correct";
      usedPositions[i] = true;
      secretLetters[i] = null;
    }
  }

  // Comprobar letras presentes pero en posición incorrecta (amarillo)
  for (let i = 0; i < inputWord.length; i++) {
    if (!result[i]) {
      const index = secretLetters.indexOf(inputWord[i]);
      if (index !== -1 && !usedPositions[index]) {
        result[i] = "present";
        usedPositions[index] = true;
        secretLetters[index] = null;
      } else {
        result[i] = "absent"; // Letra no está en la palabra
      }
    }
  }
  return result;
}

// Actualizar tablero con colores
function updateBoard(inputWord, result) {
  const row = board.children[currentRow];

  for (let i = 0; i < inputWord.length; i++) {
    const cell = row.children[i];
    cell.textContent = inputWord[i]; // Mostrar letra
    cell.classList.remove("correct", "present", "absent");
    cell.classList.add(result[i]); // Aplicar color
  }

  currentRow++;
  currentCell = 0;
}

// Manejar entradas del teclado
async function handleKeyPress(key) {
  key = key.toUpperCase();

  // Validar entrada válida
  if (!/^[A-ZÑ]$/.test(key) && key !== "BACKSPACE" && key !== "ENTER") return;

  const row = board.children[currentRow];

  // Borrar letra
  if (key === "BACKSPACE") {
    if (currentCell > 0) {
      currentCell--;
      const cell = row.children[currentCell];
      cell.textContent = "";
    }
    return;
  }

  // Confirmar palabra
  if (key === "ENTER") {
    if (currentCell < secretWord.length) {
      statusMessage.textContent = `La palabra debe tener ${secretWord.length} letras.`;
      return;
    }

    // Obtener palabra ingresada
    const inputWord = Array.from(row.children)
      .map((cell) => cell.textContent)
      .join("");

    // Validar si existe
    const exists = await isWordValid(inputWord);
    if (!exists) {
      statusMessage.textContent = "❌ Esa palabra no existe.";
      return;
    }

    // Validar letras
    const result = validateWord(inputWord);
    updateBoard(inputWord, result);

    // Verificar si ganó
    if (inputWord === secretWord) {
      statusMessage.textContent = "🎉 ¡Correcto! Adivinaste la palabra.";
      disableInput();
      return;
    }

    // Verificar si perdió
    if (currentRow >= 6) {
      statusMessage.textContent = `¡Perdiste! La palabra era: ${secretWord}`;
      disableInput();
      return;
    }

    // Seguir intentando
    statusMessage.textContent = "⏳ Sigue intentando.";
    return;
  }

  // Escribir letra en celda
  if (currentCell < secretWord.length) {
    const cell = row.children[currentCell];
    cell.textContent = key;
    currentCell++;
  }
}

// Desactivar teclado después de ganar o perder
function disableInput() {
  document.removeEventListener("keydown", keyboardInput);
}

// Teclado físico
function keyboardInput(event) {
  handleKeyPress(event.key);
}

// Teclado virtual
const keys = document.querySelectorAll(".key");
keys.forEach((key) => {
  key.addEventListener("click", () => {
    const keyValue = key.textContent.toUpperCase();
    if (keyValue === "⌫") handleKeyPress("BACKSPACE");
    else if (keyValue === "ENTER") handleKeyPress("ENTER");
    else handleKeyPress(keyValue);
  });
});

// Activar teclados
document.removeEventListener("keydown", keyboardInput);
document.addEventListener("keydown", keyboardInput);

// Obtener la palabra inicial
fetchWord();

statusMessage.textContent = "@perudle"; // Solo para probar
