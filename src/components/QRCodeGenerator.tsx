import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  url: string;
}

function QRCodeGenerator({ url }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1e40af',
          light: '#ffffff'
        }
      });
    }
  }, [url]);

  return (
    <div className="flex justify-center">
      <div className="bg-white p-4 rounded-2xl shadow-lg">
        <canvas ref={canvasRef} className="rounded-lg" />
      </div>
    </div>
  );
}

export default QRCodeGenerator;