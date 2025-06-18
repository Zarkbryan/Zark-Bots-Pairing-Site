const express = require('express');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory storage for pairing codes and sessions
const sessions = {};

function generatePairingCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
}

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Serve static CSS
app.use('/styles.css', express.static(__dirname + '/public/styles.css'));

// API to request a pairing code
app.post('/api/request-pairing', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone number required" });

  // Generate unique session and pairing code
  const sessionId = crypto.randomBytes(8).toString('hex');
  const pairingCode = generatePairingCode();

  // Save session (in production, handle expiration and DB storage)
  sessions[sessionId] = {
    phone,
    pairingCode,
    paired: false,
    created: Date.now()
  };

  res.json({ sessionId, pairingCode });
});

// API to mark as paired (simulate WhatsApp linking)
app.post('/api/complete-pair', (req, res) => {
  const { sessionId } = req.body;
  const session = sessions[sessionId];
  if (!session) return res.status(404).json({ error: "Session not found" });

  session.paired = true;
  res.json({ success: true });
});

// API to check session status
app.get('/api/session/:sessionId', (req, res) => {
  const session = sessions[req.params.sessionId];
  if (!session) return res.status(404).json({ error: "Session not found" });
  res.json({ paired: session.paired, sessionId: req.params.sessionId });
});

app.listen(PORT, () => console.log(`Pairing site running on ${PORT}`));
