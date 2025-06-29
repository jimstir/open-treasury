import express from 'express';
import { PrismaClient } from '@prisma/client';
const router = express.Router();
const prisma = new PrismaClient();

// Get all proposals for a treasury
router.get('/treasury/:treasuryId', async (req, res) => {
  const proposals = await prisma.proposal.findMany({
    where: { treasuryId: Number(req.params.treasuryId) }
  });
  res.json(proposals);
});

// Create a proposal for a treasury
router.post('/treasury/:treasuryId', async (req, res) => {
  const data = req.body;
  try {
    const proposal = await prisma.proposal.create({
      data: { ...data, treasuryId: Number(req.params.treasuryId) }
    });
    res.status(201).json(proposal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
