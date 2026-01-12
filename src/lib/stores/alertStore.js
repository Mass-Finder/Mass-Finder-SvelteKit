import { writable } from 'svelte/store';

function createAlertStore() {
  const { subscribe, set, update } = writable(null);

  return {
    subscribe,
    show: (message, title = 'Alert', type = 'info') => {
      set({ message, title, type });
    },
    close: () => {
      set(null);
    }
  };
}

export const alertStore = createAlertStore();

// Helper function to replace window.alert()
export function showAlert(message, title = 'Alert', type = 'info') {
  alertStore.show(message, title, type);

  // Return a promise that resolves when the alert is closed
  return new Promise((resolve) => {
    const unsubscribe = alertStore.subscribe((value) => {
      if (value === null) {
        unsubscribe();
        resolve();
      }
    });
  });
}
