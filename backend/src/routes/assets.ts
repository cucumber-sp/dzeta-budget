import express from 'express';
import { prisma } from '../server';
import { auth } from '../middlewares/auth';

const router = express.Router();

// Get all assets for a user
router.get('/', auth, async (req, res) => {
  try {
    const assets = await prisma.asset.findMany({
      where: {
        userId: req.user.id
      }
    });
    
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve assets' });
  }
});

// Get a single asset by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const asset = await prisma.asset.findUnique({
      where: {
        id: req.params.id
      }
    });
    
    if (!asset || asset.userId !== req.user.id) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    res.json(asset);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve asset' });
  }
});

// Create a new asset
router.post('/', auth, async (req, res) => {
  try {
    const { name, type, amount, description } = req.body;
    
    const asset = await prisma.asset.create({
      data: {
        name,
        type,
        amount: parseFloat(amount),
        description,
        userId: req.user.id
      }
    });
    
    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create asset' });
  }
});

// Update an asset
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, type, amount, description } = req.body;
    
    // Check if asset exists and belongs to user
    const existingAsset = await prisma.asset.findUnique({
      where: {
        id: req.params.id
      }
    });
    
    if (!existingAsset || existingAsset.userId !== req.user.id) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    // Update asset
    const asset = await prisma.asset.update({
      where: {
        id: req.params.id
      },
      data: {
        name: name || undefined,
        type: type || undefined,
        amount: amount ? parseFloat(amount) : undefined,
        description: description !== undefined ? description : undefined
      }
    });
    
    res.json(asset);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update asset' });
  }
});

// Delete an asset
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if asset exists and belongs to user
    const existingAsset = await prisma.asset.findUnique({
      where: {
        id: req.params.id
      }
    });
    
    if (!existingAsset || existingAsset.userId !== req.user.id) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    // Delete asset
    await prisma.asset.delete({
      where: {
        id: req.params.id
      }
    });
    
    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete asset' });
  }
});

export default router; 