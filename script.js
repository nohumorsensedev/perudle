// Variables para controlar el estado del juego
let secretWord = ''; // La palabra secreta
let currentRow = 0;  // Fila actual
let currentCell = 0; // Celda actual

// Elementos del DOM
const board = document.getElementById("board");
const statusMessage = document.getElementById("status-message");

// Obtener palabra secreta del servidor
async function fetchWord() {
  const response = await fetch('/word'); // Llama al servidor
  const data = await response.json();   // Recibe la palabra
  secretWord = data.word.toUpperCase(); // Guarda la palabra en mayúsculas
  console.log(secretWord);              // Para depuración

  // Crear tablero dinámico según longitud de la palabra
  createBoard(secretWord.length);
}

// Crear tablero dinámico (5 o 6 letras)
function createBoard(length) {
  board.innerHTML = ''; // Limpia el tablero

  // Crear 6 filas dinámicas
  for (let i = 0; i < 6; i++) {
    const row = document.createElement("div");
    row.classList.add("row");
    for (let j = 0; j < length; j++) { // Ajustar según longitud
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
  return data.exists; // Devuelve true o false
}

// Validar palabra y asignar colores
function validateWord(inputWord) {
  const result = [];
  const secretLetters = secretWord.split('');
  const usedPositions = Array(secretWord.length).fill(false);

  // Verificar letras correctas (verde)
  for (let i = 0; i < inputWord.length; i++) {
    if (inputWord[i] === secretWord[i]) {
      result[i] = "correct";
      usedPositions[i] = true;
      secretLetters[i] = null;
    }
  }

  // Verificar letras presentes pero en posición incorrecta (amarillo)
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
  const row = board.children[currentRow]; // Seleccionar fila actual

  for (let i = 0; i < inputWord.length; i++) {
    const cell = row.children[i];
    cell.textContent = inputWord[i]; // Mostrar la letra
    cell.classList.remove("correct", "present", "absent");
    cell.classList.add(result[i]); // Añadir color
  }

  currentRow++; // Pasar a la siguiente fila
  currentCell = 0; // Reiniciar celda
}

// Manejar el teclado
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
    const inputWord = Array.from(row.children)
      .map((cell) => cell.textContent)
      .join("");

    // Validar si existe
    const exists = await isWordValid(inputWord);
    if (!exists) {
      statusMessage.textContent = "❌ Esa palabra no existe.";
      return;
    }

    const result = validateWord(inputWord);
    updateBoard(inputWord, result);

    if (inputWord === secretWord) {
      statusMessage.textContent = "🎉 ¡Correcto! Adivinaste la palabra.";
      disableInput();
    } else if (currentRow >= 6) {
      statusMessage.textContent = `😢 ¡Perdiste! La palabra era: ${secretWord}`;
      disableInput();
    } else {
      statusMessage.textContent = "⏳ Sigue intentando.";
    }
    return;
  }

  // Insertar letras
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
