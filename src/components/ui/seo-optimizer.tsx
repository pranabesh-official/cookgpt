import Head from 'next/head';
import Script from 'next/script';

interface SEOOptimizerProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'recipe' | 'cooking-app';
  structuredData?: Record<string, unknown>;
  noIndex?: boolean;
  children?: React.ReactNode;
}

export function SEOOptimizer({
  title = "CookGPT - AI-Powered Recipe Creation & Meal Planning",
  description = "Transform your pantry into delicious meals with AI-powered recipe creation, intelligent meal planning, and food waste reduction.",
  keywords = [
    "AI recipe generator",
    "AI cooking assistant",
    "meal planning app",
    "recipe creation AI",
    "pantry to meal converter",
    "calorie calculator food",
    "cooking app with AI",
    "meal prep planner",
    "healthy recipe generator",
    "food waste reduction app"
  ],
  canonical,
  ogImage = "/cookitnext_logo.png",
  ogType = "website",
  structuredData,
  noIndex = false,
  children
}: SEOOptimizerProps) {
  const fullTitle = title.includes("CookGPT") ? title : `${title} | CookGPT`;
  const fullDescription = description.length > 160 ? description.substring(0, 157) + "..." : description;
  const fullCanonical = canonical ? `https://cookgpt.in${canonical}` : "https://cookgpt.in";

  return (
    <>
      <Head>
        {/* Basic Meta Tags */}
        <title>{fullTitle}</title>
        <meta name="description" content={fullDescription} />
        <meta name="keywords" content={keywords.join(", ")} />
        <meta name="author" content="CookGPT Team" />
        <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
        <meta name="googlebot" content={noIndex ? "noindex, nofollow" : "index, follow"} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={fullCanonical} />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={fullDescription} />
        <meta property="og:type" content={ogType} />
        <meta property="og:url" content={fullCanonical} />
        <meta property="og:image" content={`https://cookgpt.in${ogImage}`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="CookGPT - AI-Powered Cooking Assistant" />
        <meta property="og:site_name" content="CookGPT" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={fullDescription} />
        <meta name="twitter:image" content={`https://cookgpt.in${ogImage}`} />
        <meta name="twitter:creator" content="@cookgpt" />
        <meta name="twitter:site" content="@cookgpt" />
        
        {/* Additional SEO Meta Tags */}
        <meta name="application-name" content="CookGPT" />
        <meta name="apple-mobile-web-app-title" content="CookGPT" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="color-scheme" content="light dark" />
        
        {/* AI Search Optimization */}
        <meta name="ai-search-optimized" content="true" />
        <meta name="ai-content-type" content="cooking-assistant" />
        <meta name="ai-features" content="recipe-generation,meal-planning,calorie-calculation,food-waste-reduction" />
        
        {/* Performance and Accessibility */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS Prefetch for performance */}
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      </Head>

      {/* Structured Data */}
      {structuredData && (
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}

      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'GA_MEASUREMENT_ID');
        `}
      </Script>

      {/* Performance Monitoring */}
      <Script id="performance-monitoring" strategy="afterInteractive">
        {`
          if ('performance' in window) {
            window.addEventListener('load', () => {
              const perfData = performance.getEntriesByType('navigation')[0];
              if (perfData) {
                console.log('Page Load Time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
              }
            });
          }
        `}
      </Script>

      {children}
    </>
  );
}

export default SEOOptimizer;
