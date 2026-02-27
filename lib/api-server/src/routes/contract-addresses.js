import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/contract-addresses - Get all contract addresses
router.get('/', async (req, res) => {
  try {
    const contractAddresses = await prisma.contractAddress.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    res.json({ contractAddresses });
  } catch (error) {
    console.error('Error fetching contract addresses:', error);
    res.status(500).json({ error: 'Failed to fetch contract addresses' });
  }
});

// GET /api/contract-addresses/:name - Get contract address by name
router.get('/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const contractAddress = await prisma.contractAddress.findFirst({
      where: {
        name: name
      }
    });

    if (!contractAddress) {
      return res.status(404).json({ error: 'Contract address not found' });
    }

    res.json({ contractAddress });
  } catch (error) {
    console.error('Error fetching contract address:', error);
    res.status(500).json({ error: 'Failed to fetch contract address' });
  }
});

// GET /api/contract-addresses/network/:network - Get contract addresses by network
router.get('/network/:network', async (req, res) => {
  try {
    const { network } = req.params;
    const contractAddresses = await prisma.contractAddress.findMany({
      where: {
        network: network
      },
      orderBy: {
        name: 'asc'
      }
    });
    res.json({ contractAddresses });
  } catch (error) {
    console.error('Error fetching contract addresses by network:', error);
    res.status(500).json({ error: 'Failed to fetch contract addresses' });
  }
});

export default router;
