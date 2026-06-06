import { useEffect, useRef } from 'react';

const LABELS = ['RAG', 'LLM', 'GIS', 'CV', 'XGB', 'FAISS', 'PyTorch', 'React'];

export function NetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let W = 0, H = 0;
    let nodes: { x: number; y: number; ox: number; oy: number; label: string; phase: number }[] = [];
    let hov = -1;
    let rafId: number;

    function resize() {
      W = canvas!.width = canvas!.offsetWidth;
      H = canvas!.height = canvas!.offsetHeight;
      const r = Math.min(W, H) * 0.3;
      nodes = LABELS.map((label, i) => {
        const a = (i / LABELS.length) * Math.PI * 2 - Math.PI / 2;
        const ox = W / 2 + Math.cos(a) * r;
        const oy = H / 2 + Math.sin(a) * r;
        return { x: ox, y: oy, ox, oy, label, phase: Math.random() * Math.PI * 2 };
      });
    }

    function onMove(e: MouseEvent) {
      const rc = canvas!.getBoundingClientRect();
      const x = e.clientX - rc.left;
      const y = e.clientY - rc.top;
      hov = -1;
      nodes.forEach((n, i) => {
        const dx = n.x - x, dy = n.y - y;
        if (dx * dx + dy * dy < 400) hov = i;
      });
    }
    function onLeave() { hov = -1; }
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;
      const t = Date.now() * 0.001;

      nodes.forEach((n, i) => {
        const al = hov < 0 ? 0.15 : hov === i ? 0.5 : 0.05;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(n.x, n.y);
        ctx.strokeStyle = `rgba(59,130,246,${al})`;
        ctx.lineWidth = hov === i ? 1.5 : 0.5;
        ctx.stroke();
        const p = (t * 0.45 + i * 0.3) % 1;
        ctx.beginPath(); ctx.arc(cx + (n.x - cx) * p, cy + (n.y - cy) * p, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(59,130,246,.65)'; ctx.fill();
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 2; j < nodes.length; j += 3) {
          ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = 'rgba(139,92,246,.04)'; ctx.lineWidth = 0.3; ctx.stroke();
        }
      }

      ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.fillStyle = 'rgba(59,130,246,.28)'; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, 4.5, 0, Math.PI * 2); ctx.fillStyle = '#3b82f6'; ctx.fill();

      nodes.forEach((n, i) => {
        n.phase += 0.007;
        n.x = n.ox + Math.sin(n.phase) * 7;
        n.y = n.oy + Math.cos(n.phase * 0.7) * 5;
        const hv = hov === i, rad = hv ? 14 : 10;
        ctx.beginPath(); ctx.arc(n.x, n.y, rad + 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59,130,246,${hv ? 0.38 : 0.13})`; ctx.fill();
        ctx.beginPath(); ctx.arc(n.x, n.y, rad, 0, Math.PI * 2);
        ctx.fillStyle = hv ? '#1a1a3e' : '#14142a'; ctx.fill();
        ctx.strokeStyle = hv ? '#3b82f6' : 'rgba(59,130,246,.38)';
        ctx.lineWidth = hv ? 1.5 : 0.8; ctx.stroke();
        ctx.fillStyle = hv ? '#fff' : 'rgba(255,255,255,.58)';
        ctx.font = `${hv ? 500 : 400} 10px 'DM Mono',monospace`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(n.label, n.x, n.y);
      });

      rafId = requestAnimationFrame(draw);
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement!);
    resize(); draw();

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}
