
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, User, ArrowLeft, ExternalLink, ArrowRight, Play, FileText, Video, Clock, Tag } from 'lucide-react';

const articleData = {
  "first-time-buyer-guide-uk": {
    title: "First-Time Buyer's Guide to the UK Property Market",
    author: "Sarah Johnson",
    date: "March 15, 2024",
    readTime: "5 min read",
    category: "Buying Guide",
    image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    content: `
      <p>Buying your first home in the UK can be an exciting yet daunting experience. With the right knowledge and preparation, you can navigate the property market successfully and secure your dream home. This comprehensive guide will walk you through every step of the process.</p>
      
      <h2>Understanding the UK Property Market</h2>
      <p>The UK property market varies significantly between regions. London and the Southeast typically have higher prices, while Northern England, Scotland, and Wales offer more affordable options. Research local market trends and property values in your desired area.</p>
      
      <p>Current market conditions show average house prices ranging from £180,000 in the North East to over £500,000 in London. Understanding these regional differences is crucial for setting realistic expectations and budgets.</p>
      
      <h2>Financial Preparation</h2>
      <p>Before you start house hunting, ensure your finances are in order:</p>
      <ul>
        <li><strong>Save for a deposit:</strong> Typically 5-20% of the property value (aim for 10% minimum for better rates)</li>
        <li><strong>Check your credit score:</strong> A good credit rating (700+) improves mortgage options significantly</li>
        <li><strong>Calculate affordability:</strong> Consider monthly payments, insurance, and maintenance costs</li>
        <li><strong>Get a mortgage agreement in principle:</strong> This shows sellers you're a serious buyer and can speed up the process</li>
        <li><strong>Budget for additional costs:</strong> Factor in stamp duty, legal fees, surveys, and moving expenses</li>
      </ul>
      
      <h2>Government Schemes for First-Time Buyers</h2>
      <p>The UK government offers several schemes to help first-time buyers:</p>
      <ul>
        <li><strong>Help to Buy:</strong> Government equity loan schemes</li>
        <li><strong>Shared Ownership:</strong> Buy a share of a property and pay rent on the rest</li>
        <li><strong>Right to Buy:</strong> For council tenants</li>
        <li><strong>First Homes Scheme:</strong> Discounted properties for local first-time buyers</li>
      </ul>
      
      <h2>The Buying Process</h2>
      <p>The typical UK property buying process involves several key steps:</p>
      <ol>
        <li><strong>Research and viewings:</strong> Find and view properties that meet your criteria</li>
        <li><strong>Make an offer:</strong> Submit a competitive but realistic offer</li>
        <li><strong>Instruct a solicitor:</strong> Essential for handling legal aspects</li>
        <li><strong>Arrange a mortgage:</strong> Finalize your mortgage application</li>
        <li><strong>Complete property surveys:</strong> Ensure the property is structurally sound</li>
        <li><strong>Exchange contracts:</strong> Legally binding commitment to purchase</li>
        <li><strong>Complete the purchase:</strong> Final payment and key handover</li>
      </ol>
      
      <h2>Property Surveys and Inspections</h2>
      <p>Never skip property surveys. Consider these options:</p>
      <ul>
        <li><strong>Basic Valuation:</strong> For lender purposes only</li>
        <li><strong>HomeBuyer Report:</strong> Suitable for conventional properties</li>
        <li><strong>Building Survey:</strong> Comprehensive inspection for older or unusual properties</li>
      </ul>
      
      <h2>Additional Costs to Consider</h2>
      <p>Beyond the property price and deposit, budget for:</p>
      <ul>
        <li><strong>Stamp duty:</strong> Varies by property value and location (first-time buyers get relief up to £425,000)</li>
        <li><strong>Solicitor fees:</strong> £500-£2,000 depending on complexity</li>
        <li><strong>Survey costs:</strong> £300-£1,500 depending on type</li>
        <li><strong>Moving costs:</strong> £400-£1,500 for professional movers</li>
        <li><strong>Home insurance:</strong> Buildings and contents insurance</li>
        <li><strong>Mortgage arrangement fees:</strong> Typically £1,000-£2,000</li>
      </ul>
      
      <h2>Tips for Success</h2>
      <ul>
        <li>Start saving early and maintain a good credit history</li>
        <li>Research areas thoroughly - visit at different times of day</li>
        <li>Don't rush - take time to find the right property</li>
        <li>Get pre-approved for a mortgage to strengthen your position</li>
        <li>Consider future needs - work, family, transport links</li>
        <li>Build a good relationship with estate agents</li>
        <li>Be prepared to act quickly in competitive markets</li>
      </ul>
    `,
    videos: [
      { title: "First-Time Buyer Mortgage Guide", url: "https://www.youtube.com/watch?v=mortgage-guide", platform: "YouTube" },
      { title: "Property Viewing Checklist", url: "https://www.youtube.com/watch?v=property-viewing", platform: "YouTube" },
      { title: "Understanding Stamp Duty", url: "https://www.bbc.co.uk/iplayer/episode/stamp-duty", platform: "BBC iPlayer" }
    ],
    relatedLinks: [
      { title: "Government First-Time Buyer Schemes", url: "https://www.gov.uk/first-time-buyer" },
      { title: "Rightmove First-Time Buyer Guide", url: "https://www.rightmove.co.uk/advice/first-time-buyer/" },
      { title: "Money Saving Expert Property Guide", url: "https://www.mse.com/mortgages/mortgage-guide" },
      { title: "Which? Home Buying Guide", url: "https://www.which.co.uk/money/mortgages-and-property/first-time-buyers" }
    ]
  },
  "top-10-areas-property-investment-2024": {
    title: "Top 10 Areas for Property Investment in 2024",
    author: "Michael Chen",
    date: "March 12, 2024",
    readTime: "8 min read",
    category: "Investment",
    image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1964&q=80",
    content: `
      <p>Property investment in 2024 presents unique opportunities across the UK. With careful analysis of market trends, infrastructure developments, and economic factors, investors can identify areas with strong growth potential and excellent rental yields.</p>
      
      <h2>Key Investment Factors for 2024</h2>
      <p>When evaluating investment opportunities, consider these crucial factors:</p>
      <ul>
        <li><strong>Transport links and infrastructure improvements:</strong> HS2, Crossrail, and other major projects</li>
        <li><strong>Local employment opportunities:</strong> Tech hubs, financial districts, and emerging industries</li>
        <li><strong>Rental yield potential:</strong> Target 5%+ gross yields in most areas</li>
        <li><strong>Capital appreciation prospects:</strong> Look for 3-7% annual growth potential</li>
        <li><strong>Government regeneration schemes:</strong> Levelling Up Fund and other initiatives</li>
        <li><strong>University presence:</strong> Student accommodation demand</li>
        <li><strong>Population growth:</strong> Areas experiencing demographic expansion</li>
      </ul>
      
      <h2>Top Investment Areas</h2>
      
      <h3>1. Manchester - The Northern Powerhouse</h3>
      <p>Manchester continues to attract investors with its thriving tech sector, excellent transport links, and ongoing regeneration projects. Average rental yields of 5-7% make it attractive for buy-to-let investors. Key areas include:</p>
      <ul>
        <li>City Center - High-rise apartments with strong rental demand</li>
        <li>Salford Quays - Media City developments</li>
        <li>Ancoats - Emerging trendy district</li>
      </ul>
      
      <h3>2. Birmingham - HS2 Benefits</h3>
      <p>With HS2 developments and major city center regeneration, Birmingham offers strong growth potential. The diverse economy and large student population provide steady rental demand. Investment hotspots:</p>
      <ul>
        <li>Jewellery Quarter - Historic charm with modern appeal</li>
        <li>Digbeth - Creative quarter with regeneration plans</li>
        <li>Edgbaston - Near University of Birmingham</li>
      </ul>
      
      <h3>3. Leeds - Financial Hub Growth</h3>
      <p>Leeds combines affordability with strong rental demand from professionals and students. The city's financial district continues to expand, driving property values. Key locations:</p>
      <ul>
        <li>City Center - New build apartments</li>
        <li>Chapel Allerton - Family homes</li>
        <li>Headingley - Student accommodation</li>
      </ul>
      
      <h3>4. Liverpool - Waterfront Renaissance</h3>
      <p>Liverpool's waterfront regeneration and cultural attractions make it increasingly popular. Property prices remain relatively affordable with good rental yields of 6-8%.</p>
      
      <h3>5. Newcastle - Tech Sector Growth</h3>
      <p>Newcastle offers excellent value for money with strong rental yields of 7-9%. The city's tech sector growth and student population provide stable investment opportunities.</p>
      
      <h3>6. Nottingham - Central Location Advantage</h3>
      <p>Nottingham's central UK location and two major universities create consistent rental demand. The city offers balanced investment opportunities with yields around 6-7%.</p>
      
      <h3>7. Sheffield - Industrial Heritage Reimagined</h3>
      <p>Sheffield's transformation from industrial city to modern hub offers great value investments. Strong student population and growing tech sector support rental demand.</p>
      
      <h3>8. Cardiff - Welsh Capital Growth</h3>
      <p>Cardiff combines affordability with steady growth. The city's status as Welsh capital and major university presence create stable investment conditions.</p>
      
      <h3>9. Coventry - Regeneration Focus</h3>
      <p>Coventry's regeneration following its City of Culture status and proximity to Birmingham make it an emerging investment hotspot with high yield potential.</p>
      
      <h3>10. Hull - Hidden Gem</h3>
      <p>Hull offers some of the highest rental yields in the UK (8-10%) combined with ongoing regeneration efforts and improved transport links.</p>
      
      <h2>Investment Strategies for 2024</h2>
      <p>Consider these approaches:</p>
      <ul>
        <li><strong>Buy-to-let:</strong> Target areas with strong rental demand and yield potential</li>
        <li><strong>Capital growth focus:</strong> Regeneration areas with development potential</li>
        <li><strong>HMOs:</strong> House in Multiple Occupation in university towns</li>
        <li><strong>Commercial to residential:</strong> Converting commercial properties in city centers</li>
        <li><strong>New build investments:</strong> Off-plan purchases in growth areas</li>
        <li><strong>Portfolio diversification:</strong> Spread risk across multiple locations</li>
      </ul>
      
      <h2>Market Trends to Watch</h2>
      <ul>
        <li>Remote working impact on location preferences</li>
        <li>Sustainability and energy efficiency requirements</li>
        <li>Build-to-rent sector growth</li>
        <li>Student accommodation evolution</li>
        <li>Co-living and flexible accommodation demand</li>
      </ul>
    `,
    videos: [
      { title: "UK Property Investment in 2024", url: "https://www.youtube.com/watch?v=property-investment-2024", platform: "YouTube" },
      { title: "Buy-to-Let Strategy Guide", url: "https://www.youtube.com/watch?v=buy-to-let-guide", platform: "YouTube" },
      { title: "Property Investment Tax Guide", url: "https://www.youtube.com/watch?v=property-tax-guide", platform: "YouTube" }
    ],
    relatedLinks: [
      { title: "Property Investment Analysis", url: "https://www.propertyhub.net/" },
      { title: "UK Property Investment Guide", url: "https://www.propertyinvestortoday.co.uk/" },
      { title: "Government Property Investment Rules", url: "https://www.gov.uk/guidance/property-investment" },
      { title: "Rightmove Investment Analysis", url: "https://www.rightmove.co.uk/news/property-investment/" }
    ]
  },
  "understanding-home-passport-ratings": {
    title: "Understanding Home Passport™ Ratings",
    author: "Emma Wilson",
    date: "March 10, 2024",
    readTime: "4 min read",
    category: "Features",
    image: "https://images.unsplash.com/photo-1496307653780-42ee777d4833?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
    content: `
      <p>Our revolutionary Home Passport™ system provides comprehensive property ratings that help buyers, sellers, and investors make informed decisions. This innovative tool combines multiple data sources to create a complete picture of any property, going far beyond traditional valuations.</p>
      
      <h2>What is Home Passport™?</h2>
      <p>Home Passport™ is a comprehensive property rating system that evaluates homes across multiple criteria, providing an overall score from 1-10. This rating helps you understand a property's true value beyond just the asking price, incorporating factors that traditional valuations often miss.</p>
      
      <p>The system uses advanced algorithms, local data analysis, and expert insights to provide a holistic view of each property's strengths and potential challenges.</p>
      
      <h2>Rating Categories Explained</h2>
      
      <h3>Location Score (25% weighting)</h3>
      <p>Evaluates the desirability of the property's location based on:</p>
      <ul>
        <li><strong>Transport connectivity:</strong> Proximity to stations, bus routes, major roads</li>
        <li><strong>Local amenities:</strong> Schools (Ofsted ratings), shops, restaurants, healthcare</li>
        <li><strong>Crime statistics:</strong> Safety levels and crime trends</li>
        <li><strong>Environmental factors:</strong> Air quality, noise levels, flood risk</li>
        <li><strong>Future development plans:</strong> Planned infrastructure and regeneration projects</li>
        <li><strong>Neighborhood demographics:</strong> Age profiles, income levels, community stability</li>
      </ul>
      
      <h3>Property Condition (30% weighting)</h3>
      <p>Assesses the physical state and quality of the property:</p>
      <ul>
        <li><strong>Structural integrity:</strong> Foundation, roof, walls condition</li>
        <li><strong>Age and maintenance history:</strong> Building age, recent improvements</li>
        <li><strong>Energy efficiency rating:</strong> EPC rating and potential improvements</li>
        <li><strong>Modern fixtures and fittings:</strong> Kitchen, bathroom, heating system quality</li>
        <li><strong>Garden and outdoor space:</strong> Size, condition, and potential</li>
        <li><strong>Parking and storage:</strong> Availability and type of parking</li>
      </ul>
      
      <h3>Investment Potential (25% weighting)</h3>
      <p>Analyzes the property's financial prospects:</p>
      <ul>
        <li><strong>Historical price trends:</strong> 5-year price movement analysis</li>
        <li><strong>Rental yield potential:</strong> Expected rental income vs purchase price</li>
        <li><strong>Market demand indicators:</strong> Time on market, viewing numbers</li>
        <li><strong>Local economic factors:</strong> Employment levels, business growth</li>
        <li><strong>Development pipeline impact:</strong> How future developments might affect value</li>
        <li><strong>Comparable sales analysis:</strong> Recent sales in the area</li>
      </ul>
      
      <h3>Lifestyle Factors (20% weighting)</h3>
      <p>Considers quality of life aspects:</p>
      <ul>
        <li><strong>Noise levels and pollution:</strong> Traffic, industrial, aircraft noise</li>
        <li><strong>Green space access:</strong> Parks, nature reserves, walking routes</li>
        <li><strong>Community facilities:</strong> Libraries, sports centers, community centers</li>
        <li><strong>Cultural and recreational opportunities:</strong> Theaters, museums, restaurants</li>
        <li><strong>Neighborhood character:</strong> Architectural style, community feel</li>
        <li><strong>Family-friendly features:</strong> Playgrounds, schools, family services</li>
      </ul>
      
      <h2>How to Use Home Passport™ Ratings</h2>
      <p>Maximize the value of these ratings by:</p>
      <ul>
        <li><strong>Objective comparison:</strong> Compare properties on like-for-like basis</li>
        <li><strong>Identifying opportunities:</strong> Find undervalued properties with high potential</li>
        <li><strong>Risk assessment:</strong> Understand potential issues before viewing</li>
        <li><strong>Negotiation tool:</strong> Use data to support price negotiations</li>
        <li><strong>Investment decisions:</strong> Make confident choices based on comprehensive data</li>
        <li><strong>Future planning:</strong> Understand long-term prospects</li>
      </ul>
      
      <h2>Rating Scale Breakdown</h2>
      <ul>
        <li><strong>9-10 (Exceptional):</strong> Premium properties in prime locations with excellent potential</li>
        <li><strong>7-8 (Excellent):</strong> High-quality properties with strong investment prospects</li>
        <li><strong>5-6 (Good):</strong> Solid properties with some considerations or improvement potential</li>
        <li><strong>3-4 (Fair):</strong> Properties requiring attention or in challenging locations</li>
        <li><strong>1-2 (Poor):</strong> Properties with significant issues or very poor locations</li>
      </ul>
      
      <h2>Data Sources and Methodology</h2>
      <p>Home Passport™ ratings are compiled using:</p>
      <ul>
        <li>Official government databases and statistics</li>
        <li>Local authority planning and development data</li>
        <li>Real-time market analysis and trends</li>
        <li>Professional property surveys and assessments</li>
        <li>Community feedback and local knowledge</li>
        <li>Environmental and infrastructure monitoring</li>
      </ul>
      
      <h2>Regular Updates</h2>
      <p>Ratings are updated regularly to reflect:</p>
      <ul>
        <li>Market condition changes</li>
        <li>New infrastructure developments</li>
        <li>Environmental factor updates</li>
        <li>Local area improvements or challenges</li>
        <li>Economic indicator changes</li>
      </ul>
    `,
    videos: [
      { title: "How Property Valuations Work", url: "https://www.youtube.com/watch?v=property-valuations", platform: "YouTube" },
      { title: "Understanding Property Reports", url: "https://www.youtube.com/watch?v=property-reports", platform: "YouTube" },
      { title: "Property Investment Analysis", url: "https://www.bbc.co.uk/iplayer/episode/property-analysis", platform: "BBC iPlayer" }
    ],
    relatedLinks: [
      { title: "Property Valuation Methods", url: "https://www.rics.org/uk/knowledge/factsheets/property-valuation/" },
      { title: "Understanding Property Reports", url: "https://www.homebuying.co.uk/property-reports/" },
      { title: "Property Investment Analysis Tools", url: "https://www.propertydata.co.uk/" },
      { title: "Government Property Data", url: "https://www.gov.uk/government/collections/property-data" }
    ]
  }
};

const relatedArticles = [
  {
    title: "How to Choose the Right Mortgage",
    slug: "choose-right-mortgage",
    category: "Finance",
    readTime: "6 min read"
  },
  {
    title: "Property Market Trends 2024",
    slug: "property-market-trends-2024",
    category: "Market Analysis",
    readTime: "7 min read"
  },
  {
    title: "Selling Your Home: A Complete Guide",
    slug: "selling-home-complete-guide",
    category: "Selling Guide",
    readTime: "9 min read"
  }
];

const Article = () => {
  const { slug } = useParams();
  const article = slug ? articleData[slug as keyof typeof articleData] : null;

  if (!article) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-xl text-gray-600 mb-8">The article you're looking for doesn't exist.</p>
          <Link to="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            {/* Back button */}
            <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-8 transition-colors group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>

            {/* Article header */}
            <header className="mb-12 max-w-4xl mx-auto">
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                    <Tag className="w-4 h-4 inline mr-1" />
                    {article.category}
                  </span>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.readTime}
                  </span>
                </div>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
                {article.title}
              </h1>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 text-gray-600 mb-8 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 block">{article.author}</span>
                    <span className="text-sm text-gray-500">Author</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">{article.date}</span>
                </div>
              </div>
              
              <div className="relative overflow-hidden rounded-2xl shadow-2xl mb-8">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-64 sm:h-80 md:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </header>

            {/* Article content */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 md:p-12 mb-12 max-w-4xl mx-auto">
              <div className="prose prose-sm sm:prose-base lg:prose-lg prose-gray max-w-none
                prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:font-bold prose-h2:text-gray-900 prose-h2:mt-6 sm:prose-h2:mt-8 prose-h2:mb-3 sm:prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-200
                prose-h3:text-lg sm:prose-h3:text-xl prose-h3:font-semibold prose-h3:text-gray-800 prose-h3:mt-4 sm:prose-h3:mt-6 prose-h3:mb-2 sm:prose-h3:mb-3
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-3 sm:prose-p:mb-4
                prose-ul:space-y-1 sm:prose-ul:space-y-2 prose-ul:mb-4 sm:prose-ul:mb-6
                prose-li:text-gray-700
                prose-strong:text-gray-900 prose-strong:font-semibold
                prose-ol:space-y-1 sm:prose-ol:space-y-2 prose-ol:mb-4 sm:prose-ol:mb-6">
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              </div>
            </div>

            {/* Video resources */}
            {article.videos && article.videos.length > 0 && (
              <div className="mb-12 max-w-6xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Video className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                    </div>
                    <span className="leading-tight">Video Resources</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {article.videos.map((video, index) => (
                      <a
                        key={index}
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col p-4 sm:p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl hover:from-red-100 hover:to-orange-100 transition-all duration-300 border border-red-100 hover:border-red-200 hover:shadow-md h-full"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 mb-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors flex-shrink-0">
                            <Play className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                          </div>
                          <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-red-500 transition-colors flex-shrink-0 ml-auto" />
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold text-gray-900 block group-hover:text-red-700 transition-colors text-sm sm:text-base leading-tight mb-2">{video.title}</span>
                          <span className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                            <Video className="w-3 h-3" />
                            {video.platform}
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Related links */}
            <div className="mb-12 max-w-6xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <span className="leading-tight">Useful Resources & Further Reading</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {article.relatedLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-4 sm:p-6 bg-gray-50 rounded-xl hover:bg-blue-50 transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:shadow-md"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0">
                          <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        </div>
                        <span className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors text-sm sm:text-base leading-tight min-w-0">{link.title}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-blue-500 transition-colors group-hover:translate-x-1 flex-shrink-0 ml-2" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Related articles */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 max-w-6xl mx-auto">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
                </div>
                <span className="leading-tight">Related Articles</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                {relatedArticles.map((relatedArticle, index) => (
                  <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md bg-gradient-to-br from-white to-gray-50 h-full group">
                    <CardContent className="p-6 h-full flex flex-col">
                      <div className="mb-4">
                        <span className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold inline-block">
                          {relatedArticle.category}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-3 leading-tight flex-grow group-hover:text-primary-700 transition-colors">
                        {relatedArticle.title}
                      </h4>
                      <p className="text-gray-600 text-sm mb-6 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {relatedArticle.readTime}
                      </p>
                      <Button variant="ghost" className="p-0 h-auto hover:bg-transparent group/btn w-full justify-start mt-auto">
                        <span className="text-primary-600 font-semibold text-sm group-hover:text-primary-700 transition-colors">Read More</span>
                        <ArrowRight className="w-4 h-4 ml-2 text-primary-600 group-hover/btn:translate-x-1 group-hover:text-primary-700 transition-all duration-300" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Article;
