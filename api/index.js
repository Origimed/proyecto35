const serverless = require('serverless-http');
const express = require('express');
const path = require('path');
const { S3Client, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
const helmet = require('helmet');
const crypto = require('crypto');
const cors = require('cors');
require('dotenv').config();

const app = express();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Habilitar CORS para todas las rutas
app.use(cors());

// Servir archivos estáticos (por ejemplo, CSS)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Generar nonce para CSP
app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString('base64');
  next();
});

// Configurar Content Security Policy con helmet
app.use((req, res, next) => {
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      mediaSrc: ["'self'", `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`],
      frameSrc: ["'self'"]
    }
  })(req, res, next);
});

// Ruta para servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});

// API para obtener la lista de videos con URL pre-firmadas
app.get('/api/videos', async (req, res) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Prefix: 'videos/' // Carpeta en S3 donde se encuentran los videos
  };

  console.log('Solicitando lista de objetos a S3...');
  try {
    const data = await s3Client.send(new ListObjectsV2Command(params));
    console.log('Datos recibidos del bucket:', data);
    const videos = data.Contents
      .filter(item => item.Key.endsWith('.mp4'))
      .map(item => {
        const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}`;
        return { key: item.Key, url };
      });
    console.log('Videos obtenidos:', videos);
    res.json(videos);
  } catch (err) {
    console.error('Error al obtener los archivos de video:', err);
    res.status(500).json({ error: 'No se pudieron obtener los archivos de video' });
  }
});

// Iniciar el servidor localmente si no se está ejecutando en Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

module.exports = serverless(app);
//
