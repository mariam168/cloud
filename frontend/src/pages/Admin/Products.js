// pages/Admin/AdminProductsPage.js
import React from 'react';
import ProductList from '../../components/Admin/ProductPage/ProductList';
import { useLanguage } from "../../components/LanguageContext";

/**
 * AdminProductsPage is a React component that renders the products page for the admin area.
 * It displays a list of all products, with options to add new products, edit existing products, and delete products.
 * It also displays a footer with the copyright information.
 * @function
 * @returns {ReactElement} The rendered component.
 */
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