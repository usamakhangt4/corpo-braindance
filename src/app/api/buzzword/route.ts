import { generateBuzzword } from '@/lib/buzzwords'
import { NextResponse } from 'next/server'

export async function GET() {
  const buzzword = generateBuzzword()
  return NextResponse.json({
    buzzword,
    generatedAt: new Date().toISOString(),
  })
}
