const express = require("express");
const fs = require("fs");
const path = require("path");
const pathBounds = require("svg-path-bounds");

const app = express();
const DATA_FILE = path.resolve(__dirname, "metadata.json");

function compileSVG(tokenId) {
  const metadata = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));

  if (!metadata[tokenId]) {
    throw new Error(`Metadata for tokenId ${tokenId} not found.`);
  }

  const paths = metadata[tokenId];

  // Initialize bounds
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  // Calculate bounding box
  paths.forEach((path) => {
    // Parse path's `d` attribute manually or use a library to get bounds
    const pathBounds = require("svg-path-bounds")(path.d);
    const [x1, y1, x2, y2] = pathBounds;

    minX = Math.min(minX, x1);
    minY = Math.min(minY, y1);
    maxX = Math.max(maxX, x2);
    maxY = Math.max(maxY, y2);
  });

  const width = maxX - minX;
  const height = maxY - minY;

  // Build the SVG string with dynamic size
  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" style="background:white;">`;
  paths.forEach((path) => {
    svgContent += `<path d="${path.d}" fill="none" stroke="#000" stroke-width="1"/>`;
  });
  svgContent += `</svg>`;

  return svgContent;
}

app.get("/svg/:tokenId", (req, res) => {
  const tokenId = req.params.tokenId;

  try {
    const svgContent = compileSVG(tokenId);
    res.set("Content-Type", "image/svg+xml");
    res.send(svgContent);
  } catch (error) {
    console.error("Error generating SVG:", error);
    res.status(500).send("Error generating SVG");
  }
});

const PORT = 3010;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
