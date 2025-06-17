import React from 'react';
import ProductList from '../../components/Admin/ProductPage/ProductList';
import { useLanguage } from "../../components/LanguageContext"; // تأكد من المسار الصحيح للـ LanguageContext

function App() {
    const { t } = useLanguage();

    return (
        <div className="App container mx-auto p-4">
            <main>
                <hr className="my-8 border-gray-300" />
                <section>
                    <ProductList /> 
                </section>
            </main>
            <footer className="text-center mt-12 py-4 text-gray-600">
                <p>&copy; {new Date().getFullYear()} {t('adminDashboardPage.footerText') || 'My Store. All rights reserved.'}</p>
            </footer>
        </div>
    );
}

export default App;