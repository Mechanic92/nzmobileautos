/**
 * SEO Head Component
 * Reusable component for page meta tags and structured data
 */

import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl: string;
  ogImage?: string;
  ogType?: string;
  structuredData?: object;
  noIndex?: boolean;
}

export default function SEOHead({
  title,
  description,
  keywords = [],
  canonicalUrl,
  ogImage = "https://www.mobileautoworksnz.com/og-image.png",
  ogType = "website",
  structuredData,
  noIndex = false,
}: SEOHeadProps) {
  const baseUrl = "https://www.mobileautoworksnz.com";
  const fullUrl = canonicalUrl.startsWith("http") ? canonicalUrl : `${baseUrl}${canonicalUrl}`;
  const fullTitle = title.includes("Mobile Autoworks") ? title : `${title} | Mobile Autoworks NZ`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(", ")} />}
      <link rel="canonical" href={fullUrl} />
      
      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="en_NZ" />
      <meta property="og:site_name" content="Mobile Autoworks NZ" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Geographic */}
      <meta name="geo.region" content="NZ-AUK" />
      <meta name="geo.placename" content="Auckland" />
      <meta name="geo.position" content="-36.8509;174.7645" />
      <meta name="ICBM" content="-36.8509, 174.7645" />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
