import React, { useEffect, useRef, useState, Suspense } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { HiSparkles, HiArrowRight, HiLightningBolt, HiTerminal, HiShieldCheck, HiCode } from 'react-icons/hi';

const Spline = React.lazy(() => import('@splinetool/react-spline'));

// ─── Interactive Neural Particle Canvas ──────────────────────────────
function NeuralParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const mouse = { x: width / 2, y: height / 3, radius: 180 };
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const particleCount = Math.min(65, Math.floor((width * height) / 18000));
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      size: Math.random() * 2 + 1,
      color: Math.random() > 0.5 ? '#6366F1' : '#EC4899',
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse gravity/interaction
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          p.x -= (dx / dist) * force * 1.5;
          p.y -= (dy / dist) * force * 1.5;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + '80';
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist2 = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist2 < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${(1 - dist2 / 130) * 0.25})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-70" />;
}

// ─── Animated Terminal Stream ────────────────────────────────────────
const TERMINAL_LINES = [
  { prefix: 'nexblog-os$', text: ' initialize-kernel --mode hexagonal-v3.2.5', type: 'command' },
  { prefix: '[system]', text: ' Loading ProviderFactory & MongoVectorStoreAdapter (64d embeddings)...', type: 'info' },
  { prefix: '[system]', text: ' Background Queue: BullMQ Redis worker registered (DLQ active)...', type: 'info' },
  { prefix: 'copilot$', text: ' rag-search --query "concentric rings domain ports" --topK 5', type: 'command' },
  { prefix: '[ai]', text: ' Synthesizing technical breakdown with verifiable vector citations [Source 1 - L12]...', type: 'success' },
  { prefix: '[status]', text: ' ✓ All claims verified against engineering knowledge anchors.', type: 'highlight' },
];

function AnimatedTerminal() {
  const [currentLines, setCurrentLines] = useState([TERMINAL_LINES[0]]);
  const [, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % TERMINAL_LINES.length;
        if (next === 0) {
          setCurrentLines([TERMINAL_LINES[0]]);
        } else {
          setCurrentLines((lines) => [...lines, TERMINAL_LINES[next]]);
        }
        return next;
      });
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="glass dark:glass-dark rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card overflow-hidden text-left font-mono text-xs">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/60 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400/80 shadow-sm" />
          <div className="w-3 h-3 rounded-full bg-yellow-400/80 shadow-sm" />
          <div className="w-3 h-3 rounded-full bg-green-400/80 shadow-sm" />
          <span className="ml-2 font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 text-[11px]">
            <HiTerminal className="w-3.5 h-3.5 text-primary-500" /> nexblog-ai-kernel.sh
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Connected</span>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="p-5 space-y-2.5 min-h-[170px] bg-slate-950/90 text-slate-200">
        {currentLines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-2.5 leading-relaxed"
          >
            <span className={
              line.type === 'command' ? 'text-primary-400 font-bold' :
              line.type === 'success' ? 'text-emerald-400' :
              line.type === 'highlight' ? 'text-amber-400 font-bold' : 'text-slate-500'
            }>
              {line.prefix}
            </span>
            <span className={line.type === 'command' ? 'text-white font-medium' : 'text-slate-300'}>
              {line.text}
            </span>
          </motion.div>
        ))}
        <div className="flex items-center gap-1 pt-1">
          <span className="text-primary-400 font-bold">nexblog-os$</span>
          <span className="w-2 h-4 bg-primary-400 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// ─── Hero Section Component ──────────────────────────────────────────
export default function HeroSection() {
  const { currentUser } = useSelector((state) => state.user);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-300, 300], [12, -12]), { damping: 25, stiffness: 120 });
  const rotateY = useSpring(useTransform(x, [-300, 300], [-12, 12]), { damping: 25, stiffness: 120 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const [_splineLoaded, setSplineLoaded] = useState(false);
  const [shouldLoadSpline, setShouldLoadSpline] = useState(false);
  const splineContainerRef = useRef(null);

  // Defer fetching the ~4.6MB Spline 3D scene chunk until its container is
  // about to scroll into view, and skip it entirely for prefers-reduced-motion
  // so hero text/CTAs aren't competing with it for bandwidth on first paint.
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const node = splineContainerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadSpline(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative min-h-screen pt-24 pb-20 flex flex-col justify-center overflow-hidden bg-surface dark:bg-surface-dark">
      {/* Neural Particle Background */}
      <NeuralParticleCanvas />

      {/* Volumetric Radial Lighting Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/6 left-1/4 w-[500px] h-[500px] rounded-full bg-primary-500/15 dark:bg-primary-500/10 blur-[140px] animate-pulse-slow" />
        <div className="absolute top-1/3 right-1/5 w-[420px] h-[420px] rounded-full bg-secondary-500/15 dark:bg-secondary-500/10 blur-[130px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[650px] h-[300px] rounded-full bg-accent-500/10 dark:bg-accent-500/5 blur-[160px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full glass dark:glass-dark border border-primary-500/30 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-glass mb-8"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
          </span>
          <span className="gradient-brand-text font-extrabold tracking-wide uppercase">Version 3.2.5 Hexagonal Architecture</span>
          <span className="h-3 w-px bg-slate-300 dark:bg-slate-700 mx-1" />
          <span className="text-slate-500 dark:text-slate-400">AI Knowledge & Content OS</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.05] max-w-5xl mx-auto mb-8"
        >
          The Next Evolution of <br />
          <span className="gradient-brand-text relative inline-block">
            AI Knowledge OS
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="absolute -bottom-2 left-0 right-0 h-1.5 gradient-brand rounded-full opacity-60 origin-left"
            />
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-12 font-medium leading-relaxed"
        >
          Unite technical documentation, hybrid RAG vector search, multi-model AI workflows, and verifiable content generation for engineering & product teams.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-20"
        >
          <Link
            to={currentUser ? "/ai-workspace" : "/sign-up"}
            id="hero-primary-cta"
            className="btn-primary px-10 py-4 text-lg font-bold shadow-glow flex items-center justify-center gap-3 w-full sm:w-auto group"
          >
            <span>{currentUser ? "✨ Open AI Studio Workspace" : "Launch AI Studio Free"}</span>
            <HiArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </Link>
          <Link
            to={currentUser ? "/ai-workflow-studio" : "/search"}
            id="hero-secondary-cta"
            className="btn-secondary px-9 py-4 text-lg font-bold flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <HiCode className="w-5 h-5 text-primary-500" />
            <span>{currentUser ? "🔀 AI Workflow Studio" : "Explore Technical Library"}</span>
          </Link>
        </motion.div>

        {/* 3D Interactive Mockup Container with Parallax Floating Panels */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ perspective: 1400 }}
          className="relative max-w-5xl mx-auto cursor-pointer"
        >
          {/* Parallax Floating Badge 1 (Top Left) */}
          <motion.div
            style={{ x: useTransform(x, [-300, 300], [-35, 35]), y: useTransform(y, [-300, 300], [-25, 25]), zIndex: 30 }}
            className="absolute -top-10 -left-6 sm:-left-12 hidden md:flex items-center gap-3 px-5 py-3 rounded-2xl glass dark:glass-dark shadow-card border border-primary-500/30 animate-float"
          >
            <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center shadow-glow-sm">
              <HiSparkles className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Vector Knowledge</p>
              <p className="text-sm font-heading font-extrabold text-slate-900 dark:text-white">64d Hybrid RAG</p>
            </div>
          </motion.div>

          {/* Parallax Floating Badge 2 (Top Right) */}
          <motion.div
            style={{ x: useTransform(x, [-300, 300], [35, -35]), y: useTransform(y, [-300, 300], [-25, 25]), zIndex: 30, animationDelay: '1.2s' }}
            className="absolute -top-8 -right-6 sm:-right-12 hidden md:flex items-center gap-3 px-5 py-3 rounded-2xl glass dark:glass-dark shadow-card border border-emerald-500/30 animate-float"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
              <HiShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Claim Verification</p>
              <p className="text-sm font-heading font-extrabold text-emerald-500">100% Factual Anchors</p>
            </div>
          </motion.div>

          {/* Parallax Floating Badge 3 (Bottom Left) */}
          <motion.div
            style={{ x: useTransform(x, [-300, 300], [-25, 25]), y: useTransform(y, [-300, 300], [35, -35]), zIndex: 30, animationDelay: '2.4s' }}
            className="absolute -bottom-8 -left-4 sm:-left-8 hidden lg:flex items-center gap-3 px-5 py-3 rounded-2xl glass dark:glass-dark shadow-card border border-secondary-500/30 animate-float"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-secondary-500 to-purple-600 flex items-center justify-center shadow-sm">
              <HiLightningBolt className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Background Queue</p>
              <p className="text-sm font-heading font-extrabold text-slate-900 dark:text-white">BullMQ + DLQ Active</p>
            </div>
          </motion.div>

          {/* Main Tilted 3D Mockup Container */}
          <motion.div
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
            className="relative rounded-3xl glass dark:glass-dark border border-slate-200/80 dark:border-slate-800 shadow-card-hover p-4 sm:p-6 transition-shadow duration-500 overflow-hidden"
          >
            {/* Background Spline or Interactive Device Frame */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Column: Spline 3D Scene / Visual Preview */}
              <div ref={splineContainerRef} className="lg:col-span-7 relative h-[320px] sm:h-[400px] rounded-2xl overflow-hidden bg-slate-950/80 border border-slate-800 flex items-center justify-center group">
                {shouldLoadSpline ? (
                  <Suspense
                    fallback={
                      <div className="flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-16 h-16 gradient-brand rounded-3xl flex items-center justify-center mb-4 animate-bounce">
                          <HiSparkles className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-sm font-bold text-slate-300">Rendering 3D Isometric Core…</p>
                      </div>
                    }
                  >
                    {/* Public interactive Spline 3D Scene */}
                    <Spline
                      scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode"
                      onLoad={() => setSplineLoaded(true)}
                      className="w-full h-full object-cover"
                    />
                  </Suspense>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 gradient-brand rounded-3xl flex items-center justify-center mb-4">
                      <HiSparkles className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-sm font-bold text-slate-300">Interactive 3D Core</p>
                  </div>
                )}

                {/* Overlay Instruction */}
                <div className="absolute bottom-4 right-4 px-3.5 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-slate-300 flex items-center gap-2 pointer-events-none">
                  <span className="w-2 h-2 rounded-full bg-primary-400 animate-ping" />
                  <span>Interactive 3D Core · Drag & Tilt</span>
                </div>
              </div>

              {/* Right Column: Animated Terminal & Copilot Panel */}
              <div className="lg:col-span-5 space-y-4">
                <AnimatedTerminal />

                <div className="p-4 rounded-2xl glass dark:glass-dark border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-left">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Engineering Teams</p>
                    <p className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">24,810+ Technical Users</p>
                  </div>
                  <div className="flex -space-x-2.5 overflow-hidden">
                    {[
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
                      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
                      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
                    ].map((src, idx) => (
                      <img key={idx} className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover" src={src} alt="Creator avatar" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Metrics Bar */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto pt-10 border-t border-slate-200/60 dark:border-slate-800/80">
          {[
            { metric: '100,000+', label: 'Technical Docs & Articles' },
            { metric: '99.9%', label: 'Factual Claim Verification' },
            { metric: '5× Faster', label: 'Engineering Workflow Velocity' },
            { metric: 'Hexagonal', label: 'Strict Ports & Adapters Core' },
          ].map(({ metric, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-5 rounded-2xl glass dark:glass-dark border border-slate-200/60 dark:border-slate-800/60 hover:border-primary-500/30 transition-colors"
            >
              <p className="font-heading text-2xl sm:text-3xl font-extrabold gradient-brand-text mb-1">{metric}</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
