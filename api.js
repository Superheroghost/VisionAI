/**
 * Interface for Pollinations AI API
 */
export class PollinationsAPI {
    constructor(apiKey = '') {
        this.apiKey = apiKey;
        this.baseUrl = 'https://gen.pollinations.ai/image';
        this.modelsUrl = 'https://gen.pollinations.ai/image/models';
    }

    setApiKey(key) {
        this.apiKey = key;
    }

    /**
     * Fetches available models from the API and filters for image output models
     */
    async fetchImageModels() {
        try {
            const response = await fetch(this.modelsUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch models: ${response.status}`);
            }
            const models = await response.json();
            
            // Filter to only include models with "image" in output_modalities
            const imageModels = models.filter(model => 
                model.output_modalities && 
                model.output_modalities.includes('image')
            );
            
            return imageModels;
        } catch (error) {
            console.error('Error fetching models:', error);
            // Return fallback models if API fails
            return this.getFallbackModels();
        }
    }

    /**
     * Fallback models in case API is unavailable
     */
    getFallbackModels() {
        return [
            { name: "turbo", description: "SDXL Turbo - Single-step real-time generation" },
            { name: "flux", description: "Flux Schnell - Fast high-quality image generation" },
            { name: "zimage", description: "Z-Image Turbo - Fast 6B Flux with 2x upscaling" },
            { name: "seedream", description: "Seedream 4.0 - ByteDance ARK (better quality)" },
            { name: "seedream-pro", description: "Seedream 4.5 Pro - ByteDance ARK (4K, Multi-Image)" },
            { name: "gptimage", description: "GPT Image 1 Mini - OpenAI's image generation model" },
            { name: "gptimage-large", description: "GPT Image 1.5 - OpenAI's advanced image generation model" },
            { name: "kontext", description: "FLUX.1 Kontext - In-context editing & generation" },
            { name: "nanobanana", description: "NanoBanana - Gemini 2.5 Flash Image" },
            { name: "nanobanana-pro", description: "NanoBanana Pro - Gemini 3 Pro Image (4K, Thinking)" }
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
