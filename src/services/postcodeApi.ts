interface PostcodeResult {
  success: boolean;
  data?: {
    postcode: string;
    street?: string;
    city: string;
    county: string;
    latitude?: number;
    longitude?: number;
  };
  error?: string;
}

class PostcodeApiService {
  private baseUrl: string;

  constructor() {
    // Use localhost for development, will be updated for production
    this.baseUrl = 'https://homedapp1.azurewebsites.net';
  }

  async lookupPostcode(postcode: string): Promise<PostcodeResult> {
    try {
      const response = await fetch(`${this.baseUrl}/postcode?postcode=${encodeURIComponent(postcode)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Postcode lookup error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to lookup postcode'
      };
    }
  }
}

export const postcodeApi = new PostcodeApiService();