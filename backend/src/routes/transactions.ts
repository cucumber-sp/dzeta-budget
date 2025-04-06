import express from 'express';
import { prisma } from '../server';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { auth } from '../middlewares/auth';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Get all transactions for a user
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.user.id
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve transactions' });
  }
});

// Get a single transaction by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: {
        id: req.params.id
      }
    });
    
    if (!transaction || transaction.userId !== req.user.id) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve transaction' });
  }
});

// Create a new transaction
router.post('/', auth, upload.single('receipt'), async (req, res) => {
  try {
    const { amount, type, category, description, date, isCash } = req.body;
    
    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        type,
        category,
        description,
        date: date ? new Date(date) : new Date(),
        isCash: isCash === 'true',
        receiptUrl: req.file ? `/uploads/${req.file.filename}` : null,
        userId: req.user.id
      }
    });
    
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Update a transaction
router.put('/:id', auth, upload.single('receipt'), async (req, res) => {
  try {
    const { amount, type, category, description, date, isCash } = req.body;
    
    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findUnique({
      where: {
        id: req.params.id
      }
    });
    
    if (!existingTransaction || existingTransaction.userId !== req.user.id) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    // Update transaction
    const transaction = await prisma.transaction.update({
      where: {
        id: req.params.id
      },
      data: {
        amount: amount ? parseFloat(amount) : undefined,
        type: type || undefined,
        category: category || undefined,
        description: description || undefined,
        date: date ? new Date(date) : undefined,
        isCash: isCash !== undefined ? isCash === 'true' : undefined,
        receiptUrl: req.file ? `/uploads/${req.file.filename}` : undefined
      }
    });
    
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// Delete a transaction
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findUnique({
      where: {
        id: req.params.id
      }
    });
    
    if (!existingTransaction || existingTransaction.userId !== req.user.id) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    // Delete receipt file if exists
    if (existingTransaction.receiptUrl) {
      const filePath = path.join(__dirname, '../../', existingTransaction.receiptUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Delete transaction
    await prisma.transaction.delete({
      where: {
        id: req.params.id
      }
    });
    
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

export default router; 