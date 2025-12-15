function updateTimer() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const remaining = totalTime - elapsed;
  if (remaining <= 0) {
    clearInterval(timer);
    submitTest();
    return;
  }

  // Calculate angles for clock hands
  const seconds = remaining % 60;
  const minutes = Math.floor(remaining / 60);
  const hours = Math.floor(minutes / 60);

  const secondDegrees = ((seconds / 60) * 360) + 90;
  const minuteDegrees = ((minutes % 60) / 60) * 360 + 90;
  const hourDegrees = ((hours % 12) / 12) * 360 + 90;

  document.querySelector('.second-hand').style.transform = `rotate(${secondDegrees}deg)`;
  document.querySelector('.min-hand').style.transform = `rotate(${minuteDegrees}deg)`;
  document.querySelector('.hour-hand').style.transform = `rotate(${hourDegrees}deg)`;

  updateMetrics();
}

// Update metrics into meters
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

  // Update meters
  document.getElementById('wpmMeter').value = wpm;
  document.getElementById('accuracyMeter').value = accuracy;
  document.getElementById('errorMeter').value = errors;
}
