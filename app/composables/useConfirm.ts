interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

// Global State (Module-level singleton)
const isVisible = ref(false);
const options = ref<ConfirmOptions>({});
let resolvePromise: ((value: boolean) => void) | null = null;

export const useConfirm = () => {
  /**
   * Shows a confirmation dialog and returns a promise that resolves
   * to true (confirmed) or false (cancelled).
   */
  const confirm = (optsOrMessage: ConfirmOptions | string): Promise<boolean> => {
    // 1. Normalize Options
    if (typeof optsOrMessage === 'string') {
      options.value = {
        message: optsOrMessage,
        isDestructive: false
      };
    } else {
      options.value = {
        isDestructive: false,
        ...optsOrMessage
      };
    }

    // 2. Show Dialog
    isVisible.value = true;

    // 3. Return Promise
    return new Promise((resolve) => {
      resolvePromise = resolve;
    });
  };

  /**
   * Internal method called by the dialog component
   */
  const handleUserChoice = (choice: boolean) => {
    isVisible.value = false;
    if (resolvePromise) {
      resolvePromise(choice);
      resolvePromise = null;
    }
  };

  return {
    isVisible,
    options,
    confirm,
    handleUserChoice
  };
};
