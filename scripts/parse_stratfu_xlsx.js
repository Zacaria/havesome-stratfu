import xlsx from 'xlsx';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { writeFile } from 'fs/promises';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function cleanText(text) {
  if (!text) return '';
  return String(text).trim();
}

function isElementRow(row) {
  const [level] = row.map(cleanText);
  return ['Principale', 'Secondaire', 'Inutile', 'Utile'].includes(level);
}

function isDungeonRow(row) {
  const [level, name] = row.map(cleanText);
  return level && name && !isElementRow(row) && !name.includes(':') && name !== 'Boss';
}

async function parseDungeonData(rows) {
  const dungeons = [];
  let currentDungeon = null;
  let currentStrategy = [];
  let currentTips = [];

  for (const row of rows) {
    const [level, name, strategy, tip1, tip2, ...rest] = row.map(cleanText);
    
    // Skip empty rows
    if (row.every(cell => !cleanText(cell))) {
      // If we have a dungeon in progress and hit an empty row, save it
      if (currentDungeon && currentDungeon.name) {
        dungeons.push(currentDungeon);
        currentDungeon = null;
      }
      currentStrategy = [];
      currentTips = [];
      continue;
    }

    // Check if this is a new dungeon row
    if (isDungeonRow(row)) {
      // Save previous dungeon if exists
      if (currentDungeon && currentDungeon.name) {
        dungeons.push(currentDungeon);
      }
      
      // Start new dungeon
      currentDungeon = {
        name: level, // First column is dungeon name
        level: name, // Second column is level
        boss: strategy || '', // Third column is boss name
        strategies: [],
        tips: []
      };
      currentStrategy = [];
      currentTips = [];
    } 
    // If we're in a dungeon and this is not an element row
    else if (currentDungeon && !isElementRow(row)) {
      // Add strategy text (third column)
      if (strategy) {
        currentStrategy.push(strategy);
      }
      
      // Add tips (fourth and fifth columns)
      if (tip1) currentTips.push(tip1);
      if (tip2) currentTips.push(tip2);
      
      // Update current dungeon with latest strategy and tips
      currentDungeon.strategies = [...new Set(currentStrategy)]; // Remove duplicates
      currentDungeon.tips = [...new Set(currentTips)]; // Remove duplicates
    }
  }
  
  // Push the last dungeon if it exists
  if (currentDungeon && currentDungeon.name) {
    dungeons.push(currentDungeon);
  }
  
  return dungeons;
}

async function analyzeXLSX() {
  try {
    const filePath = resolve(__dirname, '../assets/stratfu-src.xlsx');
    const workbook = xlsx.readFile(filePath);
    const result = {};

    for (const sheetName of workbook.SheetNames) {
      if (!sheetName.includes('-')) continue; // Skip non-level range sheets
      
      console.log(`\nProcessing sheet: ${sheetName}`);
      
      const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
        defval: '',
        header: 1,
        blankrows: false
      });

      const dungeons = await parseDungeonData(jsonData);
      result[sheetName] = dungeons;
      
      console.log(`Found ${dungeons.length} dungeons in ${sheetName}`);
      dungeons.forEach((d, i) => {
        console.log(`  ${i + 1}. ${d.name} (${d.level}) - Boss: ${d.boss || 'N/A'}`);
        if (d.strategies.length > 0) {
          console.log(`     Strategies: ${d.strategies.length} entries`);
        }
        if (d.tips.length > 0) {
          console.log(`     Tips: ${d.tips.length} entries`);
        }
      });
    }

    // Save the structured data
    const outputPath = resolve(__dirname, '../build/data/dungeons.json');
    await writeFile(outputPath, JSON.stringify(result, null, 2));
    console.log(`\nData saved to: ${outputPath}`);

    return result;
  } catch (error) {
    console.error('Error analyzing XLSX file:', error);
    process.exit(1);
  }
}

// Create output directory if it doesn't exist
const outputDir = resolve(__dirname, '../build/data');
if (!existsSync(outputDir)) {
  await mkdir(outputDir, { recursive: true });
}

// Run the analysis
analyzeXLSX();