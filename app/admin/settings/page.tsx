"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Settings, Save, Bell, Mail, Shield, Globe } from "lucide-react"

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    // General Settings
    siteName: "Origiganics by Wallian",
    siteDescription: "Premium organic dry fruits and nuts",
    contactEmail: "admin@organicorchard.com",
    contactPhone: "+92 300 1234567",
    
    // Business Settings
    businessAddress: "123 Organic Street, Karachi, Pakistan",
    gstNumber: "NTN123456789",
    panNumber: "STN123456789",
    
    // Notification Settings
    emailNotifications: true,
    orderNotifications: true,
    reviewNotifications: true,
    lowStockAlerts: true,
    
    // Email Settings
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUsername: "admin@organicorchard.com",
    smtpPassword: "",
    
    // Security Settings
    enableTwoFactor: false,
    sessionTimeout: "30",
    maxLoginAttempts: "5",
    
    // API Settings
    enableApi: true,
    apiRateLimit: "100"
  })

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert("Settings saved successfully!")
    } catch (error) {
      alert("Failed to save settings")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#355E3B]">System Settings</h1>
            <p className="text-gray-600 mt-1">Configure your admin panel and business settings</p>
          </div>
          <Button 
            onClick={handleSaveSettings}
            disabled={loading}
            className="bg-[#355E3B] hover:bg-[#2A4A2F]"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Settings */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#355E3B] flex items-center gap-2">
              <Settings className="w-5 h-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => handleInputChange("siteName", e.target.value)}
                className="border-[#355E3B]/20 focus:border-[#D4AF37]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => handleInputChange("siteDescription", e.target.value)}
                className="border-[#355E3B]/20 focus:border-[#D4AF37]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                className="border-[#355E3B]/20 focus:border-[#D4AF37]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                value={settings.contactPhone}
                onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                className="border-[#355E3B]/20 focus:border-[#D4AF37]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Settings */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#355E3B] flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessAddress">Business Address</Label>
              <Textarea
                id="businessAddress"
                value={settings.businessAddress}
                onChange={(e) => handleInputChange("businessAddress", e.target.value)}
                className="border-[#355E3B]/20 focus:border-[#D4AF37]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gstNumber">GST Number</Label>
              <Input
                id="gstNumber"
                value={settings.gstNumber}
                onChange={(e) => handleInputChange("gstNumber", e.target.value)}
                className="border-[#355E3B]/20 focus:border-[#D4AF37]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="panNumber">PAN Number</Label>
              <Input
                id="panNumber"
                value={settings.panNumber}
                onChange={(e) => handleInputChange("panNumber", e.target.value)}
                className="border-[#355E3B]/20 focus:border-[#D4AF37]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#355E3B] flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-600">Receive email alerts for important events</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleInputChange("emailNotifications", checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Order Notifications</Label>
                <p className="text-sm text-gray-600">Get notified when new orders are placed</p>
              </div>
              <Switch
                checked={settings.orderNotifications}
                onCheckedChange={(checked) => handleInputChange("orderNotifications", checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Review Notifications</Label>
                <p className="text-sm text-gray-600">Get notified about new customer reviews</p>
              </div>
              <Switch
                checked={settings.reviewNotifications}
                onCheckedChange={(checked) => handleInputChange("reviewNotifications", checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Low Stock Alerts</Label>
                <p className="text-sm text-gray-600">Alert when products are running low</p>
              </div>
              <Switch
                checked={settings.lowStockAlerts}
                onCheckedChange={(checked) => handleInputChange("lowStockAlerts", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#355E3B] flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">SMTP Host</Label>
              <Input
                id="smtpHost"
                value={settings.smtpHost}
                onChange={(e) => handleInputChange("smtpHost", e.target.value)}
                className="border-[#355E3B]/20 focus:border-[#D4AF37]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="smtpPort">SMTP Port</Label>
              <Input
                id="smtpPort"
                value={settings.smtpPort}
                onChange={(e) => handleInputChange("smtpPort", e.target.value)}
                className="border-[#355E3B]/20 focus:border-[#D4AF37]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="smtpUsername">SMTP Username</Label>
              <Input
                id="smtpUsername"
                value={settings.smtpUsername}
                onChange={(e) => handleInputChange("smtpUsername", e.target.value)}
                className="border-[#355E3B]/20 focus:border-[#D4AF37]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="smtpPassword">SMTP Password</Label>
              <Input
                id="smtpPassword"
                type="password"
                value={settings.smtpPassword}
                onChange={(e) => handleInputChange("smtpPassword", e.target.value)}
                className="border-[#355E3B]/20 focus:border-[#D4AF37]"
                placeholder="••••••••"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#355E3B] flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </div>
              <Switch
                checked={settings.enableTwoFactor}
                onCheckedChange={(checked) => handleInputChange("enableTwoFactor", checked)}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleInputChange("sessionTimeout", e.target.value)}
                className="border-[#355E3B]/20 focus:border-[#D4AF37]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => handleInputChange("maxLoginAttempts", e.target.value)}
                className="border-[#355E3B]/20 focus:border-[#D4AF37]"
              />
            </div>
          </CardContent>
        </Card>

        {/* API Settings */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#355E3B] flex items-center gap-2">
              <Globe className="w-5 h-5" />
              API Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Enable API Access</Label>
                <p className="text-sm text-gray-600">Allow external API access</p>
              </div>
              <Switch
                checked={settings.enableApi}
                onCheckedChange={(checked) => handleInputChange("enableApi", checked)}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="apiRateLimit">API Rate Limit (requests/hour)</Label>
              <Input
                id="apiRateLimit"
                type="number"
                value={settings.apiRateLimit}
                onChange={(e) => handleInputChange("apiRateLimit", e.target.value)}
                className="border-[#355E3B]/20 focus:border-[#D4AF37]"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button - Mobile */}
      <div className="mt-8 lg:hidden">
        <Button 
          onClick={handleSaveSettings}
          disabled={loading}
          className="w-full bg-[#355E3B] hover:bg-[#2A4A2F]"
        >
          <Save className="w-4 h-4 mr-2" />
          {loading ? "Saving..." : "Save All Changes"}
        </Button>
      </div>
    </div>
  )
}
