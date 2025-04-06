# Dzeta Budget - Telegram Mini App

A Telegram mini-app for budget tracking with features for managing transactions, assets, and tracking net worth.

## Features

- **Dashboard**: View your total net worth, asset distribution, and recent transactions
- **Transactions**: Track income and expenses, with support for cash and non-cash transactions
- **Asset Management**: Track different types of assets (cash, crypto, products, accounts)
- **Receipt Storage**: Attach and store receipts for transactions
- **Crypto Integration**: Track crypto assets with real-time rates

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL database
- Prisma ORM
- JWT Authentication
- Multer for file uploads

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Chart.js for data visualization
- React Query for data fetching
- Telegram Mini App SDK

## Setup

### Prerequisites
- Node.js (v16+)
- PostgreSQL
- Docker and Docker Compose (for containerized deployment)

### Local Development

1. **Clone the repository**
   ```
   git clone https://github.com/yourusername/dzeta-budget.git
   cd dzeta-budget
   ```

2. **Set up the backend**
   ```
   cd backend
   npm install
   cp .env.example .env  # Edit the .env file with your database credentials
   npx prisma migrate dev
   npx prisma generate
   npm run dev
   ```

3. **Set up the frontend**
   ```
   cd frontend
   npm install
   cp .env.example .env  # Edit the .env file with your API URL
   npm run dev
   ```

### Docker Deployment

1. **Set environment variables**
   Create a `.env` file in the root directory with your Coin API key:
   ```
   COIN_API_KEY=your_coin_api_key
   ```

2. **Build and run with Docker Compose**
   ```
   docker-compose up -d
   ```

3. **Access the application**
   The frontend will be available at http://localhost and the API at http://localhost:3000

## Telegram Integration

1. Create a Telegram bot using BotFather
2. Set up a Telegram Mini App and link it to your deployment
3. Configure the webhook URL in your Telegram bot settings

## Project Structure

```
dzeta-budget/
├── frontend/               # React frontend
│   ├── src/                
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context for state management
│   │   └── ...
│   └── ...
├── backend/                # Express backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── middlewares/    # Express middlewares
│   │   └── ...
│   ├── prisma/             # Prisma schema and migrations
│   └── ...
└── docker-compose.yml      # Docker Compose configuration
```

## License

MIT 