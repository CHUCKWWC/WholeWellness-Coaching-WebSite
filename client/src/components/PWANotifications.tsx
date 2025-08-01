import React from 'react';
import { usePWA } from '../hooks/usePWA';

export function PWANotifications() {
  const { isInstallable, isOffline, isUpdateAvailable, promptInstall, updateApp } = usePWA();

  return (
    <>
      {/* Offline indicator */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white p-3 text-center z-50">
          <div className="flex items-center justify-center gap-2">
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
            You're currently offline. Some features may be limited.
          </div>
        </div>
      )}

      {/* Install prompt */}
      {isInstallable && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" 
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Install WholeWellness App</h3>
              <p className="text-xs opacity-90 mt-1">
                Install our app for faster access and offline support
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={promptInstall}
                  className="bg-white text-blue-600 px-3 py-1 rounded text-xs font-medium hover:bg-gray-100 transition-colors"
                >
                  Install
                </button>
                <button
                  onClick={() => {/* Handle dismiss */}}
                  className="text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                >
                  Not now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update available notification */}
      {isUpdateAvailable && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Update Available</h3>
              <p className="text-xs opacity-90 mt-1">
                A new version of WholeWellness is available
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={updateApp}
                  className="bg-white text-green-600 px-3 py-1 rounded text-xs font-medium hover:bg-gray-100 transition-colors"
                >
                  Update Now
                </button>
                <button
                  onClick={() => {/* Handle dismiss */}}
                  className="text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-700 transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}