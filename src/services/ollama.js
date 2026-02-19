/**
 * Service to interact with local Ollama instance
 */

// Since we have a proxy set up in vite.config.js, we can target /api directly
// The proxy forwards /api requests to http://localhost:11434/api

/**
 * Fetch available models from Ollama
 * @returns {Promise<Array>} List of models
 */
export const getModels = async () => {
    try {
        const response = await fetch('/api/tags');
        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
        }
        const data = await response.json();
        return data.models || [];
    } catch (error) {
        console.error("Failed to fetch models:", error);
        return [];
    }
};

/**
 * Chat with a model using streaming
 * @param {string} model - Model name
 * @param {Array} messages - History of messages [{role: 'user', content: '...'}, ...]
 * @param {Function} onChunk - Callback for each streamed chunk
 * @returns {Promise<void>}
 */
export const chatWithOllama = async (model, messages, onChunk) => {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                stream: true,
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama chat error: ${response.statusText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            // Ollama sends multiple JSON objects in one chunk sometimes
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
                try {
                    const json = JSON.parse(line);
                    if (json.message && json.message.content) {
                        onChunk(json.message.content);
                    }
                    if (json.done) {
                        // Chat complete
                    }
                } catch (e) {
                    console.error("Error parsing chunk:", e);
                }
            }
        }
    } catch (error) {
        console.error("Chat error:", error);
        throw error;
    }
};
