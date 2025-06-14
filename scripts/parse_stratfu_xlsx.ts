import xlsx from "xlsx";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { parseStrategyXLSX } from "../usecases/parse/xlsx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const targetDir = "../public/data/";

async function analyzeXLSX() {
  try {
    const filePath = resolve(__dirname, "../assets/stratfu-src.xlsx");
    const result = await parseStrategyXLSX(filePath);

    // Save the structured data
    const outputPath = resolve(__dirname, `${targetDir}dungeons.json`);
    await writeFile(outputPath, JSON.stringify(result, null, 2));
    console.log(`\nData saved to: ${outputPath}`);

    return result;
  } catch (error) {
    console.error("Error analyzing XLSX file:", error);
    process.exit(1);
  }
}

// Create output directory if it doesn't exist
const outputDir = resolve(__dirname, targetDir);
if (!existsSync(outputDir)) {
  await mkdir(outputDir, { recursive: true });
}

// Run the analysis
analyzeXLSX();
