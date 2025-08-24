const express = require("express");
const cors = require("cors");
const chokidar = require("chokidar");
const fs = require("fs-extra");
const path = require("path");

// Import the Claude client from local file
// const { chatWithClaude } = require("./claude-client.js");
const { chatWithClaude } = require("./../utils/claude-client.js");

// entewr the claude key here

const app = express();
const PORT = 3006;
const DATA_DIR = path.join(__dirname, "..", "data");
const RESPONSES_DIR = path.join(__dirname, "responses");
const CONTEXT_PATH = path.join(__dirname, "..", "prompts", "context.json");

// Middleware
app.use(cors());
app.use(express.json());

// Ensure responses directory exists
fs.ensureDirSync(RESPONSES_DIR);

// Store processing status
const processingStatus = new Map();

/**
 * Process a data directory with Claude
 * @param {string} hashDir - The hash directory path
 */
async function processHashDirectory(hashDir) {
  const hash = path.basename(hashDir);
  const dataFilePath = path.join(hashDir, "data.json");
  const outputFile = path.join(RESPONSES_DIR, `${hash}.json`);

  try {
    // Check if already processed
    if (await fs.pathExists(outputFile)) {
      const existing = await fs.readJson(outputFile);
      if (existing.status === "completed") {
        console.log(`Hash ${hash} already processed, skipping...`);
        return;
      }
    }

    // Mark as processing
    processingStatus.set(hash, "processing");
    console.log(`Processing hash ${hash}...`);

    // Read the data.json file
    if (!(await fs.pathExists(dataFilePath))) {
      throw new Error(`Data file not found: ${dataFilePath}`);
    }

    const data = await fs.readJson(dataFilePath);
    console.log(`Read data for ${hash}:`, Object.keys(data));

    // Read the context
    if (!(await fs.pathExists(CONTEXT_PATH))) {
      throw new Error(`Context file not found: ${CONTEXT_PATH}`);
    }

    const contextData = await fs.readJson(CONTEXT_PATH);
    const context = contextData.context;

    // Prepare the input data as a JSON string
    const inputDataString = JSON.stringify(data, null, 2);

    // Create the full prompt by combining context and input data
    const fullPrompt = `${context}\n\n## Company Data to Rank\n\`\`\`json\n${inputDataString}\n\`\`\``;

    console.log(`Sending ${hash} data to Claude...`);

    // Get API key from environment
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      throw new Error("CLAUDE_API_KEY environment variable is not set");
    }

    // Send to Claude using the chatWithClaude function
    const claudeResponse = await chatWithClaude(context, fullPrompt, apiKey);

    if (!claudeResponse) {
      throw new Error("No response received from Claude");
    }

    console.log(`Received response from Claude for ${hash}`);

    // Try to extract JSON from Claude's response
    let jsonResponse;

    // Look for JSON content in the response
    const jsonMatch = claudeResponse.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonResponse = JSON.parse(jsonMatch[1]);
    } else {
      // Try to find JSON without markdown formatting
      const jsonStart = claudeResponse.indexOf("{");
      const jsonEnd = claudeResponse.lastIndexOf("}") + 1;
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        const jsonString = claudeResponse.substring(jsonStart, jsonEnd);
        jsonResponse = JSON.parse(jsonString);
      } else {
        throw new Error("Could not extract JSON response from Claude");
      }
    }

    // Save the completed result
    const result = {
      hash,
      data,
      ranking: jsonResponse,
      processedAt: new Date().toISOString(),
      status: "completed",
      claudeResponse: claudeResponse,
    };

    await fs.writeJson(outputFile, result, { spaces: 2 });
    processingStatus.set(hash, "completed");

    console.log(`Hash ${hash} processed successfully!`);
  } catch (error) {
    console.error(`Error processing hash ${hash}:`, error);

    // Save error state
    const errorResult = {
      hash,
      data: {},
      ranking: {},
      processedAt: new Date().toISOString(),
      status: "error",
      error: error.message,
    };

    await fs.writeJson(outputFile, errorResult, { spaces: 2 });
    processingStatus.set(hash, "error");
  }
}

/**
 * Watch the data directory for new subdirectories
 */
function watchDataDirectory() {
  console.log(`Starting to watch directory: ${DATA_DIR}`);

  const watcher = chokidar.watch(DATA_DIR, {
    persistent: true,
    ignoreInitial: false,
    depth: 1, // Only watch immediate subdirectories
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100,
    },
  });

  // When a new directory is added
  watcher.on("addDir", async (dirPath) => {
    const dirName = path.basename(dirPath);

    // Skip if it's the data directory itself
    if (dirName === path.basename(DATA_DIR)) {
      return;
    }

    console.log(`New directory detected: ${dirName}`);

    // Check if it contains a data.json file
    const dataJsonPath = path.join(dirPath, "data.json");

    try {
      // Wait a bit for the file to be fully written
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if data.json exists
      if (await fs.pathExists(dataJsonPath)) {
        console.log(`Processing new hash directory: ${dirName}`);
        await processHashDirectory(dirPath);
      } else {
        console.log(
          `Directory ${dirName} doesn't contain data.json, skipping...`
        );
      }
    } catch (error) {
      console.error(`Error processing new directory ${dirName}:`, error);
    }
  });

  // When a directory is removed
  watcher.on("unlinkDir", (dirPath) => {
    const dirName = path.basename(dirPath);
    console.log(`Directory removed: ${dirName}`);
  });

  // Handle errors
  watcher.on("error", (error) => {
    console.error("Directory watcher error:", error);
  });

  // Handle ready event
  watcher.on("ready", async () => {
    console.log("Directory watcher is ready");

    // Process any existing directories
    try {
      const items = await fs.readdir(DATA_DIR);
      for (const item of items) {
        const itemPath = path.join(DATA_DIR, item);
        const stats = await fs.stat(itemPath);

        if (stats.isDirectory()) {
          const dataJsonPath = path.join(itemPath, "data.json");
          if (await fs.pathExists(dataJsonPath)) {
            console.log(`Processing existing hash directory: ${item}`);
            try {
              await processHashDirectory(itemPath);
            } catch (error) {
              console.error(
                `Error processing existing directory ${item}:`,
                error
              );
            }
          }
        }
      }
    } catch (error) {
      console.error("Error reading existing directories:", error);
    }
  });

  console.log("Directory watcher started successfully");
}

// API Endpoints

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    dataDirectory: DATA_DIR,
    server: "responses-server",
  });
});

// List all processed hashes
app.get("/outputs", async (req, res) => {
  try {
    const files = await fs.readdir(RESPONSES_DIR);
    const hashes = files
      .filter((file) => file.endsWith(".json"))
      .map((file) => file.replace(".json", ""));

    res.json({
      hashes,
      count: hashes.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error listing outputs:", error);
    res.status(500).json({
      error: "Failed to list outputs",
      message: error.message,
    });
  }
});

// Get processed hash by hash name
app.get("/outputs/:hash", async (req, res) => {
  try {
    const { hash } = req.params;
    const outputFile = path.join(RESPONSES_DIR, `${hash}.json`);

    if (!(await fs.pathExists(outputFile))) {
      return res.status(404).json({
        error: "Hash not found",
        message: `No processed data found for hash: ${hash}`,
      });
    }

    const result = await fs.readJson(outputFile);
    res.json(result);
  } catch (error) {
    console.error(`Error getting hash ${req.params.hash}:`, error);
    res.status(500).json({
      error: "Failed to get hash data",
      message: error.message,
    });
  }
});

// Get processing status
app.get("/status/:hash", (req, res) => {
  const { hash } = req.params;
  const status = processingStatus.get(hash) || "unknown";

  res.json({
    hash,
    status,
    timestamp: new Date().toISOString(),
  });
});

// Force reprocess a specific hash
app.post("/reprocess/:hash", async (req, res) => {
  try {
    const { hash } = req.params;
    const hashDir = path.join(DATA_DIR, hash);

    // Check if the hash directory exists
    if (!(await fs.pathExists(hashDir))) {
      return res.status(404).json({
        error: "Hash directory not found",
        message: `Directory not found: ${hashDir}`,
      });
    }

    console.log(`Force reprocessing hash: ${hash}`);
    await processHashDirectory(hashDir);

    res.json({
      message: `Hash ${hash} reprocessed successfully`,
      status: processingStatus.get(hash),
    });
  } catch (error) {
    console.error(`Error reprocessing hash ${req.params.hash}:`, error);
    res.status(500).json({
      error: "Failed to reprocess hash",
      message: error.message,
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Responses Server running on port ${PORT}`);
  console.log(`📁 Watching data directory: ${DATA_DIR}`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📤 Outputs: http://localhost:${PORT}/outputs`);
  console.log(`🔍 Individual output: http://localhost:${PORT}/outputs/{hash}`);

  // Start watching the data directory
  watchDataDirectory();
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down Responses Server...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Shutting down Responses Server...");
  process.exit(0);
});

