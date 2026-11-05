import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

import connectDB from './backend/config/db.js';
import authRoutes from './backend/routes/authRoutes.js';
import userRoutes from './backend/routes/userRoutes.js';
import donorRoutes from './backend/routes/donorRoutes.js';
import campaignRoutes from './backend/routes/campaignRoutes.js';
import donationRoutes from './backend/routes/donationRoutes.js';
import receiptRoutes from './backend/routes/receiptRoutes.js';
import reportRoutes from './backend/routes/reportRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Connect Database & Seed Initial NGO Records
  await connectDB();

  app.use(cors());
  app.use(express.json());

  // Express API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/donors', donorRoutes);
  app.use('/api/campaigns', campaignRoutes);
  app.use('/api/donations', donationRoutes);
  app.use('/api/receipts', receiptRoutes);
  app.use('/api/reports', reportRoutes);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', project: '23. NGO Donation Management' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NGO Donation Management Server running on http://localhost:${PORT}`);
  });
}

startServer();
