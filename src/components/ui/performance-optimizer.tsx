import { useEffect, useRef } from 'react';
import Script from 'next/script';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
  enableAnalytics?: boolean;
  enablePerformanceMonitoring?: boolean;
  enableLazyLoading?: boolean;
}

export function PerformanceOptimizer({
  children,
  enableAnalytics = true,
  enablePerformanceMonitoring = true,
  enableLazyLoading = true
}: PerformanceOptimizerProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Performance monitoring
    if (enablePerformanceMonitoring && typeof window !== 'undefined') {
      // Core Web Vitals monitoring
      if ('web-vital' in window) {
        import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
          getCLS(console.log);
          getFID(console.log);
          getFCP(console.log);
          getLCP(console.log);
          getTTFB(console.log);
        });
      }

      // Custom performance metrics
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            console.log('Page Load Performance:', {
              DNS: navEntry.domainLookupEnd - navEntry.domainLookupStart,
              TCP: navEntry.connectEnd - navEntry.connectStart,
              TTFB: navEntry.responseStart - navEntry.requestStart,
              DOMContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              Load: navEntry.loadEventEnd - navEntry.loadEventStart,
              Total: navEntry.loadEventEnd - navEntry.fetchStart
            });
          }
        }
      });

      observer.observe({ entryTypes: ['navigation'] });

      return () => observer.disconnect();
    }
  }, [enablePerformanceMonitoring]);

  useEffect(() => {
    // Lazy loading implementation
    if (enableLazyLoading && typeof window !== 'undefined') {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const target = entry.target as HTMLElement;
              
              // Lazy load images
              if (target.tagName === 'IMG') {
                const img = target as HTMLImageElement;
                if (img.dataset.src) {
                  img.src = img.dataset.src;
                  img.classList.remove('lazy');
                  observerRef.current?.unobserve(img);
                }
              }

              // Lazy load background images
              if (target.dataset.bgImage) {
                target.style.backgroundImage = `url(${target.dataset.bgImage})`;
                target.classList.remove('lazy-bg');
                observerRef.current?.unobserve(target);
              }
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01
        }
      );

      // Observe lazy elements
      const lazyElements = document.querySelectorAll('.lazy, .lazy-bg');
      lazyElements.forEach((el) => observerRef.current?.observe(el));

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }
  }, [enableLazyLoading]);

  // Preload critical resources
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Preload critical CSS
      const criticalCSS = document.createElement('link');
      criticalCSS.rel = 'preload';
      criticalCSS.as = 'style';
      criticalCSS.href = '/critical.css';
      document.head.appendChild(criticalCSS);

      // Preload critical fonts
      const fontPreload = document.createElement('link');
      fontPreload.rel = 'preload';
      fontPreload.as = 'font';
      fontPreload.href = '/fonts/inter-var.woff2';
      fontPreload.crossOrigin = 'anonymous';
      document.head.appendChild(fontPreload);

      // Preload hero image (keep existing logo path to avoid 404)
      const heroImage = document.createElement('link');
      heroImage.rel = 'preload';
      heroImage.as = 'image';
      heroImage.href = '/cookitnext_logo.png';
      document.head.appendChild(heroImage);
    }
  }, []);

  return (
    <>
      {/* Performance optimization scripts */}
      {enableAnalytics && (
        <>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'GA_MEASUREMENT_ID', {
                page_title: document.title,
                page_location: window.location.href,
                custom_map: {
                  'custom_parameter_1': 'ai_cooking_app',
                  'custom_parameter_2': 'recipe_generation',
                  'custom_parameter_3': 'meal_planning'
                }
              });
            `}
          </Script>
        </>
      )}

      {/* Service Worker for offline support */}
      <Script id="service-worker" strategy="afterInteractive">
        {`
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js')
                .then(function(registration) {
                  console.log('SW registered: ', registration);
                })
                .catch(function(registrationError) {
                  console.log('SW registration failed: ', registrationError);
                });
            });
          }
        `}
      </Script>

      {/* Resource hints for performance */}
      <Script id="resource-hints" strategy="beforeInteractive">
        {`
          // DNS prefetch for external domains
          const domains = [
            'fonts.googleapis.com',
            'fonts.gstatic.com',
            'www.google-analytics.com'
          ];
          
          domains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = '//' + domain;
            document.head.appendChild(link);
          });
        `}
      </Script>

      {/* Performance monitoring */}
      {enablePerformanceMonitoring && (
        <Script id="performance-monitoring" strategy="afterInteractive">
          {`
            // Monitor Core Web Vitals
            if ('PerformanceObserver' in window) {
              try {
                const observer = new PerformanceObserver((list) => {
                  for (const entry of list.getEntries()) {
                    if (entry.entryType === 'largest-contentful-paint') {
                      console.log('LCP:', entry.startTime);
                      // Send to analytics
                      if (window.gtag) {
                        gtag('event', 'web_vitals', {
                          event_category: 'Web Vitals',
                          event_label: 'LCP',
                          value: Math.round(entry.startTime)
                        });
                      }
                    }
                  }
                });
                observer.observe({ entryTypes: ['largest-contentful-paint'] });
              } catch (e) {
                console.log('Performance monitoring error:', e);
              }
            }

            // Monitor user interactions
            let firstInputDelay = 0;
            let firstInputTime = 0;

            const firstInputCallback = (entry) => {
              firstInputDelay = entry.processingStart - entry.startTime;
              firstInputTime = entry.startTime;
              
              console.log('FID:', firstInputDelay);
              
              // Send to analytics
              if (window.gtag) {
                gtag('event', 'web_vitals', {
                  event_category: 'Web Vitals',
                  event_label: 'FID',
                  value: Math.round(firstInputDelay)
                });
              }
            };

            if ('PerformanceObserver' in window) {
              try {
                const observer = new PerformanceObserver((list) => {
                  for (const entry of list.getEntries()) {
                    if (entry.entryType === 'first-input') {
                      firstInputCallback(entry);
                      observer.disconnect();
                      break;
                    }
                  }
                });
                observer.observe({ entryTypes: ['first-input'] });
              } catch (e) {
                console.log('FID monitoring error:', e);
              }
            }
          `}
        </Script>
      )}

      {children}
    </>
  );
}

export default PerformanceOptimizer;
