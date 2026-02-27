import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all deployed treasuries
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [treasuries, totalCount] = await Promise.all([
      prisma.deployedTreasury.findMany({
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.deployedTreasury.count()
    ]);

    res.json({
      treasuries,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching deployed treasuries:', error);
    res.status(500).json({ error: 'Failed to fetch deployed treasuries' });
  }
});

// Save a new deployed treasury
router.post('/', async (req, res) => {
  const { name, tokenName, tokenSymbol, tokenAddress, vaultAddress, ownerAddress } = req.body;
  
  if (!name || !tokenName || !tokenSymbol || !tokenAddress || !vaultAddress || !ownerAddress) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const treasury = await prisma.deployedTreasury.create({
      data: {
        name,
        tokenName,
        tokenSymbol,
        tokenAddress,
        vaultAddress,
        ownerAddress
      }
    });
    res.status(201).json(treasury);
  } catch (error) {
    console.error('Error saving deployed treasury:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'A treasury with this token or vault address already exists' });
    }
    res.status(500).json({ error: 'Failed to save deployed treasury' });
  }
});

export default router;
