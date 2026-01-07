/**
 * Interface for Pollinations AI API
 */
export class PollinationsAPI {
    constructor(apiKey = '') {
        this.apiKey = apiKey;
        this.baseUrl = 'https://gen.pollinations.ai/image';
    }

    setApiKey(key) {
        this.apiKey = key;
    }

    /**
     * Returns static list of available models
     */
    getAvailableModels() {
        return [
            { name: "flux", description: "Flux Schnell" },
            { name: "zimage", description: "Z-Image Turbo" },
            { name: "turbo", description: "SDXL Turbo" },
            { name: "gptimage", description: "GPT Image 1 Mini" },
            { name: "gptimage-large", description: "GPT Image 1.5" },
            { name: "seedream", description: "Seedream 4.0" },
            { name: "kontext", description: "FLUX.1 Kontext" },
            { name: "nanobanana", description: "NanoBanana" },
            { name: "seedream-pro", description: "Seedream 4.5 Pro" },
            { name: "nanobanana-pro", description: "NanoBanana Pro" }
        ];
    }



    /**
     * Enhances a prompt using the Pollinations Chat API
     */
    async improvePrompt(prompt) {
        if (!this.apiKey) {
            throw new Error('API Key is mandatory for prompt enhancement.');
        }

        const response = await fetch('https://gen.pollinations.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'openai-fast',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert prompt engineer for AI image generation. Enhance the user\'s prompt to be more descriptive, artistic, and detailed while maintaining the original intent. Keep the final result concise (under 75 words). Return ONLY the enhanced prompt text, no explanations.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`Chat API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    }

    /**
     * Generates an image using the direct pollinations.ai /image/ endpoint.
     * Requires an API key.
     */
    async generate(params) {
        if (!this.apiKey) {
            throw new Error('API Key is mandatory for image generation.');
        }

        const { prompt, model, width, height, seed } = params;
        
        const queryParams = new URLSearchParams({
            model: model || 'turbo',
            width: width || 1024,
            height: height || 1024,
            seed: seed || Math.floor(Math.random() * 9999999),
            nologo: 'true'
        });

        // The endpoint structure requested: /image/{prompt}
        const url = `${this.baseUrl}/${encodeURIComponent(prompt)}?${queryParams.toString()}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`
            }
        });

        if (!response.ok) {
            let errorMessage = `API Error ${response.status}`;
            try {
                const text = await response.text();
                if (text) errorMessage += `: ${text.substring(0, 100)}`;
            } catch (e) {}
            throw new Error(errorMessage);
        }

        // Since this endpoint returns the image directly as a binary blob,
        // we convert it to a data URL for display and local persistence.
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
}
