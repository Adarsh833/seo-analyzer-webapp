import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  // State variables
  const [text, setText] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [highlightedText, setHighlightedText] = useState("");
  const [history, setHistory] = useState([]); // For undo functionality

  const BACKEND_URL = "http://localhost:5000"; // Backend API endpoint

  // Load saved draft from localStorage on initial load
  useEffect(() => {
    const saved = localStorage.getItem("seoDraft");
    if (saved) {
      setText(saved);
      setHighlightedText(saved);
    }
  }, []);

  // Save the current draft to localStorage whenever the text changes
  useEffect(() => {
    localStorage.setItem("seoDraft", text);
  }, [text]);

  // Function to call the backend API and fetch SEO analysis
  const handleAnalyze = async () => {
    setError("");
    if (text.trim() === "") {
      setError("Please enter some text.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/analyze`, { text });
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Network error while analyzing text.");
    } finally {
      setLoading(false);
    }
  };

  // Function to insert a recommended keyword into the text
  const handleInsertKeyword = (keyword) => {
    // Prevent duplicate insertions
    if (text.toLowerCase().includes(keyword.toLowerCase())) return;

    // Save current state for undo
    setHistory([...history, text]);

    // Add keyword and highlight it
    const newText = text.trim() + ". " + keyword;
    setText(newText);
    highlightInserted(newText, keyword);

    // Remove keyword from the list
    setResults((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== keyword),
    }));
  };

  // Highlight inserted keyword using a yellow background
  const highlightInserted = (text, keyword) => {
    const safeKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // escape special chars
    const highlighted = text.replace(
      new RegExp(`(${safeKeyword})`, "gi"),
      '<span class="bg-yellow-200 font-semibold">$1</span>'
    );
    setHighlightedText(highlighted);
  };

  // Undo last keyword insertion
  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setText(prev);
    setHighlightedText(prev);
    setHistory(history.slice(0, -1));
  };

  const handleRewrite = async () => {
    setError("");
    if (text.trim() === "") {
      setError("Please enter some text to rewrite.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/rewrite", { text });
      const newText = response.data.rewrittenText;
      setHistory([...history, text]);
      setText(newText);
      highlightInserted(newText, "");
    } catch (err) {
      setError("Error rewriting the content.");
    } finally {
      setLoading(false);
    }
  };
  


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 p-6 font-sans">
      {/* App Header */}
      <h1 className="text-4xl font-bold mb-6 text-indigo-700 text-center">
        SEO Analyzer Web App
      </h1>

      {/* Text Input and Preview Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Text Area */}
        <div className="flex flex-col h-[350px]">
          <div className="text-xl font-semibold mb-2 text-gray-800">Input Text</div>
          <textarea
            className="flex-1 w-full border border-gray-300 p-4 rounded-lg text-base resize-none shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-900 bg-white"
            placeholder="Paste your blog, tweet, or text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {/* Action Buttons */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-base font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "Analyze SEO"}
            </button>
            <button
              onClick={handleUndo}
              className="bg-gray-400 text-white px-6 py-2 rounded-lg text-base font-medium hover:bg-gray-600"
            >
              Undo
            </button>

            <button
              onClick={handleRewrite}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded-lg text-base font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Rewriting..." : "Rewrite with AI"}
            </button>

          </div>

          {/* Error Message */}
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>

        {/* Text Preview with Highlights */}
        <div className="flex flex-col h-[290px]">
          <div className="text-xl font-semibold mb-2 text-gray-800">Text Preview</div>
          <div
            className="flex-1 w-full whitespace-pre-wrap p-4 border border-gray-300 rounded-md bg-white text-gray-900 shadow-inner overflow-auto"
            dangerouslySetInnerHTML={{ __html: highlightedText }}
          />
        </div>
      </div>

      {/* Recommended Keywords Section */}
      {results?.keywords?.length > 0 && (
        <div className="mt-8 bg-white shadow-md rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-green-800">Recommended Keywords</h2>
          <div className="flex flex-wrap gap-3">
            {results.keywords.map((kw, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full shadow-sm"
              >
                <span className="font-medium">{kw}</span>
                <button
                  onClick={() => handleInsertKeyword(kw)}
                  className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-full"
                >
                  Insert
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Final SEO Analysis Results Section */}
      {results && (
        <div className="mt-8 bg-white shadow-md rounded-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold text-indigo-700 mb-4">SEO Analysis Results</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2 text-gray-800 text-base">
            <p><strong>Readability Ease Score:</strong> {results.readabilityScore?.ease}</p>
            <p><strong>Grade Level:</strong> {results.readabilityScore?.grade}</p>
            <p><strong>Total Words:</strong> {results.extraMetrics?.totalWords}</p>
            <p><strong>Avg. Sentence Length:</strong> {results.extraMetrics?.avgSentenceLength} words</p>
            <p><strong>Complex Words %:</strong> {results.extraMetrics?.complexWordsPercent}%</p>
            <p><strong>Stopwords %:</strong> {results.extraMetrics?.stopwordsPercent}%</p>
            <p><strong>Unique Words:</strong> {results.extraMetrics?.uniqueWordsCount}</p>
          </div>

          {/* Suggestions Section */}
          {results.suggestions?.length > 0 && (
            <>
              <p className="mt-6 text-lg font-semibold text-gray-800">Suggestions:</p>

              {/* If first suggestion is a general tip (like SEO topics), show it separately */}
              {results.suggestions[0].startsWith("Try focusing on") && (
                <p className="text-gray-700 mt-1">{results.suggestions[0]}</p>
              )}

              {/* Display other suggestions in bullet list */}
              <ul className="list-disc list-inside text-gray-700 mt-1">
                {results.suggestions.slice(1).map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
