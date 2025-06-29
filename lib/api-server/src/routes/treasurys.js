import express from 'express';
import { PrismaClient } from '@prisma/client';
const router = express.Router();
const prisma = new PrismaClient();

// Get all treasurys
router.get('/', async (req, res) => {
  const treasurys = await prisma.treasury.findMany({
    include: { proposals: true, members: true, balances: true }
  });
  res.json(treasurys);
});

// Create a treasury
router.post('/', async (req, res) => {
  const data = req.body;
  try {
    const treasury = await prisma.treasury.create({ data });
    res.status(201).json(treasury);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get a single treasury
router.get('/:id', async (req, res) => {
  const treasury = await prisma.treasury.findUnique({
    where: { id: Number(req.params.id) },
    include: { proposals: true, members: true, balances: true }
  });
  if (!treasury) return res.status(404).json({ error: 'Not found' });
  res.json(treasury);
});

export default router;
