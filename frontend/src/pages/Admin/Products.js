
import React from 'react';
import ProductList from '../../components/Admin/ProductPage/ProductList';
import { useLanguage } from "../../components/LanguageContext";
import { Package } from 'lucide-react';

function AdminProductsPage() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-gray-100">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <header className="flex items-center justify-between py-6 mb-8 border-b border-gray-200 dark:border-slate-700">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 dark:text-white flex items-center gap-3">
                        <Package size={36} className="text-indigo-600 dark:text-indigo-400" />
                        {t('adminProductsPage.title') || 'Product Management'}
                    </h1>
                </header>

                <main className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-8 border border-gray-200 dark:border-slate-700">
                    <section>
                        <ProductList />
                    </section>
                </main>

                <footer className="text-center mt-10 py-6 border-t border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400">
                    <p className="text-sm">
                        &copy; {new Date().getFullYear()} {t('adminDashboardPage.footerText') || 'My Store. All rights reserved.'}
                    </p>
                </footer>
            </div>
        </div>
    );
}

export default AdminProductsPage;
