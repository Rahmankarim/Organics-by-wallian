import { Resend } from 'resend'
import nodemailer from 'nodemailer'

// Initialize Resend only if API key is available
const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    return null
  }
  return new Resend(process.env.RESEND_API_KEY)
}

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

// Email configuration
const getEmailConfig = (): EmailConfig => {
  return {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASSWORD || ''
    }
  }
}

// Create transporter
const createTransporter = () => {
  const config = getEmailConfig()
  
  if (!config.auth.user || !config.auth.pass) {
    console.warn('Email credentials not configured. User:', config.auth.user ? 'SET' : 'NOT SET', 'Pass:', config.auth.pass ? 'SET' : 'NOT SET')
    return null
  }

  console.log('Creating SMTP transporter with config:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.auth.user ? `${config.auth.user.slice(0, 3)}...${config.auth.user.slice(-3)}` : 'NOT SET'
  })

  return nodemailer.createTransport(config)
}

// Send verification code email (6-digit code)
export const sendVerificationCodeEmail = async (email: string, code: string): Promise<boolean> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const verificationUrl = `${baseUrl}/verify?email=${encodeURIComponent(email)}&code=${code}`
    
    // Try Resend first
    const resendClient = getResendClient()
    if (resendClient) {
      const { error } = await resendClient.emails.send({
        from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
        to: email,
        subject: 'Your Verification Code - Organics by Wallian',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background-color: #355E3B; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Organics by Wallian</h1>
              <p style="color: #D4AF37; margin: 5px 0;">Premium Dry Fruits</p>
            </div>
            <div style="padding: 30px 20px; background: #fff;">
              <h2 style="color: #355E3B;">Your Verification Code</h2>
              <p style="font-size: 1.2em;">Please use the following code to verify your email address:</p>
              <div style="font-size: 2em; font-weight: bold; color: #D4AF37; margin: 20px 0; letter-spacing: 4px; text-align: center; padding: 20px; background: #f8f9fa; border: 2px dashed #D4AF37; border-radius: 8px;">${code}</div>
              <p style="color: #888;">This code will expire in 10 minutes.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="background-color: #355E3B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Verify Now
                </a>
              </div>
              <p style="color: #666; font-size: 14px;">
                Or copy and paste this link: <a href="${verificationUrl}" style="color: #355E3B;">${verificationUrl}</a>
              </p>
              <p style="color: #666; font-size: 0.9em; margin-top: 20px;">If you didn't request this code, please ignore this email.</p>
            </div>
            <div style="background-color: #f8f9fa; padding: 15px; text-align: center; color: #666; font-size: 0.8em;">
              <p>© 2024 Organics by Wallian. All rights reserved.</p>
            </div>
          </div>
        `
      })

      if (error) {
        console.error('Resend error:', error)
        return false
      }

      console.log('Verification code email sent successfully via Resend to:', email)
      return true
    }

    // Fallback to nodemailer if Resend is not configured
    console.log('Resend not configured, trying SMTP...')
    const transporter = createTransporter()
    if (!transporter) {
      console.log('No email service configured. Verification code for', email, ':', code)
      return false
    }

    const mailOptions = {
      from: `"Organics by Wallian" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Verification Code - Organics by Wallian',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background-color: #355E3B; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Organics by Wallian</h1>
            <p style="color: #D4AF37; margin: 5px 0;">Premium Dry Fruits</p>
          </div>
          <div style="padding: 30px 20px; background: #fff;">
            <h2 style="color: #355E3B;">Your Verification Code</h2>
            <p style="font-size: 1.2em;">Please use the following code to verify your email address:</p>
            <div style="font-size: 2em; font-weight: bold; color: #D4AF37; margin: 20px 0; letter-spacing: 4px; text-align: center; padding: 20px; background: #f8f9fa; border: 2px dashed #D4AF37; border-radius: 8px;">${code}</div>
            <p style="color: #888;">This code will expire in 10 minutes.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #355E3B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Now
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              Or copy and paste this link: <a href="${verificationUrl}" style="color: #355E3B;">${verificationUrl}</a>
            </p>
          </div>
        </div>
      `
    }

    console.log('Attempting to send email via SMTP to:', email)
    await transporter.sendMail(mailOptions)
    console.log('Verification code email sent successfully via SMTP to:', email)
    return true

  } catch (error) {
    console.error('Error sending verification code email:', error)
    return false
  }
}