/*
    SCRIPT for "The Echo Lens" - Version 3 Kelsey The ΦGrid Protocol
    Connects to a live FastAPI backend to classify exoplanets.
*/

// --- 1. CONFIGURATION & STATE ---
const API_URL = 'https://exoplanet-hunt-api.onrender.com';
//const API_URL = 'predict.php';
// Pre-defined star systems data to send to the backend.
const STAR_SYSTEMS = {
    'trappist-1': {
        name: 'TRAPPIST-1',
        ra: 346.6223,
        dec: -5.0413,
        koi_period: 1.51087,
        koi_prad: 1.127,
        koi_smass: 0.0898,
        koi_srad: 0.1192,
        koi_dor: 4.5,
        koi_teq: 400.5,
        koi_insol: 4.65,
        koi_score: 0.951,
        koi_pdisposition: 0.912
    },
    'kepler-62': {
        name: 'Kepler-62',
        ra: 283.7850,
        dec: 45.3477,
        koi_period: 122.387,
        koi_prad: 1.610,
        koi_smass: 0.690,
        koi_srad: 0.640,
        koi_dor: 12.8,
        koi_teq: 270.0,
        koi_insol: 1.195,
        koi_score: 0.923,
        koi_pdisposition: 0.874
    },
    'tess-14': {
        name: 'TESS-14',
        ra: 65.3214,
        dec: -20.4356,
        koi_period: 3.1267,
        koi_prad: 1.201,
        koi_smass: 1.032,
        koi_srad: 0.989,
        koi_dor: 6.2,
        koi_teq: 915.3,
        koi_insol: 5.120,
        koi_score: 0.881,
        koi_pdisposition: 0.853
    },
    'proxima-centauri': {
        name: 'Proxima Centauri',
        ra: 217.4289,
        dec: -62.6795,
        koi_period: 11.186,
        koi_prad: 1.070,
        koi_smass: 0.123,
        koi_srad: 0.154,
        koi_dor: 8.9,
        koi_teq: 234.0,
        koi_insol: 0.650,
        koi_score: 0.896,
        koi_pdisposition: 0.889
    },
    'kepler-235-e': {
        name: "Kepler-235 e",
        ra: 286.07913,
        dec: 39.27832,
        koi_period: 46.1842039,
        koi_prad: 1.83,
        koi_smass: 0.502,
        koi_srad: 0.493,
        koi_dor: 76.67,
        koi_teq: 273.0,
        koi_insol: 1.32,
        koi_score: 0.7403,
        koi_pdisposition: 0.242
    },
    'kepler-155-c': {
        name: "Kepler-155 c",
        ra: 288.49582,
        dec: 51.08194,
        koi_period: 52.6615266,
        koi_prad: 1.87,
        koi_smass: 0.557,
        koi_srad: 0.539,
        koi_dor: 98.6,
        koi_teq: 271.0,
        koi_insol: 1.28,
        koi_score: 0.7374,
        koi_pdisposition: 1
    },
    'kepler-1653-b': {
        name: "Kepler-1653 b",
        ra: 296.45776,
        dec: 41.266022,
        koi_period: 140.251943,
        koi_prad: 1.84,
        koi_smass: 0.765,
        koi_srad: 0.788,
        koi_dor: 157.9,
        koi_teq: 271.0,
        koi_insol: 1.28,
        koi_score: 0.7304,
        koi_pdisposition: 1
    },
    'kepler-1455-b': {
        name: "Kepler-1455 b",
        ra: 294.08307,
        dec: 50.502769,
        koi_period: 49.2768448,
        koi_prad: 1.75,
        koi_smass: 0.528,
        koi_srad: 0.529,
        koi_dor: 102.4,
        koi_teq: 271.0,
        koi_insol: 1.28,
        koi_score: 0.7094,
        koi_pdisposition: 1
    },
    'kepler-62-e': {
        name: "Kepler-62 e",
        ra: 283.21274,
        dec: 45.349861,
        koi_period: 122.3858681,
        koi_prad: 1.72,
        koi_smass: 0.727,
        koi_srad: 0.662,
        koi_dor: 133.71,
        koi_teq: 269.0,
        koi_insol: 1.24,
        koi_score: 0.6901,
        koi_pdisposition: 1
    },
    'kepler-560-b': {
        name: "Kepler-560 b",
        ra: 300.20609,
        dec: 45.018139,
        koi_period: 18.47762694,
        koi_prad: 1.55,
        koi_smass: 0.271,
        koi_srad: 0.283,
        koi_dor: 56.2,
        koi_teq: 267.0,
        koi_insol: 1.21,
        koi_score: 0.64,
        koi_pdisposition: 1
    },
    'kepler-1450-b': {
        name: "Kepler-1450 b",
        ra: 294.55383,
        dec: 45.08139,
        koi_period: 54.5091549,
        koi_prad: 1.94,
        koi_smass: 0.621,
        koi_srad: 0.603,
        koi_dor: 34.2,
        koi_teq: 308.0,
        koi_insol: 2.13,
        koi_score: 0.6314,
        koi_pdisposition: 1
    },
    'kepler-1816-b': {
        name: "Kepler-1816 b",
        ra: 296.85101,
        dec: 50.698929,
        koi_period: 91.500873,
        koi_prad: 1.82,
        koi_smass: 0.786,
        koi_srad: 0.706,
        koi_dor: 147.71,
        koi_teq: 310.0,
        koi_insol: 2.18,
        koi_score: 0.608,
        koi_pdisposition: 1
    },
    'kepler-267-d': {
        name: "Kepler-267 d",
        ra: 299.83041,
        dec: 47.157459,
        koi_period: 28.46464804,
        koi_prad: 1.87,
        koi_smass: 0.467,
        koi_srad: 0.46,
        koi_dor: 84.56,
        koi_teq: 301.0,
        koi_insol: 1.95,
        koi_score: 0.5989,
        koi_pdisposition: 1
    },
    'kepler-737-b': {
        name: "Kepler-737 b",
        ra: 291.86285,
        dec: 46.42926,
        koi_period: 28.59914031,
        koi_prad: 1.83,
        koi_smass: 0.47,
        koi_srad: 0.461,
        koi_dor: 61.92,
        koi_teq: 298.0,
        koi_insol: 1.87,
        koi_score: 0.5826,
        koi_pdisposition: 1
    },
    'kepler-283-c': {
        name: "Kepler-283 c",
        ra: 293.61371,
        dec: 47.839001,
        koi_period: 92.7495777,
        koi_prad: 1.87,
        koi_smass: 0.596,
        koi_srad: 0.582,
        koi_dor: 132.45,
        koi_teq: 240.0,
        koi_insol: 0.78,
        koi_score: 0.5697,
        koi_pdisposition: 1
    },
    'kepler-705-b': {
        name: "Kepler-705 b",
        ra: 289.50848,
        dec: 41.812119,
        koi_period: 56.0560754,
        koi_prad: 1.94,
        koi_smass: 0.503,
        koi_srad: 0.491,
        koi_dor: 94.7,
        koi_teq: 233.0,
        koi_insol: 0.69,
        koi_score: 0.5525,
        koi_pdisposition: 1
    },
    'kepler-437-b': {
        name: "Kepler-437 b",
        ra: 297.34738,
        dec: 44.026939,
        koi_period: 66.6504521,
        koi_prad: 1.56,
        koi_smass: 0.713,
        koi_srad: 0.679,
        koi_dor: 82.0,
        koi_teq: 308.0,
        koi_insol: 2.14,
        koi_score: 0.5427,
        koi_pdisposition: 1
    },
    'kepler-69-c': {
        name: "Kepler-69 c",
        ra: 293.26093,
        dec: 44.868889,
        koi_period: 242.467406,
        koi_prad: 1.73,
        koi_smass: 0.813,
        koi_srad: 0.943,
        koi_dor: 144.9,
        koi_teq: 286.0,
        koi_insol: 1.59,
        koi_score: 0.5422,
        koi_pdisposition: 0
    },
    'kepler-1544-b': {
        name: "Kepler-1544 b",
        ra: 297.285,
        dec: 49.21246,
        koi_period: 168.81133,
        koi_prad: 1.69,
        koi_smass: 0.771,
        koi_srad: 0.707,
        koi_dor: 199.6,
        koi_teq: 241.0,
        koi_insol: 0.8,
        koi_score: 0.5338,
        koi_pdisposition: 1
    },
    'kepler-1634-b': {
        name: "Kepler-1634 b",
        ra: 294.0434,
        dec: 45.139778,
        koi_period: 374.878133,
        koi_prad: 4.27,
        koi_smass: 1.103,
        koi_srad: 1.354,
        koi_dor: 221.6,
        koi_teq: 282.0,
        koi_insol: 1.49,
        koi_score: 0.5272,
        koi_pdisposition: 1
    },
};

const FUN_FACTS = [
    "The TRAPPIST-1 system has 7 Earth-sized planets, 3 of which could have liquid water.",
    "Kepler-62e is a 'Super-Earth', potentially a water world completely covered by ocean.",
    "Proxima Centauri b is our closest exoplanet neighbor, 'only' 4.2 light-years away.",
    "Some exoplanets are 'rogue planets' that drift through space without a star to orbit."
];

// --- 2. DOM ELEMENT REFERENCES ---
// Header & Footer
const missionStatusText = document.getElementById('mission-status-text');
// Panel 1
const starSystemSelect = document.getElementById('star-system');
const launchButton = document.getElementById('launch-button');
const funFactText = document.getElementById('fun-fact-text');
// Panel 2
const chartCanvas = document.getElementById('lightCurveChart');
const centralPlaceholder = document.getElementById('central-placeholder');
// Panel 3
const resultsCard = document.getElementById('results-card');
const noResultsText = document.getElementById('no-results-text');
const resultName = document.getElementById('result-name');
const resultPrediction = document.getElementById('result-prediction');
const resultDistance = document.getElementById('result-distance');
const resultPeriod = document.getElementById('result-period');
const resultSize = document.getElementById('result-size');
const habitabilityGauge = document.getElementById('habitability-gauge');
const confidenceDots = document.getElementById('confidence-dots');

let lightCurveChart = null; // Holds the chart instance.

// --- 3. CORE FUNCTIONS ---
/**
 * Initializes the Particle.js background for an immersive feel.
 */
function initializeParticles() {
    
// === CONFIGURATION FOR PARTICLE.JS ===
// (Place this inside the initializeParticles function)
/* 
    Le code de configuration de particles.js est un long objet JSON. 
    Vous le trouverez facilement en cherchant "particles.js default config".
    Choisissez le thème "NASA" ou "Default" et copiez-collez le JSON ici.
    Exemple:
    {
      "particles": { "number": { "value": 80, ... }, ... },
      "interactivity": { ... },
      "retina_detect": true
    }
*/
    particlesJS('particles-js', {
  "particles": {
    "number": {
      "value": 160,
      "density": {
        "enable": true,
        "value_area": 800
      }
    },
    "color": {
      "value": "#ffffff"
    },
    "shape": {
      "type": "circle",
      "stroke": {
        "width": 0,
        "color": "#000000"
      },
      "polygon": {
        "nb_sides": 5
      },
      "image": {
        "src": "img/github.svg",
        "width": 100,
        "height": 100
      }
    },
    "opacity": {
      "value": 1,
      "random": true,
      "anim": {
        "enable": true,
        "speed": 1,
        "opacity_min": 0,
        "sync": false
      }
    },
    "size": {
      "value": 3,
      "random": true,
      "anim": {
        "enable": false,
        "speed": 4,
        "size_min": 0.3,
        "sync": false
      }
    },
    "line_linked": {
      "enable": false,
      "distance": 150,
      "color": "#ffffff",
      "opacity": 0.4,
      "width": 1
    },
    "move": {
      "enable": true,
      "speed": 1,
      "direction": "none",
      "random": true,
      "straight": false,
      "out_mode": "out",
      "bounce": false,
      "attract": {
        "enable": false,
        "rotateX": 600,
        "rotateY": 600
      }
    }
  },
  "interactivity": {
    "detect_on": "canvas",
    "events": {
      "onhover": {
        "enable": true,
        "mode": "bubble"
      },
      "onclick": {
        "enable": true,
        "mode": "repulse"
      },
      "resize": true
    },
    "modes": {
      "grab": {
        "distance": 400,
        "line_linked": {
          "opacity": 1
        }
      },
      "bubble": {
        "distance": 250,
        "size": 0,
        "duration": 2,
        "opacity": 0,
        "speed": 3
      },
      "repulse": {
        "distance": 400,
        "duration": 0.4
      },
      "push": {
        "particles_nb": 4
      },
      "remove": {
        "particles_nb": 2
      }
    }
  },
  "retina_detect": true
});
}


/**
 * Populates the dropdown with star systems.
 */
function initializeMissionControl() {
    for (const key in STAR_SYSTEMS) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = STAR_SYSTEMS[key].name;
        starSystemSelect.appendChild(option);
    }
}

/**
 * Displays a random fun fact.
 */
function showRandomFunFact() {
    const randomIndex = Math.floor(Math.random() * FUN_FACTS.length);
    funFactText.textContent = FUN_FACTS[randomIndex];
}

/**
 * Updates the chart with data from the API.
 * @param {Array<number>} lightCurveData - Array of light intensity values.
 */
function updateChart(lightCurveData) {
    chartCanvas.style.display = 'block';
    centralPlaceholder.style.opacity = '0';
    
    if (lightCurveChart) {
        lightCurveChart.destroy();
    }
    
    lightCurveChart = new Chart(chartCanvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: Array.from({ length: lightCurveData.length }, (_, i) => i),
            datasets: [{
                data: lightCurveData,
                borderColor: 'var(--color-accent)',
                backgroundColor: 'rgba(0, 169, 255, 0.1)',
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.4,
                fill: true
            }]
        },
        options: { /* ... chart options from previous version ... */ }
    });
}

/**
 * Updates the candidate profile card with API data.
 * @param {object} data - The prediction object from the API.
 */
function updateProfileCard(data) {
    resultName.textContent = data.name;
    resultPrediction.textContent = data.prediction;
    resultDistance.textContent = `${data.distance} light-years`;
    resultPeriod.textContent = `${data.period} days`;
    resultSize.textContent = `${data.size}x Earth`;

    // Animate the habitability gauge
    habitabilityGauge.style.width = `${data.habitability * 100}%`;

    // Update confidence dots
    const confidenceLevel = Math.round(data.confidence * 10); // Scale to 10
    confidenceDots.innerHTML = ''; // Clear previous dots
    for(let i = 0; i < 10; i++) {
        const dot = document.createElement('div');
        dot.classList.add('confidence-dot');
        if (i < confidenceLevel) {
            dot.classList.add('is-active');
        }
        confidenceDots.appendChild(dot);
    }
    
    resultsCard.classList.remove('hidden');
    // We use a short delay to allow the card to be visible before animating
    setTimeout(() => resultsCard.classList.add('is-visible'), 50);
}
// --- 5. CORE LOGIC: NARRATIVE LOADING SEQUENCE ---

/**
 * Shows a sequence of loading messages in the central panel.
 */
function runNarrativeLoadingSequence() {
    const messages = [
        "Connecting to Deep Space Network...",
        "Receiving light curve data stream...",
        "ΦGrid AI Core analyzing signatures...",
        "Searching for transit echoes..."
    ];
    let messageIndex = 0;
    
    centralPlaceholder.style.opacity = '1';
    centralPlaceholder.textContent = messages[messageIndex];
    missionStatusText.textContent = 'TRANSMITTING';
    
    // Create an interval to cycle through messages
    const loadingInterval = setInterval(() => {
        messageIndex++;
        if (messageIndex < messages.length) {
            centralPlaceholder.textContent = messages[messageIndex];
        } else {
            clearInterval(loadingInterval); // Stop after the last message
        }
    }, 1500); // Change message every 1.5 seconds

    return loadingInterval; // Return so we can clear it later
}

/**
 * Handles the main hunt button click. This is an async function.
 */
async function handleHuntButtonClick() {
    // 1. Set UI to loading state
    launchButton.disabled = true;
    resultsCard.classList.remove('is-visible');
    
    // 2. Start the narrative loading sequence
    const loadingInterval = runNarrativeLoadingSequence();
    const selectedSystemKey = starSystemSelect.value;
    const requestData = STAR_SYSTEMS[selectedSystemKey];


    try {
        // 3. Call the API
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
        // 4. Stop narrative and show result
        clearInterval(loadingInterval);
        
        centralPlaceholder.textContent = "ECHO DETECTED! PROFILING...";
        missionStatusText.textContent = 'ANALYSIS COMPLETE';
        
        // Use a short delay before showing the chart for dramatic effect
        setTimeout(() => {
            updateChart(data.light_curve);
            updateProfileCard(data);
        }, 1000);

    } catch (error) {
        console.error("Error fetching prediction:", error);
        clearInterval(loadingInterval);
        centralPlaceholder.textContent = 'Error: Connection to AI core lost.';
        missionStatusText.textContent = 'CONNECTION FAILED';
    } finally {
        // 5. Reset button state
        launchButton.disabled = false;
        launchButton.querySelector('.cta-button__text').textContent = 'Hunt for Echoes';
    }
}

// --- 4. INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    initializeParticles();
    initializeMissionControl();
    showRandomFunFact(); // Show an initial fact

    launchButton.addEventListener('click', handleHuntButtonClick);
    
    // Rotate fun facts every 10 seconds
    setInterval(showRandomFunFact, 10000);

    // Remove boot animation class after it completes
    setTimeout(() => document.querySelector('.container').classList.remove('is-booting'), 1200);

  // === UPLOAD CSV FUNCTIONALITY ===
  const csvForm = document.getElementById('csvForm');
  const csvFileInput = document.getElementById('csvFile');
  const csvResult = document.getElementById('csv-result');

  if (csvForm) {
    csvForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      if (!csvFileInput.files.length) {
        alert('Sélectionne un fichier CSV.');
        return;
      }
      const file = csvFileInput.files[0];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('https://exoplanet-hunt-api.onrender.com', {
          method: 'POST',
          body: formData
        });
        if (!response.ok) {
          throw new Error('Erreur serveur');
        }
        const result = await response.json();
        csvResult.textContent = JSON.stringify(result, null, 2);
      } catch (err) {
        csvResult.textContent = 'Erreur : ' + err.message;
      }
    });
  }
});