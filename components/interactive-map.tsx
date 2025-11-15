"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { MapPin, Navigation, Phone, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(  
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
)

// Store location coordinates (Karimabad, Hunza, Gilgit-Baltistan, Pakistan)
const STORE_LOCATION = {
  lat: 36.3235833, // 36°19'24.9"N
  lng: 74.6600556, // 74°39'36.2"E
  address: "Mohallah garabrass karimabad hunza Gilgit-Baltistan Pakistan",
  name: "Origiganics by Wallian Store",
  phone: "+92 318 0441303",
  hours: "Mon-Sat: 9 AM - 7 PM"
}

interface InteractiveMapProps {
  height?: string
  showDetails?: boolean
}

export default function InteractiveMap({ height = "400px", showDetails = true }: InteractiveMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [mapError, setMapError] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const openInGoogleMaps = () => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${STORE_LOCATION.lat},${STORE_LOCATION.lng}`
    window.open(googleMapsUrl, '_blank')
  }

  const openDirections = () => {
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${STORE_LOCATION.lat},${STORE_LOCATION.lng}`
    window.open(directionsUrl, '_blank')
  }

  // Fallback map component using iframe (Google Maps embed)
  const FallbackMap = () => (
    <div className="relative">
      <iframe
        src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.7!2d${STORE_LOCATION.lng}!3d${STORE_LOCATION.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzbCsDE5JzAwLjEiTiA3NMKwMzknMDAuMCJF!5e0!3m2!1sen!2s!4v1639000000000!5m2!1sen!2s`}
        width="100%"
        height={height}
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="rounded-lg"
      />
      <div className="absolute top-4 right-4 space-y-2">
        <Button
          onClick={openInGoogleMaps}
          size="sm"
          className="bg-white/90 text-[#355E3B] hover:bg-white shadow-lg"
        >
          <MapPin className="h-4 w-4 mr-2" />
          View in Maps
        </Button>
        <Button
          onClick={openDirections}
          size="sm"
          className="bg-[#355E3B] text-white hover:bg-[#2A4A2F] shadow-lg"
        >
          <Navigation className="h-4 w-4 mr-2" />
          Get Directions
        </Button>
      </div>
    </div>
  )

  // Interactive Leaflet map
  const LeafletMap = () => {
    if (!isClient) {
      return (
        <div 
          className="bg-gray-200 rounded-lg flex items-center justify-center"
          style={{ height }}
        >
          <div className="text-center text-gray-500">
            <MapPin className="h-8 w-8 mx-auto mb-2" />
            <p>Loading map...</p>
          </div>
        </div>
      )
    }

    try {
      return (
        <div className="relative">
          <MapContainer
            center={[STORE_LOCATION.lat, STORE_LOCATION.lng]}
            zoom={15}
            style={{ height, width: '100%' }}
            className="rounded-lg z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[STORE_LOCATION.lat, STORE_LOCATION.lng]}>
              <Popup>
                <div className="text-center p-2">
                  <h3 className="font-semibold text-[#355E3B] mb-2">{STORE_LOCATION.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{STORE_LOCATION.address}</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      <span>{STORE_LOCATION.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>{STORE_LOCATION.hours}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
          
          {/* Map Controls */}
          <div className="absolute top-4 right-4 space-y-2 z-10">
            <Button
              onClick={openInGoogleMaps}
              size="sm"
              className="bg-white/90 text-[#355E3B] hover:bg-white shadow-lg"
            >
              <MapPin className="h-4 w-4 mr-2" />
              View in Maps
            </Button>
            <Button
              onClick={openDirections}
              size="sm"
              className="bg-[#355E3B] text-white hover:bg-[#2A4A2F] shadow-lg"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Get Directions
            </Button>
          </div>
        </div>
      )
    } catch (error) {
      console.error('Map rendering error:', error)
      setMapError(true)
      return <FallbackMap />
    }
  }

  return (
    <div className="space-y-6">
      {/* Map Container */}
      <div className="relative overflow-hidden rounded-lg shadow-lg">
        {mapError ? <FallbackMap /> : <LeafletMap />}
      </div>

      {/* Store Details */}
      {showDetails && (
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold text-[#355E3B] mb-4">Store Location</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-[#355E3B] mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-[#355E3B]">{STORE_LOCATION.name}</p>
                      <p className="text-[#6F4E37]">{STORE_LOCATION.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-[#355E3B]" />
                    <div>
                      <p className="font-medium text-[#355E3B]">Contact</p>
                      <p className="text-[#6F4E37]">{STORE_LOCATION.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-[#355E3B]" />
                    <div>
                      <p className="font-medium text-[#355E3B]">Store Hours</p>
                      <p className="text-[#6F4E37]">{STORE_LOCATION.hours}</p>
                      <p className="text-[#6F4E37]">Sunday: 10 AM - 5 PM</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-[#355E3B] mb-4">Visit Our Store</h3>
                <p className="text-[#6F4E37] mb-4">
                  Experience our premium organic dry fruits in person. Our knowledgeable staff can help you 
                  choose the perfect products for your health and wellness needs.
                </p>
                <div className="space-y-2">
                  <Button 
                    onClick={openDirections}
                    className="w-full bg-[#355E3B] hover:bg-[#2A4A2F] text-white"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                  <Button 
                    onClick={openInGoogleMaps}
                    variant="outline"
                    className="w-full border-[#355E3B] text-[#355E3B] hover:bg-[#355E3B] hover:text-white"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Open in Google Maps
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
