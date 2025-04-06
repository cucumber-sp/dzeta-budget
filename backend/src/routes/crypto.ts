import express from 'express';
import axios from 'axios';
import { prisma } from '../server';
import { auth } from '../middlewares/auth';

const router = express.Router();

// Get all crypto rates
router.get('/rates', auth, async (req, res) => {
  try {
    const rates = await prisma.cryptoRate.findMany();
    res.json(rates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve crypto rates' });
  }
});

// Update crypto rates from API
router.post('/update-rates', auth, async (req, res) => {
  try {
    const { symbols } = req.body;
    
    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({ error: 'Symbol array is required' });
    }
    
    const apiKey = process.env.COIN_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'Crypto API key not configured' });
    }
    
    // Call external API to get rates
    const response = await axios.get('https://rest.coinapi.io/v1/exchangerate/USD', {
      headers: {
        'X-CoinAPI-Key': apiKey
      }
    });
    
    // Process the response and update rates in the database
    const updatedRates = [];
    
    for (const symbol of symbols) {
      const rateData = response.data.rates.find((rate: any) => rate.asset_id_quote === symbol.toUpperCase());
      
      if (rateData) {
        // Update or create rate
        const rate = await prisma.cryptoRate.upsert({
          where: { symbol: symbol.toUpperCase() },
          update: { rate: 1 / rateData.rate },
          create: {
            symbol: symbol.toUpperCase(),
            rate: 1 / rateData.rate
          }
        });
        
        updatedRates.push(rate);
      }
    }
    
    res.json(updatedRates);
  } catch (error) {
    console.error('Error updating crypto rates:', error);
    res.status(500).json({ error: 'Failed to update crypto rates' });
  }
});

// Get specific crypto rate
router.get('/rates/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const rate = await prisma.cryptoRate.findUnique({
      where: { symbol: symbol.toUpperCase() }
    });
    
    if (!rate) {
      return res.status(404).json({ error: 'Crypto rate not found' });
    }
    
    res.json(rate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve crypto rate' });
  }
});

// Manually update a crypto rate
router.put('/rates/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { rate } = req.body;
    
    if (!rate || isNaN(parseFloat(rate))) {
      return res.status(400).json({ error: 'Valid rate is required' });
    }
    
    const updatedRate = await prisma.cryptoRate.upsert({
      where: { symbol: symbol.toUpperCase() },
      update: { rate: parseFloat(rate) },
      create: {
        symbol: symbol.toUpperCase(),
        rate: parseFloat(rate)
      }
    });
    
    res.json(updatedRate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update crypto rate' });
  }
});

export default router; 