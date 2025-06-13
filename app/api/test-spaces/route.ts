import { NextRequest, NextResponse } from 'next/server';
import { testSpacesConnection } from '@/lib/digitalocean-spaces';

export async function GET() { try {
    console.log('🔍 Testing Digital Ocean Spaces configuration...');

    // Check environment variables first
    const envCheck = {
      DO_SPACES_KEY: !!process.env.DO_SPACES_KEY,
      DO_SPACES_SECRET: !!process.env.DO_SPACES_SECRET,
      DO_SPACES_ENDPOINT: process.env.DO_SPACES_ENDPOINT,
      DO_SPACES_BUCKET: process.env.DO_SPACES_BUCKET,
      DO_SPACES_REGION: process.env.DO_SPACES_REGION, };

    console.log('📋 Environment variables check:', envCheck);

    // Test connection
    const result = await testSpacesConnection();

    const response = { success: result,
      message: result
        ? '✅ Digital Ocean Spaces connected successfully!'
        : '❌ Digital Ocean Spaces connection failed',
      environment: envCheck,
      timestamp: new Date().toISOString(), };

    console.log('📊 Test result:', response);

    return NextResponse.json(response);
  } catch (error) { console.error('❌ Test failed:', error);

    let errorMessage = 'Unknown error';
    let errorType = 'UnknownError';

    if (error instanceof Error) {
      errorMessage = error.message;

      if (error.message.includes('Missing required environment variables')) {
        errorType = 'MissingEnvironmentVariables'; } else if (error.message.includes('SignatureDoesNotMatch')) {
        errorType = 'InvalidCredentials';
      } else if (error.message.includes('InvalidAccessKeyId')) {
        errorType = 'InvalidAccessKey';
      } else if (error.message.includes('NoSuchBucket')) {
        errorType = 'BucketNotFound';
      }
    }

    const errorResponse = { success: false,
      error: errorMessage,
      errorType,
      environment: {
        DO_SPACES_KEY: !!process.env.DO_SPACES_KEY,
        DO_SPACES_SECRET: !!process.env.DO_SPACES_SECRET,
        DO_SPACES_ENDPOINT: process.env.DO_SPACES_ENDPOINT,
        DO_SPACES_BUCKET: process.env.DO_SPACES_BUCKET,
        DO_SPACES_REGION: process.env.DO_SPACES_REGION, },
      timestamp: new Date().toISOString(),
      troubleshooting: { MissingEnvironmentVariables: 'Add the missing environment variables to your .env.local file',
        InvalidCredentials: 'Check your DO_SPACES_SECRET - it may be incorrect or have extra spaces',
        InvalidAccessKey: 'Check your DO_SPACES_KEY - it may be incorrect or inactive',
        BucketNotFound: 'Verify DO_SPACES_BUCKET name matches your actual Space name exactly',
        UnknownError: 'Check the console logs for more details' }[errorType] || 'Check the setup guide for troubleshooting steps'
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
