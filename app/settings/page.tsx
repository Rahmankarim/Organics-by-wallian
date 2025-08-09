"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Settings, 
  Bell, 
  Shield, 
  Globe, 
  CreditCard, 
  Smartphone,
  Mail,
  Eye,
  EyeOff,
  Save,
  Trash2
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuthStore } from "@/lib/store"
import { toast } from "sonner"
import ProtectedRoute from "@/components/protected-route"

export default function SettingsPage() {
  const { user, isAuthenticated, updateUser, logout } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  
  // Form states
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false,
    orderUpdates: true,
    promotions: false
  })

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'private',
    dataSharing: false,
    analytics: true,
    cookiePreferences: 'essential'
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // Fetch user data and settings
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated) return
      
      try {
        const token = localStorage.getItem('auth-token')
        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setUserData(data.user)
          
          // Update notification settings from user preferences
          if (data.user.preferences) {
            setNotificationSettings(prev => ({
              ...prev,
              email: data.user.preferences.newsletter || false,
              sms: data.user.preferences.smsNotifications || false
            }))
          }
        } else {
          toast.error('Failed to fetch user data')
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        toast.error('Failed to load settings')
      }
    }

    fetchUserData()
  }, [isAuthenticated])

  const handleNotificationUpdate = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          preferences: {
            ...userData?.preferences,
            newsletter: notificationSettings.email,
            smsNotifications: notificationSettings.sms
          }
        })
      })

      if (response.ok) {
        toast.success('Notification settings updated successfully')
      } else {
        toast.error('Failed to update settings')
      }
    } catch (error) {
      console.error('Error updating settings:', error)
      toast.error('Failed to update settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })

      if (response.ok) {
        toast.success('Password changed successfully')
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to change password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    )
    
    if (!confirmed) return

    setIsLoading(true)
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('Account deleted successfully')
        logout()
        window.location.href = '/'
      } else {
        toast.error('Failed to delete account')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error('Failed to delete account')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <ProtectedRoute>
        <div></div>
      </ProtectedRoute>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4EBD0]">
      <Header />

      {/* Page Header */}
      <section className="bg-[#355E3B] text-white py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">Account Settings</h1>
            <p className="text-gray-200">Manage your account preferences and security</p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 bg-white">
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Account
            </TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#355E3B] flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose how you want to be notified about updates and promotions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-[#355E3B] font-medium">Email Notifications</Label>
                      <p className="text-sm text-[#6F4E37]">Receive important updates via email</p>
                    </div>
                    <Switch
                      checked={notificationSettings.email}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, email: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-[#355E3B] font-medium">SMS Notifications</Label>
                      <p className="text-sm text-[#6F4E37]">Get order updates via SMS</p>
                    </div>
                    <Switch
                      checked={notificationSettings.sms}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, sms: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-[#355E3B] font-medium">Order Updates</Label>
                      <p className="text-sm text-[#6F4E37]">Notifications about order status changes</p>
                    </div>
                    <Switch
                      checked={notificationSettings.orderUpdates}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, orderUpdates: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-[#355E3B] font-medium">Promotional Offers</Label>
                      <p className="text-sm text-[#6F4E37]">Special deals and discount notifications</p>
                    </div>
                    <Switch
                      checked={notificationSettings.promotions}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, promotions: checked }))
                      }
                    />
                  </div>
                </div>

                <Separator />

                <Button 
                  onClick={handleNotificationUpdate}
                  disabled={isLoading}
                  className="bg-[#D4AF37] hover:bg-[#B8941F] text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Preferences'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#355E3B] flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>
                  Control how your data is used and shared.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[#355E3B] font-medium">Profile Visibility</Label>
                    <Select value={privacySettings.profileVisibility} onValueChange={(value) => 
                      setPrivacySettings(prev => ({ ...prev, profileVisibility: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="friends">Friends Only</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-[#355E3B] font-medium">Data Sharing</Label>
                      <p className="text-sm text-[#6F4E37]">Allow sharing anonymized data for improvement</p>
                    </div>
                    <Switch
                      checked={privacySettings.dataSharing}
                      onCheckedChange={(checked) => 
                        setPrivacySettings(prev => ({ ...prev, dataSharing: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-[#355E3B] font-medium">Analytics</Label>
                      <p className="text-sm text-[#6F4E37]">Help us improve your experience</p>
                    </div>
                    <Switch
                      checked={privacySettings.analytics}
                      onCheckedChange={(checked) => 
                        setPrivacySettings(prev => ({ ...prev, analytics: checked }))
                      }
                    />
                  </div>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Your privacy is important to us. We never sell your personal data to third parties.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#355E3B] flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your password and account security.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#355E3B]">Change Password</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    onClick={handlePasswordChange}
                    disabled={isLoading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    className="bg-[#D4AF37] hover:bg-[#B8941F] text-white"
                  >
                    {isLoading ? 'Changing...' : 'Change Password'}
                  </Button>
                </div>

                <Separator />

                <Alert>
                  <Settings className="h-4 w-4" />
                  <AlertDescription>
                    Use a strong password with at least 8 characters including numbers and special characters.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#355E3B] flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Account Management
                </CardTitle>
                <CardDescription>
                  Manage your account data and deletion.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="border-red-200 bg-red-50">
                  <Trash2 className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>Danger Zone</strong><br />
                    Once you delete your account, there is no going back. Please be certain.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#355E3B]">Delete Account</h3>
                  <p className="text-[#6F4E37]">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  
                  <Button 
                    onClick={handleDeleteAccount}
                    disabled={isLoading}
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isLoading ? 'Deleting...' : 'Delete My Account'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  )
}
