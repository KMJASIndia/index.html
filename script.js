const BACKEND_URL = "https://script.google.com/macros/s/AKfycbz9VpxPTRvhIrJyg-ZQ2AFqpXXQYtvqsFyWufnKlhCwUf2ePNBv-EHLZKKE8iDSU46RTQ/exec";
let timer;
let totalTime = 10 * 60; // 10 minutes
let startTime;
let currentPassage = 0;

const form = document.getElementById('candidateForm');
const testArea = document.getElementById('testArea');
const passageDiv = document.getElementById('passage');
const typingArea = document.getElementById('typingArea');
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

  const seconds = remaining % 60;
  const minutes = Math.floor(remaining / 60) % 60;
  const hours = Math.floor(remaining / 3600);

  const secondDegrees = ((seconds / 60) * 360) + 90;
  const minuteDegrees = ((minutes / 60) * 360) + 90;
  const hourDegrees = ((hours % 12) / 12) * 360 + 90;

  document.querySelector('.second-hand').style.transform = `rotate(${secondDegrees}deg)`;
  document.querySelector('.min-hand').style.transform = `rotate(${minuteDegrees}deg)`;
  document.querySelector('.hour-hand').style.transform = `rotate(${hourDegrees}deg)`;

  updateMetrics();
}

function updateMetrics() {
  if (!startTime) return;

  const typed = typingArea.value || "";
  const original = passages[currentPassage] || "";

  const typedLen = typed.length;
  const origLen = original.length;

  let mismatches = 0;
  const overlap = Math.min(typedLen, origLen);
  for (let i = 0; i < overlap; i++) {
    if (typed[i] !== original[i]) mismatches++;
  }
  const extras = typedLen > origLen ? (typedLen - origLen) : 0;
  const errors = mismatches + extras;

  const correctChars = Math.max(typedLen - errors, 0);
  const accuracy = typedLen > 0 ? Math.round((correctChars / typedLen) * 100) : 100;

  const minutes = (Date.now() - startTime) / 60000;
  const wpm = minutes > 0 ? Math.round((typedLen / 5) / minutes) : 0;

  document.getElementById('wpmMeter').value = wpm;
  document.getElementById('accuracyMeter').value = accuracy;
  document.getElementById('errorMeter').value = errors;

  document.getElementById('wpmValue').textContent = wpm;
  document.getElementById('accuracyValue').textContent = accuracy + "%";
  document.getElementById('errorValue').textContent = errors;
}

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
    wpm: document.getElementById('wpmMeter').value,
    accuracy: document.getElementById('accuracyMeter').value,
    errors: document.getElementById('errorMeter').value,
    photo: ""
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

typingArea.onpaste = () => false;
document.oncontextmenu = () => false;
document.oncopy = () => false;
