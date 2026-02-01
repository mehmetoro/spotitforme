// app/api/env-check/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Sadece gerekli env vars'ları kontrol et
    const requiredVars = ['GMAIL_USER', 'GMAIL_APP_PASS', 'ADMIN_EMAIL']
    const missingVars = requiredVars.filter(varName => !process.env[varName])
    
    if (missingVars.length > 0) {
      return NextResponse.json({
        success: false,
        message: `Missing environment variables: ${missingVars.join(', ')}`
      })
    }

    return NextResponse.json({
      success: true,
      message: 'All required environment variables are set',
      envVars: {
        gmailUser: process.env.GMAIL_USER ? '✓ Set' : '✗ Missing',
        adminEmail: process.env.ADMIN_EMAIL ? '✓ Set' : '✗ Missing',
        hasGmailPass: process.env.GMAIL_APP_PASS ? '✓ Set' : '✗ Missing'
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `Error checking environment: ${error}`
    }, { status: 500 })
  }
}