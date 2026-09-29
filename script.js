// Innovation categories with search keywords
const categories = {
    materials: ['materials science', 'graphene', 'nanomaterials', 'metamaterials'],
    biochemistry: ['biochemistry', 'protein', 'enzyme', 'molecular biology'],
    chemistry: ['chemistry', 'chemical synthesis', 'catalysis', 'organic chemistry'],
    space: ['space exploration', 'astronomy', 'astrophysics', 'cosmic'],
    nanotechnology: ['nanotechnology', 'nanoparticles', 'nanostructures'],
    medicine: ['medicine', 'medical breakthrough', 'drug discovery', 'healthcare'],
    science: ['scientific discovery', 'research breakthrough', 'innovation'],
    nature: ['nature', 'ecology', 'biodiversity', 'environmental science'],
    quantum: ['quantum computing', 'quantum physics', 'quantum mechanics'],
    satellites: ['satellite', 'orbital', 'remote sensing'],
    solar: ['solar energy', 'photovoltaic', 'solar power']
};

// Gemma AI configuration
const GEMMA_MODEL = 'gemma-3-27b-it';
const GEMMA_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// Retrieve and persist the API key in localStorage
function getApiKey() {
    return localStorage.getItem('gemma_api_key') || '';
}

function saveApiKey(key) {
    // The key is stored in localStorage so users don't have to re-enter it on every visit.
    // This is intentional for a client-side-only app; there is no server-side alternative.
    // Users are informed of this in the settings panel.
    localStorage.setItem('gemma_api_key', key.trim());
}

function clearApiKey() {
    localStorage.removeItem('gemma_api_key');
}

// Escape HTML special characters to prevent XSS when inserting AI-generated text
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Validate that a URL uses http or https to prevent javascript: injection
function sanitizeUrl(url) {
    try {
        const parsed = new URL(url);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
            return url;
        }
    } catch (_) { /* ignore */ }
    return '#';
}

// Call Gemma AI to generate cutting-edge innovations for the given category
async function fetchFromGemma(category) {
    const apiKey = getApiKey();
    if (!apiKey) return null;

    const categoryScope = category === 'all'
        ? `a diverse mix of the following fields: ${Object.keys(categories).join(', ')}`
        : `the "${category}" field (related topics: ${categories[category].join(', ')})`;

    const categoryRule = category === 'all'
        ? `Spread entries across these categories: ${Object.keys(categories).join(', ')}`
        : `Set the "category" field to "${category}" for every entry`;

    const prompt = `You are a chronographer for a Victorian-era gazette reporting from the twenty-third century — formal, vivid, slightly archaic diction mixed with modern scientific terms (e.g. "Hereby announced", "a most singular apparatus", "from the orbital post").
Generate 8 of the most cutting-edge, real-world innovation summaries representing genuine recent breakthroughs (2024-2026) in ${categoryScope}.

Write each "title" and "description" in that chrono-futures voice while remaining factual. Do not invent fictional discoveries.

Return ONLY a valid JSON array containing exactly 8 objects. Do not include markdown code fences, prose, or any text outside the JSON array.
Each object must have these exact keys:
- "title": string — a compelling, factual headline in the gazette voice (max 100 characters)
- "category": string — ${categoryRule}
- "description": string — 2-3 sentences describing the breakthrough and its broader significance, in the same voice
- "date": string — publication or announcement date in YYYY-MM-DD format, within the last 6 months
- "url": string — a real, authoritative URL (e.g. nature.com, science.org, nasa.gov, arxiv.org, pubmed.ncbi.nlm.nih.gov, cell.com, thelancet.com, esa.int, etc.)`;

    const response = await fetch(
        `${GEMMA_API_BASE}/${GEMMA_MODEL}:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048
                }
            })
        }
    );

    if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error?.message || `Gemma API error ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Strip markdown code fences if the model wraps its response in them
    const jsonText = rawText
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

    const parsed = JSON.parse(jsonText);
    if (!Array.isArray(parsed)) throw new Error('Gemma returned unexpected format');
    return parsed;
}

// Sample innovations — chrono-futures gazette voice (fallback when no API key)
const sampleInnovations = [
    {
        title: "Hereby Announced: A Quantum Engine of Most Singular Power",
        category: "quantum",
        description: "From the laboratories comes word that a new quantum apparatus hath solved problems once deemed intractable, outpacing the classical engines of computation by orders of magnitude. The Gazette records this as a milestone of the first rank in quantum craft.",
        date: new Date().toISOString().split('T')[0],
        url: "https://www.nature.com/subjects/quantum-computing"
    },
    {
        title: "Graphene Composite Yields Batteries of Astonishing Vitality",
        category: "materials",
        description: "Researchers report a graphene-based substance that stores charge with uncommon density and replenishes itself with remarkable haste. Electric carriages and pocket instruments stand to be transformed by this material innovation.",
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        url: "https://www.nature.com/subjects/materials-science"
    },
    {
        title: "A Refined CRISPR Quill Writes Genes with Surgical Exactitude",
        category: "biochemistry",
        description: "A novel CRISPR technique permits gene emendation within living creatures with a precision formerly unattainable. The medical colleges foresee new remedies for hereditary afflictions and a golden age of personalised physic.",
        date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
        url: "https://www.nature.com/subjects/biochemistry"
    },
    {
        title: "From the Orbital Post: Webb Spies an Earth-Kin World",
        category: "space",
        description: "The James Webb observatory hath discerned a potentially habitable exoplanet whose atmospheric character recalls our own sphere, nestled in the temperate belt of its sun. Astronomers of every nation attend the next despatch with keen interest.",
        date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
        url: "https://www.nasa.gov/mission_pages/webb/main/index.html"
    },
    {
        title: "Minute Automata Strike at the Cancerous Blight",
        category: "nanotechnology",
        description: "Microscopic nanorobots, in trials of the second phase, have identified and undone malignant cells whilst sparing wholesome tissue. A most singular apparatus of healing, witnessed by the clinical boards with cautious applause.",
        date: new Date(Date.now() - 345600000).toISOString().split('T')[0],
        url: "https://www.science.org/topic/nanotechnology"
    },
    {
        title: "Thinking Engines Forecast Protein Folds with Rare Certainty",
        category: "medicine",
        description: "An artificial intellect now predicts the folding of proteins with accuracy approaching ninety-five in the hundred. Drug discovery and the mapping of disease mechanisms advance at a pace the old pharmacopoeias could scarce imagine.",
        date: new Date(Date.now() - 432000000).toISOString().split('T')[0],
        url: "https://www.nature.com/subjects/medical-research"
    },
    {
        title: "Perovskite Cells Attain a Record Harvest of Solar Fire",
        category: "solar",
        description: "Natural philosophers record solar cells of perovskite construction yielding nearly half the incident light as useful power. The path toward truly enduring energy for the cities of tomorrow grows clearer by the day.",
        date: new Date(Date.now() - 518400000).toISOString().split('T')[0],
        url: "https://www.science.org/topic/solar-energy"
    },
    {
        title: "Green Alchemy Curtails the Smokestack's Carbon Toll",
        category: "chemistry",
        description: "A revolutionary method of chemical synthesis is said to diminish industrial carbon exhalations by four-fifths. The Gazette hails this as green chemistry of the highest practical consequence.",
        date: new Date(Date.now() - 604800000).toISOString().split('T')[0],
        url: "https://www.nature.com/subjects/chemistry"
    },
    {
        title: "Abyssal Menagerie Found in the Mariana Deep",
        category: "nature",
        description: "Marine naturalists have charted a hitherto unknown ecosystem teeming with peculiar species in the Mariana Trench. Life in the extreme dark reveals itself anew, expanding the catalogue of Creation's oddities.",
        date: new Date(Date.now() - 691200000).toISOString().split('T')[0],
        url: "https://www.nature.com/subjects/biodiversity"
    },
    {
        title: "Orbital Sentinels Wire the Climate in Real Time",
        category: "satellites",
        description: "A fresh constellation of satellites, armed with sensors of uncommon acuity, now relays continuous intelligence upon global climate and the state of the terrestrial estate. From the orbital post, the weather of worlds is made plain.",
        date: new Date(Date.now() - 777600000).toISOString().split('T')[0],
        url: "https://www.nasa.gov/mission_pages/satellites/main/index.html"
    },
    {
        title: "Room-Temperature Superconductors Enter the Ledger",
        category: "science",
        description: "Physicists announce a class of superconducting materials that operate at ordinary warmth and pressure. Power transmission and magnetic levitation may yet be remade by this most practical wonder.",
        date: new Date(Date.now() - 864000000).toISOString().split('T')[0],
        url: "https://www.science.org/"
    },
    {
        title: "Organs Grown in the Laboratory Take Root in Living Hosts",
        category: "medicine",
        description: "Bioengineered organs, cultivated from a patient's own cells, have been transplanted with success in human trials. Regenerative medicine thus dodges the ancient spectre of rejection — a milestone duly entered in these columns.",
        date: new Date(Date.now() - 950400000).toISOString().split('T')[0],
        url: "https://www.nature.com/subjects/regenerative-medicine"
    }
];

let currentFilter = 'all';
let allInnovations = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const refreshBtn = document.getElementById('refreshBtn');
    const filterTags = document.querySelectorAll('.tag');
    const settingsToggle = document.getElementById('settingsToggle');
    const settingsPanel = document.getElementById('settingsPanel');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const saveApiKeyBtn = document.getElementById('saveApiKey');
    const clearApiKeyBtn = document.getElementById('clearApiKey');
    const toggleKeyVisibility = document.getElementById('toggleKeyVisibility');
    const apiKeyStatus = document.getElementById('apiKeyStatus');
    const footerYear = document.getElementById('footerYear');

    if (footerYear) {
        footerYear.textContent = String(new Date().getFullYear());
    }

    // Populate input if a key is already saved
    const existingKey = getApiKey();
    if (existingKey) {
        apiKeyInput.value = existingKey;
        apiKeyStatus.textContent = 'Cipher loaded from the local vault.';
        apiKeyStatus.className = 'api-key-status status-ok';
    }

    settingsToggle.addEventListener('click', () => {
        const isHidden = settingsPanel.style.display === 'none';
        settingsPanel.style.display = isHidden ? 'block' : 'none';
        settingsToggle.classList.toggle('settings-toggle-open', isHidden);
    });

    toggleKeyVisibility.addEventListener('click', () => {
        const showing = apiKeyInput.type === 'text';
        apiKeyInput.type = showing ? 'password' : 'text';
        toggleKeyVisibility.textContent = showing ? 'Reveal' : 'Conceal';
    });

    saveApiKeyBtn.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if (!key) {
            apiKeyStatus.textContent = 'Pray enter a cipher before recording.';
            apiKeyStatus.className = 'api-key-status status-warn';
            return;
        }
        saveApiKey(key);
        apiKeyStatus.textContent = 'Cipher recorded. Requisition fresh dispatches to engage Gemma.';
        apiKeyStatus.className = 'api-key-status status-ok';
    });

    clearApiKeyBtn.addEventListener('click', () => {
        clearApiKey();
        apiKeyInput.value = '';
        apiKeyStatus.textContent = 'Cipher expunged. Resorting to the archive samples.';
        apiKeyStatus.className = 'api-key-status status-warn';
        document.getElementById('aiBadge').style.display = 'none';
    });

    refreshBtn.addEventListener('click', fetchInnovations);

    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            filterTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            currentFilter = tag.dataset.category;
            displayInnovations();
        });
    });

    // Load initial innovations
    fetchInnovations();
});

// Fetch innovations — uses Gemma AI when an API key is present, otherwise falls back to sample data
async function fetchInnovations() {
    const loading = document.getElementById('loading');
    const loadingText = document.getElementById('loadingText');
    const innovationsContainer = document.getElementById('innovations');
    const errorContainer = document.getElementById('error');
    const aiBadge = document.getElementById('aiBadge');

    loading.classList.add('active');
    innovationsContainer.innerHTML = '';
    errorContainer.style.display = 'none';

    const hasApiKey = Boolean(getApiKey());

    if (hasApiKey) {
        loadingText.textContent = 'Gemma apparatus sweeping the wires for breakthroughs…';
    } else {
        loadingText.textContent = 'Consulting the archives for fresh intelligence…';
    }

    try {
        if (hasApiKey) {
            const gemmaResults = await fetchFromGemma(currentFilter);
            allInnovations = gemmaResults;
            aiBadge.style.display = 'inline-block';
        } else {
            // Simulate API call delay for sample data
            await new Promise(resolve => setTimeout(resolve, 1500));
            allInnovations = shuffleArray([...sampleInnovations]);
            aiBadge.style.display = 'none';
        }

        document.getElementById('lastUpdate').textContent = new Date().toLocaleString();
        displayInnovations();
    } catch (error) {
        console.error('Error fetching innovations:', error);
        aiBadge.style.display = 'none';
        const errorText = document.getElementById('errorText');
        if (hasApiKey) {
            errorText.textContent = `Gemma apparatus faltered: ${error.message}. Falling back to archive samples.`;
            allInnovations = shuffleArray([...sampleInnovations]);
            document.getElementById('lastUpdate').textContent = new Date().toLocaleString();
            displayInnovations();
        } else {
            errorText.textContent = 'The wires have gone silent. Pray try again presently.';
            errorContainer.style.display = 'block';
        }
    } finally {
        loading.classList.remove('active');
    }
}

// Display innovations based on current filter
function displayInnovations() {
    const innovationsContainer = document.getElementById('innovations');
    innovationsContainer.innerHTML = '';

    const filteredInnovations = currentFilter === 'all'
        ? allInnovations
        : allInnovations.filter(innovation => innovation.category === currentFilter);

    if (filteredInnovations.length === 0) {
        innovationsContainer.innerHTML = `
            <div class="empty-archives">
                <h2>No dispatches in this folio</h2>
                <p>Consult another archive seal, or requisition fresh dispatches from the wires.</p>
            </div>
        `;
        return;
    }

    filteredInnovations.forEach((innovation, index) => {
        const card = createInnovationCard(innovation, index);
        innovationsContainer.appendChild(card);
    });
}

// Create an innovation card element
function createInnovationCard(innovation, index) {
    const card = document.createElement('div');
    card.className = 'innovation-card';
    card.style.animationDelay = `${index * 0.1}s`;

    const safeUrl = sanitizeUrl(innovation.url);

    card.innerHTML = `
        <span class="innovation-category">${escapeHtml(innovation.category)}</span>
        <h3>${escapeHtml(innovation.title)}</h3>
        <p class="innovation-date">WIRED · ${formatDate(escapeHtml(innovation.date))}</p>
        <p>${escapeHtml(innovation.description)}</p>
        <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="innovation-link">
            Read the Full Despatch
        </a>
    `;

    return card;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'This very day';
    if (diffDays === 1) return 'Yester-day';
    if (diffDays < 7) return `${diffDays} days hence`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks hence`;

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Shuffle array for randomization
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// API integration functions (for production use)
// These would connect to real news APIs like NewsAPI, ScienceDaily, etc.

async function fetchFromNewsAPI(category) {
    // Example integration with NewsAPI (requires API key)
    // const API_KEY = 'your_api_key_here';
    // const keywords = categories[category].join(' OR ');
    // const url = `https://newsapi.org/v2/everything?q=${keywords}&sortBy=publishedAt&apiKey=${API_KEY}`;
    // const response = await fetch(url);
    // return await response.json();
    return null;
}

async function fetchFromArXiv(category) {
    // Example integration with arXiv API for scientific papers
    // const keywords = categories[category][0];
    // const url = `https://export.arxiv.org/api/query?search_query=all:${keywords}&sortBy=lastUpdatedDate&sortOrder=descending&max_results=5`;
    // const response = await fetch(url);
    // return await response.text();
    return null;
}

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fetchInnovations,
        fetchFromGemma,
        displayInnovations,
        createInnovationCard,
        formatDate,
        shuffleArray,
        escapeHtml,
        sanitizeUrl,
        getApiKey,
        saveApiKey,
        clearApiKey
    };
}
