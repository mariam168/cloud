import { useCart } from '../context/CartContext'; 
import { Link } from 'react-router-dom';
import { Plus, Minus, Trash2 } from 'lucide-react';
const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center min-h-[50vh] flex flex-col justify-center items-center">
        <h1 className="text-2xl font-semibold mb-4 dark:text-white">Your Cart is Empty</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Link
          to="/shop" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }
  return (
    <div className="container mx-auto p-4 md:p-8 dark:bg-slate-900">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Your Shopping Cart</h1>
      <div className="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-6">
        {cartItems.map(item => (
          <div key={item.id} className="flex flex-col sm:flex-row items-center justify-between py-4 border-b dark:border-gray-700 last:border-b-0">
            <div className="flex items-center mb-4 sm:mb-0">
              <img
                src={item.image ? `http://localhost:5000${item.image}` : 'https://via.placeholder.com/80?text=No+Image'}
                alt={item.name}
                className="w-20 h-20 object-contain rounded-md mr-4"
              />
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{item.name}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Price: ${item.price?.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                  disabled={item.quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="px-3 text-gray-800 dark:text-white">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
              <p className="text-md font-semibold text-gray-800 dark:text-white w-20 text-right">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 transition-colors"
                title="Remove item"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
        <div className="mt-6 pt-6 border-t dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Total:</h2>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">${getCartTotal().toFixed(2)}</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <button
              onClick={clearCart}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg shadow transition-colors"
            >
              Clear Cart
            </button>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded-lg shadow transition-colors"
              onClick={() => alert('Proceeding to Checkout!')} 
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;