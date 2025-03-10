import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export default async function handler(req, res) {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Prefix: 'videos/'
  };

  try {
    const data = await s3Client.send(new ListObjectsV2Command(params));
    const videos = data.Contents
      .filter(item => item.Key.endsWith('.mp4'))
      .map(item => ({
        key: item.Key,
        url: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}`
      }));
    res.status(200).json(videos);
  } catch (err) {
    console.error('Error al obtener los videos:', err);
    res.status(500).json({ error: 'No se pudieron obtener los videos' });
  }
}