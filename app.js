// const express = require("express");
// const { mdToPdf } = require("md-to-pdf");
// const cors = require("cors");
// const app = express();

// const corsOptions = {
//   origin: "http://localhost:3000",
//   credentials: true,
//   optionSuccessStatus: 200,
// };
// app.use(cors(corsOptions));
// app.use(express.json());

// app.post("/generate-pdf", async (req, res) => {
//   const markdown = req.body.markdown;
//   console.log(markdown);
//   const pdf = await mdToPdf({
//     content: markdown,
//   }).catch(console.error);
//   if (pdf) {
//     res.send(pdf.content);
//   } else {
//     res.status(500).send("Error generating PDF");
//   }
// });

// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");
const md = require("markdown-it")();
const mdHighlight = require("markdown-it-highlightjs");
const app = express();

md.use(mdHighlight);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/generate-pdf", async (req, res) => {
  try {
    const markdown = req.body.markdown;
    console.log(markdown);
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11.3.1/styles/default.min.css">
        <style>
          body { font-family: Arial, sans-serif; }
          /* Additional CSS for your PDF */
        </style>
      </head>
      <body>
        ${md.render(markdown)}
      </body>
      </html>`;

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=generated.pdf");
    res.send(pdfBuffer);
  } catch (e) {
    console.error(e);
    res.status(500).send("An error occurred while generating the PDF");
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
