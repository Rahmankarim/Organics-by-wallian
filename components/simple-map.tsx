"use client"

import { useState } from "react"
import { MapPin, Navigation, Phone, Clock, ExternalLink, Info, Star, Users, Award } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

// Store location coordinates (Karimabad, Hunza, Gilgit-Baltistan, Pakistan)
const STORE_LOCATION = {
  lat: 36.3235833, // 36°19'24.9"N
  lng: 74.6600556, // 74°39'36.2"E
  address: "Mohallah garabrass karimabad hunza Gilgit-Baltistan Pakistan",
  name: "Origiganics by Wallian Store",
  phone: "+92 318 0441303",
  hours: "Mon-Sat: 9 AM - 7 PM",
  rating: 4.8,
  reviews: 127,
  specialties: ["Premium Almonds", "Fresh Dates", "Organic Walnuts", "Cashews"]
}

interface SimpleMapProps {
  height?: string
  showDetails?: boolean
}

export default function SimpleMap({ height = "400px", showDetails = true }: SimpleMapProps) {
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap')

  const openInGoogleMaps = () => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${STORE_LOCATION.lat},${STORE_LOCATION.lng}`
    window.open(googleMapsUrl, '_blank')
  }

  const openDirections = () => {
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${STORE_LOCATION.lat},${STORE_LOCATION.lng}`
    window.open(directionsUrl, '_blank')
  }

  const openInAppleMaps = () => {
    const appleMapsUrl = `http://maps.apple.com/?q=${STORE_LOCATION.lat},${STORE_LOCATION.lng}`
    window.open(appleMapsUrl, '_blank')
  }

  const handleMapLoad = () => {
    setIsMapLoaded(true)
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Map with Loading State */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-lg shadow-lg"
      >
        {!isMapLoaded && (
          <div 
            className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10"
            style={{ height }}
          >
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#355E3B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#6F4E37]">Loading interactive map...</p>
            </div>
          </div>
        )}
        
        <iframe
          src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.7!2d${STORE_LOCATION.lng}!3d${STORE_LOCATION.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzbCsDE5JzAwLjEiTiA3NMKwMzknMDAuMCJF!5e${mapType === 'satellite' ? '1' : '0'}!3m2!1sen!2s!4v1639000000000!5m2!1sen!2s`}
          width="100%"
          height={height}
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="rounded-lg"
          onLoad={handleMapLoad}
        />
        
        {/* Enhanced Map Controls */}
        <div className="absolute top-4 right-4 space-y-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              onClick={openInGoogleMaps}
              size="sm"
              className="bg-white/95 text-[#355E3B] hover:bg-white shadow-lg backdrop-blur-sm border border-white/50"
            >
              <MapPin className="h-4 w-4 mr-2" />
              View Larger
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Button
              onClick={openDirections}
              size="sm"
              className="bg-[#355E3B] text-white hover:bg-[#2A4A2F] shadow-lg"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Directions
            </Button>
          </motion.div>
        </div>

        {/* Store Info Overlay */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs"
        >
          <h3 className="font-semibold text-[#355E3B] mb-1">{STORE_LOCATION.name}</h3>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{STORE_LOCATION.rating}</span>
            </div>
            <span className="text-sm text-gray-500">({STORE_LOCATION.reviews} reviews)</span>
          </div>
          <p className="text-xs text-gray-600">{STORE_LOCATION.address}</p>
        </motion.div>
      </motion.div>

      {/* Enhanced Store Details */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white shadow-lg overflow-hidden">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Location & Contact Info */}
                <div>
                  <h3 className="text-xl font-semibold text-[#355E3B] mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Store Information
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Store Name & Rating */}
                    <div className="bg-gradient-to-r from-[#F4EBD0] to-[#F4EBD0]/50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-[#355E3B]">{STORE_LOCATION.name}</h4>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{STORE_LOCATION.rating}</span>
                        </div>
                      </div>
                      <p className="text-[#6F4E37] text-sm mb-2">{STORE_LOCATION.address}</p>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#355E3B]" />
                        <span className="text-sm text-[#6F4E37]">{STORE_LOCATION.reviews} customer reviews</span>
                      </div>
                    </div>
                    
                    {/* Contact */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <Phone className="h-5 w-5 text-[#355E3B] flex-shrink-0" />
                      <div>
                        <p className="font-medium text-[#355E3B]">Contact Us</p>
                        <p className="text-[#6F4E37]">{STORE_LOCATION.phone}</p>
                      </div>
                    </div>
                    
                    {/* Hours */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Clock className="h-5 w-5 text-[#355E3B] flex-shrink-0" />
                      <div>
                        <p className="font-medium text-[#355E3B]">Store Hours</p>
                        <p className="text-[#6F4E37] text-sm">{STORE_LOCATION.hours}</p>
                        <p className="text-[#6F4E37] text-sm">Sunday: 10 AM - 5 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Visit Information & Actions */}
                <div>
                  <h3 className="text-xl font-semibold text-[#355E3B] mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Visit Our Store
                  </h3>
                  
                  <p className="text-[#6F4E37] mb-4 leading-relaxed">
                    Experience our premium organic dry fruits in person. Located in the beautiful Hunza Valley, 
                    our store offers the finest selection of naturally grown almonds, walnuts, dates, and more.
                  </p>

                  {/* Specialties */}
                  <div className="mb-6">
                    <h4 className="font-medium text-[#355E3B] mb-3">Our Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {STORE_LOCATION.specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="bg-[#F4EBD0] text-[#355E3B]">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button 
                      onClick={openDirections}
                      className="w-full bg-[#355E3B] hover:bg-[#2A4A2F] text-white"
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Get Directions
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        onClick={openInGoogleMaps}
                        variant="outline"
                        className="border-[#355E3B] text-[#355E3B] hover:bg-[#355E3B] hover:text-white"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Google Maps
                      </Button>
                      <Button 
                        onClick={openInAppleMaps}
                        variant="outline"
                        className="border-[#355E3B] text-[#355E3B] hover:bg-[#355E3B] hover:text-white"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Apple Maps
                      </Button>
                    </div>
                  </div>
                  
                  {/* What to Expect */}
                  <div className="mt-6 p-4 bg-[#F4EBD0] rounded-lg">
                    <h4 className="font-semibold text-[#355E3B] mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      What to Expect
                    </h4>
                    <ul className="text-sm text-[#6F4E37] space-y-1">
                      <li>• Fresh, premium quality dry fruits</li>
                      <li>• Expert product recommendations</li>
                      <li>• Taste testing available</li>
                      <li>• Bulk purchase discounts</li>
                      <li>• Free consultation on health benefits</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
