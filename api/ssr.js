import { renderPage } from "vike/server";
export const edge = true;
// We use JSDoc instead of TypeScript because Vercel seems buggy with /api/**/*.ts files
if (process.env.NODE_ENV === 'production') {
  await import('../dist/server/entry.mjs') // Or wherever the build directory is
}
/**
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 */
export default async function handler(req, res) {
  const { url } = req;
  console.log("Request to url:", url);
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
