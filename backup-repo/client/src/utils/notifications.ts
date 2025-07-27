/**
 * Utility function to show toast notifications
 * @param message The message to display in the notification
 * @param type The type of notification (success, error, or info)
 */
export const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
  try {
    // Remove any existing notifications with the same message
    const existingToasts = document.querySelectorAll('.toast-notification');
    existingToasts.forEach(toast => {
      if (toast.textContent?.includes(message)) {
        try {
          toast.remove();
        } catch (removeError) {
          console.warn('Failed to remove existing toast:', removeError);
        }
      }
    });

    const toast = document.createElement('div');
    toast.className = `toast-notification fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 ${
      type === 'success' ? 'bg-green-500' : 
      type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    toast.textContent = message;
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.className = 'ml-2 text-white hover:text-gray-200';
    closeBtn.onclick = () => {
      try {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      } catch (removeError) {
        console.warn('Failed to remove toast via close button:', removeError);
      }
    };
    toast.appendChild(closeBtn);
    
    document.body.appendChild(toast);
    
    // Auto remove after delay
    const timeout = setTimeout(() => {
      try {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      } catch (removeError) {
        console.warn('Failed to auto-remove toast:', removeError);
      }
    }, type === 'error' ? 5000 : 3000);
    
    // Store timeout ID for potential cancellation
    (toast as any)._timeout = timeout;
  } catch (error) {
    console.error('Error showing notification:', error);
    // Fallback to alert if DOM manipulation fails
    alert(`${type.toUpperCase()}: ${message}`);
  }
};