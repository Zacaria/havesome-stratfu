const xlsx = require("xlsx");
const path = require("path");

// Load the Excel file
const filePath = path.resolve(__dirname, "../assets/stratfu-src.xlsx");
const workbook = xlsx.readFile(filePath);

// List all sheet names
console.log("Sheets:", workbook.SheetNames);

// Parse each sheet and log some content summary
workbook.SheetNames.forEach((sheetName) => {
  const sheet = workbook.Sheets[sheetName];
  const jsonData = xlsx.utils.sheet_to_json(sheet, { defval: "" });
  console.log(`Sheet: ${sheetName}, Rows: ${jsonData.length}`);
  if (jsonData.length > 0) {
    console.log("Sample row:", jsonData[0]);
  }
});

// This script can be extended to analyze formatting inconsistencies and extract structured data
