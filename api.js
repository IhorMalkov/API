const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = 8080;

app.get("/", async (req, res) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.goto(
      "https://www.theparking.ca/used-cars/lamborghini-urus-mansory.html",
      {
        waitUntil: "domcontentloaded",
      }
    );

    const carPrices = await page.$$eval(".prix", (elements) =>
      elements.map((el) => {
        let priceText = el.innerText.trim();
        return priceText === "POA" ? "$550,592" : priceText;
      })
    );

    const carTypes = await page.$$eval(".nowrap", (elements) =>
      elements.map((el) => el.innerText.trim())
    );

    const carImages = await page.$$eval("img", (images) =>
      images.map((img) => img.src)
    );

    const carListings = carPrices.map((price, index) => ({
      productTitle: "Lamborghini",
      productSubtitle: "Urus",
      productPrice: price || "Contact For Price Details",
      productType: carTypes[index] || "V8", 
      productImage: carImages[index] || "https://www.theparking.ca/images/picto-logo-parking.png",
    }));

    await browser.close();

    res.json(carListings);
  } catch (error) {
    res.status(500).send("Error fetching data");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
