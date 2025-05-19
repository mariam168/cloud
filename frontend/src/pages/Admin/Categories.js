import React, { useState } from 'react';
import CategoryList from '../../components/Admin/CategoryPage/CategoryList';
import AddCategoryModal from '../../components/Admin/CategoryPage/AddCategoryForm';
import { useLanguage } from '../../components/LanguageContext';

function App() {
    const { t } = useLanguage();
    const [refreshCategoriesKey, setRefreshCategoriesKey] = useState(0);
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
    const SERVER_URL = 'http://localhost:5000';

    const handleCategoryAction = () => {
        setRefreshCategoriesKey(prevKey => prevKey + 1);
    };

    return (
        <div className="App container mx-auto p-4 min-h-screen flex flex-col">
            <header className="text-center my-8">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
                    {t('adminDashboardPage.dashboardTitle') || 'Admin Dashboard'}
                </h1>
            </header>
            <main className="flex-grow">
                <section id="categories-section">
                    <div className="flex justify-between items-center mb-6 px-2 sm:px-0">
                        <h2 className="text-2xl sm:text-3xl font-semibold text-purple-700 dark:text-purple-400">
                            {t('adminCategoryPage.categoryListTitle') || 'Category List'}
                        </h2>
                        <button
                            onClick={() => setShowAddCategoryModal(true)}
                            className="bg-purple-600 text-white py-2 px-4 sm:px-5 rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 text-sm sm:text-base"
                        >
                            {t('adminDashboardPage.addCategoryButton') || '+ Add New Category'}
                        </button>
                    </div>
                    <div>
                        <CategoryList
                            key={refreshCategoriesKey}
                            serverUrl={SERVER_URL}
                            onCategoryAction={handleCategoryAction}
                        />
                    </div>
                </section>
            </main>
            <AddCategoryModal
                isOpen={showAddCategoryModal}
                onClose={() => setShowAddCategoryModal(false)}
                onCategoryAdded={() => {
                    handleCategoryAction();
                    setShowAddCategoryModal(false);
                }}
                serverUrl={SERVER_URL}
            />
            <footer className="text-center mt-16 py-6 text-gray-600 dark:text-gray-400 border-t border-gray-300 dark:border-gray-700">
                <p>&copy; {new Date().getFullYear()} {t('adminDashboardPage.footerText') || 'My Store. All rights reserved.'}</p>
            </footer>
        </div>
    );
}

export default App;
