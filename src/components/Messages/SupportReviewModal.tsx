import { useState } from "react";
import { Star, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reviewsApi } from "@/services/reviewsApi";
import { toast } from "sonner";

interface SupportReviewModalProps {
  conversationSubject: string;
  onClose: () => void;
}

function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none"
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              star <= (hovered || value)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function SupportReviewModal({
  conversationSubject,
  onClose,
}: SupportReviewModalProps) {
  const [overallScore, setOverallScore] = useState(0);
  const [handlingScore, setHandlingScore] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (overallScore === 0) {
      toast.error("Please rate your overall experience");
      return;
    }
    setSubmitting(true);
    try {
      await reviewsApi.submitPlatformReview({
        overall_score: overallScore,
        review_text: reviewText.trim() || undefined,
        aspects: handlingScore > 0 ? { issue_handling: handlingScore } : undefined,
      });
      toast.success("Thank you for your feedback!");
      onClose();
    } catch {
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 mb-3">
            <Star className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Rate Your Experience</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Your support conversation has been resolved.
            <br />
            <span className="font-medium text-foreground/70">"{conversationSubject}"</span>
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Overall experience <span className="text-red-500">*</span>
            </label>
            <StarInput value={overallScore} onChange={setOverallScore} />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              How well was your issue handled?
            </label>
            <StarInput value={handlingScore} onChange={setHandlingScore} />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Comments <span className="text-muted-foreground text-xs">(optional)</span>
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={3}
              placeholder="Tell us about your experience..."
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={submitting}
            >
              Skip
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={submitting || overallScore === 0}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Submit Review
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
