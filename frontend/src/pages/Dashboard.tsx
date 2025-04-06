import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { format } from 'date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Dashboard data interface
interface DashboardData {
  totalNetWorth: number;
  netWorthByType: Record<string, number>;
  recentTransactions: Transaction[];
  assets: Asset[];
}

// Transaction interface
interface Transaction {
  id: string;
  amount: number;
  type: string;
  category: string;
  description?: string;
  date: string;
  isCash: boolean;
  receiptUrl?: string;
}

// Asset interface
interface Asset {
  id: string;
  name: string;
  type: string;
  amount: number;
  description?: string;
}

const Dashboard = () => {
  // Fetch dashboard data
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await axios.get('/users/dashboard');
      return response.data;
    },
  });

  // Skip if data is loading or if there's an error
  if (isLoading) {
    return <div className="flex justify-center py-8">Loading dashboard data...</div>;
  }

  if (error || !data) {
    return (
      <div className="flex justify-center py-8 text-red-500">
        Error loading dashboard data
      </div>
    );
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    }).format(amount);
  };

  // Prepare chart data
  const chartData = {
    labels: data.assets.map(asset => asset.name),
    datasets: [
      {
        label: 'Net Worth by Asset',
        data: data.assets.map(asset => asset.amount),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Total Net Worth */}
      <section className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Total Net Worth</h2>
        <p className="text-3xl font-bold text-blue-600">
          {formatCurrency(data.totalNetWorth)}
        </p>
      </section>

      {/* Net Worth by Type */}
      <section className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Net Worth by Type</h2>
        <div className="space-y-2">
          {Object.entries(data.netWorthByType).map(([type, amount]) => (
            <div key={type} className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-xl mr-2">
                  {type === 'cash' ? '💵' : type === 'crypto' ? '₿' : type === 'product' ? '📦' : '🏦'}
                </span>
                <span className="capitalize">{type}</span>
              </div>
              <span className="font-semibold">{formatCurrency(amount)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Chart */}
      <section className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Assets Distribution</h2>
        <div className="h-60">
          <Line data={chartData} options={{ maintainAspectRatio: false }} />
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
        {data.recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {data.recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <div className="font-medium">
                    {transaction.category}{' '}
                    <span className="text-xs">
                      ({transaction.isCash ? 'Cash' : 'Non-cash'})
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(transaction.date), 'dd.MM.yyyy')}
                  </div>
                </div>
                <div className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No recent transactions</p>
        )}
      </section>
    </div>
  );
};

export default Dashboard; 