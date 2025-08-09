export default function RegisterLoading() {
  return (
    <div className="min-h-screen bg-[#F4EBD0] flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-6">
          <div className="w-20 h-20 border-4 border-[#355E3B]/20 border-t-[#355E3B] rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-[#D4AF37] rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
        </div>
        <h2 className="text-xl font-semibold text-[#355E3B] mb-2">Creating Account</h2>
        <p className="text-[#6F4E37]">Setting up your premium experience...</p>
      </div>
    </div>
  )
}
