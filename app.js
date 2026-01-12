import { createIcons, Settings, Sparkles, Image, History, Download, Copy, Share2, Wand2, AlertCircle } from 'lucide';
import confetti from 'canvas-confetti';
import { PollinationsAPI } from './api.js';

// State Management
const state = {
    isGenerating: false,
    history: JSON.parse(localStorage.getItem('vision_ai_history') || '[]'),
    apiKey: localStorage.getItem('pollinations_api_key') || '',
    model: localStorage.getItem('vision_ai_model') || null, // Will be set after models are loaded
    width: localStorage.getItem('vision_ai_width') || '1024',
    height: localStorage.getItem('vision_ai_height') || '1024',
    availableModels: [], // Will store fetched models
};

const api = new PollinationsAPI(state.apiKey);

// DOM Elements
const elements = {
    promptInput: document.getElementById('prompt'),
    modelSelect: document.getElementById('model'),
    widthInput: document.getElementById('width'),
    heightInput: document.getElementById('height'),
    apiKeyInput: document.getElementById('api-key'),
    generateBtn: document.getElementById('generate-btn'),
    settingsToggle: document.getElementById('settings-toggle'),
    apiKeyContainer: document.getElementById('api-key-container'),
    resultArea: document.getElementById('result-area'),
    placeholder: document.querySelector('.placeholder'),
    loadingOverlay: document.getElementById('loading-overlay'),
    imageContainer: document.getElementById('image-container'),
    outputImage: document.getElementById('output-image'),
    historyGrid: document.getElementById('history-grid'),
    toast: document.getElementById('toast'),
    downloadBtn: document.getElementById('download-btn'),
    copyBtn: document.getElementById('copy-btn'),
    shareBtn: document.getElementById('share-btn'),
    magicPromptBtn: document.getElementById('magic-prompt-btn'),
    resetDefaultsBtn: document.getElementById('reset-defaults-btn'),
};

// Initialize Icons
const refreshIcons = () => createIcons({
    icons: { Settings, Sparkles, Image, History, Download, Copy, Share2, Wand2, AlertCircle }
});

function loadModels() {
    // Get static models list
    state.availableModels = api.getAvailableModels();
    
    // Safety check: ensure we have models (should always be true with static list)
    if (!state.availableModels || state.availableModels.length === 0) {
        console.error('No models available');
        return;
    }
    
    // Populate the model dropdown
    elements.modelSelect.innerHTML = '';
    state.availableModels.forEach(model => {
        const option = document.createElement('option');
        option.value = model.name; // Use model ID for API calls
        // Limit description to before " - " (space-dash-space) if present
        const displayDescription = (model.description || '').split(' - ')[0].trim();
        option.textContent = displayDescription; // Use description for display
        elements.modelSelect.appendChild(option);
    });
    
    // Set model: use saved model if valid, otherwise pick random
    const savedModel = localStorage.getItem('vision_ai_model');
    const modelExists = state.availableModels.some(m => m.name === savedModel);
    
    if (savedModel && modelExists) {
        state.model = savedModel;
    } else {
        // Pick a random model as default
        const randomIndex = Math.floor(Math.random() * state.availableModels.length);
        state.model = state.availableModels[randomIndex].name;
        localStorage.setItem('vision_ai_model', state.model);
    }
    
    elements.modelSelect.value = state.model;
}

function init() {
    refreshIcons();
    
    // Load models (now synchronous)
    loadModels();
    renderHistory();
    
    // Set stored API key in input
    elements.apiKeyInput.value = state.apiKey;
    
    // Set stored dimensions
    elements.widthInput.value = state.width;
    elements.heightInput.value = state.height;
    
    // If no API key, ensure container is visible
    if (!state.apiKey) {
        elements.apiKeyContainer.classList.remove('hidden');
    }

    // Event Listeners
    elements.generateBtn.addEventListener('click', handleGenerate);
    elements.magicPromptBtn.addEventListener('click', handleMagicPrompt);
    elements.settingsToggle.addEventListener('click', () => {
        elements.apiKeyContainer.classList.toggle('hidden');
    });

    elements.apiKeyInput.addEventListener('input', (e) => {
        state.apiKey = e.target.value;
        localStorage.setItem('pollinations_api_key', state.apiKey);
        api.setApiKey(state.apiKey);
    });

    elements.modelSelect.addEventListener('change', (e) => {
        state.model = e.target.value;
        localStorage.setItem('vision_ai_model', state.model);
    });

    elements.widthInput.addEventListener('input', (e) => {
        state.width = e.target.value;
        localStorage.setItem('vision_ai_width', state.width);
    });

    elements.heightInput.addEventListener('input', (e) => {
        state.height = e.target.value;
        localStorage.setItem('vision_ai_height', state.height);
    });

    elements.downloadBtn.addEventListener('click', downloadImage);
    elements.copyBtn.addEventListener('click', copyImageLink);
    elements.shareBtn.addEventListener('click', shareImage);
    elements.resetDefaultsBtn.addEventListener('click', resetToDefaults);

    // Enter to generate
    elements.promptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) handleGenerate();
    });
}

async function handleMagicPrompt() {
    const currentPrompt = elements.promptInput.value.trim();
    if (!currentPrompt) {
        showToast("Enter a base prompt first!");
        return;
    }

    if (!state.apiKey) {
        showToast("API Key required for magic prompts!");
        elements.apiKeyContainer.classList.remove('hidden');
        return;
    }

    elements.magicPromptBtn.classList.add('loading');
    try {
        const improved = await api.improvePrompt(currentPrompt);
        elements.promptInput.value = improved;
        showToast("Prompt enhanced with AI magic!");
    } catch (error) {
        console.error(error);
        showToast("Magic failed: " + error.message);
    } finally {
        elements.magicPromptBtn.classList.remove('loading');
    }
}

async function handleGenerate() {
    const prompt = elements.promptInput.value.trim();
    if (!prompt) {
        showToast("Please enter a prompt first!");
        return;
    }

    if (!state.apiKey) {
        showToast("API Key is required! Get it from pollinations.ai");
        elements.apiKeyContainer.classList.remove('hidden');
        elements.apiKeyInput.focus();
        return;
    }

    setLoading(true);

    const params = {
        prompt,
        model: elements.modelSelect.value,
        width: elements.widthInput.value,
        height: elements.heightInput.value,
        seed: Math.floor(Math.random() * 9999999)
    };

    try {
        const imageUrl = await api.generate(params);
        displayResult(imageUrl, params);
        addToHistory(imageUrl, params);
        
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#6366f1', '#a855f7', '#ec4899']
        });
        setLoading(false, true);
    } catch (error) {
        showToast("Generation failed!");
        displayError(error.message);
        setLoading(false, false);
    }
}

function setLoading(isLoading, success = false) {
    state.isGenerating = isLoading;
    elements.generateBtn.disabled = isLoading;
    
    if (isLoading) {
        elements.placeholder.classList.add('hidden');
        elements.loadingOverlay.classList.remove('hidden');
        elements.imageContainer.classList.add('hidden');
        elements.resultArea.classList.remove('empty');
        // Clear any previous error message if retrying
        const existingError = elements.resultArea.querySelector('.error-display');
        if (existingError) existingError.remove();
    } else {
        elements.loadingOverlay.classList.add('hidden');
        if (!success) {
            // Only show placeholder if we haven't rendered an error or image
            if (!elements.resultArea.querySelector('.error-display') && elements.imageContainer.classList.contains('hidden')) {
                elements.placeholder.classList.remove('hidden');
                elements.resultArea.classList.add('empty');
            }
        }
    }
}

function displayError(message) {
    // Remove existing error or image display
    const existingError = elements.resultArea.querySelector('.error-display');
    if (existingError) existingError.remove();
    elements.imageContainer.classList.add('hidden');
    elements.placeholder.classList.add('hidden');

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-display';
    errorDiv.innerHTML = `
        <i data-lucide="alert-circle" style="color: #ef4444; width: 48px; height: 48px; margin-bottom: 12px;"></i>
        <p style="color: #ef4444; font-weight: bold;">Generation Error</p>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 8px; max-width: 80%; text-align: center;">${message}</p>
        <button class="secondary-btn" style="margin-top: 16px;" onclick="location.reload()">Reset App</button>
    `;
    elements.resultArea.appendChild(errorDiv);
    refreshIcons();
}

function displayResult(url, params) {
    elements.outputImage.src = url;
    elements.imageContainer.classList.remove('hidden');
}

function addToHistory(url, params) {
    const item = { url, params, timestamp: Date.now() };
    state.history.unshift(item);
    state.history = state.history.slice(0, 10); // Reduced history count to prevent LocalStorage quota issues with large data URLs
    
    try {
        localStorage.setItem('vision_ai_history', JSON.stringify(state.history));
    } catch (e) {
        console.warn("History full, clearing oldest items");
        state.history = state.history.slice(0, 3); // Drastic cut if quota hit
        localStorage.setItem('vision_ai_history', JSON.stringify(state.history));
    }
    renderHistory();
}

function renderHistory() {
    elements.historyGrid.innerHTML = '';
    state.history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `<img src="${item.url}" alt="${item.params.prompt}" loading="lazy">`;
        div.onclick = () => {
            elements.promptInput.value = item.params.prompt;
            elements.modelSelect.value = item.params.model;
            elements.widthInput.value = item.params.width;
            elements.heightInput.value = item.params.height;
            displayResult(item.url, item.params);
            elements.resultArea.classList.remove('empty');
            elements.placeholder.classList.add('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        elements.historyGrid.appendChild(div);
    });
}

async function downloadImage() {
    const url = elements.outputImage.src;
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `vision-ai-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
    } catch (e) {
        window.open(url, '_blank');
    }
}

async function copyImageLink() {
    try {
        await navigator.clipboard.writeText(elements.outputImage.src);
        showToast("Link copied to clipboard!");
    } catch (err) {
        showToast("Failed to copy link");
    }
}

async function shareImage() {
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Vision AI Generation',
                text: `Check out this AI art I generated: "${elements.promptInput.value}"`,
                url: elements.outputImage.src
            });
        } catch (err) {
            console.log("Share failed or cancelled");
        }
    } else {
        copyImageLink();
    }
}

async function resetToDefaults() {
    // Confirm before performing destructive action
    if (!confirm('Are you sure you want to reset all settings? This will clear your API key, preferences, and generation history.')) {
        return;
    }

    // Clear all persisted settings from localStorage
    localStorage.removeItem('pollinations_api_key');
    localStorage.removeItem('vision_ai_model');
    localStorage.removeItem('vision_ai_width');
    localStorage.removeItem('vision_ai_height');
    localStorage.removeItem('vision_ai_history');

    // Reset state to defaults
    state.apiKey = '';
    state.width = '1024';
    state.height = '1024';
    state.history = [];

    // Reset UI elements to defaults
    elements.apiKeyInput.value = '';
    elements.widthInput.value = '1024';
    elements.heightInput.value = '1024';

    // Update API instance
    api.setApiKey('');

    // Re-render history (now empty)
    renderHistory();

    // Reload models and pick a new random one
    loadModels();

    // Show confirmation
    showToast("Settings reset to defaults!");
}

function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.remove('hidden');
    elements.toast.style.opacity = '1';
    
    setTimeout(() => {
        elements.toast.style.opacity = '0';
        setTimeout(() => elements.toast.classList.add('hidden'), 300);
    }, 3000);
}

// Start the app
init();
