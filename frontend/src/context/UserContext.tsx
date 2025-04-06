import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import axios from 'axios';
import { WebApp } from '@twa-dev/sdk';

// Define user interface
interface User {
  id: string;
  telegramId: string;
  name: string;
}

// Define context interface
interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (telegramId: string, name: string) => Promise<void>;
  logout: () => void;
}

// Create context with default values
const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

// Create provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to authenticate user
  const login = async (telegramId: string, name: string) => {
    try {
      const response = await axios.post('/users/auth', { telegramId, name });
      const { token, user } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      
      // Set authentication header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user state
      setUser(user);
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
  };

  // Function to logout user
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove authentication header
    delete axios.defaults.headers.common['Authorization'];
    
    // Reset user state
    setUser(null);
  };

  // Effect to check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Set auth header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch user info
          const response = await axios.get('/users/me');
          setUser(response.data);
        } catch (error) {
          console.error('Error verifying token:', error);
          // If token is invalid, remove it
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      
      setLoading(false);
    };

    // Check authentication status on mount
    checkAuth();

    // If we have Telegram Web App data, auto-login
    try {
      const initData = WebApp.initData;
      if (initData) {
        const initDataJson = WebApp.initDataUnsafe;
        if (initDataJson && initDataJson.user) {
          const { id, first_name } = initDataJson.user;
          login(id.toString(), first_name);
        }
      }
    } catch (error) {
      console.error('Error processing Telegram data:', error);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for using the user context
export const useUser = () => useContext(UserContext);

export default UserContext; 