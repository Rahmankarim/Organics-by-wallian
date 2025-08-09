'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Cookie, X, Settings } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false
  })

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setShowBanner(true)
    } else {
      const savedPreferences = JSON.parse(consent)
      setPreferences(savedPreferences)
    }
  }, [])

  const saveCookiePreferences = (prefs: typeof preferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify(prefs))
    setPreferences(prefs)
    setShowBanner(false)
    setShowSettings(false)
  }

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    }
    saveCookiePreferences(allAccepted)
  }

  const acceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    }
    saveCookiePreferences(necessaryOnly)
  }

  const saveCustomPreferences = () => {
    saveCookiePreferences(preferences)
  }

  if (!showBanner) return null

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
        <Card className="max-w-4xl mx-auto border-[#355E3B] shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Cookie className="w-6 h-6 text-[#D4AF37] flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-[#355E3B] mb-2">We use cookies</h3>
                <p className="text-sm text-gray-600 mb-4">
                  We use cookies to enhance your browsing experience, serve personalized content, 
                  and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={acceptAll} size="sm">
                    Accept All
                  </Button>
                  <Button onClick={acceptNecessary} variant="outline" size="sm">
                    Necessary Only
                  </Button>
                  <Button 
                    onClick={() => setShowSettings(true)} 
                    variant="ghost" 
                    size="sm"
                    className="text-[#355E3B]"
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Customize
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBanner(false)}
                className="flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cookie Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cookie Preferences</DialogTitle>
            <DialogDescription>
              Choose which cookies you want to allow. You can change these settings at any time.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Necessary Cookies</Label>
                <p className="text-xs text-gray-600">Required for basic site functionality</p>
              </div>
              <Switch checked={true} disabled />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Analytics Cookies</Label>
                <p className="text-xs text-gray-600">Help us understand how you use our site</p>
              </div>
              <Switch 
                checked={preferences.analytics}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, analytics: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Marketing Cookies</Label>
                <p className="text-xs text-gray-600">Used to show you relevant ads</p>
              </div>
              <Switch 
                checked={preferences.marketing}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, marketing: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Functional Cookies</Label>
                <p className="text-xs text-gray-600">Enable enhanced functionality and personalization</p>
              </div>
              <Switch 
                checked={preferences.functional}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, functional: checked }))
                }
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button onClick={saveCustomPreferences} className="flex-1">
              Save Preferences
            </Button>
            <Button onClick={() => setShowSettings(false)} variant="outline">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
