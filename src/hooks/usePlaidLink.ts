import { useState, useCallback } from 'react';
import { createPlaidLinkSession, LinkSuccess, LinkExit } from 'react-native-plaid-link-sdk';
import { useCreateLinkToken, useExchangePublicToken } from '../api/plaid';
import Toast from 'react-native-toast-message';

export const usePlaidLink = () => {
  const [isLoading, setIsLoading] = useState(false);
  const createLinkToken = useCreateLinkToken();
  const exchangePublicToken = useExchangePublicToken();

  const openPlaidLink = useCallback(async () => {
    setIsLoading(true);

    try {
      // Step 1: Get the link token from our backend
      const data = await createLinkToken.mutateAsync();
      const linkToken = data.link_token;

      if (!linkToken) {
        throw new Error('Failed to get link token');
      }

      // Step 2 & 3: Create the Plaid Link session and configure callbacks
      const session = await createPlaidLinkSession({
        token: linkToken,
        noLoadingState: false,
        onSuccess: async (success: LinkSuccess) => {
          // Step 4: Exchange the public token via our backend
          try {
            const result = await exchangePublicToken.mutateAsync(
              success.publicToken,
            );
            Toast.show({
              type: 'success',
              text1: 'Bank Connected!',
              text2: `${result.institution_name || 'Bank'} linked with ${result.accounts_linked} account(s)`,
            });
          } catch (exchangeError) {
            console.error('Error exchanging public token:', exchangeError);
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
        onEvent: (event) => {
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
  }, [createLinkToken, exchangePublicToken]);

  return {
    openPlaidLink,
    isLoading: isLoading || createLinkToken.isPending || exchangePublicToken.isPending,
  };
};
