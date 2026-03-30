import { useState, useEffect } from 'react';
import { Star, Send, CheckCircle2, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { reviewsApi, type PlatformReview } from '@/services/reviewsApi';

// ── Aspect labels shown in the form ──────────────────────────────────────────
const ASPECTS: { key: string; label: string; description: string }[] = [
  { key: 'ease_of_use', label: 'Ease of Use', description: 'How easy was the portal to navigate?' },
  { key: 'support', label: 'Support Quality', description: 'How helpful and responsive was our support team?' },
  { key: 'listings_quality', label: 'Service Quality', description: 'Overall quality of service provided to you?' },
];

// ── Star rating input ─────────────────────────────────────────────────────────
const StarInput = ({
  value,
  onChange,
  size = 24,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}) => {
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
            className={
              n <= (hovered || value)
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-300 dark:text-gray-600'
            }
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

// ── Submitted review card ─────────────────────────────────────────────────────
const ReviewCard = ({ review }: { review: PlatformReview }) => {
  const date = review.created_at
    ? new Date(review.created_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <StarDisplay score={review.overall_score} size={18} />
          {date && <p className="text-xs text-gray-400 mt-1">Submitted {date}</p>}
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">
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
          {ASPECTS.map(({ key, label }) =>
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

// ── Main component ────────────────────────────────────────────────────────────
const ExternalTenantReviews = () => {
  const [existingReview, setExistingReview] = useState<PlatformReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [overallScore, setOverallScore] = useState(0);
  const [aspects, setAspects] = useState<Record<string, number>>({
    ease_of_use: 0,
    support: 0,
    listings_quality: 0,
  });
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await reviewsApi.getMyReviews();
        const platformReview = res.data?.ratings?.find(
          (r) => r.rating_type === 'platform',
        );
        if (platformReview) setExistingReview(platformReview);
      } catch {
        // User may not have reviewed yet — that's fine
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const setAspect = (key: string, value: number) =>
    setAspects((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (overallScore === 0) {
      toast.error('Please give an overall star rating before submitting.');
      return;
    }

    const filledAspects = Object.fromEntries(
      Object.entries(aspects).filter(([, v]) => v > 0),
    );

    setSubmitting(true);
    try {
      const res = await reviewsApi.submitPlatformReview({
        overall_score: overallScore,
        review_text: reviewText.trim() || undefined,
        aspects: Object.keys(filledAspects).length > 0 ? filledAspects : undefined,
      });

      if (res.data) {
        setExistingReview(res.data as PlatformReview);
        setSubmitted(true);
        toast.success('Thank you for your review! It is now live on our homepage.');
      } else {
        toast.error(res.message || 'Something went wrong. Please try again.');
      }
    } catch (err: any) {
      const msg: string = err?.message ?? '';
      if (msg.toLowerCase().includes('already submitted')) {
        toast.error('You have already submitted a review.');
      } else {
        toast.error(msg || 'Failed to submit review. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  // Already reviewed
  if (existingReview) {
    return (
      <div className="space-y-6 max-w-2xl">
        {submitted && (
          <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium">
              Your review has been published and is now visible on our homepage.
            </p>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Your Review
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your experience review is live on the Homed homepage.
          </p>
        </div>

        <ReviewCard review={existingReview} />

        <p className="text-xs text-gray-400 dark:text-gray-500">
          Each tenant can submit one review. Contact support if you need to update yours.
        </p>
      </div>
    );
  }

  // Review form
  return (
    <div className="max-w-2xl space-y-8">
      {/* Intro */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Share Your Experience
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              How has Homed been for you as a tenant? Your honest review helps future
              tenants and appears publicly on our homepage.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Overall rating */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm space-y-3">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-0.5">
              Overall Rating <span className="text-red-500">*</span>
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              How would you rate your overall experience with Homed?
            </p>
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
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-0.5">
              Rate Specific Areas
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Optional — helps us understand where we can improve.
            </p>
          </div>
          {ASPECTS.map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{description}</p>
              </div>
              <div className="flex-shrink-0">
                <StarInput value={aspects[key]} onChange={(v) => setAspect(key, v)} size={20} />
              </div>
            </div>
          ))}
        </div>

        {/* Written review */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm space-y-3">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-0.5">
              Tell Us More
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Optional — your words will appear as a testimonial on our homepage.
            </p>
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

        {/* Submit */}
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
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Review
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ExternalTenantReviews;
