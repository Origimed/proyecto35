const serverless = require('serverless-http');
const express = require('express');
const path = require('path');
const AWS = require('aws-sdk');
const helmet = require('helmet');
const crypto = require('crypto');
const cors = require('cors');
require('dotenv').config();

const app = express();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
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
      mediaSrc: [
        "'self'",
        `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`
      ],
      frameSrc: ["'self'"]
    }
  })(req, res, next);
});

// Ruta para servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});

// API para obtener la lista de videos con URL pre-firmadas
app.get('/api/videos', (req, res) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Prefix: 'videos/' // Carpeta en S3 donde se encuentran los videos
  };

  s3.listObjectsV2(params, (err, data) => {
    if (err) {
      console.error('Error al obtener los archivos de video:', err);
      return res.status(500).json({ error: 'No se pudieron obtener los archivos de video' });
    }
    console.log('Datos recibidos del bucket:', data);
    const videos = data.Contents
      .filter(item => item.Key.endsWith('.mp4'))
      .map(item => {
        const url = s3.getSignedUrl('getObject', {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: item.Key,
          Expires: 60
        });
        return { key: item.Key, url };
      });
    console.log('Videos obtenidos:', videos);
    res.json(videos);
  });
});

module.exports = serverless(app);