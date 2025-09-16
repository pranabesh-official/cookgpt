'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WifiOff, RefreshCw, Home, ChefHat, Calendar, Search, Wifi } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Redirect to home when back online
      setTimeout(() => {
        router.push('/');
      }, 1000);
    };

    const handleOffline = () => setIsOnline(false);

    // Check initial status
    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    if (navigator.onLine) {
      router.push('/');
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const offlineFeatures = [
    {
      icon: ChefHat,
      title: 'Cached Recipes',
      description: 'Browse previously viewed recipes',
      available: true
    },
    {
      icon: Calendar,
      title: 'Meal Plans',
      description: 'View saved meal plans',
      available: true
    },
    {
      icon: Search,
      title: 'Recipe Search',
      description: 'Search through cached content',
      available: true
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
              <WifiOff className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              You're Offline
            </h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Don't worry! You can still access some features while offline. 
              We'll automatically reconnect when your network is back.
            </p>
          </div>

          {/* Connection Status */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                Connection Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {isOnline ? 'Back online!' : 'No internet connection'}
                </span>
                <Badge variant={isOnline ? 'default' : 'destructive'}>
                  {isOnline ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
              {isOnline && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  Redirecting you back to the app...
                </p>
              )}
            </CardContent>
          </Card>

          {/* Available Features */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Available Offline</CardTitle>
              <CardDescription>
                These features work without an internet connection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {offlineFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                  >
                    <feature.icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                    <Badge variant={feature.available ? 'default' : 'secondary'}>
                      {feature.available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleRetry}
              className="w-full"
              disabled={isOnline}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {retryCount > 0 ? `Retry (${retryCount})` : 'Check Connection'}
            </Button>
            
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Home
            </Button>
          </div>

          {/* Tips */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Offline Tips</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Browse previously viewed recipes and meal plans</li>
                <li>• Use the search function to find cached content</li>
                <li>• Your data will sync when you're back online</li>
                <li>• Check your internet connection and try again</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}


