export default async function handler(req, res) {
    try {
      const { key } = req.query; // Por ejemplo: ?key=videos/video.mp4
      if (!key) {
        return res.status(400).send("Falta el parámetro key");
      }
  
      // Dominio asignado a la distribución de CloudFront, ej: d123456abc.cloudfront.net
      const cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN;
      if (!cloudFrontDomain) {
        return res.status(500).send("Falta la variable de entorno CLOUDFRONT_DOMAIN");
      }
  
      // Construye la URL del video a través de CloudFront
      const videoUrl = `https://${cloudFrontDomain}/${key}`;
  
      // Configura el encabezado de caché para 1 semana (604800 segundos)
      res.setHeader("Cache-Control", "public, max-age=604800, immutable");
  
      // Redirige al usuario para que CloudFront entregue el contenido (Range Requests serán manejados por CloudFront)
      res.redirect(302, videoUrl);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error al transmitir el video");
    }
  }