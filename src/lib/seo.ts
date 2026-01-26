/**
 * SEO Utilities and Structured Data Generators
 * Mobile Autoworks NZ
 */

// Business information - single source of truth
export const BUSINESS_INFO = {
  name: "Mobile Autoworks NZ",
  legalName: "Mobile Autoworks NZ Ltd",
  description: "Professional mobile mechanic services in Auckland. We come to your home or workplace for car diagnostics, repairs, servicing, and pre-purchase inspections.",
  url: "https://www.mobileautoworksnz.com",
  telephone: "+64-27-642-1824",
  telephoneDisplay: "027 642 1824",
  email: "chris@mobileautoworksnz.com",
  founder: "Chris",
  foundingDate: "2020",
  address: {
    streetAddress: "",
    addressLocality: "Auckland",
    addressRegion: "Auckland",
    postalCode: "",
    addressCountry: "NZ",
  },
  geo: {
    latitude: -36.8509,
    longitude: 174.7645,
  },
  priceRange: "$140-$500",
  currencyAccepted: "NZD",
  paymentAccepted: ["Cash", "Credit Card", "EFTPOS", "Bank Transfer", "Afterpay"],
  openingHours: {
    weekdays: { opens: "09:00", closes: "17:00" },
    weekends: "By appointment",
  },
  socialProfiles: [
    "https://www.facebook.com/mobileautoworksnz",
  ],
  serviceAreas: [
    "Auckland",
    "West Auckland",
    "Henderson",
    "Massey",
    "Te Atatū",
    "Hobsonville",
    "Whenuapai",
    "Kumeu",
    "Huapai",
    "North Shore",
    "Takapuna",
    "Albany",
    "Browns Bay",
  ],
  keywords: [
    "mobile mechanic auckland",
    "mobile car diagnostic auckland",
    "pre purchase car inspection auckland",
    "car won't start auckland",
    "mobile auto repair west auckland",
    "on-site mechanic henderson",
    "vehicle inspection before buying nz",
  ],
};

// Service definitions with SEO data
export const SERVICES = {
  mobileDiagnostic: {
    id: "mobile-diagnostic",
    name: "Mobile Car Diagnostic",
    shortName: "Diagnostics",
    description: "Professional mobile vehicle diagnostic service. We come to your location with professional scan tools to diagnose check engine lights, warning lights, and vehicle faults.",
    price: 140,
    currency: "NZD",
    duration: "PT90M",
    durationText: "60-90 minutes",
    keywords: ["mobile car diagnostic auckland", "check engine light auckland", "car won't start", "vehicle scan"],
    url: "/mobile-diagnostic-auckland",
  },
  prePurchaseInspection: {
    id: "pre-purchase-inspection",
    name: "Pre-Purchase Car Inspection",
    shortName: "Pre-Purchase Inspection",
    description: "Comprehensive mobile pre-purchase vehicle inspection. We inspect used cars at the seller's location before you buy, checking mechanical condition, safety, and identifying hidden problems.",
    price: 180,
    currency: "NZD",
    duration: "PT120M",
    durationText: "90-120 minutes",
    keywords: ["pre purchase car inspection auckland", "used car check", "vehicle inspection before buying"],
    url: "/pre-purchase-inspection-auckland",
  },
  carServicing: {
    id: "car-servicing",
    name: "Mobile Car Servicing",
    shortName: "Car Servicing",
    description: "Full car servicing at your home or workplace. Oil change, filter replacement, fluid top-ups, and comprehensive vehicle check.",
    price: 250,
    currency: "NZD",
    duration: "PT120M",
    durationText: "90-120 minutes",
    keywords: ["mobile car service auckland", "oil change at home", "car servicing west auckland"],
    url: "/services/car-servicing",
  },
  brakeRepairs: {
    id: "brake-repairs",
    name: "Mobile Brake Repairs",
    shortName: "Brake Repairs",
    description: "Professional brake pad replacement, rotor machining, and brake system repairs at your location.",
    price: 200,
    currency: "NZD",
    duration: "PT150M",
    durationText: "2-3 hours",
    keywords: ["mobile brake repair auckland", "brake pads replacement", "brake service west auckland"],
    url: "/services/brake-repairs",
  },
  wofRepairs: {
    id: "wof-repairs",
    name: "WOF Repair Service",
    shortName: "WOF Repairs",
    description: "Failed your WOF? We come to you to fix common WOF failures including lights, wipers, suspension, and brakes.",
    price: 150,
    currency: "NZD",
    duration: "PT120M",
    durationText: "1-3 hours",
    keywords: ["wof repairs auckland", "failed wof fix", "warrant of fitness repairs"],
    url: "/services/wof-repairs",
  },
};

/**
 * Generate LocalBusiness structured data
 */
export function generateLocalBusinessSchema() {
  return {
    "@type": "LocalBusiness",
    "@id": `${BUSINESS_INFO.url}/#business`,
    "name": BUSINESS_INFO.name,
    "description": BUSINESS_INFO.description,
    "url": BUSINESS_INFO.url,
    "telephone": BUSINESS_INFO.telephone,
    "email": BUSINESS_INFO.email,
    "founder": {
      "@type": "Person",
      "name": BUSINESS_INFO.founder,
    },
    "foundingDate": BUSINESS_INFO.foundingDate,
    "address": {
      "@type": "PostalAddress",
      ...BUSINESS_INFO.address,
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": BUSINESS_INFO.geo.latitude,
      "longitude": BUSINESS_INFO.geo.longitude,
    },
    "areaServed": BUSINESS_INFO.serviceAreas.map(area => ({
      "@type": "City",
      "name": area,
    })),
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": BUSINESS_INFO.openingHours.weekdays.opens,
        "closes": BUSINESS_INFO.openingHours.weekdays.closes,
      },
    ],
    "priceRange": BUSINESS_INFO.priceRange,
    "currenciesAccepted": BUSINESS_INFO.currencyAccepted,
    "paymentAccepted": BUSINESS_INFO.paymentAccepted.join(", "),
    "image": `${BUSINESS_INFO.url}/logo.png`,
    "sameAs": BUSINESS_INFO.socialProfiles,
  };
}

/**
 * Generate Service structured data
 */
export function generateServiceSchema(service: typeof SERVICES.mobileDiagnostic) {
  return {
    "@type": "Service",
    "@id": `${BUSINESS_INFO.url}${service.url}#service`,
    "name": service.name,
    "description": service.description,
    "provider": { "@id": `${BUSINESS_INFO.url}/#business` },
    "areaServed": { "@type": "City", "name": "Auckland" },
    "serviceType": service.name,
    "offers": {
      "@type": "Offer",
      "price": service.price.toString(),
      "priceCurrency": service.currency,
      "availability": "https://schema.org/InStock",
    },
  };
}

/**
 * Generate FAQ structured data
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };
}

/**
 * Generate Breadcrumb structured data
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith("http") ? item.url : `${BUSINESS_INFO.url}${item.url}`,
    })),
  };
}

/**
 * Generate Review/AggregateRating structured data
 */
export function generateAggregateRatingSchema(rating: number, reviewCount: number) {
  return {
    "@type": "AggregateRating",
    "ratingValue": rating.toString(),
    "bestRating": "5",
    "worstRating": "1",
    "reviewCount": reviewCount.toString(),
  };
}

/**
 * Generate complete page structured data
 */
export function generatePageSchema(options: {
  service?: typeof SERVICES.mobileDiagnostic;
  faqs?: Array<{ question: string; answer: string }>;
  breadcrumbs?: Array<{ name: string; url: string }>;
  includeRating?: boolean;
  rating?: number;
  reviewCount?: number;
}) {
  const graph: any[] = [generateLocalBusinessSchema()];

  if (options.service) {
    graph.push(generateServiceSchema(options.service));
  }

  if (options.faqs && options.faqs.length > 0) {
    graph.push(generateFAQSchema(options.faqs));
  }

  if (options.breadcrumbs && options.breadcrumbs.length > 0) {
    graph.push(generateBreadcrumbSchema(options.breadcrumbs));
  }

  if (options.includeRating && options.rating && options.reviewCount) {
    const business = graph[0];
    business.aggregateRating = generateAggregateRatingSchema(options.rating, options.reviewCount);
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

/**
 * Generate meta tags for a page
 */
export function generateMetaTags(options: {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl: string;
  ogImage?: string;
  ogType?: string;
}) {
  const fullTitle = options.title.includes("Mobile Autoworks") 
    ? options.title 
    : `${options.title} | Mobile Autoworks NZ`;

  return {
    title: fullTitle,
    description: options.description,
    keywords: options.keywords?.join(", ") || BUSINESS_INFO.keywords.join(", "),
    canonical: options.canonicalUrl.startsWith("http") 
      ? options.canonicalUrl 
      : `${BUSINESS_INFO.url}${options.canonicalUrl}`,
    og: {
      title: fullTitle,
      description: options.description,
      url: options.canonicalUrl.startsWith("http") 
        ? options.canonicalUrl 
        : `${BUSINESS_INFO.url}${options.canonicalUrl}`,
      type: options.ogType || "website",
      locale: "en_NZ",
      siteName: BUSINESS_INFO.name,
      image: options.ogImage || `${BUSINESS_INFO.url}/og-image.png`,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: options.description,
    },
  };
}
