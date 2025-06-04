const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("SEO Analyzer backend running ✅");
});

app.listen(5000, () => console.log("Server is running on port 5000"));
