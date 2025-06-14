import xlsx from "xlsx";

function cleanText(text: string) {
  if (!text) return "";
  return String(text).trim();
}

function isIgnoredRow(row: string[]) {
  const [level] = row.map(cleanText);
  if (level.startsWith("Intéressant")) {
    return true;
  }

  if (level.startsWith("Résistances à favoriser")) {
    return true;
  }

  return ["Principale", "Secondaire", "Inutile", "Utile"].includes(level);
}

function isDungeonRow(row: string[]) {
  const [level, name] = row.map(cleanText);
  return (
    level &&
    name &&
    !isIgnoredRow(row) &&
    !name.includes(":") &&
    name !== "Boss"
  );
}

async function parseDungeonData(rows: string[][], rangeId: string) {
  const dungeons = [];
  let currentDungeon = null;
  let currentStrategy = [];
  let currentTips = [];

  for (const row of rows) {
    const [level, name, strategy, tip1, tip2, ...rest] = row.map(cleanText);

    // Skip empty rows
    if (row.every((cell) => !cleanText(cell))) {
      // If we have a dungeon in progress and hit an empty row, save it
      if (currentDungeon?.name) {
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
      if (currentDungeon?.name) {
        dungeons.push(currentDungeon);
      }

      // Start new dungeon
      currentDungeon = {
        name: level, // First column is dungeon name
        level: name, // Second column is level
        boss: strategy || "", // Third column is boss name
        slug: name
          .toLowerCase()
          .replace(/\s+/g, "")
          .replace(/[^a-z0-9-]/g, ""),
        levelRange: rangeId,
        strategies: [],
        tips: [],
      };
      currentStrategy = [];
      currentTips = [];
    }
    // If we're in a dungeon and this is not an element row
    else if (currentDungeon && !isIgnoredRow(row)) {
      // Add strategy text (third column)
      if (strategy) {
        currentStrategy.push(strategy);
      }

      // Add tips (fourth and fifth columns)
      if (tip1) currentTips.push(tip1);
      if (tip2) currentTips.push(tip2);

      // Update current dungeon with latest strategy and tips
      if (currentDungeon) {
        currentDungeon.strategies = [...new Set(currentStrategy)]; // Remove duplicates
        currentDungeon.tips = [...new Set(currentTips)]; // Remove duplicates
      }
    }
  }

  // Push the last dungeon if it exists
  if (currentDungeon?.name) {
    dungeons.push(currentDungeon);
  }

  return dungeons;
}

export const parseStrategyXLSX = async (filePath: string) => {
  const workbook = xlsx.readFile(filePath);
  const result = [];

  for (const sheetName of workbook.SheetNames) {
    if (!sheetName.includes("-")) continue; // Skip non-level range sheets

    console.log(`\nProcessing sheet: ${sheetName}`);

    const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
      defval: "",
      header: 1,
      blankrows: false,
    });
    const rangeId = cleanText(sheetName).replace(/\s+/g, "");

    const dungeons = await parseDungeonData(jsonData as string[][], rangeId);
    result.push({
      id: rangeId,
      label: cleanText(sheetName),
      dungeons,
    });

    console.log(`Found ${dungeons.length} dungeons in ${sheetName}`);
    dungeons.forEach((d, i) => {
      console.log(
        `  ${i + 1}. ${d.name} (${d.level}) - Boss: ${d.boss || "N/A"}`
      );
      if (d.strategies.length > 0) {
        console.log(`     Strategies: ${d.strategies.length} entries`);
      }
      if (d.tips.length > 0) {
        console.log(`     Tips: ${d.tips.length} entries`);
      }
    });
  }

  return result;
};
