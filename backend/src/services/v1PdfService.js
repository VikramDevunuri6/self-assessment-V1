const fs = require("fs");
const os = require("os");
const path = require("path");
const puppeteer = require("puppeteer-core");
const { buildExecutiveHtml } = require("../reports/v1ExecutiveReportHtml");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../constants/errorCodes");

/**
 * The Alpine production container (backend/Dockerfile) always has
 * PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser set and that binary
 * apk-installed, so the env var check below is sufficient there. Outside
 * Docker (local dev, any OS) there's usually no env var and no
 * /usr/bin/chromium-browser, which is exactly what was crashing PDF
 * download with "Browser was not found at the configured executablePath" --
 * so we also probe common OS-installed Chrome/Chromium locations and any
 * "Chrome for Testing" build already cached locally (e.g. from `npx
 * puppeteer browsers install`) before giving up.
 */
function findCachedPuppeteerChrome() {
  const cacheDir = path.join(os.homedir(), ".cache", "puppeteer", "chrome");
  if (!fs.existsSync(cacheDir)) return null;

  const builds = fs.readdirSync(cacheDir).sort().reverse();
  for (const build of builds) {
    const candidates = [
      path.join(cacheDir, build, "chrome-mac-arm64", "Google Chrome for Testing.app", "Contents", "MacOS", "Google Chrome for Testing"),
      path.join(cacheDir, build, "chrome-mac-x64", "Google Chrome for Testing.app", "Contents", "MacOS", "Google Chrome for Testing"),
      path.join(cacheDir, build, "chrome-linux64", "chrome"),
    ];
    const found = candidates.find((p) => fs.existsSync(p));
    if (found) return found;
  }
  return null;
}

function resolveExecutablePath() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const candidates = [
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    findCachedPuppeteerChrome(),
  ].filter(Boolean);

  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) {
    throw new AppError(
      500,
      "PDF generation is unavailable: no Chromium/Chrome executable was found. Install Google Chrome, or set PUPPETEER_EXECUTABLE_PATH to a Chrome/Chromium binary.",
      ERROR_CODES.INTERNAL_ERROR
    );
  }
  return found;
}

const PAGE_WIDTH_PX = 860;

/**
 * Renders the v1 executive report to a single-page PDF via headless
 * Chromium and streams it to the HTTP response. Sibling to pdfService.js
 * (old engine, pdfkit-based) so that file needs zero edits.
 *
 * The page is a tall poster-style single page (fixed width, height fit to
 * content) rather than a literal A4 sheet -- a strict 297x210mm landscape
 * canvas forced 6-9px micro-type to make every section fit, which read as
 * "generated" rather than "designed" (see V2.1 design-review pass). The
 * height is measured from the rendered DOM so the PDF is always exactly
 * one page regardless of how report content varies in length.
 */
async function streamReportPdf(res, { report, sessionId, generatedAt, meta = {} }) {
  const html = buildExecutiveHtml(report, { ...meta, generatedAt });

  const browser = await puppeteer.launch({
    executablePath: resolveExecutablePath(),
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: PAGE_WIDTH_PX, height: 1200 });
    await page.setContent(html, { waitUntil: "load" });

    const contentHeight = await page.evaluate(() => document.body.scrollHeight);

    const pdfBuffer = await page.pdf({
      width: `${PAGE_WIDTH_PX}px`,
      height: `${contentHeight}px`,
      printBackground: true,
      pageRanges: "1",
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="assessment-report-v1-${sessionId}.pdf"`);
    res.send(Buffer.from(pdfBuffer));
  } finally {
    await browser.close();
  }
}

module.exports = { streamReportPdf };
