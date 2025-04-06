import express from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';
import { auth } from '../middlewares/auth';

const router = express.Router();

// Authenticate Telegram user
router.post('/auth', async (req, res) => {
  try {
    const { telegramId, name } = req.body;
    
    if (!telegramId) {
      return res.status(400).json({ error: 'Telegram ID is required' });
    }
    
    // Find user or create if not exists
    let user = await prisma.user.findUnique({
      where: { telegramId }
    });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramId,
          name: name || 'User'
        }
      });
    } else {
      // Update name if provided
      if (name && name !== user.name) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { name }
        });
      }
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '30d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        telegramId: user.telegramId,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Get user profile
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      id: req.user.id,
      telegramId: req.user.telegramId,
      name: req.user.name
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve user profile' });
  }
});

// Update user profile
router.put('/me', auth, async (req, res) => {
  try {
    const { name } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name: name || undefined }
    });
    
    res.json({
      id: user.id,
      telegramId: user.telegramId,
      name: user.name
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Get user dashboard stats
router.get('/dashboard', auth, async (req, res) => {
  try {
    // Get all assets for the user
    const assets = await prisma.asset.findMany({
      where: { userId: req.user.id }
    });
    
    // Get recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId: req.user.id },
      orderBy: { date: 'desc' },
      take: 5
    });
    
    // Calculate total net worth by asset type
    const netWorthByType = assets.reduce((acc, asset) => {
      acc[asset.type] = (acc[asset.type] || 0) + asset.amount;
      return acc;
    }, {} as Record<string, number>);
    
    // Calculate total net worth
    const totalNetWorth = assets.reduce((sum, asset) => sum + asset.amount, 0);
    
    res.json({
      totalNetWorth,
      netWorthByType,
      recentTransactions,
      assets
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve dashboard data' });
  }
});

export default router; 