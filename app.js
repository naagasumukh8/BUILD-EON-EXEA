// Polyinnovae AI Hackathon Frontend Client Logic

let currentInputMode = 'text';
let lastResponseData = null;

document.addEventListener('DOMContentLoaded', () => {
  checkApiHealth();
  // Periodically check API health
  setInterval(checkApiHealth, 30000);
});

// Tab Switcher Functionality
function switchTab(tabId) {
  const tabs = ['hackathon', 'portfolio'];
  tabs.forEach(id => {
    const pane = document.getElementById(`tab-${id}`);
    const btn = document.getElementById(`tab-btn-${id}`);
    if (id === tabId) {
      pane.classList.add('active');
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
    } else {
      pane.classList.remove('active');
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    }
  });
}

// Input Mode Selection (Text, JSON, File)
function setInputMode(mode) {
  currentInputMode = mode;
  ['text', 'json', 'file'].forEach(m => {
    const container = document.getElementById(`input-container-${m}`);
    const btn = document.getElementById(`mode-${m}`);
    if (m === mode) {
      container.classList.remove('hidden');
      btn.classList.add('active');
    } else {
      container.classList.add('hidden');
      btn.classList.remove('active');
    }
  });
}

// Handle File Selection
function handleFileSelected(event) {
  const file = event.target.files[0];
  const display = document.getElementById('file-name-display');
  if (file) {
    display.textContent = `Attached: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
  } else {
    display.textContent = 'Supports PDF, PNG, JPG, CSV, JSON (Placeholder upload handler)';
  }
}

// Clear Form Input
function clearInput() {
  document.getElementById('input-text-area').value = '';
  document.getElementById('input-json-area').value = '{\n  "input": ""\n}';
  document.getElementById('file-input').value = '';
  document.getElementById('file-name-display').textContent = 'Supports PDF, PNG, JPG, CSV, JSON (Placeholder upload handler)';
  showState('empty');
}

// Load Sample Input
function loadSampleInput() {
  if (currentInputMode === 'text') {
    document.getElementById('input-text-area').value = 'Sample Polyinnovae Hackathon Query: Analyze user workflow and generate optimized strategy.';
  } else if (currentInputMode === 'json') {
    document.getElementById('input-json-area').value = JSON.stringify({
      input: "Sample Hackathon Data Payload",
      mode: "test",
      timestamp: new Date().toISOString()
    }, null, 2);
  } else {
    document.getElementById('file-name-display').textContent = 'Attached: sample_hackathon_dataset.csv (14.2 KB)';
  }
}

// API Health Check
async function checkApiHealth() {
  const dot = document.getElementById('status-dot');
  const text = document.getElementById('status-text');
  
  try {
    const response = await fetch('/api/health');
    if (response.ok) {
      const data = await response.json();
      dot.className = 'pulse-dot status-online';
      text.textContent = 'API: Online';
    } else {
      dot.className = 'pulse-dot status-offline';
      text.textContent = 'API: Limited';
    }
  } catch (err) {
    dot.className = 'pulse-dot status-offline';
    text.textContent = 'API: Offline';
  }
}

// Handle Form Submission (Frontend -> Backend Communication)
async function handleFormSubmit(event) {
  if (event) event.preventDefault();

  showState('loading');
  updateLoadingStep(1, 'Validating Input...');

  let payload = {};

  if (currentInputMode === 'text') {
    const val = document.getElementById('input-text-area').value.trim();
    payload = {
      input: val || "Placeholder input",
      input_type: "text"
    };
  } else if (currentInputMode === 'json') {
    const val = document.getElementById('input-json-area').value.trim();
    try {
      payload = JSON.parse(val);
      payload.input_type = "json";
    } catch (e) {
      showErrorState(`Invalid JSON formatting: ${e.message}`);
      return;
    }
  } else if (currentInputMode === 'file') {
    const fileInput = document.getElementById('file-input');
    const fileName = fileInput.files[0] ? fileInput.files[0].name : "sample_file.txt";
    payload = {
      input: `File attached: ${fileName}`,
      input_type: "file",
      file_name: fileName
    };
  }

  const startTime = performance.now();

  try {
    updateLoadingStep(2, 'Executing Core Solution...');
    
    // Call backend API endpoint
    const response = await fetch('/api/solve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    updateLoadingStep(3, 'Formatting Output...');

    if (!response.ok) {
      const errText = await response.text();
      showErrorState(`Server returned status ${response.status}: ${errText}`);
      return;
    }

    const data = await response.json();
    lastResponseData = data;

    // Render Success State
    renderSuccessState(data, duration);

  } catch (err) {
    showErrorState(`Network or Server connection error: ${err.message}`);
  }
}

// Render Success State
function renderSuccessState(data, duration) {
  showState('success');

  document.getElementById('output-meta-header').classList.remove('hidden');
  document.getElementById('output-timer-badge').textContent = `${duration} ms`;

  document.getElementById('result-title').textContent = data.title || "PLACEHOLDER SOLUTION";
  document.getElementById('result-message-text').textContent = data.message || "The actual solution logic will be implemented here after the problem statement is released.";

  document.getElementById('output-json-display').textContent = JSON.stringify(data, null, 2);
}

// Show Error State
function showErrorState(msg) {
  showState('error');
  document.getElementById('error-message-text').textContent = msg;
}

// State Manager
function showState(stateName) {
  const states = ['empty', 'loading', 'error', 'success'];
  states.forEach(s => {
    const el = document.getElementById(`state-${s}`);
    if (s === stateName) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });

  if (stateName !== 'success') {
    document.getElementById('output-meta-header').classList.add('hidden');
  }
}

// Loading Step Progress Animator
function updateLoadingStep(stepNum, label) {
  [1, 2, 3].forEach(n => {
    const stepEl = document.getElementById(`step-${n}`);
    if (n === stepNum) {
      stepEl.classList.add('active');
    } else {
      stepEl.classList.remove('active');
    }
  });
}

// Copy Output JSON to Clipboard
function copyOutputToClipboard() {
  if (!lastResponseData) return;
  const jsonStr = JSON.stringify(lastResponseData, null, 2);
  navigator.clipboard.writeText(jsonStr).then(() => {
    const btn = document.querySelector('.btn-copy');
    const orig = btn.textContent;
    btn.textContent = '✓ Copied!';
    setTimeout(() => { btn.textContent = orig; }, 2000);
  }).catch(err => {
    console.error('Copy failed:', err);
  });
}
