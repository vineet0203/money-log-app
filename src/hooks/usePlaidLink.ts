import { useState, useCallback } from 'react';
import type { LinkSuccess, LinkExit } from 'react-native-plaid-link-sdk';
import { useCreateLinkToken, useExchangePublicToken, useResetItemStatus } from '../api/plaid';
import Toast from 'react-native-toast-message';

// Conditionally require the native module to prevent Expo Go from crashing on startup
let createPlaidLinkSession: any = null;
try {
  const Plaid = require('react-native-plaid-link-sdk');
  createPlaidLinkSession = Plaid.createPlaidLinkSession;
} catch (e) {
  console.warn('ReactNativePlaidLinkSdk not available in this environment (likely Expo Go).');
}

export const usePlaidLink = () => {
  const [isLoading, setIsLoading] = useState(false);
  const createLinkToken = useCreateLinkToken();
  const exchangePublicToken = useExchangePublicToken();
  const resetItemStatus = useResetItemStatus();

  const openPlaidLink = useCallback(async (itemId?: string) => {
    setIsLoading(true);

    if (!createPlaidLinkSession) {
      setIsLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Not Supported',
        text2: 'Plaid Link requires a custom development build (not Expo Go).',
      });
      return;
    }

    try {
      // Step 1: Get the link token from our backend (pass item_id for update mode)
      const data = await createLinkToken.mutateAsync(itemId ? { item_id: itemId } : undefined);
      const linkToken = data.link_token;

      if (!linkToken) {
        throw new Error('Failed to get link token');
      }

      // Step 2 & 3: Create the Plaid Link session and configure callbacks
      const session = await createPlaidLinkSession({
        token: linkToken,
        noLoadingState: false,
        onSuccess: async (success: LinkSuccess) => {
          try {
            if (itemId) {
              // Update mode: just reset the item status!
              await resetItemStatus.mutateAsync(itemId);
              Toast.show({
                type: 'success',
                text1: 'Reconnected!',
                text2: 'Bank connection restored successfully.',
              });
            } else {
              // Normal mode: exchange token
              const result = await exchangePublicToken.mutateAsync(
                success.publicToken,
              );
              Toast.show({
                type: 'success',
                text1: 'Bank Connected!',
                text2: `${result.institution_name || 'Bank'} linked with ${result.accounts_linked} account(s)`,
              });
            }
          } catch (exchangeError) {
            console.error('Error in onSuccess:', exchangeError);
            Toast.show({
              type: 'error',
              text1: 'Connection Failed',
              text2: 'Could not finish linking your bank. Please try again.',
            });
          } finally {
            setIsLoading(false);
          }
        },
        onExit: (exit: LinkExit) => {
          setIsLoading(false);
          // Plaid sometimes returns an empty object {} on user cancellation
          if (exit.error && Object.keys(exit.error).length > 0) {
            console.error('Plaid Link error:', exit.error);
            Toast.show({
              type: 'error',
              text1: 'Connection Error',
              text2: exit.error.displayMessage || 'Something went wrong. Please try again.',
            });
          }
        },
        onEvent: (event: any) => {
          console.log('Plaid Link Event:', event);
        }
      });

      // Open Plaid Link UI
      await session.open(false);

    } catch (error: any) {
      setIsLoading(false);
      console.error('Error opening Plaid Link:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to open bank connection. Please try again.',
      });
    }
  }, [createLinkToken, exchangePublicToken, resetItemStatus]);

  return {
    openPlaidLink,
    isLoading: isLoading || createLinkToken.isPending || exchangePublicToken.isPending,
  };
};
