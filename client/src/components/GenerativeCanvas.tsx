import React, { useRef, useEffect } from "react";
import p5 from "p5";

const GenerativeCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let sketchInstance: p5;

    const sketch = (p: p5) => {
      p.setup = () => {
        p.createCanvas(window.innerWidth, window.innerHeight);
        p.background(20);
        p.fill(255, 100, 100);
        p.noStroke();
        p.ellipse(p.width / 2, p.height / 2, 100, 100);
        console.log("✅ Canvas rendered");
      };
    };

    if (canvasRef.current) {
      sketchInstance = new p5(sketch, canvasRef.current);
    }

    return () => {
      sketchInstance?.remove();
    };
  }, []);

  return <div ref={canvasRef} style={{ width: "100%", height: "100vh" }} />;
};

export default GenerativeCanvas;
