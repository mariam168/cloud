// components/ToastNotification.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { XCircle, CheckCircle, Info, TriangleAlert } from 'lucide-react'; // لإضافة أيقونات

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        setToasts((prevToasts) => [...prevToasts, { id, message, type, duration }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem = ({ toast, onRemove }) => {
    const { id, message, type, duration } = toast;
    const [isVisible, setIsVisible] = useState(false); // لإدارة ظهور/اختفاء الـ fade

    useEffect(() => {
        // لجعل الـ toast يظهر بشكل تدريجي (fade in)
        setIsVisible(true); 

        const timer = setTimeout(() => {
            setIsVisible(false); // لجعل الـ toast يختفي بشكل تدريجي (fade out)
            setTimeout(() => onRemove(id), 300); // إزالته من الـ DOM بعد انتهاء الـ fade out
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, onRemove]);

    const getColors = () => {
        switch (type) {
            case 'success':
                return { bg: 'bg-green-500', text: 'text-white', icon: CheckCircle };
            case 'error':
                return { bg: 'bg-red-500', text: 'text-white', icon: XCircle };
            case 'warning':
                return { bg: 'bg-yellow-500', text: 'text-white', icon: TriangleAlert };
            default: // info
                return { bg: 'bg-blue-500', text: 'text-white', icon: Info };
        }
    };

    const { bg, text, icon: Icon } = getColors();

    return (
        <div
            className={`flex items-center gap-3 p-4 rounded-lg shadow-lg transition-all duration-300 transform 
                        ${bg} ${text} 
                        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
            role="alert"
        >
            {Icon && <Icon size={24} className="flex-shrink-0" />}
            <span className="flex-grow text-sm font-medium">{message}</span>
            <button
                onClick={() => { setIsVisible(false); setTimeout(() => onRemove(id), 300); }}
                className={`p-1 rounded-full ${text} opacity-80 hover:opacity-100 transition-opacity`}
                aria-label="Close toast"
            >
                <XCircle size={18} />
            </button>
        </div>
    );
};