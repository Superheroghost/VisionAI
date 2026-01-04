# VisionAI

A sleek, modern web application for generating AI-powered images using the Pollinations AI API. Create stunning artwork from text prompts with a beautiful dark-themed interface.

![VisionAI](https://img.shields.io/badge/VisionAI-AI%20Image%20Generator-6366f1?style=for-the-badge)

## ✨ Features

- **AI Image Generation** - Transform text prompts into stunning images using various AI models
- **Magic Prompt Enhancement** - Use AI to automatically enhance and improve your prompts for better results
- **Multiple Models** - Choose from 10 different AI models including SDXL Turbo, Flux Schnell, Z-Image Turbo, Seedream, GPT Image, and more
- **Customizable Dimensions** - Set image width and height (256px to 2048px)
- **Persistent Settings** - Your selected model, dimensions, and API key are saved and persist across page refreshes
- **Reset to Defaults** - Easily reset all settings, API key, and history to their default values
- **Generation History** - View and re-use your 10 most recent generations
- **Image Actions** - Download, copy link, or share your generated images
- **Responsive Design** - Works beautifully on desktop and mobile devices
- **Local Storage** - Your API key, settings, and history are stored locally in your browser

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A Pollinations API key from [pollinations.ai](https://pollinations.ai)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Superheroghost/VisionAI.git
   cd VisionAI
   ```

2. Open `index.html` in your browser, or serve it with any static file server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (npx)
   npx serve .
   ```

3. Enter your Pollinations API key when prompted

### Usage

1. **Enter a Prompt** - Describe the image you want to generate in the text area
2. **Enhance with Magic Prompt** - Click the wand button (✨) next to the prompt to use AI to enhance your prompt for better results
3. **Select a Model** - Choose from available AI models:
   - **SDXL Turbo** - Fast generation
   - **Flux Schnell** - AI image generation model
   - **Z-Image Turbo** - Artistic style (default)
   - **Seedream 4.0 / Seedream 4.5 Pro** - Dream-like imagery
   - **GPT Image 1 Mini / GPT Image 1.5** - GPT-powered generation
   - **FLUX.1 Kontext** - Context-aware generation
   - **NanoBanana / NanoBanana Pro** - Experimental models
4. **Set Dimensions** - Adjust width and height (default: 1024×1024)
5. **Generate** - Click the "Generate Image" button or press `Ctrl+Enter`
6. **Save & Share** - Download, copy the link, or share your creation
7. **Reset Settings** - Click the settings icon (⚙️) and then "Reset to Defaults" to clear all saved settings, API key, and history

> **Note:** Your selected model, dimensions, and API key are automatically saved and will persist when you refresh the page. Use the "Reset to Defaults" button to restore default settings.

## 🛠️ Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables and glass morphism effects
- **Vanilla JavaScript** - ES Modules for clean, modular code
- **[Lucide Icons](https://lucide.dev/)** - Beautiful, consistent icons
- **[Canvas Confetti](https://github.com/catdad/canvas-confetti)** - Celebration effects on successful generation

## 📁 Project Structure

```
VisionAI/
├── index.html    # Main HTML file
├── style.css     # Styling and animations
├── app.js        # Main application logic
├── api.js        # Pollinations API interface
└── README.md     # This file
```

## 🔒 Privacy

- Your API key is stored locally in your browser's localStorage
- Your settings (model, dimensions) are stored locally and persist across sessions
- Generation history is kept locally and never sent to external servers
- No analytics or tracking is implemented

## 📝 License

This project is open source. Please see the repository for licensing details.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.
