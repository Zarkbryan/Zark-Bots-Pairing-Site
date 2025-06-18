const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// In-memory store for demo (use DB/Redis for production)
const sessions = {};

app.use(express.json());

// Generate pairing code
app.post('/generate', (req, res) => {
  const sessionId = crypto.randomBytes(8).toString('hex');
  sessions[sessionId] = { created: Date.now() };
  res.json({ sessionId });
});

// Retrieve session info (to be used by the bot)
app.get('/session/:id', (req, res) => {
  const session = sessions[req.params.id];
  if (session) {
    res.json({ success: true, session });
  } else {
    res.status(404).json({ success: false, error: "Not found" });
  }
});

// Simple UI for testing
app.get('/', (req, res) => {
  res.send(`
    <h1>WhatsApp Bot Pairing</h1>
    <button onclick="gen()">Generate Pairing Code</button>
    <div id="out"></div>
    <script>
      function gen() {
        fetch('/generate', {method: 'POST'})
        .then(r => r.json())
        .then(d => {
          document.getElementById('out').innerHTML = "<b>Session ID:</b> " + d.sessionId
        })
      }
    </script>
  `);
});

app.listen(PORT, () => console.log("Pairing site running on " + PORT));
