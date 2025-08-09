'use client'

interface PasswordStrengthProps {
  password: string
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const getPasswordStrength = (password: string) => {
    let score = 0
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password)
    }
    
    Object.values(checks).forEach(check => {
      if (check) score++
    })
    
    return {
      score,
      checks,
      strength: score < 2 ? 'weak' : score < 4 ? 'medium' : 'strong'
    }
  }

  const { score, checks, strength } = getPasswordStrength(password)
  
  if (!password) return null

  return (
    <div className="mt-2 space-y-2">
      {/* Progress bar */}
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-1 w-full rounded ${
              level <= score
                ? strength === 'weak'
                  ? 'bg-red-500'
                  : strength === 'medium'
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      
      {/* Requirements */}
      <div className="text-xs space-y-1">
        <div className={`flex items-center gap-2 ${checks.length ? 'text-green-600' : 'text-gray-500'}`}>
          <span className={`w-2 h-2 rounded-full ${checks.length ? 'bg-green-500' : 'bg-gray-300'}`} />
          At least 8 characters
        </div>
        <div className={`flex items-center gap-2 ${checks.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
          <span className={`w-2 h-2 rounded-full ${checks.lowercase ? 'bg-green-500' : 'bg-gray-300'}`} />
          One lowercase letter
        </div>
        <div className={`flex items-center gap-2 ${checks.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
          <span className={`w-2 h-2 rounded-full ${checks.uppercase ? 'bg-green-500' : 'bg-gray-300'}`} />
          One uppercase letter
        </div>
        <div className={`flex items-center gap-2 ${checks.number ? 'text-green-600' : 'text-gray-500'}`}>
          <span className={`w-2 h-2 rounded-full ${checks.number ? 'bg-green-500' : 'bg-gray-300'}`} />
          One number
        </div>
        <div className={`flex items-center gap-2 ${checks.special ? 'text-green-600' : 'text-gray-500'}`}>
          <span className={`w-2 h-2 rounded-full ${checks.special ? 'bg-green-500' : 'bg-gray-300'}`} />
          One special character (@$!%*?&)
        </div>
      </div>
    </div>
  )
}
