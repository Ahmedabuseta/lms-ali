import AWS from 'aws-sdk';

// Validate environment variables
const validateEnvironment = () => {
  const required = {
    DO_SPACES_KEY: process.env.DO_SPACES_KEY,
    DO_SPACES_SECRET: process.env.DO_SPACES_SECRET,
    DO_SPACES_ENDPOINT: process.env.DO_SPACES_ENDPOINT,
    DO_SPACES_BUCKET: process.env.DO_SPACES_BUCKET,
    DO_SPACES_REGION: process.env.DO_SPACES_REGION,
  };

  const missing = Object.entries(required)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return required;
};

// Configure AWS SDK with DigitalOcean Spaces credentials
const initializeSpaces = () => {
  try {
    const env = validateEnvironment();

    // Clean and validate endpoint
    let endpoint = env.DO_SPACES_ENDPOINT!.trim();
    if (!endpoint.startsWith('http')) {
      endpoint = `https://${endpoint}`;
    }

    // Remove trailing slash if present
    endpoint = endpoint.replace(/\/$/, '');

    console.log('Initializing Digital Ocean Spaces with:', {
      endpoint,
      region: env.DO_SPACES_REGION,
      bucket: env.DO_SPACES_BUCKET,
      hasKey: !!env.DO_SPACES_KEY,
      hasSecret: !!env.DO_SPACES_SECRET,
    });

    const spacesEndpoint = new AWS.Endpoint(endpoint);

    const s3 = new AWS.S3({
      endpoint: spacesEndpoint,
      accessKeyId: env.DO_SPACES_KEY!.trim(),
      secretAccessKey: env.DO_SPACES_SECRET!.trim(),
      region: env.DO_SPACES_REGION!.trim(),
      s3ForcePathStyle: false, // Important for Digital Ocean Spaces
      signatureVersion: 'v4', // Explicitly set signature version
      httpOptions: {
        timeout: 120000, // 2 minutes timeout
      },
    });

    return { s3, bucket: env.DO_SPACES_BUCKET!.trim() };
  } catch (error) {
    console.error('Failed to initialize Digital Ocean Spaces:', error);
    throw error;
  }
};

// Initialize once
let spacesConfig: { s3: AWS.S3; bucket: string } | null = null;

const getSpacesConfig = () => {
  if (!spacesConfig) {
    spacesConfig = initializeSpaces();
  }
  return spacesConfig;
};

export const uploadToSpaces = async (
  file: Buffer | Uint8Array,
  fileName: string,
  contentType: string,
  folder: string = ''
) => {
  try {
    const { s3, bucket } = getSpacesConfig();

    // Clean folder path
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '');

    // Preserve original filename with timestamp for uniqueness
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8); // Shorter random ID

    // Clean the original filename - remove special characters but keep readable name
    const cleanFileName = fileName
      .replace(/[^a-zA-Z0-9.\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDCF\uFDF0-\uFDFF\uFE70-\uFEFF]/g, '_') // Allow Arabic characters
      .replace(/_{ 2, }/g, '_') // Replace multiple underscores with single
      .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores

    // Create unique filename while preserving original name
    const uniqueFileName = cleanFolder
      ? `${cleanFolder}/${cleanFileName}_${timestamp}_${randomId}`
      : `${cleanFileName}_${timestamp}_${randomId}`;

    console.log('Uploading file:', {
      fileName: uniqueFileName,
      contentType,
      fileSize: file.length,
      bucket,
    });

    const params: AWS.S3.PutObjectRequest = {
      Bucket: bucket,
      Key: uniqueFileName,
      Body: file,
      ACL: 'public-read',
      ContentType: contentType,
      CacheControl: 'max-age=31536000', // 1 year cache
      Metadata: {
        'original-name': fileName,
        'upload-timestamp': timestamp.toString(),
      },
    };

    const data = await s3.upload(params).promise();

    console.log('Upload successful:', {
      location: data.Location,
      etag: data.ETag,
      key: data.Key,
    });

    return data.Location;
  } catch (error) {
    console.error('Error uploading to DigitalOcean Spaces:', error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('SignatureDoesNotMatch')) {
        throw new Error('Invalid Digital Ocean Spaces credentials. Please check your access key and secret.');
      } else if (error.message.includes('InvalidAccessKeyId')) {
        throw new Error('Invalid Digital Ocean Spaces access key. Please verify your credentials.');
      } else if (error.message.includes('NoSuchBucket')) {
        throw new Error('Digital Ocean Spaces bucket not found. Please check your bucket name.');
      } else if (error.message.includes('NetworkingError')) {
        throw new Error('Network error while uploading. Please check your internet connection.');
      }
    }

    throw new Error('Failed to upload file to Digital Ocean Spaces. Please try again.');
  }
};

export const deleteFromSpaces = async (fileUrl: string) => {
  try {
    const { s3, bucket } = getSpacesConfig();

    // Extract the key from the URL
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1); // Remove leading slash

    console.log('Deleting file:', { key, bucket });

    const params = {
      Bucket: bucket,
      Key: key,
    };

    await s3.deleteObject(params).promise();
    console.log('File deleted successfully:', key);
    return true;
  } catch (error) {
    console.error('Error deleting from DigitalOcean Spaces:', error);
    throw new Error('Failed to delete file from Digital Ocean Spaces.');
  }
};

export const getSignedUrl = (key: string, expires: number = 3600) => {
  try {
    const { s3, bucket } = getSpacesConfig();

    const params = {
      Bucket: bucket,
      Key: key,
      Expires: expires,
    };

    return s3.getSignedUrl('getObject', params);
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate signed URL.');
  }
};

// Test connection function
export const testSpacesConnection = async () => {
  try {
    const { s3, bucket } = getSpacesConfig();

    console.log('Testing Digital Ocean Spaces connection...');

    // Test by listing objects (this requires minimal permissions)
    await s3.headBucket({ Bucket: bucket }).promise();

    console.log('✅ Digital Ocean Spaces connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Digital Ocean Spaces connection failed:', error);
    return false;
  }
};
