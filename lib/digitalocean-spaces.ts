import AWS from 'aws-sdk';

// Configure AWS SDK with DigitalOcean Spaces credentials
const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT || '');
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_SPACES_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET,
  region: process.env.DO_SPACES_REGION || 'nyc3',
});

export const uploadToSpaces = async (file: Buffer | Uint8Array, fileName: string, contentType: string, folder: string = '') => {
  try {
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

    const params = {
      Bucket: process.env.DO_SPACES_BUCKET || '',
      Key: uniqueFileName,
      Body: file,
      ACL: 'public-read',
      ContentType: contentType,
    };

    const data = await s3.upload(params).promise();
    return data.Location;
  } catch (error) {
    console.error('Error uploading to DigitalOcean Spaces:', error);
    throw error;
  }
};

export const deleteFromSpaces = async (fileUrl: string) => {
  try {
    // Extract the key from the URL
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1); // Remove leading slash

    const params = {
      Bucket: process.env.DO_SPACES_BUCKET || '',
      Key: key,
    };

    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    console.error('Error deleting from DigitalOcean Spaces:', error);
    throw error;
  }
};

export const getSignedUrl = (key: string, expires: number = 3600) => {
  try {
    const params = {
      Bucket: process.env.DO_SPACES_BUCKET || '',
      Key: key,
      Expires: expires,
    };

    return s3.getSignedUrl('getObject', params);
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
}; 