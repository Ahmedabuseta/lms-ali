# 🔧 Digital Ocean Spaces Setup Guide - Fix Upload Errors

## 🚨 Current Issue: SignatureDoesNotMatch Error

You're getting a `SignatureDoesNotMatch` error which means your Digital Ocean Spaces credentials are partially configured but incorrect. Let's fix this step by step.

## 📋 Step 1: Create Digital Ocean Spaces

### 1.1 Create a Space
1. Go to [DigitalOcean Cloud Console](https://cloud.digitalocean.com/)
2. Navigate to **"Spaces Object Storage"**
3. Click **"Create a Space"**
4. Choose settings:
   - **Region**: Choose closest to your users (e.g., `nyc3`, `fra1`, `sgp1`)
   - **Space Name**: Use a unique name (e.g., `lms-ali-storage`)
   - **File Listing**: Set to **"Public"** for easier access
   - **CDN**: Enable for better performance

### 1.2 Generate API Keys
1. Go to **"API"** section in DigitalOcean
2. Click **"Spaces Keys"** tab
3. Click **"Generate New Key"**
4. Give it a name (e.g., "LMS Ali Upload Key")
5. **IMPORTANT**: Save both the **Key** and **Secret** immediately (secret is only shown once!)

## 🔑 Step 2: Configure Environment Variables

Create a `.env.local` file in your project root with these exact values:

```env
# =============================================================================
# 🚨 CRITICAL: Digital Ocean Spaces Configuration
# =============================================================================

# Your Spaces Access Key (from DigitalOcean API > Spaces Keys)
DO_SPACES_KEY=your_actual_access_key_here

# Your Spaces Secret Key (from DigitalOcean API > Spaces Keys)  
DO_SPACES_SECRET=your_actual_secret_key_here

# Your Spaces Endpoint (replace region with yours)
DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com

# Your Bucket/Space Name (the name you created)
DO_SPACES_BUCKET=lms-ali-storage

# Your Region (must match your Space's region)
DO_SPACES_REGION=nyc3

# =============================================================================
# Other required variables for authentication
# =============================================================================
BETTER_AUTH_SECRET=a98f2c8ad736d1b80de17e9c54828f3e007ea28075b7e78cece34caaa834cad8
BETTER_AUTH_URL=http://localhost:3000

# Add your Google OAuth credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Your database URL
DATABASE_URL=your-database-url
```

## 🎯 Step 3: Region & Endpoint Matching

**CRITICAL**: Your endpoint and region MUST match exactly:

| Region | Endpoint | Example |
|--------|----------|---------|
| `nyc3` | `https://nyc3.digitaloceanspaces.com` | New York 3 |
| `fra1` | `https://fra1.digitaloceanspaces.com` | Frankfurt 1 |
| `sgp1` | `https://sgp1.digitaloceanspaces.com` | Singapore 1 |
| `sfo3` | `https://sfo3.digitaloceanspaces.com` | San Francisco 3 |
| `ams3` | `https://ams3.digitaloceanspaces.com` | Amsterdam 3 |

## 🔍 Step 4: Verify Your Configuration

### 4.1 Check Environment Variables
Add this test endpoint to verify your setup:

```typescript
// app/api/test-spaces/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { testSpacesConnection } from '@/lib/digitalocean-spaces';

export async function GET() {
  try {
    const result = await testSpacesConnection();
    
    return NextResponse.json({ 
      success: result,
      message: result ? 'Digital Ocean Spaces connected successfully!' : 'Connection failed'
    });
  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
```

### 4.2 Test the Connection
1. Restart your development server: `npm run dev` or `bun dev`
2. Visit: `http://localhost:3000/api/test-spaces`
3. You should see: `{"success": true, "message": "Digital Ocean Spaces connected successfully!"}`

## 🛠️ Step 5: Common Issues & Solutions

### Issue 1: SignatureDoesNotMatch
**Cause**: Incorrect secret key or endpoint mismatch
**Solution**: 
- Double-check your secret key (no extra spaces)
- Ensure endpoint matches your Space's region exactly
- Regenerate new API keys if needed

### Issue 2: InvalidAccessKeyId
**Cause**: Incorrect or missing access key
**Solution**:
- Verify your access key is correct
- Ensure no extra characters or spaces
- Check if the key is active in DigitalOcean

### Issue 3: NoSuchBucket
**Cause**: Bucket name is incorrect or doesn't exist
**Solution**:
- Verify bucket name matches exactly (case-sensitive)
- Ensure the Space exists in your DigitalOcean account

### Issue 4: NetworkingError
**Cause**: Network connectivity or firewall issues
**Solution**:
- Check your internet connection
- Verify firewall settings allow HTTPS outbound connections

## ✅ Step 6: Test Upload Functionality

Once configured correctly, test the upload:

1. **Go to any course creation page**
2. **Try uploading an image**
3. **Check the browser console** for detailed logs
4. **Verify the file appears** in your DigitalOcean Space

## 📝 Step 7: Environment Variables Checklist

Make sure your `.env.local` has all these (no missing values):

- [ ] `DO_SPACES_KEY` - Your access key
- [ ] `DO_SPACES_SECRET` - Your secret key  
- [ ] `DO_SPACES_ENDPOINT` - Correct endpoint URL
- [ ] `DO_SPACES_BUCKET` - Your space name
- [ ] `DO_SPACES_REGION` - Matching region
- [ ] `BETTER_AUTH_SECRET` - Auth secret
- [ ] `BETTER_AUTH_URL` - Your app URL
- [ ] `GOOGLE_CLIENT_ID` - Google OAuth
- [ ] `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- [ ] `DATABASE_URL` - Your database

## 🎉 Step 8: Success Indicators

When everything works correctly, you'll see:

1. **Console logs**: "✅ Digital Ocean Spaces connection successful!"
2. **Upload progress**: Real progress bars during upload
3. **Success messages**: "تم رفع الملف بنجاح" (File uploaded successfully)
4. **Files in Space**: Your uploaded files visible in DigitalOcean console

## 🆘 Still Having Issues?

### Debug Steps:
1. **Check server logs** in your terminal
2. **Verify environment variables** are loading: `console.log(process.env.DO_SPACES_KEY?.substring(0, 5))`
3. **Test with small files** first (< 1MB)
4. **Try different file types** (image, document, etc.)

### Get Help:
If you're still stuck, check:
- Your DigitalOcean Space permissions
- That your Space is in the same region as your endpoint
- That there are no special characters in your credentials

---

**Once configured correctly, your Arabic upload component will work perfectly with real-time progress bars! 🚀** 