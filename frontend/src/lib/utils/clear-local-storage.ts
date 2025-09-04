export const clearUserLocalStorage = () => {
  if (typeof window === 'undefined') return;

  try {
    // Clear localStorage items
    // localStorage.removeItem('s45-preferred-model-v3');
    // localStorage.removeItem('s45-model-selection-v2');
    // localStorage.removeItem('s45_upgrade_dialog_displayed');
    localStorage.removeItem('customModels');
          localStorage.removeItem('s45-model-selection-v2');
    localStorage.removeItem('agent-selection-storage');
    localStorage.removeItem('auth-tracking-storage');
    localStorage.removeItem('pendingAgentPrompt');
    localStorage.removeItem('suna_upgrade_dialog_displayed');
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('maintenance-dismissed-')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('✅ Local storage cleared on logout');
  } catch (error) {
    console.error('❌ Error clearing local storage:', error);
  }
}; 