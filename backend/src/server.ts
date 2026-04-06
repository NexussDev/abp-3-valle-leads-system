import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[server] Rodando em http://localhost:${PORT}`);
  console.log(`[server] Ambiente: ${process.env.NODE_ENV}`);
});
