module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; " +
              "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; " +
              "font-src 'self' https://fonts.gstatic.com; " +
              "img-src 'self' data:; " +
              "connect-src 'self'; " +
              "media-src 'self' https://proyecto35.s3.us-east-2.amazonaws.com https://d5v4utim9ibun.cloudfront.net; " +
              "frame-src 'self';"
          }
        ]
      }
    ];
  }
}