import React, { useRef, useEffect } from "react";
import p5 from "p5";

const GenerativeCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let sketchInstance: p5;

    const sketch = (p: p5) => {
      let globeRadius = 300;
      let earthTexture: p5.Image;
      let coreTexture: p5.Graphics;
      let nodes: p5.Vector[] = [];
      let connections: [number, number][] = [];
      let coreRotY = 0;
      let globeRotX = 0.003;
      let globeRotY = 0.002;
      let comets: Comet[] = [];
      let starStreaks: StarStreak[] = [];
      let bgGraphics: p5.Graphics;
      let perspectiveLines: PerspectiveLine[] = [];

      // -------------------------
      // 📌 Load assets
      // -------------------------
      p.preload = () => {
        
        earthTexture = p.loadImage("/Map.png");
      };

      p.setup = () => {
        p.createCanvas(window.innerWidth, window.innerHeight, p.WEBGL);

        // Background
        bgGraphics = p.createGraphics(p.width, p.height);
        generateGalaxyBackground(bgGraphics);

        // Core texture
        coreTexture = p.createGraphics(256, 256);
        coreTexture.noStroke();
        for (let i = 0; i < 4000; i++) {
          coreTexture.fill(p.random(200, 255), p.random(100, 200), p.random(50, 150), 80);
          coreTexture.ellipse(p.random(256), p.random(256), 1.5);
        }

        // Graph nodes
        for (let i = 0; i < 40; i++) {
          let v = p5.Vector.random3D().mult(globeRadius * 1.01);
          nodes.push(v);
        }
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            if (p.random() < 0.12) connections.push([i, j]);
          }
        }

        // Effects
        for (let i = 0; i < 6; i++) comets.push(new Comet());
        for (let i = 0; i < 80; i++) starStreaks.push(new StarStreak());
        generatePerspectiveLines();
      };

      // -------------------------
      // Classes
      // -------------------------
      class PerspectiveLine {
        x: number;
        y: number;
        z: number;
        length: number;
        speed: number;
        weight: number;
        color: p5.Color;

        constructor() {
          this.reset();
        }

        reset() {
          this.x = p.random(-p.width / 2, p.width / 2);
          this.y = p.random(-p.height / 2, p.height / 2);
          this.z = p.random(-200, -1000);
          this.length = p.random(10, 100);
          this.speed = p.random(4, 20);
          this.weight = p.random(0.5, 5);
          this.color = p.color(p.random(150, 255), p.random(150, 255), 255, p.random(50, 200));
        }

        update() {
          this.z += this.speed;
          if (this.z > 100) this.reset();
        }

        show() {
          p.push();
          p.stroke(this.color);
          p.strokeWeight(this.weight);
          const f = 900;
          const scale = f / (f - this.z);
          p.line(this.x * scale, this.y * scale, 0, this.x * scale, this.y * scale, -this.length * scale);
          p.pop();
        }
      }

      class StarStreak {
        z: number;
        angle: number;
        radius: number;
        len: number;
        thickness: number;
        speed: number;

        constructor() {
          this.reset(true);
        }

        reset(initial = false) {
          this.z = p.random(-1400, -400);
          this.angle = p.random(p.TWO_PI);
          this.radius = p.random(80, Math.max(p.width, p.height) * 0.9);
          this.len = p.random(6, 22);
          this.thickness = p.random(0.6, 2.0);
          this.speed = p.random(6, 20);
          if (!initial) this.z = -1200;
        }

        update() {
          this.z += this.speed;
          if (this.z > 80) this.reset(false);
        }

        show() {
          const f = 900;
          const s = f / (f - this.z);
          let sx = this.radius * p.cos(this.angle) * s;
          let sy = this.radius * p.sin(this.angle) * s;
          p.push();
          p.translate(sx, sy);
          p.stroke(200, 200, 255, p.constrain(210 - p.map(this.z, -1400, 80, 0, 220), 0, 210));
          p.strokeWeight(Math.max(0.9, this.thickness * s));
          p.line(0, 0, -p.cos(this.angle) * this.len * s, -p.sin(this.angle) * this.len * s);
          p.pop();
        }
      }

      class Particle {
        pos: p5.Vector;
        vel: p5.Vector;
        size: number;
        lifespan: number;
        alphaMul: number;

        constructor(pos: p5.Vector, vel: p5.Vector, size: number) {
          this.pos = pos.copy();
          this.vel = vel.copy();
          this.size = size;
          this.lifespan = 255;
          this.alphaMul = 1;
        }

        update() {
          this.pos.add(this.vel);
          this.lifespan -= 8;
        }

        show() {
          p.push();
          p.noStroke();
          p.fill(255, 160, 60, this.lifespan * this.alphaMul);
          p.ellipse(this.pos.x, this.pos.y, this.size);
          p.pop();
        }

        isDead() {
          return this.lifespan <= 0;
        }
      }

      class Comet {
        pos: p5.Vector;
        vel: p5.Vector;
        size: number;
        particles: Particle[];
        alpha: number;
        speed: number;

        constructor() {
          this.reset();
        }

        reset() {
          const edge = p.random(["left", "right", "top", "bottom"]);
          const m = 160;
          if (edge === "left") this.pos = p.createVector(-p.width / 2 - m, p.random(-p.height / 2, p.height / 2));
          else if (edge === "right") this.pos = p.createVector(p.width / 2 + m, p.random(-p.height / 2, p.height / 2));
          else if (edge === "top") this.pos = p.createVector(p.random(-p.width / 2, p.width / 2), -p.height / 2 - m);
          else this.pos = p.createVector(p.random(-p.width / 2, p.width / 2), p.height / 2 + m);

          const target = p.createVector(p.random(-20, 20), p.random(-20, 20));
          const dir = p5.Vector.sub(target, this.pos).normalize();
          this.speed = p.random(9, 16);
          this.vel = dir.mult(this.speed);
          this.size = p.random(20, 30);
          this.particles = [];
          this.alpha = 255;
        }

        update() {
          this.pos.add(this.vel);
          for (let i = 0; i < 2; i++) {
            let pvel = this.vel.copy().mult(p.random(-0.06, -0.25));
            pvel.add(p5.Vector.random2D().mult(p.random(0, 0.18)));
            const pParticle = new Particle(this.pos.copy(), pvel, p.random(2, 4));
            const d = this.pos.mag();
            if (d < globeRadius * 0.78) this.alpha = Math.max(0, this.alpha - 16);
            else this.alpha = Math.min(255, this.alpha + 6);
            pParticle.alphaMul = this.alpha / 255;
            this.particles.push(pParticle);
          }

          for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].isDead()) this.particles.splice(i, 1);
          }

          const d = this.pos.mag();
          if (d < globeRadius * 0.78) {
            this.vel.mult(0.88);
            if (this.alpha <= 0) this.reset();
          }

          if (
            this.pos.x < -p.width * 1.5 ||
            this.pos.x > p.width * 1.5 ||
            this.pos.y < -p.height * 1.5 ||
            this.pos.y > p.height * 1.5
          ) {
            this.reset();
          }
        }

        show() {
          p.push();
          for (let particle of this.particles) particle.show();
          p.pop();
        }
      }

      // -------------------------
      // Helpers
      // -------------------------
      function generateGalaxyBackground(g: p5.Graphics) {
        const c1 = p.color(p.random(10, 50), p.random(0, 30), p.random(80, 140));
        const c2 = p.color(p.random(50, 100), p.random(10, 50), p.random(120, 200));
        const c3 = p.color(p.random(120, 180), p.random(20, 100), p.random(160, 255));
        g.noFill();
        for (let y = 0; y < g.height; y++) {
          let t = y / g.height;
          let col = t < 0.5 ? p.lerpColor(c1, c2, t * 2) : p.lerpColor(c2, c3, (t - 0.5) * 2);
          g.stroke(col);
          g.line(0, y, g.width, y);
        }
      }

      function generatePerspectiveLines() {
        perspectiveLines = [];
        const count = p.int(p.random(50, 120));
        for (let i = 0; i < count; i++) {
          perspectiveLines.push(new PerspectiveLine());
        }
      }

      // -------------------------
      // Draw loop
      // -------------------------
      p.draw = () => {
        p.background(0);

        p.push();
        p.translate(-p.width / 2, -p.height / 2, 0);
        p.image(bgGraphics, 0, 0);
        p.pop();

        p.push();
        p.translate(0, 0, -500);
        for (let line of perspectiveLines) {
          line.update();
          line.show();
        }
        p.pop();

        const gl = p.drawingContext as WebGLRenderingContext;
        gl.disable(gl.DEPTH_TEST);
        for (let s of starStreaks) {
          s.update();
          s.show();
        }
        gl.enable(gl.DEPTH_TEST);

        p.push();
        p.rotateY(coreRotY);
        p.texture(coreTexture);
        p.noStroke();
        p.sphere(globeRadius * 0.22, 64, 64);
        coreRotY += 0.006;

        p.rotateX(p.frameCount * globeRotX);
        p.rotateY(p.frameCount * globeRotY);

        p.push();
        p.texture(earthTexture);
        p.noStroke();
        p.sphere(globeRadius, 56, 56);
        p.pop();

        p.stroke(200, 220, 255, 160);
        p.strokeWeight(1);
        p.noFill();
        for (let [i, j] of connections) {
          let a = nodes[i], b = nodes[j];
          let control = p5.Vector.add(a, b).div(2).normalize().mult(globeRadius * 1.02);
          p.beginShape();
          p.vertex(a.x, a.y, a.z);
          p.vertex(control.x, control.y, control.z);
          p.vertex(b.x, b.y, b.z);
          p.endShape();
        }

        for (let n of nodes) {
          p.push();
          p.translate(n.x, n.y, n.z);
          p.rotateY(p.frameCount * 0.01);
          p.noStroke();
          p.fill(255);
          p.sphere(2.6, 6, 6);
          p.fill(100, 180, 255, 80);
          p.sphere(5.6, 6, 6);
          p.fill(100, 180, 255, 40);
          p.sphere(8.2, 6, 6);
          p.pop();
        }
        p.pop();

        const gl2 = p.drawingContext as WebGLRenderingContext;
        gl2.disable(gl2.DEPTH_TEST);
        for (let c of comets) {
          c.update();
          c.show();
        }
        gl2.enable(gl2.DEPTH_TEST);
      };
    };

    sketchInstance = new p5(sketch, canvasRef.current!);

    return () => {
      sketchInstance.remove();
    };
  }, []);

  return <div ref={canvasRef} style={{ width: "100%", height: "100vh" }} />;
};

export default GenerativeCanvas;
