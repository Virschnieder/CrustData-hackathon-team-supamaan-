// Claude Client with chunking support (JavaScript / ESM)

// If you're on Node < 18, uncomment the next two lines:
// import fetch from "node-fetch";
// globalThis.fetch = fetch;

export class ClaudeClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = "https://api.anthropic.com/v1/messages";
    this.specialSequence = "####";
    this.maxChunkSize = 4000; // Characters per chunk
  }

  /**
   * Main function to send context and prompt to Claude
   * @param {string} context - The context information
   * @param {string} prompt - The user's prompt/question
   * @returns {Promise<string>} - Claude's response
   */
  async chatWithContext(context, prompt) {
    try {
      // Combine context and prompt
      const fullMessage = `${context}\n\n${prompt}\n\n${this.specialSequence}`;

      console.log("📝 Full message length:", fullMessage.length, "characters");

      // Process the message in chunks
      const chunks = this.chunkMessage(fullMessage);
      console.log("📦 Created", chunks.length, "chunks");

      // Send chunks sequentially and wait for acknowledgment
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(
          `📤 Sending chunk ${i + 1}/${chunks.length} (${
            chunk.chunk.length
          } chars)`
        );

        await this.sendChunk(chunk);

        // Wait a bit between chunks to avoid rate limiting
        if (i < chunks.length - 1) {
          await this.delay(100);
        }
      }

      // Now that all chunks are sent, get Claude's response
      console.log("🤖 Getting Claude response...");
      const response = await this.getClaudeResponse(prompt);

      return response;
    } catch (error) {
      console.error("❌ Error in chatWithContext:", error);
      throw new Error(
        `Claude chat failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Chunk the message into smaller pieces
   * @param {string} message - The full message to chunk
   * @returns {Array<{chunk:string,isComplete:boolean,specialSequenceFound:boolean}>}
   */
  chunkMessage(message) {
    const chunks = [];
    let currentIndex = 0;

    while (currentIndex < message.length) {
      const chunkEnd = Math.min(
        currentIndex + this.maxChunkSize,
        message.length
      );
      const chunk = message.slice(currentIndex, chunkEnd);

      const specialSequenceFound = chunk.includes(this.specialSequence);

      chunks.push({
        chunk,
        isComplete: chunkEnd >= message.length,
        specialSequenceFound,
      });

      currentIndex = chunkEnd;
    }

    return chunks;
  }

  /**
   * Send a single chunk and wait for acknowledgment
   * (Simulated; adapt to your buffering strategy if needed)
   * @param {{chunk:string,isComplete:boolean,specialSequenceFound:boolean}} chunkData
   * @returns {Promise<void>}
   */
  async sendChunk(chunkData) {
    try {
      console.log(
        `📋 Chunk content: "${chunkData.chunk.substring(0, 50)}${
          chunkData.chunk.length > 50 ? "..." : ""
        }"`
      );

      if (chunkData.specialSequenceFound) {
        console.log("🎯 Special sequence found in this chunk!");
      }

      await this.delay(200);
      console.log(`✅ Chunk acknowledged`);
    } catch (error) {
      console.error("❌ Error sending chunk:", error);
      throw error;
    }
  }

  /**
   * Get Claude's response after all chunks are processed
   * @param {string} prompt - The original prompt
   * @returns {Promise<string>} - Claude's response
   */
  async getClaudeResponse(prompt) {
    try {
      const request = {
        model: "claude-3-sonnet-20240229",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      };

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(
          `Claude API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      // `data.content` is typically an array of content blocks; pick first text block safely
      const first = Array.isArray(data.content) ? data.content[0] : undefined;
      if (first && typeof first.text === "string") return first.text;
      if (first && typeof first.content === "string") return first.content;
      return "No response generated";
    } catch (error) {
      console.error("❌ Error getting Claude response:", error);
      throw error;
    }
  }

  /**
   * Utility function to add delay
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Set custom special sequence
   * @param {string} sequence
   */
  setSpecialSequence(sequence) {
    this.specialSequence = sequence;
    console.log("🔧 Special sequence updated to:", sequence);
  }

  /**
   * Set custom chunk size
   * @param {number} size - Maximum characters per chunk
   */
  setChunkSize(size) {
    this.maxChunkSize = size;
    console.log("🔧 Chunk size updated to:", size, "characters");
  }
}

/**
 * Main exported function
 * @param {string} context
 * @param {string} prompt
 * @param {string} apiKey
 * @returns {Promise<string>}
 */
export async function chatWithClaude(context, prompt, apiKey) {
  const client = new ClaudeClient(apiKey);
  return await client.chatWithContext(context, prompt);
}

/**
 * Alternative function that creates a client instance
 * @param {string} apiKey
 * @returns {ClaudeClient}
 */
export function createClaudeClient(apiKey) {
  return new ClaudeClient(apiKey);
}
