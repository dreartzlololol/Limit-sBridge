import React from 'react';
import type { Level } from '../types/game';
import { MathFormula } from './MathFormula';
import { X, BookOpen, CheckCircle } from 'lucide-react';

interface ExplanationModalProps {
  level: Level;
  isOpen: boolean;
  onClose: () => void;
}

export const ExplanationModal: React.FC<ExplanationModalProps> = ({ level, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
          <div className="flex items-center space-x-2 text-cyan-400">
            <BookOpen className="w-5 h-5" />
            <h3 className="font-bold text-lg text-slate-100">{level.titleTh} - เฉลยและคำอธิบาย</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-rose-500/80 transition-all duration-300 active:scale-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200">
          {/* Main Formula */}
          <div className="p-4 bg-slate-950/70 border border-cyan-500/30 rounded-xl text-center shadow-inner">
            <span className="text-xs uppercase tracking-wider text-cyan-400 font-semibold block mb-2">
              โจทย์สมการลิมิต
            </span>
            <MathFormula math={level.fullFormulaLaTeX} displayMode={true} className="text-xl text-cyan-200" />
          </div>

          {/* Step-by-step list */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-300 text-sm tracking-wide flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>ขั้นตอนการแก้โจทย์ (Step-by-Step Solution):</span>
            </h4>

            {level.explanationSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-2 hover:border-slate-600 transition"
              >
                <div className="font-medium text-cyan-300 text-sm">{step.title}</div>
                <div className="py-2 bg-slate-900/60 px-3 rounded-lg border border-slate-800">
                  <MathFormula math={step.math} displayMode={true} className="text-emerald-300" />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-800/40 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl border-t border-white/20 transition-all duration-300 active:scale-95 shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)]"
          >
            เข้าใจแล้ว (Got It)
          </button>
        </div>
      </div>
    </div>
  );
};
