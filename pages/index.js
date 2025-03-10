import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    async function loadVideos() {
      console.log('Ejecutando loadVideos...');
      try {
        const res = await fetch('/api/videos');
        console.log('Respuesta de la API:', res);
        const data = await res.json();
        console.log('Videos recibidos:', data);
        // Corrige las URLs de los videos
        const correctedData = data.map(video => ({
          ...video,
          url: video.url.replace('https://https//', 'https://')
        }));
        setVideos(correctedData);
      } catch (error) {
        console.error('Error al cargar los videos:', error);
      }
    }
    loadVideos();
    const interval = setInterval(loadVideos, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Head>
        <title>Galería de Videos</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Se elimina la meta CSP para evitar conflictos y usar la política definida en next.config.js */}
      </Head>
      
      <header>
        <h1>Galería de Videos</h1>
      </header>
      <main>
        {videos.length === 0 ? (
          <p style={{ textAlign:'center', padding: '20px' }}>No se encontraron videos.</p>
        ) : (
          <div className="video-grid">
            {videos.map(video => (
              <div key={video.key} className="video-container">
                <video controls>
                  <source src={video.url} type="video/mp4" />
                  Tu navegador no soporta el elemento de video.
                </video>
                <p>{video.key.split('/').pop()}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}