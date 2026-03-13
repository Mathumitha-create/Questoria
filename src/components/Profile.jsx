import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Shield, Zap, Award, LogOut, Camera, Sparkles, Loader2, Check, RefreshCw, Palette } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { logout, db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { GoogleGenAI } from "@google/genai";

const PREDEFINED_ASSETS = [
  { id: 'cyber', name: 'Cyberpunk', url: 'https://picsum.photos/seed/cyber/400' },
  { id: 'fantasy', name: 'Fantasy', url: 'https://picsum.photos/seed/fantasy/400' },
  { id: 'tech', name: 'Tech', url: 'https://picsum.photos/seed/tech/400' },
  { id: 'steampunk', name: 'Steampunk', url: 'https://picsum.photos/seed/steam/400' },
];

export function Profile() {
  const { user, profile } = useAuth();
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!user || !profile) return null;

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: `A high-quality, futuristic avatar for a skill-learning platform. Character description: ${prompt}. Style: digital art, vibrant colors, clean lines, professional profile picture.`,
            },
          ],
        },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          setGeneratedImage(`data:image/png;base64,${base64EncodeString}`);
          break;
        }
      }
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAvatar = async (imageUrl) => {
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        photoURL: imageUrl
      });
      setIsCustomizing(false);
      setGeneratedImage(null);
      setPrompt('');
    } catch (error) {
      console.error('Error saving avatar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="relative">
        <div className="h-48 w-full bg-gradient-to-r from-cyan-600/20 to-purple-600/20 rounded-[40px] border border-white/10" />
        <div className="absolute -bottom-12 left-12 flex items-end gap-6">
          <div className="relative group">
            <img 
              src={profile.photoURL || user.photoURL || 'https://picsum.photos/seed/user/200'} 
              alt="Profile" 
              className="w-32 h-32 rounded-3xl border-4 border-slate-950 object-cover shadow-2xl"
              referrerPolicy="no-referrer"
            />
            <button 
              onClick={() => setIsCustomizing(true)}
              className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
            >
              <Camera size={24} />
            </button>
          </div>
          <div className="pb-4">
            <h1 className="text-3xl font-black text-white mb-1">{profile.displayName}</h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
              <Shield size={12} className="text-cyan-400" /> Level {profile.level} Master Architect
            </p>
          </div>
        </div>
        <div className="absolute bottom-4 right-8 flex gap-3">
          <button 
            onClick={() => setIsCustomizing(true)}
            className="flex items-center gap-2 px-6 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl hover:bg-cyan-500 hover:text-white transition-all font-bold text-sm"
          >
            <Palette size={18} /> CUSTOMIZE
          </button>
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-6 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all font-bold text-sm"
          >
            <LogOut size={18} /> SIGN OUT
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isCustomizing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-900/60 border border-cyan-500/20 rounded-[32px] p-8 space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  <Sparkles className="text-cyan-400" /> AVATAR FORGE
                </h2>
                <button 
                  onClick={() => setIsCustomizing(false)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  CANCEL
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* AI Generation */}
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">AI Generator</h3>
                  <div className="space-y-4">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe your perfect avatar... e.g., 'A cyberpunk hacker with neon goggles and a chrome jacket'"
                      className="w-full h-32 bg-slate-950 border border-white/10 rounded-2xl p-4 text-white placeholder:text-slate-600 focus:border-cyan-500/50 outline-none transition-all resize-none"
                    />
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating || !prompt}
                      className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="animate-spin" /> FORGING...
                        </>
                      ) : (
                        <>
                          <Sparkles size={20} /> GENERATE AVATAR
                        </>
                      )}
                    </button>
                  </div>

                  {generatedImage && (
                    <div className="space-y-4">
                      <div className="aspect-square rounded-3xl overflow-hidden border-4 border-cyan-500/30 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                        <img src={generatedImage} alt="Generated" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleSaveAvatar(generatedImage)}
                          disabled={isSaving}
                          className="flex-1 py-3 bg-cyan-500 text-slate-950 font-black rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-400 transition-colors disabled:opacity-50"
                        >
                          {isSaving ? <Loader2 className="animate-spin" /> : <Check size={20} />} EQUIP THIS
                        </button>
                        <button
                          onClick={() => setGeneratedImage(null)}
                          className="px-6 py-3 bg-slate-800 text-white font-black rounded-xl hover:bg-slate-700 transition-colors"
                        >
                          <RefreshCw size={20} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Predefined Assets */}
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Legacy Assets</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {PREDEFINED_ASSETS.map((asset) => (
                      <button
                        key={asset.id}
                        onClick={() => handleSaveAvatar(asset.url)}
                        className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-transparent hover:border-cyan-500/50 transition-all"
                      >
                        <img 
                          src={asset.url} 
                          alt={asset.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                          <span className="text-white text-xs font-black uppercase tracking-widest">{asset.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
        <div className="space-y-6">
          <section className="bg-slate-900/40 border border-white/5 rounded-3xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <User size={18} className="text-cyan-400" /> INFO
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-slate-500" />
                <span className="text-slate-300 text-sm">{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap size={16} className="text-slate-500" />
                <span className="text-slate-300 text-sm">Joined March 2026</span>
              </div>
            </div>
          </section>

          <section className="bg-slate-900/40 border border-white/5 rounded-3xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Award size={18} className="text-purple-400" /> BADGES
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="aspect-square rounded-lg bg-slate-800 flex items-center justify-center text-xl grayscale opacity-30">
                  {i === 1 ? '🥇' : i === 2 ? '🚀' : '🔥'}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="md:col-span-2 space-y-6">
          <section className="bg-slate-900/40 border border-white/5 rounded-3xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">SKILL MASTERY</h2>
            <div className="space-y-6">
              {[
                { name: 'JavaScript', level: 85, color: 'bg-yellow-500' },
                { name: 'React', level: 70, color: 'bg-cyan-500' },
                { name: 'Three.js', level: 45, color: 'bg-purple-500' },
                { name: 'Logic', level: 90, color: 'bg-emerald-500' },
              ].map((skill) => (
                <div key={skill.name}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-300 font-bold">{skill.name}</span>
                    <span className="text-white font-black">{skill.level}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.level}%` }}
                      className={cn("h-full", skill.color)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-slate-900/40 border border-white/5 rounded-3xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">RECENT ACTIVITY</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-lg">
                    {i === 1 ? '✅' : i === 2 ? '🏆' : '⚔️'}
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-bold">
                      {i === 1 ? 'Completed "The Binary Fortress"' : 
                       i === 2 ? 'Reached Level 12' : 
                       'Started "Neural Nexus"'}
                    </div>
                    <div className="text-slate-500 text-xs uppercase font-bold tracking-tighter">2 hours ago</div>
                  </div>
                  <div className="text-cyan-400 font-black text-sm">
                    {i === 1 ? '+500 XP' : i === 2 ? '+1000 XP' : '+50 XP'}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
