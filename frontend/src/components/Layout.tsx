import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

interface LayoutProps {
  children: ReactNode;
}

// Bottom navigation item interface
interface NavItem {
  name: string;
  path: string;
  icon: string;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { user } = useUser();

  // Navigation items
  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/', icon: '📊' },
    { name: 'Transactions', path: '/transactions', icon: '💸' },
    { name: 'Assets', path: '/assets', icon: '💰' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 fixed w-full top-0 z-10">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Dzeta Budget</h1>
          {user && (
            <div className="text-sm">
              {user.name}
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow pt-16 pb-16 px-4">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`p-3 flex flex-col items-center text-xs ${
                location.pathname === item.path ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
          <Link
            to={'/add-transaction'}
            className="p-3 flex flex-col items-center text-xs text-green-600"
          >
            <span className="text-xl">➕</span>
            <span>Add</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Layout; 