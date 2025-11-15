// In-memory store for verification codes (development only)
// In production, use Redis or similar persistent store
interface VerificationEntry {
  code: string
  expires: number
  userData: {
    firstName: string
    lastName: string
    email: string
    password: string
    phone?: string
  }
}

export const verificationCodes: Record<string, VerificationEntry> = {}
