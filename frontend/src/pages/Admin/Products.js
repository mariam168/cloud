import React, { useState } from 'react';
import AddProductPage from '../../components/Admin/ProductPage/AddProductPage';
import ProductList from '../../components/Admin/ProductPage/ProductList';
import { useLanguage } from "../../components/LanguageContext";

function App() {
    const { t } = useLanguage();
    const [refreshKey, setRefreshKey] = useState(0);

    const handleProductAdded = () => {
        setRefreshKey(prevKey => prevKey + 1);
    };

    return (
        <div className="App container mx-auto p-4">
            <main>
                <hr className="my-8 border-gray-300" />
                <section>
                    <ProductList key={refreshKey} />
                </section>
            </main>
            <footer className="text-center mt-12 py-4 text-gray-600">
                <p>&copy; {new Date().getFullYear()} {t('adminDashboardPage.footerText') || 'My Store. All rights reserved.'}</p>
            </footer>
        </div>
    );
}

export default App;
