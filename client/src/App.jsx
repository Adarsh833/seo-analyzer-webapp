import { useState } from "react";
import axios from "axios";

export default function App() {
  const [text, setText] = useState("");
  const [results, setResults] = useState(null);

  const handleAnalyze = async () => {
    try {
      const response = await axios.post("http://localhost:5000/analyze", { text });
      setResults(response.data);
    } catch (err) {
      alert("Error analyzing text");
      console.error(err);
    }
  };

  const handleInsertKeyword = (keyword) => {
    if (text.toLowerCase().includes(keyword.toLowerCase())) return;
  
    setText(prev => prev.trim() + ". " + keyword);
  
    // Remove the inserted keyword from results.keywords
    setResults(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-6 text-blue-700">SEO Analyzer Web App 🚀</h1>

      <textarea
        placeholder="Enter your blog, tweet or caption..."
        className="w-full h-40 p-4 border-2 border-blue-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="mt-6">
        <p className="text-sm text-gray-600 mb-1">Text Preview:</p>
        <div className="bg-white p-4 rounded-lg border text-gray-800 shadow-inner whitespace-pre-wrap max-h-52 overflow-y-auto">
          {text}
        </div>
      </div>

      <button
        className="mt-6 px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded shadow hover:shadow-lg transition"
        onClick={handleAnalyze}
      >
        Analyze Text
      </button>

      {results && (
        <div className="mt-8 bg-white shadow-lg rounded-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">SEO Results</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2 text-gray-800 text-base">
            <p><strong>Readability Ease Score:</strong> {results.readabilityScore?.ease}</p>
            <p><strong>Grade Level:</strong> {results.readabilityScore?.grade}</p>
            <p><strong>Total Words:</strong> {results.extraMetrics?.totalWords}</p>
            <p><strong>Avg. Sentence Length:</strong> {results.extraMetrics?.avgSentenceLength} words</p>
            <p><strong>Complex Words %:</strong> {results.extraMetrics?.complexWordsPercent}%</p>
            <p><strong>Stopwords %:</strong> {results.extraMetrics?.stopwordsPercent}%</p>
          </div>

          {results.suggestions?.length > 0 && (
            <>
              <p className="mt-6 text-lg font-semibold text-gray-800">Suggestions:</p>
              <ul className="list-disc list-inside text-gray-700 mt-1">
                {results.suggestions.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </>
          )}

          {results.keywords?.length > 0 && (
            <>
              <p className="mt-6 text-lg font-semibold text-gray-800">Recommended Keywords:</p>
              <div className="flex flex-wrap gap-3 mt-2">
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
            </>
          )}
        </div>
      )}
    </div>
  );
}
