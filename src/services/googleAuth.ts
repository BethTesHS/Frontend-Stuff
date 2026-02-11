// Google OAuth service for handling popup-based authentication flow

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://homedapp1.azurewebsites.net';

interface GoogleAuthResult {
  success: boolean;
  data?: {
    user: any;
    profile?: any;
    access_token: string;
    refresh_token: string;
    token_type: string;
  };
  error?: string;
  message?: string;
}

/**
 * Opens Google OAuth popup and handles the authentication flow
 */
export const handleGoogleAuth = (): Promise<GoogleAuthResult> => {
  return new Promise((resolve, reject) => {
    // Open Google OAuth popup
    const popup = window.open(
      `${API_BASE_URL}/auth/google`,
      'googleAuth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    if (!popup) {
      reject(new Error('Failed to open popup. Please check if popups are blocked.'));
      return;
    }

    // Poll for popup URL changes to detect callback
    const pollTimer = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(pollTimer);
          reject(new Error('Authentication cancelled by user.'));
          return;
        }

        
     const url = popup.location.href;
        if (url.includes('/auth/google/callback')) {
          const urlParams = new URLSearchParams(popup.location.search);
          const code = urlParams.get('code');
          const state = urlParams.get('state');
          const error = urlParams.get('error');

          clearInterval(pollTimer);
          popup.close();

          if (error) {
            reject(new Error(`Google OAuth error: ${error}`));
            return;
          }

          if (!code) {
            reject(new Error('No authorization code received from Google.'));
            return;
          }

          // Send code to backend
          sendCodeToBackend(code, state)
            .then(resolve)
            .catch(reject);
        }
      } catch (e) {
        // Cross-origin error - expected while navigating through Google
        // Continue polling until we reach our callback URL
      }
    }, 1000);

    // Set timeout for authentication
    setTimeout(() => {
      clearInterval(pollTimer);
      if (!popup.closed) {
        popup.close();
      }
      reject(new Error('Authentication timeout. Please try again.'));
    }, 300000); // 5 minutes timeout
  });
};

/**
 * Sends the authorization code to the backend for token exchange
 */
const sendCodeToBackend = async (code: string, state?: string): Promise<GoogleAuthResult> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/google/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        state: state || undefined,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Authentication failed');
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to authenticate with Google');
  }
};