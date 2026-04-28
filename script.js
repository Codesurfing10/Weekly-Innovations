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

    const prompt = `You are an expert science and technology journalist with access to the latest research.
Generate 8 of the most cutting-edge, real-world innovation summaries representing genuine recent breakthroughs (2024-2025) in ${categoryScope}.

Return ONLY a valid JSON array containing exactly 8 objects. Do not include markdown code fences, prose, or any text outside the JSON array.
Each object must have these exact keys:
- "title": string — a compelling, factual headline (max 100 characters)
- "category": string — ${categoryRule}
- "description": string — 2-3 sentences describing the breakthrough and its broader significance
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

// Sample innovations data (in production, this would come from APIs)
const sampleInnovations = [
    {
        title: "Revolutionary Quantum Computer Achieves Quantum Supremacy",
        category: "quantum",
        description: "Scientists have developed a new quantum computer that can solve complex problems exponentially faster than classical computers, marking a major milestone in quantum computing technology.",
        date: new Date().toISOString().split('T')[0],
        url: "https://www.nature.com/subjects/quantum-computing"
    },
    {
        title: "Breakthrough in Graphene-Based Materials for Energy Storage",
        category: "materials",
        description: "Researchers have created a new graphene composite material that dramatically increases battery capacity and charging speed, potentially revolutionizing electric vehicles and portable electronics.",
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        url: "https://www.nature.com/subjects/materials-science"
    },
    {
        title: "New CRISPR Technique Enables Precise Gene Editing in Living Organisms",
        category: "biochemistry",
        description: "A novel CRISPR-based method allows for unprecedented precision in gene editing, opening new possibilities for treating genetic diseases and advancing personalized medicine.",
        date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
        url: "https://www.nature.com/subjects/biochemistry"
    },
    {
        title: "NASA's James Webb Telescope Discovers Earth-Like Exoplanet",
        category: "space",
        description: "The James Webb Space Telescope has identified a potentially habitable exoplanet with atmospheric conditions similar to Earth, located in the habitable zone of its star system.",
        date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
        url: "https://www.nasa.gov/mission_pages/webb/main/index.html"
    },
    {
        title: "Nanorobots Successfully Target Cancer Cells in Clinical Trials",
        category: "nanotechnology",
        description: "Microscopic nanorobots have shown remarkable success in identifying and destroying cancer cells while leaving healthy tissue unharmed in phase II clinical trials.",
        date: new Date(Date.now() - 345600000).toISOString().split('T')[0],
        url: "https://www.science.org/topic/nanotechnology"
    },
    {
        title: "Artificial Intelligence Predicts Protein Structures with 95% Accuracy",
        category: "medicine",
        description: "A new AI system can predict protein folding structures with unprecedented accuracy, accelerating drug discovery and our understanding of diseases.",
        date: new Date(Date.now() - 432000000).toISOString().split('T')[0],
        url: "https://www.nature.com/subjects/medical-research"
    },
    {
        title: "Solar Cell Efficiency Reaches Record 47% Using Perovskite Technology",
        category: "solar",
        description: "Scientists have achieved a breakthrough in solar cell efficiency using advanced perovskite materials, bringing us closer to truly sustainable energy solutions.",
        date: new Date(Date.now() - 518400000).toISOString().split('T')[0],
        url: "https://www.science.org/topic/solar-energy"
    },
    {
        title: "Chemical Synthesis Method Reduces CO2 Emissions by 80%",
        category: "chemistry",
        description: "Researchers have developed a revolutionary green chemistry technique that dramatically reduces carbon emissions in industrial chemical production.",
        date: new Date(Date.now() - 604800000).toISOString().split('T')[0],
        url: "https://www.nature.com/subjects/chemistry"
    },
    {
        title: "Biodiversity Hotspot Discovered in Deep Ocean Trench",
        category: "nature",
        description: "Marine biologists have uncovered a previously unknown ecosystem teeming with unique species in the Mariana Trench, expanding our understanding of life in extreme environments.",
        date: new Date(Date.now() - 691200000).toISOString().split('T')[0],
        url: "https://www.nature.com/subjects/biodiversity"
    },
    {
        title: "Advanced Satellite System Enables Real-Time Climate Monitoring",
        category: "satellites",
        description: "A new constellation of satellites equipped with cutting-edge sensors provides unprecedented real-time data on global climate patterns and environmental changes.",
        date: new Date(Date.now() - 777600000).toISOString().split('T')[0],
        url: "https://www.nasa.gov/mission_pages/satellites/main/index.html"
    },
    {
        title: "Superconducting Materials Work at Room Temperature",
        category: "science",
        description: "Physicists have created a new class of superconducting materials that operate at room temperature and ambient pressure, potentially revolutionizing power transmission and magnetic levitation.",
        date: new Date(Date.now() - 864000000).toISOString().split('T')[0],
        url: "https://www.science.org/"
    },
    {
        title: "Lab-Grown Organs Successfully Transplanted in Human Trials",
        category: "medicine",
        description: "Bioengineered organs grown from patients' own cells have been successfully transplanted, marking a major milestone in regenerative medicine and eliminating organ rejection issues.",
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

    // Populate input if a key is already saved
    const existingKey = getApiKey();
    if (existingKey) {
        apiKeyInput.value = existingKey;
        apiKeyStatus.textContent = '✅ API key loaded from storage';
        apiKeyStatus.className = 'api-key-status status-ok';
    }

    settingsToggle.addEventListener('click', () => {
        const isHidden = settingsPanel.style.display === 'none';
        settingsPanel.style.display = isHidden ? 'block' : 'none';
        settingsToggle.classList.toggle('settings-toggle-open', isHidden);
    });

    toggleKeyVisibility.addEventListener('click', () => {
        apiKeyInput.type = apiKeyInput.type === 'password' ? 'text' : 'password';
    });

    saveApiKeyBtn.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if (!key) {
            apiKeyStatus.textContent = '⚠️ Please enter an API key first.';
            apiKeyStatus.className = 'api-key-status status-warn';
            return;
        }
        saveApiKey(key);
        apiKeyStatus.textContent = '✅ API key saved. Click Refresh to use Gemma AI!';
        apiKeyStatus.className = 'api-key-status status-ok';
    });

    clearApiKeyBtn.addEventListener('click', () => {
        clearApiKey();
        apiKeyInput.value = '';
        apiKeyStatus.textContent = '🗑️ API key cleared. Using sample data.';
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
        loadingText.textContent = '🤖 Gemma AI is sweeping the latest breakthroughs…';
    } else {
        loadingText.textContent = 'Searching for latest innovations...';
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
            errorText.textContent = `Gemma AI error: ${error.message}. Falling back to sample data.`;
            allInnovations = shuffleArray([...sampleInnovations]);
            document.getElementById('lastUpdate').textContent = new Date().toLocaleString();
            displayInnovations();
        } else {
            errorText.textContent = 'Unable to fetch innovations. Please try again later.';
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
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <h2>No innovations found for this category</h2>
                <p>Try selecting a different category or refresh for new content.</p>
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
        <p class="innovation-date">📅 ${formatDate(escapeHtml(innovation.date))}</p>
        <p>${escapeHtml(innovation.description)}</p>
        <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="innovation-link">
            Read Full Article →
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
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    
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
