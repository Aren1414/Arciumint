import React, { useRef, useEffect } from "react";
import p5 from "p5";

const GenerativeCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let sketchInstance: p5;

    const sketch = (p: p5) => {
      let img: p5.Image | null = null;

      p.preload = () => {
        img = p.loadImage("/Map.png", () => {
          console.log("✅ Map.png loaded");
        }, () => {
          console.error("❌ Failed to load Map.png");
          img = null;
        });
      };

      p.setup = () => {
        p.createCanvas(window.innerWidth, window.innerHeight);
        p.noLoop();
      };

      p.draw = () => {
        p.background(30);
        if (img) {
          p.image(img, 0, 0, p.width, p.height);
        } else {
          p.fill(255, 0, 0);
          p.textSize(32);
          p.text("Image not loaded", 50, 50);
        }
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
