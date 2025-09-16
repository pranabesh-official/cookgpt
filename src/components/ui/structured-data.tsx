import Script from 'next/script';

interface StructuredDataProps {
  type: 'organization' | 'website' | 'recipe' | 'cooking-app';
  data?: Record<string, unknown>;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    switch (type) {
      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "CookGPT",
          "url": "https://cookgpt.in",
          "logo": "https://cookgpt.in/cookitnext_logo.png",
          "description": "AI-powered recipe creation and meal planning platform that transforms your pantry into delicious meals",
          "foundingDate": "2024",
          "sameAs": [
            "https://twitter.com/cookgpt",
            "https://facebook.com/cookgpt",
            "https://instagram.com/cookgpt"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "email": "support@cookgpt.in"
          },
          "areaServed": "Worldwide",
          "serviceType": "AI Cooking Assistant",
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Cooking Services",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "AI Recipe Generation",
                  "description": "Create personalized recipes from available ingredients"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Meal Planning",
                  "description": "Intelligent meal planning with nutritional guidance"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Calorie Estimation",
                  "description": "Accurate nutritional information for recipes"
                }
              }
            ]
          }
        };

      case 'website':
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "CookGPT",
          "url": "https://cookgpt.in",
          "description": "AI-powered cooking assistant for recipe creation, meal planning, and food waste reduction",
          "publisher": {
            "@type": "Organization",
            "name": "CookGPT"
          },
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://cookgpt.in/search?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          },
          "mainEntity": {
            "@type": "SoftwareApplication",
            "name": "CookGPT",
            "applicationCategory": "Food & Drink",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "AI Recipe Generation",
              "Smart Meal Planning",
              "Calorie Estimation",
              "Pantry Management",
              "Food Waste Reduction",
              "Personalized Cooking Assistant"
            ]
          }
        };

      case 'cooking-app':
        return {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "CookGPT",
          "description": "AI-powered cooking assistant that helps you create recipes, plan meals, and reduce food waste",
          "url": "https://cookgpt.in",
          "applicationCategory": "Food & Drink",
          "operatingSystem": "Web Browser",
          "operatingSystemVersion": "All",
          "softwareVersion": "1.0.0",
          "releaseNotes": "Initial release with AI recipe generation and meal planning",
          "downloadUrl": "https://cookgpt.in",
          "installUrl": "https://cookgpt.in",
          "screenshot": "https://cookgpt.in/cookitnext_logo.png",
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "1250",
            "bestRating": "5",
            "worstRating": "1"
          },
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          },
          "featureList": [
            "AI-Powered Recipe Creation",
            "Intelligent Meal Planning",
            "Calorie and Nutrition Tracking",
            "Pantry to Meal Conversion",
            "Food Waste Reduction",
            "Personalized Cooking Guidance",
            "Recipe Optimization",
            "Meal Prep Scheduling"
          ],
          "author": {
            "@type": "Organization",
            "name": "CookGPT Team"
          },
          "publisher": {
            "@type": "Organization",
            "name": "CookGPT"
          }
        };

      default:
        return {};
    }
  };

  const structuredData = data || getStructuredData();

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}

export default StructuredData;
