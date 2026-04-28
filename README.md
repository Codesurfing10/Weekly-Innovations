# Weekly-Innovations

A dynamic web application that displays the latest innovations and breakthroughs across multiple scientific and technological fields including materials, biochemistry, chemistry, space, nanotechnology, medicine, science, nature, quantum computing, satellites, and solar energy.

## Features

- 🤖 **Gemma AI Integration**: Uses Google's Gemma AI model to sweep the web and generate real-time, cutting-edge innovation summaries across all categories
- 🔄 **Real-time Updates**: Refresh button to fetch the latest innovations
- 🎨 **Animated Interface**: Beautiful color scheme with blue, steel, orange-red, and yellow animations
- 🏷️ **Category Filtering**: Filter innovations by specific fields of interest
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- 🔗 **Direct Links**: Easy access to full articles and research papers
- ✨ **Dynamic Animations**: Eye-catching animations and transitions throughout

## Gemma AI Setup

1. **Get an API key**: Visit [Google AI Studio](https://aistudio.google.com/app/apikey) and create a free API key.
2. **Open the app**: Open `index.html` in any modern browser.
3. **Enter your key**: Click **⚙️ Gemma AI Settings**, paste your key, and click **Save**.
4. **Refresh**: Click **🔄 Refresh for Latest** — Gemma AI will now generate fresh, cutting-edge innovations for every category.

The API key is stored only in your browser's `localStorage` and is sent exclusively to Google's Generative Language API. No third-party servers are involved.

> Without an API key, the app falls back to built-in sample data so it always works out of the box.

## Color Scheme

The application features a vibrant animated color palette:
- **Steel Blue** (#4682B4) - Represents technology and innovation
- **Steel/Gray-Blue** (rgba gradients) - Professional and modern feel
- **Orange-Red** (#FF4500) - Energy and excitement
- **Yellow** (#FFD700) - Optimism and breakthrough discoveries

## Categories Covered

- Materials Science
- Biochemistry
- Chemistry
- Space Exploration
- Nanotechnology
- Medicine
- General Science
- Nature & Environment
- Quantum Computing
- Satellites
- Solar Energy

## How to Use

1. **Open the Application**: Simply open `index.html` in any modern web browser
2. **Browse Innovations**: Scroll through the latest scientific breakthroughs
3. **Filter by Category**: Click on any category tag to filter innovations
4. **Refresh Content**: Click the "🔄 Refresh for Latest" button to load new content
5. **Read More**: Click "Read Full Article →" on any card to access the complete article

## Technical Details

- **HTML5**: Semantic structure with accessibility features
- **CSS3**: Advanced animations, gradients, and responsive design
- **Vanilla JavaScript**: No dependencies, fast and lightweight
- **Gemma AI**: Google's `gemma-3-27b-it` model via the Generative Language API
- **No Backend Required**: Runs entirely in the browser

## Gemma AI Integration Details

The Gemma integration lives in `script.js`:

```javascript
// The model used for innovation sweeping
const GEMMA_MODEL = 'gemma-3-27b-it';

// Prompt Gemma to generate cutting-edge innovation summaries as JSON
async function fetchFromGemma(category) { ... }
```

When an API key is saved, clicking **Refresh** calls `fetchFromGemma(currentFilter)` which:
1. Sends a structured prompt to `gemma-3-27b-it` asking for 8 recent breakthrough summaries in the selected category (or all categories if "All" is active).
2. Parses the returned JSON array into innovation cards.
3. Displays a **✨ Powered by Gemma AI** badge in the header.

On any error (invalid key, quota exceeded, network issue) the app automatically falls back to the built-in sample data and shows an informative error message.

## Future Enhancements

Additional real-time data sources can be layered on top:

- **News APIs**: NewsAPI, Guardian API, New York Times API
- **Scientific Sources**: arXiv, PubMed, ScienceDaily
- **Space Data**: NASA APIs, ESA feeds
- **Environmental Data**: NOAA, EPA data streams

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## License

MIT License - Feel free to use and modify for your projects

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests to improve the application.

## Color Scheme

The application features a vibrant animated color palette:
- **Steel Blue** (#4682B4) - Represents technology and innovation
- **Steel/Gray-Blue** (rgba gradients) - Professional and modern feel
- **Orange-Red** (#FF4500) - Energy and excitement
- **Yellow** (#FFD700) - Optimism and breakthrough discoveries

## Categories Covered

- Materials Science
- Biochemistry
- Chemistry
- Space Exploration
- Nanotechnology
- Medicine
- General Science
- Nature & Environment
- Quantum Computing
- Satellites
- Solar Energy

## How to Use

1. **Open the Application**: Simply open `index.html` in any modern web browser
2. **Browse Innovations**: Scroll through the latest scientific breakthroughs
3. **Filter by Category**: Click on any category tag to filter innovations
4. **Refresh Content**: Click the "🔄 Refresh for Latest" button to load new content
5. **Read More**: Click "Read Full Article →" on any card to access the complete article

## Technical Details

- **HTML5**: Semantic structure with accessibility features
- **CSS3**: Advanced animations, gradients, and responsive design
- **Vanilla JavaScript**: No dependencies, fast and lightweight
- **No Backend Required**: Runs entirely in the browser

## Future Enhancements

For production deployment, you can integrate real-time data sources:

- **News APIs**: NewsAPI, Guardian API, New York Times API
- **Scientific Sources**: arXiv, PubMed, ScienceDaily
- **Space Data**: NASA APIs, ESA feeds
- **Environmental Data**: NOAA, EPA data streams

## API Integration Guide

To connect real data sources, update the `script.js` file:

```javascript
// Add your API key
const API_KEY = 'your_api_key_here';

// Uncomment and modify the API fetch functions
async function fetchFromNewsAPI(category) {
    const keywords = categories[category].join(' OR ');
    const url = `https://newsapi.org/v2/everything?q=${keywords}&sortBy=publishedAt&apiKey=${API_KEY}`;
    const response = await fetch(url);
    return await response.json();
}
```

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## License

MIT License - Feel free to use and modify for your projects

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests to improve the application.