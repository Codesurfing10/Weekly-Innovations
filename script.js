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

// Fetch innovations from various sources
async function fetchInnovations() {
    const loading = document.getElementById('loading');
    const innovationsContainer = document.getElementById('innovations');
    const errorContainer = document.getElementById('error');
    
    loading.classList.add('active');
    innovationsContainer.innerHTML = '';
    errorContainer.style.display = 'none';
    
    try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // In production, you would fetch from real APIs here
        // For now, we'll use sample data with some randomization to simulate "fresh" data
        allInnovations = shuffleArray([...sampleInnovations]);
        
        // Update last update time
        document.getElementById('lastUpdate').textContent = new Date().toLocaleString();
        
        displayInnovations();
    } catch (error) {
        console.error('Error fetching innovations:', error);
        errorContainer.style.display = 'block';
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
    
    card.innerHTML = `
        <span class="innovation-category">${innovation.category}</span>
        <h3>${innovation.title}</h3>
        <p class="innovation-date">📅 ${formatDate(innovation.date)}</p>
        <p>${innovation.description}</p>
        <a href="${innovation.url}" target="_blank" rel="noopener noreferrer" class="innovation-link">
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
        displayInnovations,
        createInnovationCard,
        formatDate,
        shuffleArray
    };
}
