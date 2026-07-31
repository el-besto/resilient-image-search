import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import searchRouter from './search.js';

const app = express();
const PORT = Number(process.env.PORT ?? 5174);

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api', searchRouter);

// Keep unknown routes JSON-only instead of returning Express's HTML fallback.
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

app.listen(PORT, () => {
  console.log(`[server] proxy listening on http://localhost:${PORT}`);
});
