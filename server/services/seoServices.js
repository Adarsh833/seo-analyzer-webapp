const axios = require("axios");
const { TEXTRAZOR_API_KEY } = require("../config/keys");

// Analyze the given text using TextRazor API
async function analyzeSEO(text) {
  try {
    const params = new URLSearchParams();
    params.append("text", text);
    params.append("extractors", "entities,topics,words,readability");

    const response = await axios.post(
      "https://api.textrazor.com/",
      params.toString(),
      {
        headers: {
          "x-textrazor-key": TEXTRAZOR_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("TextRazor API error:", error.response?.data || error.message);
    throw new Error("Failed to analyze text");
  }
}

// Extract keywords from TextRazor response
function extractKeywords(data) {
  const stopwords = new Set(["the", "and", "but", "with", "this", "that", "for", "you"]);

  if (!data.response) return [];

  const { entities = [], words = [] } = data.response;

  if (entities.length > 0) {
    return entities
      .map(e => e.matchedText.trim())
      .filter((kw, i, arr) =>
        kw.length > 2 &&
        !stopwords.has(kw.toLowerCase()) &&
        arr.indexOf(kw) === i
      );
  }

  if (words.length > 0) {
    const filtered = words.filter(
      w => w.partOfSpeech !== "PUNCT" && w.lemma.length > 2
    );

    return Array.from(new Set(
      filtered
        .map(w => w.lemma.toLowerCase())
        .filter(kw => !stopwords.has(kw))
    ));
  }

  return [];
}

// Insert a keyword into the most suitable position in the text
function insertKeyword(text, keyword) {
  if (!keyword || text.toLowerCase().includes(keyword.toLowerCase())) {
    return text;
  }

  const sentences = text.match(/[^.!?]+[.!?]/g) || [text];
  const targetIndex = sentences.findIndex(s => s.length > 30) || 0;

  const insertText = (targetIndex === 0)
    ? capitalize(keyword.trim())
    : keyword.trim();

  sentences[targetIndex] = sentences[targetIndex].trim() + " " + insertText + ".";

  return sentences.join(" ").replace(/\s{2,}/g, " ");
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = {
  analyzeSEO,
  extractKeywords,
  insertKeyword
};
