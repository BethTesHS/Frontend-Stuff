
import { Link } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  image: string;
  slug: string;
}

// Enhanced articles mock data
const mockArticles: Article[] = [
  {
    id: 1,
    title: "2024 UK Property Market Analysis: What's Next?",
    excerpt: "Comprehensive analysis of the latest UK property market trends, interest rates, and predictions for the remainder of 2024.",
    author: "Sarah Johnson",
    date: "2024-07-20",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop",
    slug: "2024-uk-property-market-analysis"
  },
  {
    id: 2,
    title: "The Complete First-Time Buyer's Handbook",
    excerpt: "Navigate the property ladder with confidence. From mortgage applications to completion, everything first-time buyers need to know.",
    author: "Michael Thompson",
    date: "2024-07-15",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop",
    slug: "first-time-buyers-handbook"
  },
  {
    id: 3,
    title: "Property Investment in 2024: Strategies That Work",
    excerpt: "Discover proven investment strategies and emerging opportunities in the current property market landscape.",
    author: "David Wilson",
    date: "2024-07-10",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&auto=format&fit=crop",
    slug: "property-investment-strategies-2024"
  },
  {
    id: 4,
    title: "London vs Regional Markets: Where to Invest?",
    excerpt: "Comparing investment opportunities between London and regional UK property markets with data-driven insights.",
    author: "Emma Clarke",
    date: "2024-07-05",
    image: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=800&auto=format&fit=crop",
    slug: "london-vs-regional-markets"
  },
  {
    id: 5,
    title: "Sustainable Homes: The Future of Property",
    excerpt: "How eco-friendly features and energy efficiency are reshaping property values and buyer preferences.",
    author: "James Rodriguez",
    date: "2024-06-28",
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop",
    slug: "sustainable-homes-future-property"
  },
  {
    id: 6,
    title: "Rental Market Insights: Landlord's Guide 2024",
    excerpt: "Essential insights for landlords navigating new regulations, tax changes, and tenant expectations in 2024.",
    author: "Lisa Chen",
    date: "2024-06-20",
    image: "https://images.unsplash.com/photo-1448630360428-65456885c650?w=800&auto=format&fit=crop",
    slug: "rental-market-landlord-guide-2024"
  }
];

const Articles = () => {
  const articles = mockArticles;

  console.log('Articles component: Using dummy data:', articles);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Latest Articles
          </h2>
          <p className="text-xl text-gray-600">
            Stay informed with expert insights and market updates
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article: Article) => (
            <article key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img 
                src={article.image} 
                alt={article.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {article.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {article.excerpt}
                </p>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <User className="w-4 h-4 mr-1" />
                  <span className="mr-4">{article.author}</span>
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{new Date(article.date).toLocaleDateString()}</span>
                </div>
                <Link 
                  to={`/articles/${article.slug}`}
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Read More →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Articles;
