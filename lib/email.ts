// Send verification code email (6-digit code)
export const sendVerificationCodeEmail = async (email: string, code: string): Promise<boolean> => {
  try {
    const transporter = createTransporter()
    if (!transporter) {
      console.log('Email service not configured. Skipping email send.')
      return false
    }
    const mailOptions = {
      from: `"Organic Orchard" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Verification Code - Organic Orchard',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background-color: #355E3B; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Organic Orchard</h1>
            <p style="color: #D4AF37; margin: 5px 0;">Premium Dry Fruits</p>
          </div>
          <div style="padding: 30px 20px; background: #fff;">
            <h2 style="color: #355E3B;">Your Verification Code</h2>
            <p style="font-size: 1.2em;">Please use the following code to verify your email address:</p>
            <div style="font-size: 2em; font-weight: bold; color: #D4AF37; margin: 20px 0; letter-spacing: 4px;">${code}</div>
            <p style="color: #888;">This code will expire in 10 minutes.</p>
          </div>
        </div>
      `
    }
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Error sending verification code email:', error)
    return false
  }
}
import nodemailer from 'nodemailer'

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
    console.warn('Email credentials not configured. Emails will not be sent.')
    return null
  }

  return nodemailer.createTransport(config)
}

// Send verification email
export const sendVerificationEmail = async (email: string, token: string): Promise<boolean> => {
  try {
    const transporter = createTransporter()
    
    if (!transporter) {
      console.log('Email service not configured. Skipping email send.')
      return false
    }

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}&email=${email}`
    
    const mailOptions = {
      from: `"Organic Orchard" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - Organic Orchard',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background-color: #355E3B; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Organic Orchard</h1>
            <p style="color: #D4AF37; margin: 5px 0;">Premium Dry Fruits</p>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #355E3B;">Verify Your Email Address</h2>
            <p>Thank you for signing up for Organic Orchard! Please click the button below to verify your email address and complete your registration.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #355E3B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              If the button doesn't work, you can copy and paste this link into your browser:
              <br>
              <a href="${verificationUrl}" style="color: #355E3B;">${verificationUrl}</a>
            </p>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              If you didn't create an account with us, please ignore this email.
            </p>
          </div>
          
          <div style="background-color: #355E3B; padding: 20px; text-align: center;">
            <p style="color: white; margin: 0; font-size: 14px;">
              © ${new Date().getFullYear()} Organic Orchard. All rights reserved.
            </p>
          </div>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)
    console.log(`Verification email sent to ${email}`)
    return true

  } catch (error) {
    console.error('Failed to send verification email:', error)
    return false
  }
}

// Send password reset email
export const sendPasswordResetEmail = async (email: string, token: string): Promise<boolean> => {
  try {
    const transporter = createTransporter()
    
    if (!transporter) {
      console.log('Email service not configured. Skipping email send.')
      return false
    }

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
    
    const mailOptions = {
      from: `"Organic Orchard" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Password - Organic Orchard',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background-color: #355E3B; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Organic Orchard</h1>
            <p style="color: #D4AF37; margin: 5px 0;">Premium Dry Fruits</p>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #355E3B;">Reset Your Password</h2>
            <p>We received a request to reset your password. Click the button below to set a new password for your account.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #355E3B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              This link will expire in 1 hour for security reasons.
            </p>
            
            <p style="color: #666; font-size: 14px;">
              If the button doesn't work, you can copy and paste this link into your browser:
              <br>
              <a href="${resetUrl}" style="color: #355E3B;">${resetUrl}</a>
            </p>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              If you didn't request a password reset, please ignore this email.
            </p>
          </div>
          
          <div style="background-color: #355E3B; padding: 20px; text-align: center;">
            <p style="color: white; margin: 0; font-size: 14px;">
              © ${new Date().getFullYear()} Organic Orchard. All rights reserved.
            </p>
          </div>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)
    console.log(`Password reset email sent to ${email}`)
    return true

  } catch (error) {
    console.error('Failed to send password reset email:', error)
    return false
  }
}

// Send welcome email
export const sendWelcomeEmail = async (email: string, firstName: string): Promise<boolean> => {
  try {
    const transporter = createTransporter()
    
    if (!transporter) {
      console.log('Email service not configured. Skipping email send.')
      return false
    }
    
    const mailOptions = {
      from: `"Organic Orchard" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Organic Orchard!',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background-color: #355E3B; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Welcome to Organic Orchard!</h1>
            <p style="color: #D4AF37; margin: 5px 0;">Premium Dry Fruits</p>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #355E3B;">Hello ${firstName}!</h2>
            <p>Thank you for joining Organic Orchard! We're excited to have you as part of our community.</p>
            
            <h3 style="color: #355E3B;">What's Next?</h3>
            <ul style="color: #666;">
              <li>Browse our premium collection of organic dry fruits</li>
              <li>Create your wishlist of favorite products</li>
              <li>Enjoy free shipping on orders over ₹500</li>
              <li>Subscribe to our newsletter for health tips and exclusive offers</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/products" 
                 style="background-color: #355E3B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Start Shopping
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              If you have any questions, feel free to contact our support team at support@organicorchard.com
            </p>
          </div>
          
          <div style="background-color: #355E3B; padding: 20px; text-align: center;">
            <p style="color: white; margin: 0; font-size: 14px;">
              © ${new Date().getFullYear()} Organic Orchard. All rights reserved.
            </p>
          </div>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)
    console.log(`Welcome email sent to ${email}`)
    return true

  } catch (error) {
    console.error('Failed to send welcome email:', error)
    return false
  }
}
