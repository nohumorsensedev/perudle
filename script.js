// Palabra secreta (se obtiene del servidor)
let secretWord = '';

// Variables para controlar el estado del juego
let currentRow = 0;
let currentCell = 0;

// Elementos del DOM
const board = document.getElementById("board");
const statusMessage = document.getElementById("status-message");

// Función para obtener la palabra desde el servidor
async function fetchWord() {
  try {
    const response = await fetch('/word'); // Solicita la palabra
    const data = await response.json();   // Recibe la palabra en formato JSON
    secretWord = data.word.toUpperCase(); // Guarda la palabra en mayúsculas
    console.log(secretWord);              // Mostrar en consola para depuración
  } catch (error) {
    console.error('Error al obtener la palabra:', error);
    statusMessage.textContent = "Error al cargar la palabra. Recarga la página.";
  }
}

// Llama a la función para obtener la palabra al cargar el juego
fetchWord();

// Función para validar la palabra ingresada
function validateWord(inputWord) {
  const result = [];
  const secretLetters = secretWord.split(''); // Crear un array con las letras de la palabra secreta
  const usedPositions = Array(secretWord.length).fill(false); // Control de letras ya usadas

  // Paso 1: Revisar letras en la posición correcta (verde)
  for (let i = 0; i < inputWord.length; i++) {
    if (inputWord[i] === secretWord[i]) {
      result[i] = "correct"; // Letra y posición correctas
      usedPositions[i] = true; // Marcar esta posición como usada
      secretLetters[i] = null; // Eliminar esta letra para evitar reutilizarla
    }
  }

  // Paso 2: Revisar letras presentes pero en posición incorrecta (amarillo)
  for (let i = 0; i < inputWord.length; i++) {
    if (!result[i]) { // Solo si aún no ha sido marcada como "correct"
      const index = secretLetters.indexOf(inputWord[i]); // Buscar letra en el resto
      if (index !== -1 && !usedPositions[index]) {
        result[i] = "present"; // Letra correcta pero en posición incorrecta
        usedPositions[index] = true; // Marcar esta posición como usada
        secretLetters[index] = null; // Eliminar para evitar reutilizarla
      } else {
        result[i] = "absent"; // Letra no está en la palabra secreta
      }
    }
  }

  return result;
}

// Función para actualizar el tablero
function updateBoard(inputWord, result) {
  const row = board.children[currentRow];
  for (let i = 0; i < inputWord.length; i++) {
    const cell = row.children[i];
    cell.textContent = inputWord[i];
    cell.classList.add(result[i]); // Agregar clase (correct, present, absent)
  }
  currentRow++; // Pasar a la siguiente fila
  currentCell = 0; // Reiniciar columna
}

// Manejar las entradas del teclado físico
document.addEventListener("keydown", (event) => {
  let key = event.key.toUpperCase();

  // Incluir la Ñ como letra válida
  if (!/^[A-ZÑ]$/.test(key) && key !== "BACKSPACE" && key !== "ENTER") return;

  const row = board.children[currentRow];

  if (key === "BACKSPACE") {
    // Borrar la última letra
    if (currentCell > 0) {
      currentCell--;
      const cell = row.children[currentCell];
      cell.textContent = "";
    }
    return;
  }

  if (key === "ENTER") {
    // Validar palabra cuando el usuario presiona Enter
    if (currentCell < 5) {
      statusMessage.textContent = "La palabra debe tener 5 letras.";
      return;
    }

    // Crear la palabra ingresada
    const inputWord = Array.from(row.children)
      .map((cell) => cell.textContent)
      .join("");

    const result = validateWord(inputWord);
    updateBoard(inputWord, result);

    // Verificar si el jugador ganó
    if (inputWord === secretWord) {
      statusMessage.textContent = "¡Felicidades! Adivinaste la palabra.";
      document.removeEventListener("keydown", arguments.callee); // Deshabilitar teclado
      return;
    }

    // Verificar si se acabaron los intentos
    if (currentRow >= 6) {
      statusMessage.textContent = `¡Perdiste! La palabra era: ${secretWord}`;
      document.removeEventListener("keydown", arguments.callee); // Deshabilitar teclado
    }
    return;
  }

  // Escribir letra en la celda actual
  if (currentCell < 5) {
    const cell = row.children[currentCell];
    cell.textContent = key;
    currentCell++;
  }
});

// Manejar clics en el teclado virtual
const keys = document.querySelectorAll(".key");
keys.forEach((key) => {
  key.addEventListener("click", () => {
    let keyValue = key.textContent.toUpperCase();

    // Manejar la Ñ específicamente
    if (keyValue === "Ñ") {
      keyValue = "Ñ";
    }

    if (keyValue === "⌫") {
      // Simula el comportamiento de Backspace
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace" }));
    } else if (keyValue === "ENTER") {
      // Simula el comportamiento de Enter
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    } else {
      // Simula la entrada de una letra, incluyendo Ñ
      document.dispatchEvent(new KeyboardEvent("keydown", { key: keyValue }));
    }
  });
});
