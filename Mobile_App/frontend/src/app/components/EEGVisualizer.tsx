import React, { useEffect, useRef } from 'react';

interface EEGVisualizerProps {
  color?: string;
  isFinished: boolean;
}

const EEGVisualizer: React.FC<EEGVisualizerProps> = ({ color = '#00ffcc', isFinished }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataRef = useRef<number[]>(new Array(512).fill(0));
  const animationFrameRef = useRef<number>(undefined);

  useEffect(() => {
    // 1. Дефинираме функцията, която Python ще извиква
    const handleUpdateEEG = (value: number) => {
      if (isFinished) return;
      dataRef.current.push(value);
      dataRef.current.shift();
    };

    // 2. Регистрираме функцията (вече е експонирана в LiveMonitoring, но тук я свързваме)
    if ((window as any).eel) {
      (window as any).eel.expose(handleUpdateEEG, 'updateEEGData');
    }

    // 3. Самата логика за рисуване върху Canvas (60 FPS)
    const drawChart = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx || isFinished) return;

      const width = canvas.width;
      const height = canvas.height;
      const data = dataRef.current;

      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';

      ctx.beginPath();
      // MindWave стойностите варират от -2048 до 2047
      const scaleY = height / 2000; 
      const centerY = height / 2;

      for (let i = 0; i < data.length; i++) {
        const x = (i / data.length) * width;
        const y = centerY - (data[i] * scaleY);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      
      animationFrameRef.current = requestAnimationFrame(drawChart);
    };

    animationFrameRef.current = requestAnimationFrame(drawChart);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isFinished, color]);

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <canvas 
        ref={canvasRef} 
        width={700} 
        height={300} 
        className="w-full h-full block"
      />
    </div>
  );
};

export default EEGVisualizer;
