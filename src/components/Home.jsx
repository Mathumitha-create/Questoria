import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import { World } from './3d/World';
import { Avatar } from './3d/Avatar';
import { Sword, Play } from 'lucide-react';

export function Home({ onStart }) {
  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden">
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[0, 2, 10]} />
          <Suspense fallback={null}>
            <World />
            <Avatar />
            <OrbitControls 
              enableZoom={false} 
              enablePan={false} 
              maxPolarAngle={Math.PI / 2} 
              minPolarAngle={Math.PI / 3} 
            />
          </Suspense>
          <fog attach="fog" args={['#020617', 5, 20]} />
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-8xl font-black text-white tracking-tighter mb-4 drop-shadow-[0_0_30px_rgba(34,211,238,0.5)]">
            SKILL<span className="text-cyan-400">VERSE</span>
          </h1>
          <p className="text-xl text-cyan-100/60 font-medium tracking-[0.3em] uppercase mb-12">
            The Gamified Learning Universe
          </p>
          
          <div className="flex gap-6 pointer-events-auto">
            <button
              onClick={onStart}
              className="group relative px-8 py-4 bg-cyan-500 text-slate-950 font-black rounded-2xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(34,211,238,0.6)]"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center gap-2">
                <Sword size={24} /> START YOUR QUEST
              </span>
            </button>
            
            <button className="px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 transition-all flex items-center gap-2">
              <Play size={24} /> WATCH TRAILER
            </button>
          </div>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <div className="absolute bottom-12 left-12 z-10 pointer-events-none">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center animate-pulse">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
          </div>
          <div className="text-white/40 text-xs font-bold uppercase tracking-widest">
            Server Status: <span className="text-cyan-400">Online</span>
          </div>
        </div>
      </div>

      <div className="absolute top-12 right-12 z-10 pointer-events-none text-right">
        <div className="text-white/20 text-4xl font-black italic">01 // THE AWAKENING</div>
        <div className="text-cyan-400/40 text-sm font-bold uppercase">Current Chapter</div>
      </div>
    </div>
  );
}
