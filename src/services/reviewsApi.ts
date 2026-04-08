import { getAuthToken } from '@/utils/tokenStorage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://api.homeduk.property';

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  status?: number;
  type?: string;
  pageinfo?: any;
}

export interface PlatformReview {
  id: number;
  rating_id: string;
  rating_type: string;
  reviewer_id: number;
  reviewer_role: string;
  reviewer_name?: string;
  overall_score: number;
  aspects?: Record<string, number>;
  review_text?: string;
  status: string;
  is_verified: boolean;
  created_at?: string;
  // For complaint_handling reviews
  context_id?: number | null;
  context_type?: string | null;
}

export interface PlatformRatingsResponse {
  subject_id: null;
  rating_type: string;
  total_ratings: number;
  average_score: number;
  ratings: PlatformReview[];
}

export interface SubmitReviewPayload {
  overall_score: number;
  review_text?: string;
  aspects?: Record<string, number>;
}

const authedRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `HTTP ${response.status}`);
  }
  return data;
};

const publicRequest = async <T>(endpoint: string): Promise<ApiResponse<T>> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || `HTTP ${response.status}`);
  return data;
};

export const reviewsApi = {
  // Submit a platform review (auth required)
  submitPlatformReview: (payload: SubmitReviewPayload) =>
    authedRequest<PlatformReview>('/ratings', {
      method: 'POST',
      body: JSON.stringify({
        rating_type: 'platform',
        reviewer_role: 'tenant',
        overall_score: payload.overall_score,
        review_text: payload.review_text,
        aspects: payload.aspects,
      }),
    }),

  // Get the current user's submitted ratings (auth required)
  getMyReviews: () =>
    authedRequest<{ ratings: PlatformReview[] }>('/ratings/my'),

  // Fetch public platform reviews — used by the homepage (no auth)
  getPublicPlatformReviews: (page = 1, limit = 6) =>
    publicRequest<PlatformRatingsResponse>(
      `/ratings/platform?page_no=${page}&limit=${limit}`,
    ),
};

export default reviewsApi;
