import { useState, useEffect } from 'react';
import {
  Star, Send, CheckCircle2, Loader2, MessageSquare,
  ListFilter, Wrench, HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { reviewsApi, type PlatformReview } from '@/services/reviewsApi';

// ── Review type filter ────────────────────────────────────────────────────────
type ReviewFilter = 'all' | 'complaint' | 'support';

const FILTER_OPTIONS: { value: ReviewFilter; label: string; icon: any; description: string }[] = [
  { value: 'all', label: 'All Reviews', icon: ListFilter, description: 'All your submitted reviews' },
  { value: 'complaint', label: 'Complaint Experience', icon: Wrench, description: 'Reviews after complaint resolutions' },
  { value: 'support', label: 'Support & Platform', icon: HelpCircle, description: 'Your review of the Homed platform' },
];

// ── Platform review aspects ───────────────────────────────────────────────────
const PLATFORM_ASPECTS: { key: string; label: string; description: string }[] = [
  { key: 'ease_of_use', label: 'Ease of Use', description: 'How easy was the portal to navigate?' },
  { key: 'support', label: 'Support Quality', description: 'How helpful and responsive was our support team?' },
  { key: 'listings_quality', label: 'Service Quality', description: 'Overall quality of service provided to you?' },
];

// ── Complaint handling aspects ────────────────────────────────────────────────
const COMPLAINT_ASPECTS: { key: string; label: string }[] = [
  { key: 'response_speed', label: 'Response Speed' },
  { key: 'resolution_quality', label: 'Resolution Quality' },
  { key: 'agent_attitude', label: 'Professionalism' },
];

// ── Star rating input ─────────────────────────────────────────────────────────
const StarInput = ({ value, onChange, size = 24 }: { value: number; onChange: (v: number) => void; size?: number }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110 focus:outline-none"
        >
          <Star
            width={size}
            height={size}
            className={n <= (hovered || value) ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}
          />
        </button>
      ))}
    </div>
  );
};

// ── Static star display ───────────────────────────────────────────────────────
const StarDisplay = ({ score, size = 16 }: { score: number; size?: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        width={size}
        height={size}
        className={n <= score ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-gray-700'}
      />
    ))}
  </div>
);

// ── Review card ───────────────────────────────────────────────────────────────
const ReviewCard = ({ review }: { review: PlatformReview }) => {
  const isComplaint = review.rating_type === 'complaint_handling';
  const date = review.created_at
    ? new Date(review.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  const aspects = isComplaint ? COMPLAINT_ASPECTS : PLATFORM_ASPECTS;
  const typeLabel = isComplaint ? 'Complaint Experience' : 'Platform Review';
  const typeBg = isComplaint
    ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
    : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <StarDisplay score={review.overall_score} size={18} />
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeBg}`}>
              {typeLabel}
            </span>
          </div>
          {date && <p className="text-xs text-gray-400">Submitted {date}</p>}
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full flex-shrink-0">
          <CheckCircle2 size={12} />
          Published
        </span>
      </div>

      {review.review_text && (
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4 italic">
          &ldquo;{review.review_text}&rdquo;
        </p>
      )}

      {review.aspects && Object.keys(review.aspects).length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-800 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {aspects.map(({ key, label }) =>
            review.aspects![key] ? (
              <div key={key} className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                <StarDisplay score={review.aspects![key]} size={14} />
              </div>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
};

// ── Platform review form ──────────────────────────────────────────────────────
const PlatformReviewForm = ({ onSubmitted }: { onSubmitted: (review: PlatformReview) => void }) => {
  const [overallScore, setOverallScore] = useState(0);
  const [aspects, setAspects] = useState<Record<string, number>>({});
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const setAspect = (key: string, value: number) => setAspects((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (overallScore === 0) {
      toast.error('Please give an overall star rating before submitting.');
      return;
    }
    const filledAspects = Object.fromEntries(Object.entries(aspects).filter(([, v]) => v > 0));
    setSubmitting(true);
    try {
      const res = await reviewsApi.submitPlatformReview({
        overall_score: overallScore,
        review_text: reviewText.trim() || undefined,
        aspects: Object.keys(filledAspects).length > 0 ? filledAspects : undefined,
      });
      if (res.data) {
        toast.success('Thank you for your review! It is now live on our homepage.');
        onSubmitted(res.data as PlatformReview);
      } else {
        toast.error(res.message || 'Something went wrong. Please try again.');
      }
    } catch (err: any) {
      const msg: string = err?.message ?? '';
      toast.error(msg.toLowerCase().includes('already') ? 'You have already submitted a platform review.' : msg || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Overall rating */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm space-y-3">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-0.5">
            Overall Rating <span className="text-red-500">*</span>
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">How would you rate your overall experience with Homed?</p>
        </div>
        <StarInput value={overallScore} onChange={setOverallScore} size={32} />
        {overallScore > 0 && (
          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][overallScore]}
          </p>
        )}
      </div>

      {/* Aspect ratings */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm space-y-5">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-0.5">Rate Specific Areas</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">Optional — helps us understand where we can improve.</p>
        </div>
        {PLATFORM_ASPECTS.map(({ key, label, description }) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{description}</p>
            </div>
            <div className="flex-shrink-0">
              <StarInput value={aspects[key] ?? 0} onChange={(v) => setAspect(key, v)} size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Written review */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm space-y-3">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-0.5">Tell Us More</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">Optional — your words will appear as a testimonial on our homepage.</p>
        </div>
        <Textarea
          placeholder="Share what you loved or what we could improve..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={4}
          maxLength={600}
          className="resize-none text-sm"
        />
        <p className="text-xs text-gray-400 text-right">{reviewText.length}/600</p>
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs">
          Your review will be published immediately and visible on the homepage.
        </p>
        <Button
          type="submit"
          disabled={submitting || overallScore === 0}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 shadow-sm"
        >
          {submitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
          ) : (
            <><Send className="mr-2 h-4 w-4" />Submit Review</>
          )}
        </Button>
      </div>
    </form>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const ExternalTenantReviews = () => {
  const [allReviews, setAllReviews] = useState<PlatformReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<ReviewFilter>('all');

  const hasPlatformReview = allReviews.some((r) => r.rating_type === 'platform');
  const complaintReviews = allReviews.filter((r) => r.rating_type === 'complaint_handling');
  const platformReviews = allReviews.filter((r) => r.rating_type === 'platform');

  const filteredReviews =
    activeFilter === 'complaint'
      ? complaintReviews
      : activeFilter === 'support'
      ? platformReviews
      : allReviews;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await reviewsApi.getMyReviews();
        if (res.data?.ratings) {
          setAllReviews(res.data.ratings);
        }
      } catch {
        // User may not have reviewed yet
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handlePlatformReviewSubmitted = (review: PlatformReview) => {
    setAllReviews((prev) => [review, ...prev]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">My Reviews</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Reviews you've submitted — about your complaint experience and about the Homed platform.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-1 shadow-sm w-fit">
        {FILTER_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const active = activeFilter === opt.value;
          const count =
            opt.value === 'all'
              ? allReviews.length
              : opt.value === 'complaint'
              ? complaintReviews.length
              : platformReviews.length;
          return (
            <button
              key={opt.value}
              onClick={() => setActiveFilter(opt.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                active
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {opt.label}
              <span
                className={`text-[10px] font-semibold px-1.5 rounded-full ${
                  active
                    ? 'bg-white/20 dark:bg-black/20 text-white dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Reviews list */}
      {filteredReviews.length > 0 ? (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <ReviewCard key={review.rating_id} review={review} />
          ))}
        </div>
      ) : (
        activeFilter !== 'support' && (
          <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-8 text-center">
            <Wrench className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {activeFilter === 'complaint' ? 'No complaint reviews yet' : 'No reviews yet'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {activeFilter === 'complaint'
                ? 'Once a complaint is resolved, you can leave a review from the Complaints tab.'
                : 'Your reviews will appear here once submitted.'}
            </p>
          </div>
        )
      )}

      {/* Platform review form — shown in Support tab or All tab when no platform review exists */}
      {(activeFilter === 'support' || activeFilter === 'all') && !hasPlatformReview && (
        <div className="space-y-6">
          {activeFilter === 'all' && complaintReviews.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">Rate Your Homed Experience</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Share your overall experience with the Homed platform.</p>
            </div>
          )}
          {activeFilter === 'support' && platformReviews.length === 0 && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Share Your Experience</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    How has Homed been for you as a tenant? Your honest review helps future tenants and appears publicly on our homepage.
                  </p>
                </div>
              </div>
            </div>
          )}
          <PlatformReviewForm onSubmitted={handlePlatformReviewSubmitted} />
        </div>
      )}

      {/* Platform review already submitted note */}
      {(activeFilter === 'support' || activeFilter === 'all') && hasPlatformReview && (
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Each tenant can submit one platform review. Contact support if you need to update yours.
        </p>
      )}

      {/* Complaint reviews info */}
      {(activeFilter === 'complaint' || activeFilter === 'all') && complaintReviews.length > 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Complaint reviews are submitted from the Complaints tab after a complaint is resolved.
        </p>
      )}
    </div>
  );
};

export default ExternalTenantReviews;
