import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongoose'
import { User } from '@/lib/mongoose'
import { getUserFromRequest } from '@/lib/auth'

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

    const userData = await User.findById(user._id).select('addresses')
    
    return NextResponse.json({
      addresses: userData?.addresses || []
    })

  } catch (error) {
    console.error('Address fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      type,
      firstName,
      lastName,
      company,
      address,
      apartment,
      city,
      state,
      zipCode,
      country,
      phone,
      isDefault
    } = body

    // Validation
    if (!type || !firstName || !lastName || !address || !city || !state || !zipCode || !country || !phone) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
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

    // If this is set as default, remove default from other addresses
    if (isDefault) {
      userData.addresses.forEach((addr: any) => {
        addr.isDefault = false
      })
    }

    // Create new address
    const newAddress = {
      type,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      company: company?.trim(),
      address: address.trim(),
      apartment: apartment?.trim(),
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
      country: country.trim(),
      phone: phone.trim(),
      isDefault: isDefault || userData.addresses.length === 0 // First address is default
    }

    userData.addresses.push(newAddress)
    await userData.save()

    return NextResponse.json({
      message: 'Address added successfully',
      address: newAddress
    }, { status: 201 })

  } catch (error) {
    console.error('Address creation error:', error)
    return NextResponse.json(
      { error: 'Failed to add address' },
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
    const { addressId, ...updateData } = body

    if (!addressId) {
      return NextResponse.json(
        { error: 'Address ID is required' },
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

    const addressIndex = userData.addresses.findIndex((addr: any) => addr._id.toString() === addressId)
    if (addressIndex === -1) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      )
    }

    // If setting as default, remove default from other addresses
    if (updateData.isDefault) {
      userData.addresses.forEach((addr: any, index: number) => {
        if (index !== addressIndex) {
          addr.isDefault = false
        }
      })
    }

    // Update address
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        userData.addresses[addressIndex][key] = updateData[key]
      }
    })

    await userData.save()

    return NextResponse.json({
      message: 'Address updated successfully',
      address: userData.addresses[addressIndex]
    })

  } catch (error) {
    console.error('Address update error:', error)
    return NextResponse.json(
      { error: 'Failed to update address' },
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

    const { searchParams } = new URL(request.url)
    const addressId = searchParams.get('addressId')

    if (!addressId) {
      return NextResponse.json(
        { error: 'Address ID is required' },
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

    const addressIndex = userData.addresses.findIndex((addr: any) => addr._id.toString() === addressId)
    if (addressIndex === -1) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      )
    }

    const wasDefault = userData.addresses[addressIndex].isDefault

    // Remove address
    userData.addresses.splice(addressIndex, 1)

    // If deleted address was default, make first remaining address default
    if (wasDefault && userData.addresses.length > 0) {
      userData.addresses[0].isDefault = true
    }

    await userData.save()

    return NextResponse.json({
      message: 'Address deleted successfully'
    })

  } catch (error) {
    console.error('Address deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete address' },
      { status: 500 }
    )
  }
}
