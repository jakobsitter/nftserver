const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

const RPC_PROVIDER = "https://sepolia.base.org";
const CONTRACT_ADDRESS = "0xbcb434b7983e04a9510ef49b35d9d3687ced8509";
const ABI = [
  "function childrenOf(uint256 tokenId) external view returns (tuple(uint256 tokenId, address contractAddress)[] memory)",
  "function tokenInfo(uint256 tokenId) external view returns (string memory, string memory, string memory)"
];

const provider = new ethers.providers.JsonRpcProvider(RPC_PROVIDER);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

const DATA_FILE = path.resolve(__dirname, "metadata.json");

async function fetchAndSaveData() {
  console.log("Starting data fetch..."); // Add this line
  const tokenIds = [1, 2, 3, 4, 5]; // Replace with token IDs you want to fetch

  const metadata = {};

  for (const tokenId of tokenIds) {
    try {
      const children = await contract.childrenOf(tokenId);
      const paths = await Promise.all(
        children.map(async (child, index) => {
          const [line] = await contract.tokenInfo(child.tokenId);
          return { d: line, transform: `translate(0, ${index * 2})` };
        })
      );

      metadata[tokenId] = paths;
    } catch (error) {
      console.error(`Error fetching data for tokenId ${tokenId}:`, error);
    }
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(metadata, null, 2));
  console.log("Metadata updated.");
}
if (require.main === module) {
  fetchAndSaveData().catch((error) => console.error("Fetcher failed:", error));
}

module.exports = fetchAndSaveData;
