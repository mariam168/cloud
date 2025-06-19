import { Home, Package, Folder, ShoppingCart, User, Megaphone, Tag, LogOut } from 'lucide-react';
import { useLanguage } from "../LanguageContext";
import { Outlet, Link, useLocation } from 'react-router-dom';

const DashboardLayout = () => {
  const { t, language } = useLanguage();
  const location = useLocation();

  const navItems = [
    { to: "/admin/dashboard", icon: Home, label: t('adminDashboardPage.dashboardTitle') },
    { to: "/admin/products", icon: Package, label: t('adminDashboardPage.productManagement') },
    { to: "/admin/categories", icon: Folder, label: t('adminDashboardPage.categoryManagement') },
    { to: "/admin/orders", icon: ShoppingCart, label: t('adminDashboardPage.orderManagement') },
    { to: "/admin/users", icon: User, label: t('adminDashboardPage.userManagement') },
    { to: "/admin/advertisements", icon: Megaphone, label: t('adminDashboardPage.advertisementManagement') },
    { to: "/admin/discounts", icon: Tag, label: t('adminDashboardPage.discountManagement') },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-200">
      <aside className="w-16 md:w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col border-r dark:border-gray-700">
        <div className="p-4 border-b dark:border-gray-700 text-center flex items-center justify-center h-20">
          <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400 hidden md:block">
            {t('mainHeader.siteName')}
          </Link>
          <Link to="/" className="md:hidden text-2xl font-bold text-blue-600 dark:text-blue-400">T</Link>
        </div>
        <nav className="flex-1 mt-4">
          <ul>
            {navItems.map(item => {
                const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
                return (
                  <li key={item.to}>
                    <Link 
                      to={item.to} 
                      className={`flex items-center py-3 my-1 mx-2 rounded-lg px-4 transition-colors duration-200 group relative ${
                        isActive 
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 font-semibold' 
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <item.icon size={22} className={`flex-shrink-0 transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400'}`} />
                      <span className="hidden md:inline ml-4 text-base">{item.label}</span>
                    </Link>
                  </li>
                )
            })}
          </ul>
        </nav>
        <div className="p-4 mt-auto border-t dark:border-gray-700">
            <Link to="/logout" className="flex items-center py-3 px-4 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-300 rounded-lg transition-colors">
                <LogOut size={22} className="text-red-500 flex-shrink-0" />
                <span className="hidden md:inline ml-4 text-base">{t('topBar.logout')}</span>
            </Link>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;