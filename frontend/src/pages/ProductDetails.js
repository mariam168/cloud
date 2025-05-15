import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
// Import icons for quantity selector, wishlist, trust badges (example using lucide-react)
import { Plus, Minus, ShoppingCart, Heart, ShieldCheck, Truck, Award } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams(); // Get product ID from URL parameters
  const [product, setProduct] = useState(null); // State to store product data
  const [loading, setLoading] = useState(true); // State to manage loading status
  const [error, setError] = useState(null); // State to store any error messages
  const [quantity, setQuantity] = useState(1); // State for product quantity, default to 1
  const [isWishlisted, setIsWishlisted] = useState(false); // State for wishlist status

  // Effect hook to fetch product data when the component mounts or ID changes
  useEffect(() => {
    setLoading(true); // Start loading
    setError(null); // Clear previous errors
    // Fetch product data from the backend API
    axios.get(`http://localhost:5000/api/products/${id}`)
      .then(res => {
        // Assuming product data is directly in res.data
        // If your API nests it (e.g., res.data.product), adjust accordingly
        if (res.data) {
            setProduct(res.data);
            setLoading(false); // Stop loading on success
            // Optional: Check if the product is already in the wishlist based on user data (not implemented here)
            // setIsWishlisted(res.data.isWishlisted || false);
        } else {
            // Handle cases where API returns success but no product data
            setError('Product data not found.');
            setLoading(false); // Stop loading
        }
      })
      .catch(err => {
        console.error('Error fetching product:', err);
        // Check if error response exists and has a status (e.g., 404 Not Found)
        if (err.response && err.response.status === 404) {
             setError('Product not found.');
        } else {
             // Generic error message for other issues
             setError('Failed to load product. Please check your connection or try again.');
        }
        setLoading(false); // Stop loading on error
      });
  }, [id]); // Dependency array: re-run effect if 'id' changes

  // Handlers for quantity selector
  const handleQuantityChange = (event) => {
    const value = parseInt(event.target.value, 10);
    // Update quantity only if it's a valid positive number
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    } else if (event.target.value === '') {
      // Allow clearing the input temporarily, but keep state as empty string
      setQuantity('');
    }
    // Note: A more robust implementation might handle invalid input better on blur/submit
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1); // Increase quantity
  };

  const decrementQuantity = () => {
    // Decrease quantity, but not below 1
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  // Handler for wishlist button
  const handleWishlistToggle = () => {
    // Add your actual wishlist toggle logic here (API call, state update)
    setIsWishlisted(prev => !prev);
    console.log(`Wishlist toggled for product ${id}. New state: ${!isWishlisted}`);
    // Example: axios.post(`/api/wishlist/toggle/${id}`);
  };


  // --- Loading State Display (Enhanced Styling) ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-xl text-gray-700 dark:text-gray-300">
        {/* Basic Spinner Icon */}
        <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Loading product details...</span>
      </div>
    );
  }

  // --- Error State Display (Enhanced Styling) ---
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-xl text-red-600 dark:text-red-400 p-4 text-center">
        Error: {error}
      </div>
    );
  }

  // --- Product Not Found State (Fallback) ---
  if (!product) {
     // This case might be hit if ID exists but no product data is returned after loading
    return (
        <div className="flex items-center justify-center min-h-[60vh] text-xl text-gray-700 dark:text-gray-300">
          Product data is missing.
        </div>
      );
  }

  // --- Product Details Display ---
  return (
    // Main container with enhanced styling (max-width, shadow, rounded corners, background)
    <div className="container mx-auto p-4 md:p-8 max-w-7xl bg-white dark:bg-slate-900 shadow-2xl rounded-xl my-8">
      {/* Grid layout for image and details section */}
      {/* 1 column on small screens, 3 columns on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

        {/* Left Column: Product Image & Thumbnail Gallery */}
        {/* Takes 2 columns on large screens */}
        <div className="lg:col-span-2 flex flex-col items-center">
          {/* Container for the main product image */}
          <div className="w-full max-w-md md:max-w-lg lg:max-w-full p-4 bg-gray-100 dark:bg-slate-800 rounded-xl shadow-inner flex items-center justify-center overflow-hidden">
            {product.image ? (
              // Display product image if available
              <img
                src={`http://localhost:5000${product.image}`}
                alt={product.name || 'Product Image'}
                // Styling for the image: full width, auto height, max height, object-fit, rounded corners, hover effect
                className="w-full h-auto max-h-[500px] object-contain rounded-lg transition-transform duration-300 ease-in-out hover:scale-105"
                // Fallback image in case the main image fails to load
                onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/500?text=Image+Not+Available'}}
              />
            ) : (
              // Placeholder if no image is available
              <div className="w-full h-[500px] flex items-center justify-center text-gray-500 dark:text-gray-400 text-lg">
                No Image Available
              </div>
            )}
          </div>

          {/* Thumbnail Gallery (Placeholder Section) */}
          {/* Displays a row of placeholder thumbnails */}
          <div className="mt-6 w-full max-w-md md:max-w-lg lg:max-w-full">
            {/* Screen reader only title for accessibility */}
            <h3 className="sr-only">Product Images</h3>
            {/* Flex container for thumbnails, allows horizontal scrolling */}
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {/* Map over a placeholder array to display dummy thumbnails */}
              {[...Array(4)].map((_, i) => ( // Example: show 4 placeholder thumbnails
                <div
                  key={i} // Unique key for list items
                  // Styling for each thumbnail: fixed size, background, rounded, flex center, cursor, ring for active/hover
                  className={`flex-shrink-0 w-20 h-20 bg-gray-200 dark:bg-slate-700 rounded-md flex items-center justify-center cursor-pointer ring-2 ring-transparent hover:ring-blue-500 transition-all ${i === 0 ? 'ring-blue-500' : ''}`} // Add ring for active/hover (first one is active example)
                  onClick={() => console.log('Thumbnail clicked:', i)} // Placeholder click handler
                  title={`View Image ${i + 1}`} // Accessibility title
                >
                  {/* Placeholder content for the thumbnail */}
                  {/* Replace with <img src="..." alt="Thumbnail"/> when actual thumbnails are available */}
                  <span className="text-sm text-gray-500 dark:text-gray-400">Thumb {i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Product Details, Price, Actions */}
        {/* Takes 1 column on large screens */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Product Category and Name */}
          <div>
            {/* Category */}
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase mb-1">
              {product.category || 'Uncategorized'} {/* Display category or default */}
            </p>
            {/* Product Name */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
              {product.name || 'Unnamed Product'} {/* Display product name or default */}
            </h1>
          </div>

          {/* Price Section */}
          {/* Displays the product price with enhanced styling */}
          <div className="flex items-baseline gap-2 pb-4 border-b border-gray-200 dark:border-gray-700">
            <p className="text-3xl md:text-4xl font-extrabold text-green-600 dark:text-green-400">
              ${product.price?.toFixed(2) || 'N/A'} {/* Display formatted price or N/A */}
            </p>
            {/* Optional: Add discount badge or old price placeholders */}
            {/* <span className="text-lg text-gray-500 dark:text-gray-400 line-through">$XX.XX</span> */}
            {/* <span className="text-lg font-semibold text-red-500">XX% Off</span> */}
          </div>

          {/* Actions Section: Quantity, Variations, Add to Cart */}
          {/* Groups interactive purchase-related elements */}
          <div className="flex flex-col gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
            {/* Quantity Selector */}
            <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantity</h3>
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md w-32 overflow-hidden"> {/* Added overflow-hidden */}
                    {/* Decrement quantity button */}
                    <button
                        onClick={decrementQuantity}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={quantity <= 1} // Disable if quantity is 1
                        aria-label="Decrease quantity"
                    >
                        <Minus size={18} /> {/* Minus icon */}
                    </button>
                    {/* Quantity input field */}
                    <input
                        type="number"
                        value={quantity}
                        onChange={handleQuantityChange}
                        // Styling to remove default number input arrows and center text
                        className="w-12 text-center border-none focus:ring-0 bg-transparent text-gray-800 dark:text-white [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0"
                        min="1" // Minimum quantity is 1
                        aria-label="Product quantity"
                    />
                    {/* Increment quantity button */}
                    <button
                        onClick={incrementQuantity}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                        aria-label="Increase quantity"
                    >
                        <Plus size={18} /> {/* Plus icon */}
                    </button>
                </div>
            </div>

            {/* Variations Section (Removed as requested) */}
            {/* <div>
                 <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</h3>
                 <div className="flex items-center space-x-2">
                     // Color swatch buttons
                 </div>
            </div> */}
             {/* Add other variations like Size similarly */}
             {/* <div>
                 <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Size</h3>
                 <div className="flex items-center space-x-2">
                    // Size buttons would go here
                 </div>
             </div> */}

            {/* Add to Cart and Wishlist Buttons */}
            {/* Grouping buttons for better layout */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4"> {/* Stack on small, row on medium+ */}
                {/* Add to Cart Button */}
                <button
                  // Make button full width on small screens, add strong styling and hover/focus effects
                  className="flex-1 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-700"
                  onClick={() => { /* Add your actual add to cart logic here */ alert(`Added ${quantity} x ${product.name} to cart!`); }} // Placeholder action
                  aria-label={`Add ${quantity} of ${product.name} to cart`} // Accessibility label
                >
                  <ShoppingCart size={20} className="inline-block mr-2"/> {/* Shopping cart icon */}
                  Add to Cart ({quantity}) {/* Display quantity in button text */}
                </button>

                {/* Add to Wishlist Button */}
                <button
                    className={`p-3 rounded-lg shadow-md transition-colors duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-pink-300 dark:focus:ring-pink-700
                        ${isWishlisted
                            ? 'bg-pink-500 hover:bg-pink-600 text-white' // Wishlisted state
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-300' // Not wishlisted state
                        }
                    `}
                    onClick={handleWishlistToggle}
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                    <Heart size={24} fill={isWishlisted ? 'white' : 'none'} stroke={isWishlisted ? 'white' : 'currentColor'}/> {/* Heart icon */}
                </button>
            </div> {/* End Buttons Group */}
          </div>

          {/* Trust Badges (Placeholder Section) */}
          {/* Displays simple icons/text indicating benefits like secure payment, shipping, guarantee */}
          <div className="flex justify-around items-center text-gray-600 dark:text-gray-400 text-xs mt-4">
              {/* Example badges - replace with actual icons and text */}
              <div className="flex flex-col items-center text-center"> {/* Use flex-col for icon above text */}
                 <ShieldCheck size={24}/> <span>Secure Payment</span>
              </div>
              <div className="flex flex-col items-center text-center">
                 <Truck size={24}/> <span>Fast Shipping</span>
              </div>
               <div className="flex flex-col items-center text-center">
                 <Award size={24}/> <span>Quality Guarantee</span>
              </div>
          </div>

        </div> {/* End Right Column */}

      </div> {/* End Grid Layout */}

      {/* Product Description Section */}
      {/* Displays the detailed description below the main grid */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Product Description</h3>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {product.description || 'No detailed description available for this product.'} {/* Display description or default */}
        </p>
      </div>

      {/* Optional: Specifications Section (Placeholder) */}
      {/* You can uncomment and populate this section with product specifications */}
      {/*
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Specifications</h3>
           <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 leading-relaxed">
              <li>Feature 1: Detail A</li>
              <li>Feature 2: Detail B</li>
              <li>Dimensions: XxYxZ</li>
              <li>Weight: W kg</li>
           </ul>
      </div>
      */}

      {/* Optional: Reviews Section (Placeholder) */}
      {/* You can uncomment and build out a reviews section here */}
      {/*
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
           <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Customer Reviews</h3>
           // Add summary (e.g., Star rating average) and a link to full reviews page/section
           <p className="text-gray-600 dark:text-gray-400">No reviews yet. Be the first!</p>
      </div>
      */}

    </div> // End Main Container
  );
};

export default ProductDetails;
