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