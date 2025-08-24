// Create a server that listens on port 3001 and serves the data from the data directory

import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

const dataDir = path.join(__dirname, "..", "..", "data");

const allNewDatas = {};
// cronjob to scan dataDir every 30 secs and listing the subdirectories
cron.schedule("*/30 * * * * *", () => {
  const newDatas = fs.readdirSync(dataDir);
  newDatas.forEach((newData) => {
    const dataPath = path.join(dataDir, newData, "data.json");
    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
      allNewDatas[newData] = data;
    }
  });
});

// handle the 404 routes errors
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// handle the server errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
