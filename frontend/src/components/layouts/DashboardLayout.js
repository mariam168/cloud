import { Home, Package, Folder, ShoppingCart, User, Megaphone, Tag, Percent, Settings, BarChart2 } from 'lucide-react'; // Added Percent, Settings, BarChart2 for potential future use or better icons
import { useLanguage } from "../LanguageContext"; // Corrected import path for LanguageContext
import { Outlet, Link, useLocation } from 'react-router-dom'; // Added useLocation for active link styling

const DashboardLayout = () => {
  const { t, language } = useLanguage(); // Added language for RTL support in styling
  const location = useLocation(); // To determine active link

  const navItems = [
    { to: "/", icon: Home, label: t('adminDashboardPage.dashboardTitle') || 'Dashboard' },
    { to: "/products", icon: Package, label: t('adminDashboardPage.productManagement') || 'Products' },
    { to: "/categories", icon: Folder, label: t('adminDashboardPage.categoryManagement') || 'Categories' },
    { to: "/orders", icon: ShoppingCart, label: t('adminDashboardPage.orderManagement') || 'Orders' },
    { to: "/users", icon: User, label: t('adminDashboardPage.userManagement') || 'Users' }, // Added Users management
    { to: "/advertisements", icon: Megaphone, label: t('adminDashboardPage.advertisementManagement') || 'Advertisements' },
    { to: "/discounts", icon: Tag, label: t('adminDashboardPage.discountManagement') || 'Discounts' },
    // Add more items as needed, e.g., settings, analytics
    // { to: "/dashboard/settings", icon: Settings, label: t('adminDashboardPage.settings') || 'Settings' },
    // { to: "/dashboard/analytics", icon: BarChart2, label: t('adminDashboardPage.analytics') || 'Analytics' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300 ease-in-out">
      {/* Sidebar */}
      <div className="w-16 md:w-64 bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ease-in-out flex flex-col flex-shrink-0 border-r border-gray-100 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 text-center flex items-center justify-center h-20">
          <h2 className="text-2xl md:text-3xl font-extrabold text-blue-600 dark:text-blue-400 hidden md:block">
            {t('mainHeader.siteName')} {/* Site Name from general translation */}
          </h2>
          <span className="md:hidden text-3xl font-extrabold text-blue-600 dark:text-blue-400">T</span> {/* Short for mobile */}
        </div>
        <nav className="flex-1 mt-6">
          <ul>
            {navItems.map(item => (
              <li key={item.to}>
                <Link 
                  to={item.to} 
                  className={`flex items-center py-3 px-4 md:px-6 text-gray-700 dark:text-gray-300 transition-colors duration-200 ease-in-out group relative 
                    ${location.pathname === item.to 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-200 font-semibold shadow-sm border-l-4 border-blue-600 dark:border-blue-400' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                    ${language === 'ar' ? 'flex-row-reverse justify-end md:justify-start' : ''}
                  `}
                >
                  <item.icon size={22} className={`${language === 'ar' ? 'ml-0 md:ml-3' : 'mr-0 md:mr-3'} flex-shrink-0 text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors duration-200`} />
                  <span className={`hidden md:inline text-lg ${location.pathname === item.to ? 'font-semibold' : 'group-hover:text-gray-900 dark:group-hover:text-white'} transition-colors duration-200`}>
                    {item.label}
                  </span>
                  {/* Active indicator for collapsed sidebar */}
                  {location.pathname === item.to && (
                    <span className={`absolute top-0 h-full w-1 rounded-r-md bg-blue-600 dark:bg-blue-400 ${language === 'ar' ? 'right-0' : 'left-0'} md:hidden`}></span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {/* Placeholder for footer/logout in sidebar */}
        <div className="p-4 mt-auto border-t border-gray-200 dark:border-gray-700">
            {/* Example: Logout Button */}
            <Link to="/logout" className="flex items-center py-3 px-4 md:px-6 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-300 rounded-lg transition-colors duration-200">
                <span className="text-red-500 dark:text-red-400 mr-0 md:mr-3 flex-shrink-0">
                    {/* Add Logout Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="17 16 22 12 17 8"/><line x1="22" x2="10" y1="12" y2="12"/></svg>
                </span>
                <span className="hidden md:inline text-lg">{t('topBar.logout')}</span>
            </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 md:p-10 lg:p-12 overflow-auto"> {/* Increased padding for main content */}
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;