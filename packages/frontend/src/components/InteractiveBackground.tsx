import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { aiTheme } from '../styles/aiTheme';

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
`;

const BackgroundContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  background: ${aiTheme.colors.background};
  overflow: hidden;
`;

const Vignette = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, transparent 0%, rgba(15, 23, 42, 0.4) 100%);
  pointer-events: none;
  z-index: 1;
`;

// Helper for random number in range
const random = (min: number, max: number) => Math.random() * (max - min) + min;

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    alpha: number;
    targetAlpha: number;
}

const InteractiveBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const particlesRef = useRef<Particle[]>([]);
    const frameRef = useRef<number>(0);

    // Initialize particles
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const handleResize = () => {
            if (containerRef.current && canvas) {
                canvas.width = containerRef.current.clientWidth;
                canvas.height = containerRef.current.clientHeight;
                initParticles();
            }
        };

        const initParticles = () => {
            const particleCount = 60;
            const colors = [
                aiTheme.colors.aiBlue,
                aiTheme.colors.aiPurple,
                aiTheme.colors.aiCyan,
            ];

            particlesRef.current = [];
            for (let i = 0; i < particleCount; i++) {
                particlesRef.current.push({
                    x: random(0, canvas.width),
                    y: random(0, canvas.height),
                    vx: random(-0.5, 0.5),
                    vy: random(-0.5, 0.5),
                    size: random(1, 3),
                    color: colors[Math.floor(random(0, colors.length))],
                    alpha: random(0.1, 0.5),
                    targetAlpha: random(0.1, 0.5),
                });
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Mouse tracking
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    // Animation Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw background gradient mesh
            const bgGradient = ctx.createRadialGradient(
                mousePos.x, mousePos.y, 0,
                mousePos.x, mousePos.y, 800
            );
            bgGradient.addColorStop(0, 'rgba(30, 41, 59, 0.4)');
            bgGradient.addColorStop(1, 'rgba(15, 23, 42, 0)');

            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Update and draw particles
            particlesRef.current.forEach((p) => {
                // Move particles
                p.x += p.vx;
                p.y += p.vy;

                // Bounce off walls
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                // Connect particles near mouse
                const dx = mousePos.x - p.x;
                const dy = mousePos.y - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 200) {
                    ctx.beginPath();
                    ctx.strokeStyle = p.color;
                    // Opacity based on proximity to mouse
                    const lineAlpha = (1 - distance / 200) * 0.3;
                    ctx.globalAlpha = lineAlpha;
                    ctx.lineWidth = 1;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mousePos.x, mousePos.y);
                    ctx.stroke();
                    ctx.globalAlpha = 1;

                    // Slightly attract particles to mouse
                    p.x += dx * 0.005;
                    p.y += dy * 0.005;
                }

                // Connect particles to each other (optional for mesh effect)
                particlesRef.current.forEach((otherP) => {
                    const ddx = p.x - otherP.x;
                    const ddy = p.y - otherP.y;
                    const ddist = Math.sqrt(ddx * ddx + ddy * ddy);

                    if (ddist < 100) {
                        ctx.beginPath();
                        ctx.strokeStyle = aiTheme.colors.aiBlue;
                        ctx.globalAlpha = (1 - ddist / 100) * 0.1;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(otherP.x, otherP.y);
                        ctx.stroke();
                        ctx.globalAlpha = 1;
                    }
                });

                // Draw particle dot
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha;
                ctx.fill();
                ctx.globalAlpha = 1;
            });

            frameRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(frameRef.current);
        };
    }, [mousePos]);

    return (
        <BackgroundContainer ref={containerRef}>
            <Canvas ref={canvasRef} />
            <Vignette />
        </BackgroundContainer>
    );
};

export default InteractiveBackground;
