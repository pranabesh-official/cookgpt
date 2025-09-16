'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Download, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';

interface ServiceWorkerRegistration extends ServiceWorkerRegistration {
  waiting?: ServiceWorker | null;
  installing?: ServiceWorker | null;
}

interface UpdateManagerState {
  isOnline: boolean;
  hasUpdate: boolean;
  isUpdating: boolean;
  updateAvailable: boolean;
  swRegistration: ServiceWorkerRegistration | null;
  cacheStatus: Record<string, number>;
}

export function PWAUpdateManager() {
  const [state, setState] = useState<UpdateManagerState>({
    isOnline: navigator.onLine,
    hasUpdate: false,
    isUpdating: false,
    updateAvailable: false,
    swRegistration: null,
    cacheStatus: {}
  });

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Register service worker and handle updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration);
          setState(prev => ({ ...prev, swRegistration: registration }));

          // Check for updates immediately
          registration.update();

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setState(prev => ({ ...prev, updateAvailable: true }));
                  toast.info('New version available!', {
                    description: 'A new version of CookGPT is ready to install.',
                    action: {
                      label: 'Update',
                      onClick: () => handleUpdate()
                    }
                  });
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('SW registration failed:', error);
        });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        const { type, version } = event.data;
        
        switch (type) {
          case 'UPDATE_AVAILABLE':
            setState(prev => ({ ...prev, updateAvailable: true }));
            toast.info('Update Available', {
              description: 'A new version is ready to install.',
              action: {
                label: 'Update Now',
                onClick: () => handleUpdate()
              }
            });
            break;
          case 'SW_ACTIVATED':
            toast.success('App Updated', {
              description: `Updated to version ${version}`
            });
            break;
        }
      });
    }
  }, []);

  // Handle update installation
  const handleUpdate = useCallback(async () => {
    if (!state.swRegistration?.waiting) {
      // If no waiting worker, try to update
      if (state.swRegistration) {
        state.swRegistration.update();
      }
      return;
    }

    setState(prev => ({ ...prev, isUpdating: true }));

    try {
      // Tell the waiting service worker to skip waiting and become active
      state.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload the page to use the new service worker
      window.location.reload();
    } catch (error) {
      console.error('Failed to update:', error);
      toast.error('Update failed', {
        description: 'Failed to install the update. Please try again.'
      });
      setState(prev => ({ ...prev, isUpdating: false }));
    }
  }, [state.swRegistration]);

  // Check cache status
  const checkCacheStatus = useCallback(async () => {
    if (state.swRegistration) {
      try {
        const messageChannel = new MessageChannel();
        const promise = new Promise<Record<string, number>>((resolve) => {
          messageChannel.port1.onmessage = (event) => {
            resolve(event.data);
          };
        });

        state.swRegistration.active?.postMessage(
          { type: 'GET_CACHE_STATUS' },
          [messageChannel.port2]
        );

        const cacheStatus = await promise;
        setState(prev => ({ ...prev, cacheStatus }));
      } catch (error) {
        console.error('Failed to get cache status:', error);
      }
    }
  }, [state.swRegistration]);

  // Clear cache
  const clearCache = useCallback(async () => {
    if (state.swRegistration?.active) {
      try {
        state.swRegistration.active.postMessage({ type: 'CLEAR_CACHE' });
        toast.success('Cache cleared', {
          description: 'All cached data has been cleared.'
        });
        checkCacheStatus();
      } catch (error) {
        console.error('Failed to clear cache:', error);
        toast.error('Failed to clear cache');
      }
    }
  }, [state.swRegistration, checkCacheStatus]);

  // Force update check
  const forceUpdateCheck = useCallback(async () => {
    if (state.swRegistration) {
      try {
        await state.swRegistration.update();
        toast.info('Checking for updates...');
      } catch (error) {
        console.error('Failed to check for updates:', error);
        toast.error('Failed to check for updates');
      }
    }
  }, [state.swRegistration]);

  // Cache specific URLs
  const cacheUrls = useCallback(async (urls: string[]) => {
    if (state.swRegistration?.active) {
      try {
        state.swRegistration.active.postMessage({
          type: 'CACHE_URLS',
          payload: { urls }
        });
        toast.success('URLs cached', {
          description: `Cached ${urls.length} URLs for offline use.`
        });
      } catch (error) {
        console.error('Failed to cache URLs:', error);
        toast.error('Failed to cache URLs');
      }
    }
  }, [state.swRegistration]);

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            {state.isOnline ? (
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
              {state.isOnline ? 'Online' : 'Offline'}
            </span>
            <Badge variant={state.isOnline ? 'default' : 'destructive'}>
              {state.isOnline ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Update Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <RefreshCw className="h-4 w-4" />
            App Updates
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {state.updateAvailable ? 'Update Available' : 'Up to Date'}
            </span>
            <Badge variant={state.updateAvailable ? 'default' : 'secondary'}>
              {state.updateAvailable ? 'New Version' : 'Current'}
            </Badge>
          </div>
          
          {state.updateAvailable && (
            <Button
              onClick={handleUpdate}
              disabled={state.isUpdating}
              className="w-full"
              size="sm"
            >
              {state.isUpdating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Install Update
                </>
              )}
            </Button>
          )}
          
          <Button
            onClick={forceUpdateCheck}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Check for Updates
          </Button>
        </CardContent>
      </Card>

      {/* Cache Management */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4" />
            Cache Management
          </CardTitle>
          <CardDescription className="text-xs">
            Manage offline data and cache
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="space-y-2">
            {Object.entries(state.cacheStatus).map(([cacheName, count]) => (
              <div key={cacheName} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{cacheName}</span>
                <Badge variant="outline">{count} items</Badge>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={checkCacheStatus}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Refresh Status
            </Button>
            <Button
              onClick={clearCache}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Clear Cache
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* PWA Features */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">PWA Features</CardTitle>
          <CardDescription className="text-xs">
            Progressive Web App capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Service Worker</span>
              <Badge variant={state.swRegistration ? 'default' : 'destructive'}>
                {state.swRegistration ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Offline Support</span>
              <Badge variant="default">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Auto Updates</span>
              <Badge variant="default">Enabled</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for using PWA update manager
export function usePWAUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        const { type } = event.data;
        if (type === 'UPDATE_AVAILABLE') {
          setUpdateAvailable(true);
        }
      });
    }
  }, []);

  return { updateAvailable, isOnline };
}
