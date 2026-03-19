// src/utils/mockProperties.ts

export const mockPropertiesResponse = {
  success: true,
  data: {
    pagination: {
      total: 6,
      pages: 1,
      current_page: 1,
      per_page: 10
    },
    properties: [
      {
        id: "prop_101",
        title: "Zahra Heights Apartment",
        description: "A beautifully presented modern apartment located in Zahra Heights on Menelik Road, Kilimani. Features stunning city views, premium finishes, and excellent natural light.",
        price: 18500000, // Adjusted price for realism in the area (can be KES or kept to your base currency)
        listing_type: "sale",
        property_type: "apartment",
        bedrooms: 3,
        bathrooms: 3,
        reception_rooms: 1,
        passport_rating: 9.0,
        status: "active",
        street: "Menelik Road, Kilimani",
        city: "Nairobi",
        county: "Nairobi County",
        postcode: "00505",
        coordinates: { lat: -1.296772, lng: 36.784169 }, // Exact coordinates for Menelik Rd, Kilimani
        primary_image_url: "https://images.unsplash.com/photo-1502672260266-1c1c2c49e5d9?auto=format&fit=crop&w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1502672260266-1c1c2c49e5d9?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"
        ],
        features: ["Balcony", "Gym", "24/7 Security", "Swimming Pool"]
      },
      {
        id: "prop_102",
        title: "Charming 4-Bed Family House",
        description: "Spacious family home featuring a large garden, driveway parking, and modern kitchen.",
        price: 850000,
        listing_type: "sale",
        property_type: "house",
        bedrooms: 4,
        bathrooms: 3,
        reception_rooms: 2,
        passport_rating: 9.2,
        status: "active",
        street: "45 Oakwood Drive",
        city: "Manchester",
        county: "Greater Manchester",
        postcode: "M20 2AA",
        // coordinates: { lat: 53.421, lng: -2.234 },
        primary_image_url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
        ],
        features: ["Large Garden", "Double Garage", "En-suite Master"]
      },
      {
        id: "prop_103",
        title: "Cozy Studio Flat for Rent",
        description: "Perfect for young professionals, this studio flat offers affordable living close to transport links.",
        price: 1200,
        listing_type: "rent",
        property_type: "flat",
        bedrooms: 1,
        bathrooms: 1,
        reception_rooms: 1,
        passport_rating: 6.5,
        status: "active",
        street: "78 Station Road",
        city: "Birmingham",
        county: "Greater Manchester", // Intentional for filter testing
        postcode: "B1 1AA",
        // coordinates: { lat: 52.4862, lng: -1.8904 },
        primary_image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
        images: [],
        features: ["Close to Station", "Fully Furnished", "Bills Included"]
      },
      {
        id: "prop_104",
        title: "Luxury 5-Bed Detached House",
        description: "An exceptional luxury property offering premium finishes throughout and a private swimming pool.",
        price: 1250000,
        listing_type: "sale",
        property_type: "house",
        bedrooms: 5,
        bathrooms: 4,
        reception_rooms: 3,
        passport_rating: 10.0,
        status: "active",
        street: "1 Millionaire Row",
        city: "Surrey",
        county: "Surrey",
        postcode: "GU1 1AA",
        // coordinates: { lat: 51.2362, lng: -0.5704 },
        primary_image_url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"
        ],
        features: ["Swimming Pool", "Gated Driveway", "Cinema Room"]
      },
      {
        id: "prop_105",
        title: "Spacious 3-Bed Maisonette",
        description: "A bright and airy 3-bedroom maisonette spread across two floors, recently renovated.",
        price: 2500,
        listing_type: "rent",
        property_type: "maisonette",
        bedrooms: 3,
        bathrooms: 2,
        reception_rooms: 1,
        passport_rating: 7.8,
        status: "active",
        street: "22 Maple Leaf Way",
        city: "Bristol",
        county: "West Midlands",
        postcode: "BS8 1TH",
        // coordinates: { lat: 51.4545, lng: -2.5879 },
        primary_image_url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
        images: [],
        features: ["Split Level", "Newly Renovated", "Pet Friendly"]
      },
      {
        id: "prop_106",
        title: "Quaint 2-Bed Bungalow",
        description: "A lovely single-story property situated in a peaceful neighborhood, ideal for retirees.",
        price: 280000,
        listing_type: "sale",
        property_type: "bungalow",
        bedrooms: 2,
        bathrooms: 1,
        reception_rooms: 1,
        passport_rating: 8.0,
        status: "active",
        street: "14 Willow Lane",
        city: "Leeds",
        county: "West Yorkshire",
        postcode: "LS1 2AB",
        // coordinates: { lat: 53.8008, lng: -1.5491 },
        primary_image_url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
        images: [],
        features: ["Single Story", "Quiet Location", "Conservatory"]
      }
    ]
  }
};