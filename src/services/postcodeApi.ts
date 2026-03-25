import { API_ENDPOINTS, API_BASE_URL } from '@/constants/apiEndpoints';

const POSTCODE_BASE_URL = API_BASE_URL;

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

interface AutocompleteResult {
  success: boolean;
  data?: string[];
  error?: string;
}

interface ValidateResult {
  success: boolean;
  data?: {
    valid: boolean;
    postcode?: string;
  };
  error?: string;
}

interface SearchPlacesResult {
  success: boolean;
  data?: Array<{
    place: string;
    postcode?: string;
    latitude?: number;
    longitude?: number;
  }>;
  error?: string;
}

class PostcodeApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = POSTCODE_BASE_URL;
  }

  private async get<T>(path: string, params: Record<string, string>): Promise<T> {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseUrl}${path}?${query}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async lookupPostcode(postcode: string): Promise<PostcodeResult> {
    try {
      return await this.get<PostcodeResult>(API_ENDPOINTS.POSTCODE.LOOKUP, {
        postcode: encodeURIComponent(postcode),
      });
    } catch (error) {
      console.error('Postcode lookup error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to lookup postcode',
      };
    }
  }

  async autocomplete(partial: string): Promise<AutocompleteResult> {
    try {
      const result = await this.get<any>(API_ENDPOINTS.POSTCODE.AUTOCOMPLETE, {
        partial: partial.replace(/\s/g, ''),
      });
      // Normalize nested data: response is { data: { data: [...] } }
      const items: string[] = result?.data?.data ?? result?.data ?? [];
      return { success: result?.success ?? true, data: items };
    } catch (error) {
      console.error('Postcode autocomplete error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Autocomplete failed' };
    }
  }

  async validate(postcode: string): Promise<ValidateResult> {
    try {
      return await this.get<ValidateResult>(API_ENDPOINTS.POSTCODE.VALIDATE, {
        postcode: encodeURIComponent(postcode),
      });
    } catch (error) {
      console.error('Postcode validate error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Validation failed' };
    }
  }

  async searchPlaces(query: string): Promise<SearchPlacesResult> {
    try {
      return await this.get<SearchPlacesResult>(API_ENDPOINTS.POSTCODE.SEARCH_PLACES, { query });
    } catch (error) {
      console.error('Search places error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Search places failed' };
    }
  }

  async locationsAutocomplete(query: string): Promise<AutocompleteResult> {
    try {
      const result = await this.get<any>(API_ENDPOINTS.POSTCODE.LOCATIONS_AUTOCOMPLETE, { query });
      // Normalize nested data: response is { data: { data: [...] } }
      const items: string[] = result?.data?.data ?? result?.data ?? [];
      return { success: result?.success ?? true, data: items };
    } catch (error) {
      console.error('Locations autocomplete error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Locations autocomplete failed' };
    }
  }
}

export const postcodeApi = new PostcodeApiService();
