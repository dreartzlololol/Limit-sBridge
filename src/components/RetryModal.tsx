import React from 'react';
import { RotateCcw, BookOpen, AlertOctagon } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface RetryModalProps {
  isOpen: boolean;
  onRetry: () => void;
  onViewSolution: () => void;
}

export const RetryModal: React.FC<RetryModalProps> = ({ isOpen, onRetry, onViewSolution }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn crt-overlay">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-rose-500/80 rounded-3xl p-6 shadow-[0_0_40px_rgba(244,63,94,0.4)] text-center space-y-6">
        {/* Crash Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-bounce">
          <AlertOctagon className="w-9 h-9 text-rose-400" />
        </div>

        <div>
          <h2 className="text-xl md:text-2xl font-pixel text-rose-400 tracking-wider">
            CRASHED! 💥
          </h2>
          <h3 className="text-base font-extrabold text-slate-100 mt-2">สะพานขาด! รถเกิดอุบัติเหตุ</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            คำตอบที่เลือกยังไม่ถูกต้อง ทำให้ลิมิตฝั่งซ้ายและฝั่งขวาไม่บรรจบกัน
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col gap-3">
          <button
            onClick={() => {
              soundManager.playClick();
              onRetry();
            }}
            className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-pixel text-xs rounded-xl border-t border-white/20 shadow-[0_0_20px_rgba(244,63,94,0.4)] hover:shadow-[0_0_30px_rgba(244,63,94,0.6)] transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>ลองใหม่อีกครั้ง (RETRY)</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onViewSolution();
            }}
            className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 font-semibold text-xs rounded-xl border border-slate-700/50 hover:border-cyan-500/50 shadow-lg hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all duration-300 active:scale-95 backdrop-blur-sm flex items-center justify-center space-x-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>ดูเฉลยและวิธีคิด (SOLUTION)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
