import React, { useState } from 'react';
// Assuming these components exist at the specified paths
// Removed AddProductPage and AdminOrdersPage imports as they are not used here
import CategoryList from '../../components/Admin/CategoryPage/CategoryList'; // Make sure path is correct
import AddCategoryModal from '../../components/Admin/CategoryPage/AddCategoryForm'; // Make sure path is correct
// Removed EditCategoryModal import as it's used within CategoryList
import { useLanguage } from '../../components/LanguageContext';

// This App component is now dedicated to Category Management
function App() {
    const { t } = useLanguage();

    // State to trigger re-fetching for the category list
    const [refreshCategoriesKey, setRefreshCategoriesKey] = useState(0);

    // State for category modal visibility
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

    // Define your backend server URL
    const SERVER_URL = 'http://localhost:5000'; // Replace with your actual server URL

     // Handler for any category action (add, edit, delete) to refresh the list
    const handleCategoryAction = () => {
        setRefreshCategoriesKey(prevKey => prevKey + 1);
    };

    return (
        <div className="App container mx-auto p-4 min-h-screen flex flex-col">
            {/* Header - Using the general dashboard title */}
            <header className="text-center my-8">
                <h1 className="text-4xl font-bold text-gray-800">
                    {t.adminDashboardPage?.dashboardTitle || 'Admin Dashboard'} {/* Use translated title */}
                </h1>
            </header>

            {/* Navigation Tabs - Removed as we only show categories */}
            {/* <nav className="flex justify-center space-x-2 sm:space-x-4 mb-10">
                ...
            </nav> */}

            {/* Main Content Area - Only Category Section */}
            <main className="flex-grow">
                <section id="categories-section">
                    <div className="flex justify-between items-center mb-6 px-2 sm:px-0">
                        {/* Use translated title for Category List */}
                        <h2 className="text-2xl sm:text-3xl font-semibold text-purple-700">
                            {t.adminCategoryPage?.categoryListTitle || 'Category List'} {/* Use translated title */}
                        </h2>
                        <button
                            onClick={() => setShowAddCategoryModal(true)}
                            className="bg-purple-600 text-white py-2 px-4 sm:px-5 rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 text-sm sm:text-base"
                        >
                            {t.adminDashboardPage?.addCategoryButton || '+ Add New Category'} {/* Use translated button text */}
                        </button>
                    </div>
                    <div>
                        {/* CategoryList component */}
                        <CategoryList
                            key={refreshCategoriesKey} // Key to force re-fetch on category actions
                            serverUrl={SERVER_URL}
                            onCategoryAction={handleCategoryAction} // Pass handler to refresh list
                        />
                    </div>
                </section>
            </main>

            {/* Add Category Modal */}
            <AddCategoryModal
                isOpen={showAddCategoryModal}
                onClose={() => setShowAddCategoryModal(false)}
                onCategoryAdded={() => {
                    handleCategoryAction(); // Refresh list after adding
                    setShowAddCategoryModal(false); // Close modal
                }}
                serverUrl={SERVER_URL}
            />

            {/* Edit Category Modal - This modal is managed within CategoryList */}
            {/* No need to render it here */}


            {/* Footer */}
            <footer className="text-center mt-16 py-6 text-gray-600 border-t border-gray-300">
                <p>&copy; {new Date().getFullYear()} {t.adminDashboardPage?.footerText || 'My Store. All rights reserved.'}</p> {/* Use translated text */}
            </footer>
        </div>
    );
}

export default App;
