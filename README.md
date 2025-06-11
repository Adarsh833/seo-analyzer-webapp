# 🧠 SEO Analyzer Web App

A single-page web application that allows users to input a block of text (such as a blog post, newsletter, tweet, or caption) and analyze it for SEO optimization using a public SEO analysis API.

This tool provides insights like keyword suggestions, readability score, and other optimization metrics. It also allows users to insert recommended keywords back into the text with a single click—without breaking the flow of the content.

## 🚀 Features

- ✍️ Text input for blogs, tweets, newsletters, etc.
- 📈 SEO metrics: readability score, grade level, total words, complex word percentage, etc.
- 🔍 Recommended keywords with one-click insertion.
- 📎 Keyword highlighting in real-time preview.
- ⏪ Undo inserted keywords.
- 💾 Auto-saving draft in browser local storage.

## 📷 Preview

![SEO Analyzer Screenshot](preview.png) <!-- Add an actual screenshot named preview.png -->

## 🛠️ Tech Stack

### Frontend
- React.js (with functional components and Hooks)
- Tailwind CSS for styling
- Axios for HTTP requests

### Backend
- Node.js + Express
- [TextRazor API](https://www.textrazor.com/) (or Twinword API) for SEO analysis

##  Setup Frontend
-cd client
-npm install
-npm run dev

## Setup Backend
-cd client
-npm install
-npm run dev

## API_KEY
-TEXTRAZOR_API_KEY=your_api_key_here
