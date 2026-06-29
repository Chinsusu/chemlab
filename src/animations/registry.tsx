import { useEffect, useRef } from "react";

import type { AnimationId, ReactionStep } from "@/lessons/schema";

interface AnimationProps {
  data?: unknown;
  reducedMotion: boolean;
}

type AnimationComponent = (props: AnimationProps) => JSX.Element;

function SunAnimation({ reducedMotion }: AnimationProps) {
  return (
    <div className={`animation-stage sun-stage ${reducedMotion ? "is-static" : ""}`} aria-hidden="true">
      <div className="sun-core" />
      <div className="sun-ring sun-ring--one" />
      <div className="sun-ring sun-ring--two" />
    </div>
  );
}

function HAtomAnimation({ reducedMotion }: AnimationProps) {
  return (
    <div className={`animation-stage atom-stage ${reducedMotion ? "is-static" : ""}`} aria-hidden="true">
      <div className="atom-orbit" />
      <div className="atom-nucleus">H</div>
      <div className="atom-electron" />
    </div>
  );
}

function CombustionAnimation({ data, reducedMotion }: AnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let frame = 0;
    let raf = 0;
    const draw = () => {
      const { width, height } = canvas;
      context.clearRect(0, 0, width, height);
      context.fillStyle = "rgba(22, 181, 155, 0.12)";
      context.fillRect(0, 0, width, height);

      const pulse = reducedMotion ? 0 : Math.sin(frame / 12) * 7;
      context.fillStyle = "#F4A024";
      context.beginPath();
      context.arc(width * 0.34, height * 0.5, 28 + pulse, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = "#16B59B";
      context.beginPath();
      context.arc(width * 0.66, height * 0.5, 32 - pulse / 2, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = "#1A1D23";
      context.font = "600 18px Inter, sans-serif";
      context.textAlign = "center";
      context.fillText("H2 + O2", width * 0.34, height * 0.52);
      context.fillText("H2O", width * 0.66, height * 0.52);

      context.strokeStyle = "#5C5F66";
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(width * 0.45, height * 0.5);
      context.lineTo(width * 0.55, height * 0.5);
      context.stroke();
      context.beginPath();
      context.moveTo(width * 0.55, height * 0.5);
      context.lineTo(width * 0.51, height * 0.46);
      context.lineTo(width * 0.51, height * 0.54);
      context.closePath();
      context.fillStyle = "#5C5F66";
      context.fill();

      frame += 1;
      if (!reducedMotion) raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  const reaction = data as ReactionStep | undefined;
  return (
    <div className="combustion-wrap">
      <canvas ref={canvasRef} width={520} height={180} aria-label="Mo phong phan ung tao nuoc" />
      {reaction ? <p className="animation-caption">{reaction.displayEquation}</p> : null}
    </div>
  );
}

const animations: Record<AnimationId, AnimationComponent> = {
  sun: SunAnimation,
  "h-atom": HAtomAnimation,
  combustion: CombustionAnimation
};

export function getAnimation(id: AnimationId): AnimationComponent {
  return animations[id];
}
