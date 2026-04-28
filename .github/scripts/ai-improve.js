'use strict';

const fs = require('fs');
const path = require('path');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const IMPROVEMENT_TYPE = process.env.IMPROVEMENT_TYPE || 'auto';
const MODELS_API = 'https://models.inference.ai.azure.com/chat/completions';
const MODEL = 'gpt-4o-mini';

// Improvement types rotate week-by-week when set to 'auto'
const IMPROVEMENT_TYPES = ['accessibility', 'seo', 'css', 'javascript', 'content'];

const IMPROVEMENTS = {
  accessibility: {
    file: 'index.html',
    label: 'Accessibility improvements',
    instruction: `Improve the HTML for web accessibility:
- Add a "Skip to main content" anchor link at the very top of <body> pointing to the #innovations element
- Add aria-label attributes to the refresh button, settings toggle, and filter tags container
- Add role="main" to the primary content area
- Ensure the loading spinner has aria-live="polite" so screen readers announce updates
- Add <meta name="theme-color"> with the primary brand colour (#1e3c72)
Keep changes minimal and focused; preserve all existing functionality.`
  },
  seo: {
    file: 'index.html',
    label: 'SEO enhancements',
    instruction: `Add or improve SEO-related elements inside <head>:
- Add <meta name="description"> with a compelling 155-character description of the site
- Add Open Graph tags: og:title, og:description, og:type="website", og:url
- Add Twitter Card tags: twitter:card="summary_large_image", twitter:title, twitter:description
- Add <link rel="canonical" href="https://theinnovationchannel.com/">
- Add JSON-LD structured data (WebSite schema with SearchAction)
Do not alter anything outside <head>; preserve all existing markup.`
  },
  css: {
    file: 'styles.css',
    label: 'Visual and UX improvements',
    instruction: `Make focused CSS/UX improvements:
- Add smooth scrolling: html { scroll-behavior: smooth; }
- Improve :focus-visible styles on interactive elements (buttons, links, tags) so keyboard users see a clear yellow outline
- Add a CSS custom property --brand-blue: #4682B4 at :root and replace the first hard-coded occurrence of #4682B4 with var(--brand-blue) as a demonstration
- Add a subtle text-rendering: optimizeLegibility rule to body for crisper text
Keep all existing rules intact; only add or refine as described.`
  },
  javascript: {
    file: 'script.js',
    label: 'JavaScript UX enhancements',
    instruction: `Add two small, well-contained JavaScript features:
1. Back-to-top button: create a <button> element in JS with id="backToTop", position it fixed bottom-right (bottom:30px; right:30px), show/hide it based on window.scrollY > 400, and scroll to top smoothly on click. Give it a short inline style (background:#FF4500; color:#fff; border:none; border-radius:50%; width:44px; height:44px; font-size:1.2rem; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,0.3)).
2. Keyboard shortcut: pressing 'R' (when no input is focused) triggers fetchInnovations().
Insert both features inside the DOMContentLoaded listener. Preserve all existing code.`
  },
  content: {
    file: 'script.js',
    label: 'Updated sample innovation content',
    instruction: `Refresh the sampleInnovations array only. For every entry:
- Set the date to a realistic YYYY-MM-DD value within the last 90 days from ${new Date().toISOString().split('T')[0]}
- Rewrite the description to be specific, informative, and 2-3 sentences (avoid generic language)
- Verify the URL is a real authoritative source (nature.com, science.org, nasa.gov, arxiv.org, pubmed.ncbi.nlm.nih.gov, cell.com, thelancet.com, esa.int, etc.)
- Sharpen each title to be specific rather than generic
Do NOT change anything outside the sampleInnovations array.`
  }
};

function getImprovementType() {
  if (IMPROVEMENT_TYPE !== 'auto') return IMPROVEMENT_TYPE;
  const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  return IMPROVEMENT_TYPES[weekNum % IMPROVEMENT_TYPES.length];
}

async function callAI(fileContent, instruction, ext) {
  const response = await fetch(MODELS_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an expert web developer making targeted improvements to a static science news website called "Weekly Innovations".
Return ONLY the complete modified file content — no explanations, no markdown code fences, no surrounding text.
Your entire response must be the raw ${ext} file content ready to write directly to disk.
Preserve all existing functionality. Make only the changes described in the task.`
        },
        {
          role: 'user',
          content: `Current file content:\n${fileContent}\n\n---\nTask:\n${instruction}`
        }
      ],
      temperature: 0.2,
      max_tokens: 8192
    })
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`GitHub Models API responded with ${response.status}: ${body.slice(0, 300)}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}

function stripFences(text) {
  return text
    .replace(/^```[\w]*\r?\n/, '')
    .replace(/\r?\n```$/, '')
    .trim();
}

// Minimum ratio of improved-to-original length; prevents accidental data loss
// if the AI truncates or omits large chunks of the file.
const MIN_CONTENT_RATIO = 0.6;

function validate(original, improved, ext) {
  if (improved.length < original.length * MIN_CONTENT_RATIO) {
    throw new Error('Improved content is suspiciously short — aborting to prevent data loss');
  }
  if (ext === 'html' && !/<!doctype\s+html>/i.test(improved.slice(0, 200))) {
    throw new Error('Improved HTML is missing DOCTYPE — aborting');
  }
  if (ext === 'js' && !improved.includes('fetchInnovations')) {
    throw new Error('Improved JS appears to be missing key functions — aborting');
  }
}

function setOutput(key, value) {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (!outputFile) return;
  const delimiter = `DELIM_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  fs.appendFileSync(outputFile, `${key}<<${delimiter}\n${value}\n${delimiter}\n`);
}

async function main() {
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN environment variable is required');
  }

  const type = getImprovementType();
  const cfg = IMPROVEMENTS[type];
  const repoRoot = path.join(__dirname, '..', '..');
  const filePath = path.join(repoRoot, cfg.file);
  const ext = path.extname(cfg.file).slice(1);

  console.log(`Improvement type : ${type}`);
  console.log(`Target file      : ${cfg.file}`);

  const original = fs.readFileSync(filePath, 'utf8');
  const raw = await callAI(original, cfg.instruction, ext);
  const improved = stripFences(raw);

  validate(original, improved, ext);

  if (improved === original.trim()) {
    console.log('No changes detected — skipping PR creation.');
    setOutput('changed', 'false');
    return;
  }

  fs.writeFileSync(filePath, improved + '\n');
  console.log(`✅  Applied ${type} improvements to ${cfg.file}`);

  // Write PR body to a file so the workflow action can reference it cleanly
  const prBodyPath = path.join(__dirname, 'pr-body.md');
  const prBody = [
    '## 🤖 Automated AI Improvement',
    '',
    `**Improvement type:** \`${type}\`  `,
    `**Modified file:** \`${cfg.file}\``,
    '',
    '### What was improved',
    '',
    cfg.instruction
      .split('\n')
      .map(l => `> ${l}`)
      .join('\n'),
    '',
    '---',
    '*This PR was generated automatically by the [AI Site Improvement](.github/workflows/ai-improve.yml) workflow.*',
    '*Please review the changes before merging.*'
  ].join('\n');

  fs.writeFileSync(prBodyPath, prBody);

  setOutput('changed', 'true');
  setOutput('label', cfg.label);
}

main().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
