export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F4EBD0] flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#355E3B]/20 border-t-[#355E3B] rounded-full animate-spin mx-auto mb-4"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-[#D4AF37] rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <p className="text-[#355E3B] font-medium">Loading...</p>
        <p className="text-[#6F4E37] text-sm mt-1">Preparing your experience</p>
      </div>
    </div>
  )
}
