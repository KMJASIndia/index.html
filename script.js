const BACKEND_URL = "https://script.google.com/macros/s/AKfycbz9VpxPTRvhIrJyg-ZQ2AFqpXXQYtvqsFyWufnKlhCwUf2ePNBv-EHLZKKE8iDSU46RTQ/exec";
let timer;
let totalTime = 15 * 60; // 15 minutes
let startTime;
let currentPassage = 0;

const form = document.getElementById('candidateForm');
const testArea = document.getElementById('testArea');
const passageDiv = document.getElementById('passage');
const typingArea = document.getElementById('typingArea');
const wpmSpan = document.getElementById('wpm');
const accuracySpan = document.getElementById('accuracy');
const errorsSpan = document.getElementById('errors');
const timerDiv = document.getElementById('timer');
const submitBtn = document.getElementById('submitBtn');

form.addEventListener('submit', e => {
  e.preventDefault();
  form.style.display = 'none';
  testArea.style.display = 'block';
  startTest();
});

function startTest() {
  if (!passages || passages.length === 0) {
    passageDiv.textContent = "No passages found!";
    return;
  }
  currentPassage = Math.floor(Math.random() * passages.length);
  passageDiv.textContent = passages[currentPassage];
  startTime = Date.now();
  timer = setInterval(updateTimer, 1000);
  typingArea.focus();
}

function updateTimer() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const remaining = totalTime - elapsed;
  if (remaining <= 0) {
    clearInterval(timer);
    submitTest();
    return;
  }
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  timerDiv.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  updateMetrics();
}

// ✅ Corrected Metrics Calculation
function updateMetrics() {
  if (!startTime) return;

  const typed = typingArea.value || "";
  const original = passages[currentPassage] || "";

  const typedLen = typed.length;
  const origLen = original.length;

  // Compare character-by-character within overlap
  const overlap = Math.min(typedLen, origLen);
  let mismatches = 0;

  for (let i = 0; i < overlap; i++) {
    if (typed[i] !== original[i]) mismatches++;
  }

  // Extra characters beyond the original count as errors
  const extras = typedLen > origLen ? (typedLen - origLen) : 0;

  const errors = mismatches + extras;

  // Accuracy: correct characters / total typed characters
  const correctChars = Math.max(typedLen - errors, 0);
  const accuracy = typedLen > 0 ? Math.round((correctChars / typedLen) * 100) : 100;

  // WPM: (characters / 5) per minute
  const minutes = (Date.now() - startTime) / 60000;
  const wpm = minutes > 0 ? Math.round((typedLen / 5) / minutes) : 0;

  wpmSpan.textContent = `WPM: ${wpm}`;
  accuracySpan.textContent = `Accuracy: ${accuracy}%`;
  errorsSpan.textContent = `Errors: ${errors}`;
}

// Submission without webcam
submitBtn.addEventListener('click', submitTest);

function submitTest() {
  clearInterval(timer);
  sendData();
}

function sendData() {
  const data = {
    name: document.getElementById('name').value,
    dob: document.getElementById('dob').value,
    email: document.getElementById('email').value,
    passageId: currentPassage + 1,
    typedText: typingArea.value,
    wpm: parseInt(wpmSpan.textContent.replace('WPM: ', '')),
    accuracy: parseInt(accuracySpan.textContent.replace('Accuracy: ', '')),
    errors: parseInt(errorsSpan.textContent.replace('Errors: ', '')),
    photo: "" // no photo now
  };

  fetch(BACKEND_URL, {
    method: 'POST',
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(resp => {
      alert(resp.status === 'success' ? 'Test submitted successfully!' : 'Error: ' + resp.message);
      location.reload();
    })
    .catch(err => {
      alert('Submission failed.');
      console.error(err);
    });
}

// Anti-cheat
typingArea.onpaste = () => false;
document.oncontextmenu = () => false;
document.oncopy = () => false;