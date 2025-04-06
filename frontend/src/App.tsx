import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WebApp } from '@twa-dev/sdk';

// Pages
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Assets from './pages/Assets';
import LoginPage from './pages/LoginPage';
import TransactionDetail from './pages/TransactionDetail';
import AssetDetail from './pages/AssetDetail';
import AddTransaction from './pages/AddTransaction';
import AddAsset from './pages/AddAsset';

// Components
import Layout from './components/Layout';

// Context
import { UserProvider } from './context/UserContext';

// Set up axios default API base URL
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create a react-query client
const queryClient = new QueryClient();

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize Telegram Mini App SDK
    try {
      WebApp.ready();
      WebApp.expand();
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing Telegram Web App:', error);
      setIsInitialized(true); // Continue even if there's an error with Telegram SDK
    }
  }, []);

  // Function to check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
  };

  // Protected route component
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    return isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
  };

  if (!isInitialized) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Transactions />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <TransactionDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-transaction"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AddTransaction />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/assets"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Assets />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/assets/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AssetDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-asset"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AddAsset />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App; 