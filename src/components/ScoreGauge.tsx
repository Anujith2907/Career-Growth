"use client";

import { useEffect, useRef } from "react";

interface ScoreGaugeProps {
  score: number; // 0 to 100
  label?: string;
  size?: number;
}

export default function ScoreGauge({ score, label = "Readiness Score", size = 200 }: ScoreGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Support Retina displays with scaling
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = size * pixelRatio;
    canvas.height = size * pixelRatio;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(pixelRatio, pixelRatio);

    let currentScore = 0;
    const speed = 0.05; // Animation speed coefficient

    let animationId = 0;

    const render = () => {
      ctx.clearRect(0, 0, size, size);

      const centerX = size / 2;
      const centerY = size / 2 + 10;
      const radius = size * 0.38;

      // Animate current score climbing up to the target score
      const diff = score - currentScore;
      if (Math.abs(diff) > 0.1) {
        currentScore += diff * speed;
      } else {
        currentScore = score;
      }

      // Draw gauge background arc (semi-circle from -220deg to 40deg)
      const startAngle = -Math.PI * 1.2;
      const endAngle = Math.PI * 0.2;
      const targetAngle = startAngle + (endAngle - startAngle) * (currentScore / 100);

      // 1. Background Track
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.strokeStyle = "rgba(30, 41, 59, 0.5)"; // Slate border in dark mode
      ctx.lineWidth = 14;
      ctx.lineCap = "round";
      ctx.stroke();

      // 2. Glowing Active Progress Arc
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, targetAngle);
      
      // Neon color gradient
      const gradient = ctx.createLinearGradient(0, centerY, size, centerY);
      gradient.addColorStop(0, "#6366f1"); // Indigo
      gradient.addColorStop(0.5, "#a855f7"); // Violet
      gradient.addColorStop(1, "#22d3ee"); // Cyan

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 14;
      ctx.lineCap = "round";
      
      // Add subtle glow shadow
      ctx.shadowColor = "rgba(34, 211, 238, 0.4)";
      ctx.shadowBlur = 12;
      
      ctx.stroke();
      ctx.restore();

      // 3. Draw Needle / Indicator
      const needleLength = radius - 8;
      const needleX = centerX + Math.cos(targetAngle) * needleLength;
      const needleY = centerY + Math.sin(targetAngle) * needleLength;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(needleX, needleY);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.stroke();

      // Needle center cap
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#0b0f19";
      ctx.fill();

      // 4. Center Metrics Text (Score percentage)
      ctx.font = "800 32px var(--font-orbitron)";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      // Add text shadow
      ctx.shadowColor = "rgba(255, 255, 255, 0.1)";
      ctx.shadowBlur = 4;
      ctx.fillText(`${Math.round(currentScore)}%`, centerX, centerY - 14);

      // Label text below score
      ctx.shadowBlur = 0; // Disable shadow for small label
      ctx.font = "600 10px var(--font-sans)";
      ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
      ctx.fillText(label.toUpperCase(), centerX, centerY + 30);

      // Evaluation range display (e.g. POOR, FAIR, READY)
      let rating = "BEGINNER";
      let ratingColor = "#94a3b8"; // Gray
      if (currentScore >= 85) {
        rating = "ELITE READY";
        ratingColor = "#22d3ee"; // Cyan
      } else if (currentScore >= 70) {
        rating = "JOB READY";
        ratingColor = "#a855f7"; // Violet
      } else if (currentScore >= 50) {
        rating = "DEVELOPING";
        ratingColor = "#6366f1"; // Indigo
      }

      ctx.font = "800 10px var(--font-orbitron)";
      ctx.fillStyle = ratingColor;
      ctx.fillText(rating, centerX, centerY + 46);

      if (currentScore < score) {
        animationId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [score, label, size]);

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}
