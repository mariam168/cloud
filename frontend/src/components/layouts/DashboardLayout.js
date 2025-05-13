import { Home, Package, Folder, ShoppingCart, User } from 'lucide-react';
import { useLanguage } from "../LanguageContext";
import { Outlet, Link } from 'react-router-dom';

const DashboardLayout = () => {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="w-64 bg-white dark:bg-gray-800 shadow-md transition-colors duration-300">
        
        <nav className="mt-6">
          <ul>
            <li>
              <Link to="/dashboard" className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                <Home size={20} className="mr-3" />
                {t.dashboard || 'Dashboard'}
              </Link>
            </li>
            <li>
              <Link to="/products" className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                <Package size={20} className="mr-3" />
                {t.products || 'Products'}
              </Link>
            </li>
            <li>
              <Link to="/categories" className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                <Folder size={20} className="mr-3" />
                {t.categories || 'Categories'}
              </Link>
            </li>
            <li>
              <Link to="/orders" className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                <ShoppingCart size={20} className="mr-3" />
                {t.orders || 'Orders'}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="flex-1 p-8">
        <div className="flex justify-end items-center mb-6 text-gray-700 dark:text-gray-300">
          <User size={20} className="mr-2" />
          samuelmariam298@gmail.com
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
