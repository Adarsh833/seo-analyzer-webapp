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
    // Check if keyword already exists in text
    if (text.toLowerCase().includes(keyword.toLowerCase())) return;

    // Insert keyword at the end (you can make this smarter later)
    setText(prev => prev.trim() + ". " + keyword);
  };


  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-4 text-blue-600">SEO Analyzer Web App 🚀</h1>

      <textarea
        placeholder="Enter your blog, tweet or caption..."
        className="w-full h-40 p-3 border rounded-md mb-4"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <p className="mt-4 text-sm text-gray-600">Updated Text Preview:</p>
      <p className="bg-white p-3 rounded border text-gray-800">{text}</p>


      <button
        className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={handleAnalyze}
      >
        Analyze
      </button>

      {results && (
        <div className="bg-white shadow-md rounded-md p-4">
          <h2 className="text-xl font-semibold mb-2">SEO Results</h2>
          <p><strong>Readability Score:</strong> {results.readabilityScore}</p>
          <p className="mt-2 font-medium">Suggestions:</p>
          <ul className="list-disc list-inside">
            {results.suggestions.map((s, idx) => <li key={idx}>{s}</li>)}
          </ul>
          <p className="mt-2 font-medium">Recommended Keywords:</p>
          <div className="flex flex-wrap gap-2">
            {results.keywords.map((kw, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-green-100 text-green-800 px-2 py-1 rounded">
                <span>{kw}</span>
                <button
                  onClick={() => handleInsertKeyword(kw)}
                  className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                >
                  Insert
                </button>
              </div>
            ))}


          </div>
        </div>

      )}
    </div>

  );
}
