import { useEffect, useState } from 'react';
import { Star, Quote } from 'lucide-react';
import { reviewsApi, type PlatformReview } from '@/services/reviewsApi';

// ── Fallback static testimonials shown while loading or when no reviews exist ─
const STATIC_TESTIMONIALS = [
  {
    name: 'Sarah M.',
    role: 'London Tenant',
    initials: 'SM',
    text: 'The team helped us find our dream home in London. Their knowledge of the local market is unparalleled.',
    rating: 5,
  },
  {
    name: 'Thomas R.',
    role: 'Manchester Tenant',
    initials: 'TR',
    text: 'Our home was arranged quickly thanks to their excellent service and professional approach.',
    rating: 5,
  },
  {
    name: 'Jessica C.',
    role: 'Birmingham Tenant',
    initials: 'JC',
    text: 'The entire process was seamless. From search to move-in, the team was with us every step.',
    rating: 5,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
};

// Abbreviate full name to "First L." for privacy
const abbreviateName = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  return parts[0];
};

const StarRow = ({ score }: { score: number }) => (
  <div className="flex gap-0.5 mb-4">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        className={`w-4 h-4 ${n <= score ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
      />
    ))}
  </div>
);

// ── Card component ────────────────────────────────────────────────────────────
const TestimonialCard = ({
  initials,
  name,
  role,
  text,
  rating,
}: {
  initials: string;
  name: string;
  role: string;
  text: string;
  rating: number;
}) => (
  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col h-full relative">
    <Quote className="absolute top-5 right-5 w-6 h-6 text-gray-200" />
    <StarRow score={rating} />
    <p className="italic text-gray-700 flex-1 mb-6 leading-relaxed text-sm">&ldquo;{text}&rdquo;</p>
    <div className="flex items-center gap-3">
      <div className="bg-blue-100 text-blue-900 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
        <span className="font-bold text-sm">{initials}</span>
      </div>
      <div>
        <p className="font-bold text-gray-900 text-sm">{name}</p>
        <p className="text-xs text-gray-500">{role}</p>
      </div>
    </div>
  </div>
);

// ── Main section ──────────────────────────────────────────────────────────────
const Testimonials = () => {
  const [reviews, setReviews] = useState<PlatformReview[]>([]);
  const [avgScore, setAvgScore] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    reviewsApi
      .getPublicPlatformReviews(1, 6)
      .then((res) => {
        if (res.data?.ratings?.length) {
          setReviews(res.data.ratings.filter((r) => r.review_text));
          setAvgScore(res.data.average_score);
          setTotalCount(res.data.total_ratings);
        }
      })
      .catch(() => {
        // Silently fall back to static testimonials
      })
      .finally(() => setLoaded(true));
  }, []);

  // Use real reviews if available, otherwise fall back to static
  const showReal = loaded && reviews.length >= 1;

  const cards = showReal
    ? reviews.slice(0, 6).map((r) => ({
        initials: getInitials(r.reviewer_name || 'Anonymous'),
        name: abbreviateName(r.reviewer_name || 'Anonymous'),
        role: 'Homed Tenant',
        text: r.review_text!,
        rating: r.overall_score,
      }))
    : STATIC_TESTIMONIALS;

  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-blue-900 mb-3">
            What Our Tenants Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-4">
            Real reviews from tenants who use the Homed platform every day.
          </p>

          {/* Live stats row — only shown when we have real data */}
          {showReal && avgScore !== null && totalCount !== null && (
            <div className="inline-flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-full px-5 py-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`w-4 h-4 ${
                      n <= Math.round(avgScore)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-800">
                {avgScore.toFixed(1)} / 5
              </span>
              <span className="text-sm text-gray-500">
                from {totalCount} {totalCount === 1 ? 'review' : 'reviews'}
              </span>
            </div>
          )}
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <TestimonialCard key={i} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
