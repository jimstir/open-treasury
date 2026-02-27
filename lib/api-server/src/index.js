import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import treasurysRouter from './routes/treasurys.js';
import proposalsRouter from './routes/proposals.js';
import deployedTreasuriesRouter from './routes/deployed-treasuries.js';
import contractAddressesRouter from './routes/contract-addresses.js';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Mount routers
app.use('/api/treasurys', treasurysRouter);
app.use('/api/proposals', proposalsRouter);
app.use('/api/deployed-treasuries', deployedTreasuriesRouter);
app.use('/api/contract-addresses', contractAddressesRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
