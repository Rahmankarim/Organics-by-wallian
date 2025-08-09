import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { User } from '@/lib/mongoose'
import { getUserFromRequest, hashPassword, validateEmail } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    await dbConnect()

    // Get full user data
    const userData = await User.findById(user._id).select('-password -emailVerificationToken -passwordResetToken -twoFactorSecret')

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: userData
    })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { firstName, lastName, phone, avatar, preferences, currentPassword, newPassword } = body

    await dbConnect()

    const userData = await User.findById(user._id)
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Build update object
    const updateData: any = {}

    if (firstName) updateData.firstName = firstName.trim()
    if (lastName) updateData.lastName = lastName.trim()
    if (phone) updateData.phone = phone.trim()
    if (avatar) updateData.avatar = avatar
    if (preferences) updateData.preferences = { ...userData.preferences, ...preferences }

    // Handle password change
    if (currentPassword && newPassword) {
      const { verifyPassword } = await import('@/lib/auth')
      
      // Verify current password
      const isCurrentPasswordValid = await verifyPassword(currentPassword, userData.password!)
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }

      // Hash new password
      updateData.password = await hashPassword(newPassword)
    }

    updateData.updatedAt = new Date()

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updateData,
      { new: true }
    ).select('-password -emailVerificationToken -passwordResetToken -twoFactorSecret')

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json(
        { error: 'Password confirmation required to delete account' },
        { status: 400 }
      )
    }

    await dbConnect()

    const userData = await User.findById(user._id)
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify password
    const { verifyPassword } = await import('@/lib/auth')
    const isPasswordValid = await verifyPassword(password, userData.password!)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 400 }
      )
    }

    // Delete user account
    await User.findByIdAndDelete(user._id)

    // Create response and clear cookie
    const response = NextResponse.json({
      message: 'Account deleted successfully'
    })

    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0
    })

    return response

  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}
