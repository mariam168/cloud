import React from 'react';
import ProductList from '../../components/Admin/ProductPage/ProductList';
import { useLanguage } from "../../components/LanguageContext";

function AdminProductsPage() {
    const { t } = useLanguage();

    return (
        <div className="App container mx-auto p-4">
            <main>
                <section>
                    <ProductList /> 
                </section>
            </main>
            <footer className="text-center mt-12 py-4 text-gray-600">
                <p>© {new Date().getFullYear()} {t('adminDashboardPage.footerText') || 'My Store. All rights reserved.'}</p>
            </footer>
        </div>
    );
}

export default AdminProductsPage;