import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || "c1959d978a0606a391c143164f4fdda0d3ed1fb870f44be2f94546c86dd86b96"

export async function POST(request: Request) {
  const { username, password } = await request.json()

  // In a real application, you would store the user in a database
  // For this example, we'll just create a token
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' })
  return NextResponse.json({ token })
}