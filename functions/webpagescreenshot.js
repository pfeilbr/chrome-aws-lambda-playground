const fs = require("fs");
const chromium = require("chrome-aws-lambda");

module.exports.handler = async event => {
  let result = null;
  let browser = null;
  const filePath = `/tmp/screenshot.png`;

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless
    });

    let page = await browser.newPage();
    const url =
      event.queryStringParameters && event.queryStringParameters.url
        ? event.queryStringParameters.url
        : "https://google.com";

    await page.goto(url);

    result = await page.title();
    await page.screenshot({ path: filePath });
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "image/png" },
    isBase64Encoded: true,
    body: new Buffer(fs.readFileSync(filePath)).toString("base64")
    // body: JSON.stringify(
    //   {
    //     result
    //   },
    //   null,
    //   2
    // )
  };
};
