import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, RotateCcw, Save, Share2, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export function Playground() {
  const [code, setCode] = useState('// Welcome to the Coding Kingdom\n\nfunction solve() {\n  console.log("Hello, Questoria!");\n}\n\nsolve();');
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const runCode = () => {
    setIsRunning(true);
    setOutput([]);
    
    // Simulate execution
    setTimeout(() => {
      setOutput(['> Executing...', 'Hello, Questoria!', '> Process exited with code 0']);
      setIsRunning(false);
      
      if (code.includes('Hello, Questoria!')) {
        setShowSuccess(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f2ff', '#7000ff', '#ff00e1']
        });
        setTimeout(() => setShowSuccess(false), 3000);
      }
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">CODING PLAYGROUND</h1>
          <p className="text-slate-400 text-sm">Experiment with code and unlock new abilities.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-400 hover:text-white transition-colors"><Save size={20} /></button>
          <button className="p-2 text-slate-400 hover:text-white transition-colors"><Share2 size={20} /></button>
          <button className="p-2 text-slate-400 hover:text-white transition-colors"><RotateCcw size={20} /></button>
          <button
            onClick={runCode}
            disabled={isRunning}
            className="flex items-center gap-2 px-6 py-2 bg-cyan-500 text-slate-950 font-black rounded-xl hover:bg-cyan-400 transition-all disabled:opacity-50"
          >
            <Play size={18} fill="currentColor" /> {isRunning ? 'RUNNING...' : 'RUN CODE'}
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        <div className="lg:col-span-2 bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
          <div className="bg-slate-950/50 px-4 py-2 border-bottom border-white/5 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">main.js</span>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
            </div>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={code}
              onChange={(v) => setCode(v || '')}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                roundedSelection: true,
                padding: { top: 20 }
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex-1 bg-slate-950 border border-white/10 rounded-2xl p-4 font-mono text-sm overflow-y-auto">
            <div className="text-slate-500 mb-2 uppercase text-[10px] font-bold tracking-widest">Console Output</div>
            {output.map((line, i) => (
              <div key={i} className={line.startsWith('>') ? 'text-slate-600' : 'text-cyan-400'}>
                {line}
              </div>
            ))}
            {output.length === 0 && <div className="text-slate-700 italic">Ready for input...</div>}
          </div>

          <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-cyan-400" /> MISSION OBJECTIVE
            </h3>
            <p className="text-slate-300 text-sm mb-4">
              Write a function that prints <code className="bg-black/40 px-1 rounded text-cyan-400">"Hello, Questoria!"</code> to the console.
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">REWARD</span>
                <span className="text-cyan-400 font-bold">+100 XP</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">DIFFICULTY</span>
                <span className="text-emerald-400 font-bold">EASY</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-12 right-12 bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.4)] flex items-center gap-4 z-50"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="font-black text-lg">MISSION COMPLETE!</div>
              <div className="text-sm opacity-90">+100 XP awarded to your profile.</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
