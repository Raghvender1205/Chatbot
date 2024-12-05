import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const profilePath = path.join(process.cwd(), 'data', 'profile.json')

async function readProfile() {
  const data = await fs.readFile(profilePath, 'utf8')
  return JSON.parse(data)
}

async function writeProfile(profile: any) {
  await fs.writeFile(profilePath, JSON.stringify(profile, null, 2))
}

export async function GET() {
  try {
    const profile = await readProfile()
    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, role } = await request.json()
    
    const newProfile = { firstName, lastName, email, role }
    await writeProfile(newProfile)
    
    console.log('Updating profile:', newProfile)
    return NextResponse.json({ message: 'Profile updated successfully', user: newProfile })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
