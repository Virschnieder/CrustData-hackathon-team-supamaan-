import { chatWithClaude, createClaudeClient } from "./claude-client";

// Example 1: Simple usage with the main function
async function simpleExample() {
  try {
    const apiKey = process.env.CLAUDE_API_KEY || "your_api_key_here";

    if (apiKey === "your_api_key_here") {
      console.log("⚠️  Please set CLAUDE_API_KEY environment variable");
      return;
    }

    console.log("🚀 Simple Claude Chat Example\n");

    const response = await chatWithClaude(
      "You are a helpful coding assistant. You know TypeScript, Node.js, and web development.",
      "Explain the benefits of using TypeScript over JavaScript in 3 points.",
      apiKey,
    );

    console.log("🤖 Claude Response:");
    console.log(response);
    console.log("\n---\n");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Example 2: Using the client class for more control
async function advancedExample() {
  try {
    const apiKey = process.env.CLAUDE_API_KEY || "your_api_key_here";

    if (apiKey === "your_api_key_here") {
      console.log("⚠️  Please set CLAUDE_API_KEY environment variable");
      return;
    }

    console.log("🚀 Advanced Claude Client Example\n");

    const client = createClaudeClient(apiKey);

    // Customize settings
    client.setChunkSize(2000); // Smaller chunks
    client.setSpecialSequence("🚀READY_TO_REPLY🚀"); // Custom sequence

    const response = await client.chatWithContext(
      "You are a data analyst. You can analyze datasets and provide insights.",
      "Explain the concept of statistical significance in simple terms."
    );

    console.log("🤖 Claude Response:");
    console.log(response);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Example 3: Long context to demonstrate chunking
async function chunkingExample() {
  try {
    const apiKey = process.env.CLAUDE_API_KEY || "your_api_key_here";

    if (apiKey === "your_api_key_here") {
      console.log("⚠️  Please set CLAUDE_API_KEY environment variable");
      return;
    }

    console.log("🚀 Chunking Example with Long Context\n");

    // Create a very long context
    const longContext = `
      This is a comprehensive guide to web development that covers multiple topics.
      
      ${"Frontend Development: HTML, CSS, JavaScript, React, Vue, Angular. ".repeat(50)}
      
      Backend Development: Node.js, Express, Python, Django, Ruby on Rails.
      
      ${"Database Management: SQL, NoSQL, MongoDB, PostgreSQL, Redis. ".repeat(30)}
      
      DevOps and Deployment: Docker, Kubernetes, AWS, Azure, Google Cloud.
      
      The purpose of this context is to demonstrate how the Claude client handles large amounts of information by breaking it into manageable chunks.
      Each chunk is processed sequentially, and only after all chunks are processed will Claude be allowed to respond.
    `.trim();

    const response = await chatWithClaude(
      longContext,
      "Based on the comprehensive web development guide I just provided, what are the top 5 skills a beginner should focus on first?",
      apiKey,
    );

    console.log("🤖 Claude Response:");
    console.log(response);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run examples
async function runExamples() {
  console.log("🎯 Claude Client Examples\n");

  await simpleExample();
  await advancedExample();
  await chunkingExample();

  console.log("\n🎉 All examples completed!");
}

// Run if this file is executed directly
if (require.main === module) {
  runExamples().catch(console.error);
}

export { simpleExample, advancedExample, chunkingExample, runExamples };
