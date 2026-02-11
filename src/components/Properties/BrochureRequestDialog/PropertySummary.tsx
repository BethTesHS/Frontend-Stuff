
import React from 'react';
import { Property } from '@/types';

interface PropertySummaryProps {
  property: Property;
}

const PropertySummary = ({ property }: PropertySummaryProps) => {
  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <h4 className="font-medium text-sm text-gray-900">{property.title}</h4>
      <p className="text-sm text-gray-600">
        {property.address.street}, {property.address.city}
      </p>
      <p className="text-sm font-semibold text-primary-600">
        £{property.price.toLocaleString()}
        {property.listingType === 'rent' && '/month'}
      </p>
    </div>
  );
};

export default PropertySummary;
