# DigitalOcean Spaces Setup Guide

## 🚀 Complete UploadThing to DigitalOcean Spaces Migration

This project has been successfully migrated from UploadThing to DigitalOcean Spaces for better performance, cost efficiency, and more control over file storage.

## 📋 What's Changed

### ✅ Removed Components
- ❌ `app/api/uploadthing/` - Removed UploadThing API routes
- ❌ `lib/uploadthing.ts` - Removed UploadThing utilities
- ❌ `components/file-upload.tsx` - Removed UploadThing component
- ❌ UploadThing dependencies from package.json
- ❌ UploadThing middleware routes
- ❌ UploadThing CSS imports

### ✅ Added Components
- ✅ `lib/digitalocean-spaces.ts` - DigitalOcean Spaces utilities
- ✅ `app/api/upload/route.ts` - New upload API using DigitalOcean
- ✅ `components/file-upload-spaces.tsx` - Enhanced file upload component
- ✅ Updated all form components to use new upload system

## 🔧 Environment Variables Required

Add these environment variables to your `.env` file:

```env
# DigitalOcean Spaces Configuration
DO_SPACES_KEY=your_spaces_access_key
DO_SPACES_SECRET=your_spaces_secret_key
DO_SPACES_ENDPOINT=your_endpoint_url
DO_SPACES_BUCKET=your_bucket_name
DO_SPACES_REGION=nyc3
```

### How to Get DigitalOcean Spaces Credentials

1. **Create a DigitalOcean Spaces Bucket:**
   - Go to [DigitalOcean Cloud Console](https://cloud.digitalocean.com/)
   - Navigate to "Spaces Object Storage"
   - Click "Create a Space"
   - Choose your region (e.g., `nyc3`, `fra1`, `sgp1`)
   - Set your bucket name
   - Set file listing to "Public" for easier access

2. **Generate API Keys:**
   - Go to "API" section in DigitalOcean
   - Click "Spaces Keys"
   - Generate a new Spaces access key
   - Save both the Key and Secret

3. **Configure Environment Variables:**
   ```env
   DO_SPACES_KEY=YOUR_ACCESS_KEY_HERE
   DO_SPACES_SECRET=YOUR_SECRET_KEY_HERE
   DO_SPACES_ENDPOINT=https://your-region.digitaloceanspaces.com
   DO_SPACES_BUCKET=your-bucket-name
   DO_SPACES_REGION=your-region
   ```

## 🎯 Features of New Upload System

### Enhanced File Upload Component
- ✅ **Drag & Drop Support** - Modern file upload experience
- ✅ **File Type Validation** - Customizable accepted file types
- ✅ **File Size Limits** - Configurable size restrictions
- ✅ **Progress Indicators** - Visual upload progress
- ✅ **Preview Support** - Image previews and file info
- ✅ **Error Handling** - Comprehensive error messages
- ✅ **Multiple File Types** - Images, videos, documents, etc.

### Component Usage Examples

#### 1. Course Images
```tsx
<FileUploadSpaces
  value={imageUrl}
  onChange={(url) => setImageUrl(url)}
  folder="course-images"
  acceptedFileTypes="image/*"
  maxFileSize={4 * 1024 * 1024} // 4MB
/>
```

#### 2. Course Attachments
```tsx
<FileUploadSpaces
  onChange={(url) => handleAttachment(url)}
  folder="course-attachments"
  acceptedFileTypes=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
  maxFileSize={50 * 1024 * 1024} // 50MB
/>
```

#### 3. Chapter Videos
```tsx
<FileUploadSpaces
  onChange={(url) => setVideoUrl(url)}
  folder="chapter-videos"
  acceptedFileTypes="video/*"
  maxFileSize={500 * 1024 * 1024} // 500MB
/>
```

## 📁 File Organization

Files are automatically organized in folders:

```
your-bucket/
├── course-images/
│   ├── 1703123456789-abc123.jpg
│   └── 1703123456790-def456.png
├── course-attachments/
│   ├── 1703123456791-ghi789.pdf
│   └── 1703123456792-jkl012.docx
├── chapter-videos/
│   ├── 1703123456793-mno345.mp4
│   └── 1703123456794-pqr678.mov
└── uploads/
    └── 1703123456795-stu901.zip
```

## 🔒 Security Features

- ✅ **Authentication Required** - Only authenticated teachers can upload
- ✅ **File Type Validation** - Server-side file type checking
- ✅ **Size Limits** - Configurable file size restrictions
- ✅ **Unique File Names** - Prevents file conflicts
- ✅ **Public Read Access** - Files are publicly accessible via CDN

## 🌐 CDN and Performance

DigitalOcean Spaces provides:
- ✅ **Global CDN** - Fast file delivery worldwide
- ✅ **High Availability** - 99.9% uptime SLA
- ✅ **Bandwidth Scaling** - Handle traffic spikes
- ✅ **Cost Effective** - $5/month for 250GB storage + 1TB transfer

## 🚀 Deployment Checklist

1. ✅ Install dependencies: `npm install aws-sdk`
2. ✅ Set up DigitalOcean Spaces bucket
3. ✅ Configure environment variables
4. ✅ Update `next.config.js` with your Spaces domain
5. ✅ Test file uploads in development
6. ✅ Deploy to production

## 🔄 Migration from UploadThing

If you have existing files on UploadThing, you'll need to:

1. **Download existing files** from UploadThing
2. **Upload files to DigitalOcean Spaces** using the AWS CLI or web interface
3. **Update database URLs** to point to new DigitalOcean URLs
4. **Update `next.config.js`** domains configuration

### Example Migration Script

```javascript
// migrate-files.js
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

const s3 = new AWS.S3({
  endpoint: new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT),
  accessKeyId: process.env.DO_SPACES_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET,
});

async function migrateFile(localPath, key) {
  const fileContent = fs.readFileSync(localPath);
  
  const params = {
    Bucket: process.env.DO_SPACES_BUCKET,
    Key: key,
    Body: fileContent,
    ACL: 'public-read',
  };
  
  try {
    const result = await s3.upload(params).promise();
    console.log('File uploaded:', result.Location);
    return result.Location;
  } catch (error) {
    console.error('Upload error:', error);
  }
}
```

## 📱 Mobile Support

The new upload component is fully mobile-responsive:
- ✅ Touch-friendly drag & drop
- ✅ Camera integration (for image uploads)
- ✅ Responsive design
- ✅ Optimized for mobile networks

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure your DigitalOcean Spaces bucket allows cross-origin requests
   - Configure CORS settings in Spaces dashboard

2. **Upload Failures**
   - Check environment variables are set correctly
   - Verify bucket permissions
   - Check file size limits

3. **Image Loading Issues**
   - Add your Spaces domain to `next.config.js`
   - Ensure files have public read access

### Support

For issues related to DigitalOcean Spaces, refer to:
- [DigitalOcean Spaces Documentation](https://docs.digitalocean.com/products/spaces/)
- [AWS SDK for JavaScript Documentation](https://docs.aws.amazon.com/sdk-for-javascript/)

## 💰 Cost Benefits

**UploadThing vs DigitalOcean Spaces:**

| Feature | UploadThing | DigitalOcean Spaces |
|---------|-------------|-------------------|
| Storage (250GB) | ~$20/month | $5/month |
| Bandwidth (1TB) | Included | Included |
| API Requests | Limited | Unlimited |
| CDN | ✅ | ✅ |
| Custom Domains | ❌ | ✅ |
| Direct Access | ❌ | ✅ |

**Estimated Savings: ~$180/year** 💰 