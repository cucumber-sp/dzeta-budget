import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WebApp } from '@twa-dev/sdk';
import { useUser } from '../context/UserContext';

const LoginPage = () => {
  const { login, user, loading } = useUser();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (user && !loading) {
      navigate('/');
    }

    // Try to get Telegram Web App init data
    try {
      const initData = WebApp.initData;
      if (initData) {
        const initDataJson = WebApp.initDataUnsafe;
        if (initDataJson && initDataJson.user) {
          const { id, first_name } = initDataJson.user;
          handleTelegramLogin(id.toString(), first_name);
        }
      }
    } catch (error) {
      console.error('Error processing Telegram data:', error);
      setError('Could not access Telegram data. Please make sure you open this app from Telegram.');
    }
  }, [user, loading, navigate]);

  // Handle Telegram login
  const handleTelegramLogin = async (telegramId: string, name: string) => {
    try {
      await login(telegramId, name);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      setError('Authentication failed. Please try again.');
    }
  };

  // For testing/manual login outside of Telegram
  const handleDebugLogin = async () => {
    try {
      await login('12345678', 'Test User');
      navigate('/');
    } catch (error) {
      console.error('Debug login error:', error);
      setError('Debug login failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-center text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">Dzeta Budget</h1>
        
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-4">
            Please open this application from Telegram to login automatically.
          </p>
          
          {error && (
            <p className="text-red-500 mb-4">{error}</p>
          )}
          
          {/* Debug login button for development only */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={handleDebugLogin}
              className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
            >
              Debug Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 