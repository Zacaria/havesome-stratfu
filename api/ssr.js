import { renderPage } from "vike/server";
export const edge = true;
// We use JSDoc instead of TypeScript because Vercel seems buggy with /api/**/*.ts files

/**
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 */
export default async function handler(req, res) {
  const { url } = req;
  console.log("Request to url:", url);

// Print file tree with max depth of 4
const fs = require('fs');
const path = require('path');

function printFileTree(dir, level = 0, maxDepth = 4) {
  if (level > maxDepth) return;
  
  try {
    const items = fs.readdirSync(dir);
    console.log("items", items);
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);
      const prefix = '  '.repeat(level) + (level > 0 ? '|- ' : '');
      console.log(`${prefix}${item}`);
      
      if (stats.isDirectory() && level < maxDepth) {
        printFileTree(itemPath, level + 1, maxDepth);
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dir}: ${err.message}`);
  }
}

console.log("File tree (max depth: 4):");
printFileTree('/var/task');

 
  if (url === undefined) throw new Error("req.url is undefined");

  const pageContextInit = { urlOriginal: url };
  const pageContext = await renderPage(pageContextInit);
  const { httpResponse } = pageContext;
  console.log("httpResponse", !!httpResponse);

  if (!httpResponse) {
    res.statusCode = 200;
    res.end();
    return;
  }

  const { body, statusCode, headers } = httpResponse;
  res.statusCode = statusCode;
  headers.forEach(([name, value]) => res.setHeader(name, value));
  res.end(body);
}
