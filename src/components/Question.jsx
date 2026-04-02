import React from 'react';

export default function Question({ question, skillName, chamberIndex, handleAnswer }) {
  return (
    <div className="bg-slate-900 border-2 border-teal-500 shadow-[0_0_50px_rgba(45,212,191,0.2)] rounded-3xl w-full max-w-4xl overflow-hidden flex flex-col relative z-50">
      
      {/* Door Header - Heavy aesthetic */}
      <div className="bg-slate-950 border-b-4 border-slate-800 p-8 text-center relative overflow-hidden flex flex-col items-center">
        {/* Glowing arch illusion */}
        <div className="absolute top-0 w-full h-[200px] bg-gradient-to-b from-amber-500/10 to-transparent blur-3xl pointer-events-none rounded-t-full"></div>
        
        <div className="text-6xl mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]">🚪</div>
        <h2 className="text-3xl font-black text-amber-500 uppercase tracking-[0.2em] mb-2 drop-shadow-md">
          Chamber {chamberIndex + 1}
        </h2>
        <p className="text-teal-400 font-bold tracking-widest text-sm uppercase px-4 py-1 bg-teal-950/40 border border-teal-500/30 rounded-full inline-block">
          Skill: {skillName}
        </p>
      </div>

      {/* The Scenario (The Engraving) */}
      <div className="p-8 md:p-12 flex-grow bg-slate-900/90 relative z-10 text-center flex items-center justify-center min-h-[200px]">
        <p className="text-2xl text-slate-200 leading-relaxed font-semibold max-w-2xl mx-auto italic">
          "{question.scenario}"
        </p>
      </div>

      {/* The Two Paths (Light & Dark options) */}
      <div className="grid md:grid-cols-2 gap-0 border-t border-slate-800">
        
        {/* Light Path Option A */}
        <button
          onClick={() => handleAnswer('A')}
          className="group relative p-8 bg-slate-900 hover:bg-slate-800 transition-all duration-500 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Light Ambient Glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-teal-400/0 group-hover:bg-teal-400/20 blur-[50px] transition-all duration-700 pointer-events-none"></div>
          
          <span className="text-teal-400 font-black text-6xl opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 absolute mb-20 pointer-events-none drop-shadow-[0_0_20px_rgba(45,212,191,0.8)] text-center w-full">A</span>
          <span className="text-teal-300 font-bold uppercase tracking-widest text-xs mb-4 opacity-50 group-hover:opacity-100 transition-opacity">The Light Path</span>
          
          <p className="text-slate-300 group-hover:text-white text-lg relative z-10 font-medium transition-colors">
            {question.option_a}
          </p>
        </button>

        {/* Dark Path Option B */}
        <button
          onClick={() => handleAnswer('B')}
          className="group relative p-8 bg-slate-950 hover:bg-black transition-all duration-500 flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Dark Ambient Glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-purple-600/0 group-hover:bg-purple-600/20 blur-[50px] transition-all duration-700 pointer-events-none"></div>
          
          <span className="text-purple-500 font-black text-6xl opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 absolute mb-20 pointer-events-none drop-shadow-[0_0_20px_rgba(168,85,247,0.8)] text-center w-full">B</span>
          <span className="text-purple-400 font-bold uppercase tracking-widest text-xs mb-4 opacity-50 group-hover:opacity-100 transition-opacity">The Shadow Path</span>

          <p className="text-slate-400 group-hover:text-white text-lg relative z-10 font-medium transition-colors">
            {question.option_b}
          </p>
        </button>

      </div>
    </div>
  );
}
