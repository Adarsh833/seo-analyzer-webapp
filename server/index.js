const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();


const app = express();
app.use(cors());
app.use(bodyParser.json());


app.get("/", (req, res) => {
  res.send("SEO Analyzer backend running ✅");
});

app.listen(5000, () => console.log("Server is running on port 5000"));

const axios = require("axios");

app.post("/analyze", async (req, res) => {
  const { text } = req.body;

  try {
    const textrazorRes = await axios.post(
      "https://api.textrazor.com/",
      new URLSearchParams({
        extractors: "entities,topics,words,phrases",
        text,
      }),
      {
        headers: {
          "x-textrazor-key": process.env.TEXTRAZOR_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const data = textrazorRes.data.response;
    console.log("🔥 Raw API Response:", JSON.stringify(data, null, 2));


    const keywords = (data.topics || [])
    .filter((t) => t.score > 0.05) // Lowered threshold for demo
    .slice(0, 5)
    .map((t) => t.label);
  

    const suggestions = keywords.length
    ? ["Try focusing on these SEO topics:", ...keywords]
    : ["Try adding more relevant content."];
  
    res.json({
      readabilityScore: "N/A",
      keywords,
      suggestions,
    });
  } catch (error) {
    console.error("❌ TextRazor API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch keyword suggestions." });
  }
});
