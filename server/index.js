const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const axios = require("axios");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("SEO Analyzer backend running ✅");
});

function countSyllables(word) {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  // Simple heuristic to count vowel groups as syllables
  const syllableMatches = word.match(/[aeiouy]{1,2}/g);
  return syllableMatches ? syllableMatches.length : 1;
}

// Extract distinct, relevant keywords from entities/words
function extractKeywords(data) {
  const stopwords = new Set([
    "the", "and", "but", "with", "this", "that", "for", "you", "is", "are"
  ]);

  if (!data) return [];

  const { entities = [], words = [] } = data;

  if (entities.length > 0) {
    return entities
      .map((e) => e.matchedText.trim())
      .filter((kw, i, arr) =>
        kw.length > 2 &&
        !stopwords.has(kw.toLowerCase()) &&
        arr.indexOf(kw) === i
      );
  }

  if (words.length > 0) {
    return Array.from(new Set(
      words
        .map((w) => w.lemma.toLowerCase())
        .filter((kw) => kw.length > 2 && !stopwords.has(kw))
    ));
  }

  return [];
}

// Insert a keyword into the text smartly
function insertKeyword(text, keyword) {
  if (!keyword || typeof text !== "string") return text;

  const lowerText = text.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();

  // Avoid inserting duplicate keyword (can be removed if always want to insert)
  if (lowerText.includes(lowerKeyword)) {
    return text; // Optional: or force insert anyway
  }

  // Split into sentences
  const sentences = text.match(/[^.!?]+[.!?]/g) || [text];

  // Pick the longest sentence to insert into
  let indexToInsert = 0;
  let maxLength = 0;
  sentences.forEach((s, i) => {
    if (s.length > maxLength) {
      maxLength = s.length;
      indexToInsert = i;
    }
  });

  const sentence = sentences[indexToInsert].trim();

  // Insert keyword just before the period
  const updatedSentence = sentence.endsWith(".")
    ? sentence.slice(0, -1) + " " + keyword + "."
    : sentence + " " + keyword;

  sentences[indexToInsert] = updatedSentence;

  // Join sentences back together
  return sentences.join(" ").replace(/\s{2,}/g, " ");
}


function analyzeTextMetrics(text, keywords) {
  const words = text.match(/\b\w+\b/g) || [];
  const totalWords = words.length;

  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const totalSentences = sentences.length;
  const avgSentenceLength = totalSentences > 0 ? totalWords / totalSentences : 0;

  // Total syllables
  const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);

  // Complex words = words with 3+ syllables
  const complexWordsCount = words.filter((w) => countSyllables(w) >= 3).length;
  const complexWordsPercent = totalWords > 0 ? (complexWordsCount / totalWords) * 100 : 0;

  const stopwords = new Set([
    "a", "an", "the", "and", "or", "but", "is", "are", "was", "were",
    "in", "on", "at", "to", "for", "with", "of", "by", "as", "that",
    "this", "it", "from", "be", "has", "had", "have",
  ]);
  const stopwordsCount = words.filter((w) => stopwords.has(w.toLowerCase())).length;
  const stopwordsPercent = totalWords > 0 ? (stopwordsCount / totalWords) * 100 : 0;

  const uniqueWordsCount = new Set(words.map((w) => w.toLowerCase())).size;

  const keywordDensity = {};
  keywords.forEach((kw) => {
    const kwLower = kw.toLowerCase();
    const count = words.filter((w) => w.toLowerCase() === kwLower).length;
    keywordDensity[kw] = totalWords > 0 ? (count / totalWords) * 100 : 0;
  });

  // Flesch-Kincaid Reading Ease
  // Formula: 206.835 - 1.015*(words/sentences) - 84.6*(syllables/words)
  const readingEase = totalSentences > 0 && totalWords > 0
    ? 206.835 - 1.015 * (totalWords / totalSentences) - 84.6 * (totalSyllables / totalWords)
    : 0;

  // Flesch-Kincaid Grade Level
  // Formula: 0.39*(words/sentences) + 11.8*(syllables/words) - 15.59
  const gradeLevel = totalSentences > 0 && totalWords > 0
    ? 0.39 * (totalWords / totalSentences) + 11.8 * (totalSyllables / totalWords) - 15.59
    : 0;

  return {
    totalWords,
    avgSentenceLength: avgSentenceLength.toFixed(2),
    complexWordsPercent: complexWordsPercent.toFixed(2),
    stopwordsPercent: stopwordsPercent.toFixed(2),
    uniqueWordsCount,
    keywordDensity,
    readabilityEase: readingEase.toFixed(2),
    gradeLevel: gradeLevel.toFixed(2),
  };
}

app.post("/analyze", async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: "Text is required for analysis." });
  }

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

    const keywords = (data.topics || [])
      .filter((t) => t.score > 0.05)
      .slice(0, 5)
      .map((t) => t.label);

    const suggestions = keywords.length
      ? ["Try focusing on these SEO topics:", ...keywords]
      : ["Try adding more relevant content."];

    const metrics = analyzeTextMetrics(text, keywords);

    res.json({
      readabilityScore: {
        ease: Number(metrics.readabilityEase),
        grade: Number(metrics.gradeLevel),
      },
      keywords,
      suggestions,
      extraMetrics: {
        totalWords: metrics.totalWords,
        avgSentenceLength: metrics.avgSentenceLength,
        complexWordsPercent: metrics.complexWordsPercent,
        stopwordsPercent: metrics.stopwordsPercent,
        uniqueWordsCount: metrics.uniqueWordsCount,
        keywordDensity: metrics.keywordDensity,
      },
    });
  } catch (error) {
    console.error("❌ Error analyzing text:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to analyze text." });
  }
});


// Used Google Gemini to enhance the text and improve the score.
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/rewrite", async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: "Text is required for rewriting." });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Rewrite the following content to improve SEO, readability, and keyword integration. Only return the rewritten paragraph. Do NOT include any explanation or analysis and that '*' symbols and average sentence length should be less than 15. It should improve the readability score and SEO.

    Text:
    ${text}`;
    
    const result = await model.generateContent(prompt);
    const rewrittenText = result.response.text();

    res.json({ rewrittenText });
  } catch (error) {
    console.error("Error rewriting with Gemini:", error.message);
    res.status(500).json({ error: "Failed to rewrite the content with Gemini." });
  }
});


app.post("/insert-keyword", (req, res) => {
  const { text, keyword } = req.body;

  if (!text || !keyword) {
    return res.status(400).json({ error: "Text and keyword are required." });
  }

  try {
    const updatedText = insertKeyword(text, keyword);
    res.json({ updatedText });
  } catch (err) {
    res.status(500).json({ error: "Failed to insert keyword." });
  }
});


app.listen(5000, () => console.log("Server is running on port 5000"));
