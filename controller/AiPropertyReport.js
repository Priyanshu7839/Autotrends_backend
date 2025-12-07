const pool = require('../connection')
const puppeteer = require('puppeteer');

async function GeneratePDF(req,res){
    const url = req.query.address
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();

    await page.goto(url, {
    waitUntil: "networkidle0",

    
  });

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();

  setInterval(() => {
   res.write('Genrating...')
}, 5000)

  res.contentType("application/pdf");
  res.send(pdf);
}

module.exports ={
    GeneratePDF
}