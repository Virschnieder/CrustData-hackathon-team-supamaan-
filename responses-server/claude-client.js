/**
 * Simplified Claude client for the responses server
 */

/**
 * Send a message to Claude AI and get a response
 * @param {string} context - The context information
 * @param {string} prompt - The prompt to send to Claude
 * @param {string} apiKey - Claude API key
 * @returns {Promise<string>} - Claude's response
 */
async function chatWithClaude(context, prompt, apiKey) {
  try {
    if (!apiKey) {
      throw new Error('API key is required');
    }

    const request = {
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1
    };

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.content && data.content.length > 0) {
      return data.content[0].content;
    } else {
      throw new Error('No response generated from Claude');
    }

  } catch (error) {
    console.error('Error communicating with Claude:', error);
    throw new Error(`Failed to communicate with Claude: ${error.message}`);
  }
}

module.exports = {
  chatWithClaude
};
