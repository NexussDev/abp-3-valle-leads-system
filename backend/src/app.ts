import express from 'express';
import cors from 'cors';

const app = express();

// --- MIDDLEWARES GLOBAIS ---

app.use(cors());

app.use(express.json());

// --- ROTA DE TESTE (health check) ---
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

export default app;
