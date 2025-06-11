import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [text, setText] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [highlightedText, setHighlightedText] = useState("");
  const [history, setHistory] = useState([]);

  const BACKEND_URL = "http://localhost:5000";

  useEffect(() => {
    const saved = localStorage.getItem("seoDraft");
    if (saved) {
      setText(saved);
      setHighlightedText(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("seoDraft", text);
  }, [text]);

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

  const handleInsertKeyword = (keyword) => {
    if (text.toLowerCase().includes(keyword.toLowerCase())) return;
    setHistory([...history, text]);
    const newText = text.trim() + ". " + keyword;
    setText(newText);
    highlightInserted(newText, keyword);
    setResults((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== keyword),
    }));
  };

  const highlightInserted = (text, keyword) => {
    const safeKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const highlighted = text.replace(
      new RegExp(`(${safeKeyword})`, "gi"),
      '<span class="bg-yellow-200 font-semibold">$1</span>'
    );
    setHighlightedText(highlighted);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setText(prev);
    setHighlightedText(prev);
    setHistory(history.slice(0, -1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 p-6 font-sans">
      <h1 className="text-4xl font-bold mb-6 text-indigo-700 text-center">
        SEO Analyzer Web App
      </h1>

      {/* Side-by-side layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input */}
        <div className="flex flex-col h-[350px]">
          <div className="text-xl font-semibold mb-2 text-gray-800">Input Text</div>
          <textarea
            className="flex-1 w-full border border-gray-300 p-4 rounded-lg text-base resize-none shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-900 bg-white"
            placeholder="Paste your blog, tweet, or text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
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
          </div>
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>

        {/* Preview */}
        <div className="flex flex-col h-[350px]">
          <div className="text-xl font-semibold mb-2 text-gray-800">Text Preview</div>
          <div
            className="flex-1 w-full whitespace-pre-wrap p-4 border border-gray-300 rounded-md bg-white text-gray-900 shadow-inner overflow-auto"
            dangerouslySetInnerHTML={{ __html: highlightedText }}
          />
        </div>
      </div>

      {/* Recommended Keywords */}
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

      {/* SEO Analysis Results */}
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

          {results.suggestions?.length > 0 && (
            <>
              <p className="mt-6 text-lg font-semibold text-gray-800">Suggestions:</p>

              {/* Check if first suggestion is an intro line */}
              {results.suggestions[0].startsWith("Try focusing on") && (
                <p className="text-gray-700 mt-1">{results.suggestions[0]}</p>
              )}

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

