import { useState, useCallback } from 'react';

/**
 * usePetCareModal – drop-in replacement for Alert.alert()
 *
 * Usage:
 *   const [modalProps, showModal] = usePetCareModal();
 *
 *   // Simple:
 *   showModal('error', 'Login Failed', 'Invalid credentials');
 *
 *   // With custom buttons (like Alert.alert with buttons array):
 *   showModal('warning', 'Delete?', 'This cannot be undone.', [
 *     { text: 'Cancel', style: 'cancel' },
 *     { text: 'Delete', style: 'destructive', onPress: () => doDelete() },
 *   ]);
 *
 * In JSX:
 *   <PetCareModal {...modalProps} />
 */
export default function usePetCareModal() {
  const [config, setConfig] = useState({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    buttons: [],
  });

  const showModal = useCallback((type, title, message, buttons = []) => {
    setConfig({
      visible: true,
      type: type || 'info',
      title: title || '',
      message: message || '',
      buttons: buttons.length > 0 ? buttons : [{ text: 'OK', style: 'primary' }],
    });
  }, []);

  const hideModal = useCallback(() => {
    setConfig((prev) => ({ ...prev, visible: false }));
  }, []);

  const modalProps = {
    ...config,
    onClose: hideModal,
  };

  return [modalProps, showModal];
}
