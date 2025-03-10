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
    
    const cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN; // Si se ha configurado
    const videos = data.Contents
      .filter(item => item.Key.endsWith('.mp4') || item.Key.endsWith('.mov'))
      .map(item => {
        let videoUrl = cloudFrontDomain 
          ? `https://${cloudFrontDomain}/${item.Key}` 
          : `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}`;
        
        // Corrige las URLs mal formateadas
        videoUrl = videoUrl.replace('https://https//', 'https://');
          
        console.log("Video URL:", videoUrl);
        return {
          key: item.Key,
          url: videoUrl
        };
      });
      
    res.status(200).json(videos);
  } catch (err) {
    console.error('Error al obtener los videos:', err);
    res.status(500).json({ error: 'No se pudieron obtener los videos' });
  }
}