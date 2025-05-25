import { Home, Package, Folder, ShoppingCart, User, Megaphone, Tag } from 'lucide-react'; 
import { useLanguage } from "../LanguageContext";
import { Outlet, Link } from 'react-router-dom';

const DashboardLayout = () => {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="w-16 md:w-64 bg-white dark:bg-gray-800 shadow-md transition-all duration-300 ease-in-out">
        <nav className="mt-6">
          <ul>
            <li>
              <Link to="/dashboard" className="flex items-center px-2 md:px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group">
                <Home size={20} className="mr-0 md:mr-3 flex-shrink-0" />
                <span className="hidden md:inline group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200">
                  {t('adminDashboardPage.dashboardTitle') || 'Dashboard'}
                </span>
              </Link>
            </li>
            <li>
              <Link to="/products" className="flex items-center px-2 md:px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group">
                <Package size={20} className="mr-0 md:mr-3 flex-shrink-0" />
                <span className="hidden md:inline group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200">
                  {t('adminDashboardPage.productManagement') || 'Products'}
                </span>
              </Link>
            </li>
            <li>
              <Link to="/categories" className="flex items-center px-2 md:px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group">
                <Folder size={20} className="mr-0 md:mr-3 flex-shrink-0" />
                <span className="hidden md:inline group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200">
                  {t('adminDashboardPage.categoryManagement') || 'Categories'}
                </span>
              </Link>
            </li>
            <li>
              <Link to="/orders" className="flex items-center px-2 md:px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group">
                <ShoppingCart size={20} className="mr-0 md:mr-3 flex-shrink-0" />
                <span className="hidden md:inline group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200">
                  {t('adminDashboardPage.orderManagement') || 'Orders'}
                </span>
              </Link>
            </li>
            <li>
              <Link to="/advertisements" className="flex items-center px-2 md:px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group">
                <Megaphone size={20} className="mr-0 md:mr-3 flex-shrink-0" />
                <span className="hidden md:inline group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200">
                  {t('adminDashboardPage.advertisementManagement') || 'Advertisements'}
                </span>
              </Link>
            </li>
            <li>
              <Link to="/discounts" className="flex items-center px-2 md:px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group">
                <Tag size={20} className="mr-0 md:mr-3 flex-shrink-0" />
                <span className="hidden md:inline group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200">
                  {t('adminDashboardPage.discountManagement') || 'Discounts'}
                </span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="flex-1 p-4 md:p-8">
       
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;

