
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown, Calendar } from 'lucide-react';
import { PropertyHistory } from '@/types';

interface PriceHistoryCardProps {
  propertyHistory: PropertyHistory[];
  currentPrice: number;
  address: string;
  listingType: 'sale' | 'rent';
}

const PriceHistoryCard = ({ propertyHistory, currentPrice, address, listingType }: PriceHistoryCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // Sort history by date and calculate changes
  const sortedHistory = [...propertyHistory].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const initialPrice = sortedHistory[0]?.price || currentPrice;
  const totalChange = currentPrice - initialPrice;
  const totalChangePercent = initialPrice ? ((totalChange / initialPrice) * 100) : 0;

  // Calculate time on market
  const listingDate = new Date(sortedHistory[0]?.date || new Date());
  const currentDate = new Date();
  const monthsOnMarket = Math.floor((currentDate.getTime() - listingDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

  // Prepare trend data for bars
  const trendData = [
    {
      date: 'Mar 1',
      price: initialPrice,
      change: 0,
      type: 'initial',
      label: 'Initial listing'
    },
    ...sortedHistory.slice(1).map((item, index) => {
      const prevPrice = index === 0 ? initialPrice : sortedHistory[index].price || 0;
      const change = (item.price || 0) - prevPrice;
      return {
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: item.price || 0,
        change,
        type: change > 0 ? 'increase' : 'decrease',
        label: item.details
      };
    }),
    {
      date: 'Today',
      price: currentPrice,
      change: sortedHistory.length > 0 ? currentPrice - (sortedHistory[sortedHistory.length - 1]?.price || currentPrice) : 0,
      type: 'current',
      label: 'Current price'
    }
  ];

  const maxPrice = Math.max(...trendData.map(d => d.price));

  const getBarColor = (type: string) => {
    switch (type) {
      case 'initial': return 'bg-gray-400';
      case 'decrease': return 'bg-red-500';
      case 'increase': return 'bg-green-500';
      case 'current': return 'bg-primary-600';
      default: return 'bg-gray-400';
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600 bg-green-50';
    if (change < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
        isHovered ? 'transform hover:scale-[1.02] hover:-rotate-1' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glass morphism background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm" />
      
      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-gray-900 mb-1">
              {address}
            </CardTitle>
            <p className="text-sm text-gray-600">Price history since listing</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              £{currentPrice.toLocaleString()}
              {listingType === 'rent' && <span className="text-sm font-normal text-gray-600">/month</span>}
            </div>
            <Badge 
              className={`mt-1 ${totalChange >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
            >
              {totalChange >= 0 ? '+' : ''}{totalChangePercent.toFixed(1)}%
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        {/* Visual Trend Bars */}
        <div className="mb-8">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Price Trend</h4>
          <div className="flex items-end justify-between space-x-2 h-32">
            {trendData.map((item, index) => {
              const height = (item.price / maxPrice) * 100;
              return (
                <div key={index} className="flex flex-col items-center space-y-2">
                  <div className="relative">
                    {/* Floating arrow animation for price changes */}
                    {item.change !== 0 && (
                      <div className={`absolute -top-8 left-1/2 transform -translate-x-1/2 animate-bounce ${
                        item.change > 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {item.change > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                      </div>
                    )}
                    
                    {/* Price bar */}
                    <div 
                      className={`w-12 rounded-t-lg transition-all duration-500 hover:scale-110 ${getBarColor(item.type)}`}
                      style={{ height: `${Math.max(height, 10)}px` }}
                    />
                  </div>
                  
                  {/* Date label */}
                  <div className="text-xs font-medium text-gray-600 text-center">
                    {item.date}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700">Timeline</h4>
          <div className="relative">
            {/* Dotted timeline connector */}
            <div className="absolute left-3 top-0 bottom-0 w-px border-l-2 border-dashed border-gray-300" />
            
            {/* Timeline events */}
            <div className="space-y-4">
              {[...trendData].reverse().map((item, index) => (
                <div key={index} className="relative flex items-center space-x-4">
                  {/* Colored dot */}
                  <div className={`w-6 h-6 rounded-full border-4 border-white shadow-lg z-10 ${
                    item.type === 'current' ? 'bg-primary-600' :
                    item.type === 'increase' ? 'bg-green-500' :
                    item.type === 'decrease' ? 'bg-red-500' : 'bg-gray-400'
                  }`} />
                  
                  {/* Event details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.label}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {item.date === 'Today' ? 'Today' : new Date(sortedHistory[trendData.length - 1 - index]?.date || new Date()).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          £{item.price.toLocaleString()}
                        </p>
                        {item.change !== 0 && (
                          <Badge 
                            variant="outline" 
                            className={getChangeColor(item.change)}
                          >
                            {item.change > 0 ? '+' : ''}£{Math.abs(item.change).toLocaleString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Summary */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Total time on market:</span> {monthsOnMarket} months
            </div>
            <div className={`flex items-center space-x-1 text-sm font-semibold ${
              totalChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>Net change: {totalChange >= 0 ? '+' : ''}£{Math.abs(totalChange).toLocaleString()} ({totalChangePercent >= 0 ? '+' : ''}{totalChangePercent.toFixed(1)}%)</span>
              {totalChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceHistoryCard;
