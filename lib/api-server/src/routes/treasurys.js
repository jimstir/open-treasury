import express from 'express';
import { PrismaClient } from '@prisma/client';
import { deployTreasury } from '../utils/deployTreasury.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all treasurys
router.get('/', async (req, res) => {
  const treasurys = await prisma.treasury.findMany({
    include: { proposals: true, members: true, balances: true }
  });
  res.json(treasurys);
});

// Deploy a new treasury with token
router.post('/deploy', async (req, res) => {
  const { treasuryName, tokenName, tokenSymbol, initialSupply, network = 'localhost' } = req.body;
  
  // Validate required fields
  if (!treasuryName || !tokenName || !tokenSymbol || !initialSupply) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields: treasuryName, tokenName, tokenSymbol, initialSupply' 
    });
  }

  try {
    // Deploy the treasury and token
    const deployment = await deployTreasury({
      treasuryName,
      tokenName,
      tokenSymbol,
      initialSupply,
      network
    });

    if (!deployment.success) {
      return res.status(500).json({
        success: false,
        error: 'Deployment failed',
        details: deployment.error,
        output: deployment.output
      });
    }

    // Save to database
    const treasury = await prisma.treasury.create({
      data: {
        name: treasuryName,
        tokenName,
        tokenSymbol,
        tokenAddress: deployment.tokenAddress,
        vaultAddress: deployment.vaultAddress,
        network,
        // Add other default values as needed
      }
    });

    res.status(201).json({
      success: true,
      treasury,
      deployment: {
        tokenAddress: deployment.tokenAddress,
        vaultAddress: deployment.vaultAddress
      }
    });
  } catch (error) {
    console.error('Error deploying treasury:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to deploy treasury',
      details: error.message
    });
  }
});

// Create a treasury (for existing deployments)
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
