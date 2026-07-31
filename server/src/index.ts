import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import searchRouter from './search.js';

const app = express();
const PORT = Number(process.env.PORT ?? 5174);

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api', searchRouter);

// Basic fallthrough error handler. Keep the client's error contract stable:
// always JSON with an `error` string.
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

app.listen(PORT, () => {
  console.log(`[server] proxy listening on http://localhost:${PORT}`);
});
