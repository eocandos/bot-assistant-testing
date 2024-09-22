import express from 'express';
import dotenv from 'dotenv';
import webhookRoutes from './routes/webhook.js';

dotenv.config(); // Cargar variables de entorno desde .env

const app = express();
app.use(express.json());

const { PORT } = process.env;

// Rutas
app.use('/webhook', webhookRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.send(`<pre>Nothing to see here. Checkout README.md to start.</pre>`);
});

// Escuchar en el puerto definido
app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
