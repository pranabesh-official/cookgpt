'use client';

import { PWAUpdateManager } from '@/components/pwa-update-manager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Smartphone, 
  Download, 
  Wifi, 
  Settings, 
  Shield, 
  Zap,
  Info,
  CheckCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function PWASettingsPage() {
  const [pwaFeatures, setPwaFeatures] = useState({
    autoUpdate: true,
    offlineMode: true,
    pushNotifications: false,
    backgroundSync: true,
    cacheManagement: true
  });

  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setInstallPrompt(null);
    }
  };

  const handleFeatureToggle = (feature: keyof typeof pwaFeatures) => {
    setPwaFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  };

  const pwaCapabilities = [
    {
      icon: Download,
      title: 'Install App',
      description: 'Install CookGPT as a native app on your device',
      status: isInstalled ? 'Installed' : installPrompt ? 'Available' : 'Not Available',
      variant: isInstalled ? 'default' : installPrompt ? 'default' : 'secondary'
    },
    {
      icon: Wifi,
      title: 'Offline Support',
      description: 'Access recipes and meal plans without internet',
      status: 'Enabled',
      variant: 'default'
    },
    {
      icon: Zap,
      title: 'Auto Updates',
      description: 'Automatically download and install updates',
      status: pwaFeatures.autoUpdate ? 'Enabled' : 'Disabled',
      variant: pwaFeatures.autoUpdate ? 'default' : 'secondary'
    },
    {
      icon: Shield,
      title: 'Secure',
      description: 'HTTPS encrypted and secure data handling',
      status: 'Enabled',
      variant: 'default'
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
              <Smartphone className="h-8 w-8 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              PWA Settings
            </h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Manage your Progressive Web App experience and offline capabilities
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* PWA Capabilities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  PWA Capabilities
                </CardTitle>
                <CardDescription>
                  Current status of Progressive Web App features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pwaCapabilities.map((capability, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                      <capability.icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      <div>
                        <h3 className="font-medium text-sm">{capability.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {capability.description}
                        </p>
                      </div>
                    </div>
                    <Badge variant={capability.variant as any}>
                      {capability.status}
                    </Badge>
                  </div>
                ))}
                
                {installPrompt && !isInstalled && (
                  <Button onClick={handleInstall} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Install CookGPT
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Feature Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Preferences
                </CardTitle>
                <CardDescription>
                  Customize your PWA experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-sm">Auto Updates</h3>
                      <p className="text-xs text-muted-foreground">
                        Automatically download and install updates
                      </p>
                    </div>
                    <Switch
                      checked={pwaFeatures.autoUpdate}
                      onCheckedChange={() => handleFeatureToggle('autoUpdate')}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-sm">Offline Mode</h3>
                      <p className="text-xs text-muted-foreground">
                        Enable offline access to cached content
                      </p>
                    </div>
                    <Switch
                      checked={pwaFeatures.offlineMode}
                      onCheckedChange={() => handleFeatureToggle('offlineMode')}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-sm">Push Notifications</h3>
                      <p className="text-xs text-muted-foreground">
                        Receive notifications about updates and features
                      </p>
                    </div>
                    <Switch
                      checked={pwaFeatures.pushNotifications}
                      onCheckedChange={() => handleFeatureToggle('pushNotifications')}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-sm">Background Sync</h3>
                      <p className="text-xs text-muted-foreground">
                        Sync data when connection is restored
                      </p>
                    </div>
                    <Switch
                      checked={pwaFeatures.backgroundSync}
                      onCheckedChange={() => handleFeatureToggle('backgroundSync')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* PWA Update Manager */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Update Management
              </CardTitle>
              <CardDescription>
                Manage app updates and cache
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PWAUpdateManager />
            </CardContent>
          </Card>

          {/* PWA Information */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                About PWA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="font-medium text-sm mb-2">What is a PWA?</h3>
                    <p className="text-xs text-muted-foreground">
                      A Progressive Web App (PWA) combines the best of web and mobile apps. 
                      It can be installed on your device, works offline, and provides a native app-like experience.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm mb-2">Benefits</h3>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Install on your device like a native app</li>
                      <li>• Works offline with cached content</li>
                      <li>• Automatic updates</li>
                      <li>• Secure and fast</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-700 dark:text-green-400">
                    CookGPT is fully PWA-enabled with offline support and auto-updates
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
