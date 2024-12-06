const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const DATA_FILE = path.resolve(__dirname, "metadata.json");

function compileSVG(tokenId) {
  const metadata = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));

  if (!metadata[tokenId]) {
    throw new Error(`Metadata for tokenId ${tokenId} not found.`);
  }

  const paths = metadata[tokenId];

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" style="background:white;">`;
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

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
