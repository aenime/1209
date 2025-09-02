import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';

const NotFound = ({ className = '' }) => {
  const navigate = useNavigate();

  return (
    <div className={cn("min-h-screen bg-gray-50 flex items-center justify-center px-4", className)}>
      <div className="max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-gray-300 mb-2">404</div>
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-600 leading-relaxed">
            Sorry, we couldn't find the page you're looking for. The page may have been moved, deleted, or the URL might be incorrect.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Go Back Home
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Go Back
          </button>
        </div>

        {/* Help Links */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">Need help?</p>
          <div className="flex justify-center space-x-4 text-sm">
            <button
              onClick={() => navigate('/contact-us')}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Contact Support
            </button>
            <button
              onClick={() => navigate('/faq')}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              FAQ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;