import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { LEVELS } from './data/levels';
import type { LevelProgress, VehicleType } from './types/game';
import { soundManager } from './utils/sound';
import { GraphCanvas } from './components/GraphCanvas';
import { MathFormula } from './components/MathFormula';
import { GameHUD } from './components/GameHUD';
import { StartMenu } from './components/StartMenu';
import { LevelSelector } from './components/LevelSelector';
import { ExplanationModal } from './components/ExplanationModal';
import { ScratchpadModal } from './components/ScratchpadModal';
import { GarageModal } from './components/GarageModal';
import { FullScreenExplosion } from './components/FullScreenExplosion';
import { RetryModal } from './components/RetryModal';
import { GravityExplosionWrapper } from './components/GravityExplosionWrapper';
import {
  Play,
  RotateCcw,
  Sparkles,
  ChevronRight,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Star,
  Award,
  Table,
  FileText,
  Edit3,
} from 'lucide-react';

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'menu' | 'game'>('menu');
  const [currentLevelId, setCurrentLevelId] = useState<number>(() => Math.floor(Math.random() * LEVELS.length) + 1);
  const [selectedChoice, setSelectedChoice] = useState<number | string | null>(null);

  // Gameplay state
  const [isDriving, setIsDriving] = useState<boolean>(false);
  const [driveResult, setDriveResult] = useState<'none' | 'success' | 'crashed'>('none');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showTable, setShowTable] = useState<boolean>(false);
  const [isExploding, setIsExploding] = useState<boolean>(false);

  // Modals
  const [isLevelSelectorOpen, setIsLevelSelectorOpen] = useState<boolean>(false);
  const [isExplanationOpen, setIsExplanationOpen] = useState<boolean>(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState<boolean>(false);
  const [isWinModalOpen, setIsWinModalOpen] = useState<boolean>(false);
  const [isRetryModalOpen, setIsRetryModalOpen] = useState<boolean>(false);
  const [isGarageOpen, setIsGarageOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Garage State
  const [unlockedVehicles, setUnlockedVehicles] = useState<VehicleType[]>(() => {
    const saved = localStorage.getItem('limit_bridge_vehicles');
    return saved ? JSON.parse(saved) : ['car'];
  });
  const [equippedVehicle, setEquippedVehicle] = useState<VehicleType>(() => {
    return (localStorage.getItem('limit_bridge_equipped') as VehicleType) || 'car';
  });
  const [spentStars, setSpentStars] = useState<number>(() => {
    const saved = localStorage.getItem('limit_bridge_spent_stars');
    return saved ? parseInt(saved) : 0;
  });

  // Level progress tracking
  const [progress, setProgress] = useState<Record<number, LevelProgress>>(() => {
    const saved = localStorage.getItem('limit_bridge_progress_100');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return {
      1: { levelId: 1, unlocked: true, completed: false, stars: 0 },
    };
  });

  const level = LEVELS.find((l) => l.id === currentLevelId) || LEVELS[0];

  // Stats
  const totalStars = Object.values(progress).reduce((acc, p) => acc + (p.stars || 0), 0);
  const completedCount = Object.values(progress).filter((p) => p.completed).length;
  const availableStars = totalStars - spentStars;

  // Sync state when level changes
  useEffect(() => {
    setSelectedChoice(null);
    setIsDriving(false);
    setDriveResult('none');
    setShowHint(false);
    setShowTable(false);
    setIsExploding(false);
    setIsRetryModalOpen(false);
  }, [currentLevelId]);

  // Save progress
  useEffect(() => {
    localStorage.setItem('limit_bridge_progress_100', JSON.stringify(progress));
  }, [progress]);

  // Save garage
  useEffect(() => {
    localStorage.setItem('limit_bridge_vehicles', JSON.stringify(unlockedVehicles));
    localStorage.setItem('limit_bridge_equipped', equippedVehicle);
    localStorage.setItem('limit_bridge_spent_stars', spentStars.toString());
  }, [unlockedVehicles, equippedVehicle, spentStars]);

  // Garage Handlers
  const handleBuyVehicle = (type: VehicleType, cost: number) => {
    if (availableStars >= cost) {
      setSpentStars(prev => prev + cost);
      setUnlockedVehicles(prev => [...prev, type]);
      setEquippedVehicle(type);
    }
  };

  const handleEquipVehicle = (type: VehicleType) => {
    setEquippedVehicle(type);
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMute(next);
    if (!next) {
      soundManager.playBGM();
    }
  };

  // Reset current choice selection
  const handleResetLevel = () => {
    setSelectedChoice(null);
    setIsDriving(false);
    setDriveResult('none');
    setIsExploding(false);
    setIsRetryModalOpen(false);
  };

  // Trigger vehicle test drive
  const handleStartDrive = () => {
    if (selectedChoice === null || isDriving) return;

    soundManager.playClick();
    setIsDriving(true);
    setDriveResult('none');
  };

  // Handle result when vehicle completes journey
  const handleDriveComplete = (success: boolean) => {
    setIsDriving(false);
    if (success) {
      setDriveResult('success');
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 },
      });

      // Calculate Stars
      const starsEarned = showHint ? 2 : 3;

      // Update progress
      setProgress((prev) => {
        const current = prev[level.id] || { levelId: level.id, unlocked: true, completed: false, stars: 0 };
        const nextLevelId = level.id + 1;

        const updated = {
          ...prev,
          [level.id]: {
            ...current,
            completed: true,
            stars: Math.max(current.stars || 0, starsEarned),
          },
        };

        if (nextLevelId <= LEVELS.length) {
          updated[nextLevelId] = {
            ...(updated[nextLevelId] || { levelId: nextLevelId }),
            unlocked: true,
          };
        }

        return updated;
      });

      setIsWinModalOpen(true);
    } else {
      // FULL-SCREEN CRASH EXPLOSION & EVERYTHING BREAKS & FALLS WITH GRAVITY!
      setDriveResult('crashed');
      setIsExploding(true);
      soundManager.playExplosion();

      // Wait 1.5 seconds before popping up Retry Screen Modal
      setTimeout(() => {
        setIsExploding(false);
        setIsRetryModalOpen(true);
      }, 1500);
    }
  };

  // Handle Choice Selection
  const handleSelectChoice = (val: number | string) => {
    soundManager.playClick();
    setSelectedChoice(val);
    setDriveResult('none');
  };

  // Next level handler
  const handleNextLevel = () => {
    setIsWinModalOpen(false);
    // Pick a completely random level from the 100 available!
    const randomLevelId = Math.floor(Math.random() * LEVELS.length) + 1;
    setCurrentLevelId(randomLevelId);
  };

  if (viewMode === 'menu') {
    return (
      <>
        <StartMenu
          totalStars={totalStars}
          completedCount={completedCount}
          totalLevels={LEVELS.length}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onStartGame={() => {
            soundManager.playBGM();
            setViewMode('game');
            const randomLevelId = Math.floor(Math.random() * LEVELS.length) + 1;
            setCurrentLevelId(randomLevelId);
          }}
          onOpenLevelSelect={() => {
            soundManager.playBGM();
            setIsLevelSelectorOpen(true);
          }}
          onOpenGarage={() => {
            soundManager.playBGM();
            setIsGarageOpen(true);
          }}
        />

        {/* Level Selector Modal */}
        <LevelSelector
          levels={LEVELS}
          progress={progress}
          currentLevelId={currentLevelId}
          onSelectLevel={(id) => {
            setCurrentLevelId(id);
            setViewMode('game');
            setIsLevelSelectorOpen(false);
          }}
          isOpen={isLevelSelectorOpen}
          onClose={() => setIsLevelSelectorOpen(false)}
        />

        {/* Garage Modal */}
        <GarageModal
          isOpen={isGarageOpen}
          onClose={() => setIsGarageOpen(false)}
          availableStars={availableStars}
          unlockedVehicles={unlockedVehicles}
          equippedVehicle={equippedVehicle}
          onBuyVehicle={handleBuyVehicle}
          onEquipVehicle={handleEquipVehicle}
        />
      </>
    );
  }

  return (
    <div
      className={`min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-cyan-500 selection:text-white relative ${
        isExploding ? 'animate-screenShake' : ''
      }`}
    >
      {/* FULL-SCREEN EXPLOSION & SHATTERED GLASS EFFECT */}
      {isExploding && <FullScreenExplosion />}

      {/* RIGHT EDGE FLOATING SCRATCHPAD DRAWER TAB HANDLE */}
      <button
        onClick={() => {
          soundManager.playClick();
          setIsScratchpadOpen(true);
        }}
        title="เปิดกระดาษทดเลข (Scratchpad)"
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-slate-900/95 hover:bg-slate-800 border-l-2 border-y-2 border-cyan-400 text-cyan-300 py-3.5 px-2 rounded-l-2xl shadow-[0_0_20px_rgba(0,240,255,0.35)] transition transform hover:scale-110 flex flex-col items-center space-y-1 group"
      >
        <Edit3 className="w-5 h-5 text-cyan-400 animate-pulse group-hover:scale-110" />
        <span className="text-[10px] font-pixel tracking-tighter [writing-mode:vertical-lr] text-slate-200 uppercase">
          กระดาษทด
        </span>
      </button>

      {/* Top HUD Header wrapped in Gravity Physics */}
      <GravityExplosionWrapper isExploding={isExploding} delay={0}>
        <GameHUD
          currentLevelId={currentLevelId}
          totalLevels={LEVELS.length}
          totalStars={totalStars}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenLevelSelector={() => setIsLevelSelectorOpen(true)}
          onOpenExplanation={() => setIsExplanationOpen(true)}
          onOpenScratchpad={() => setIsScratchpadOpen(true)}
          onShowHint={() => setShowHint(!showHint)}
          onReset={handleResetLevel}
          onGoHome={() => setViewMode('menu')}
        />
      </GravityExplosionWrapper>

      {/* Main Game Interface */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Canvas Highway View */}
        <div className="lg:col-span-7 space-y-4">
          <GravityExplosionWrapper isExploding={isExploding} delay={40}>
            <GraphCanvas
              level={level}
              selectedChoiceVal={selectedChoice}
              isDriving={isDriving}
              equippedVehicle={equippedVehicle}
              onDriveComplete={handleDriveComplete}
            />
          </GravityExplosionWrapper>

          {/* Test Drive Button & Status Bar wrapped in Gravity Physics */}
          <GravityExplosionWrapper isExploding={isExploding} delay={80}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-4 bg-slate-900/80 border border-slate-800 rounded-none shadow-lg">
              <div className="flex items-center space-x-3">
                {driveResult === 'success' && (
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30 shadow-[0_0_15px_rgba(0,255,157,0.3)]">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>คำตอบถูกต้อง! ✅ รถข้ามสะพานสำเร็จ</span>
                  </div>
                )}
                {driveResult === 'crashed' && (
                  <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/30">
                    <AlertCircle className="w-5 h-5" />
                    <span>คำตอบยังไม่ถูกต้อง! รถเกิดอุบัติเหตุ 💥</span>
                  </div>
                )}
                {driveResult === 'none' && (
                  <span className="text-xs text-slate-400">
                    {selectedChoice === null ? (
                      <span className="text-amber-400 font-semibold">⚠️ เลือกคำตอบฝั่งขวา แล้วกดทดสอบวิ่งเพื่อตรวจคำตอบ</span>
                    ) : (
                      <span>กด <strong className="text-cyan-400">ทดสอบวิ่ง (Test Drive)</strong> เพื่อเริ่มทดสอบข้ามสะพาน</span>
                    )}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <button
                  onClick={handleResetLevel}
                  className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold border border-slate-700/50 hover:border-slate-500 hover:shadow-lg hover:shadow-slate-900/50 transition-all duration-300 active:scale-95 flex items-center justify-center space-x-1.5 backdrop-blur-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>ล้างคำตอบ</span>
                </button>

                {driveResult === 'success' ? (
                  <button
                    onClick={handleNextLevel}
                    className="btn-uiverse flex-1 sm:flex-none shadow-[0_0_20px_rgba(0,255,157,0.4)] !bg-emerald-600 hover:!bg-emerald-500"
                  >
                    <span>ด่านถัดไป (Next)</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                ) : (
                  <button
                    onClick={handleStartDrive}
                    disabled={selectedChoice === null || isDriving}
                    className={`btn-uiverse flex-1 sm:flex-none shadow-[0_0_20px_rgba(0,240,255,0.4)] ${
                      selectedChoice === null || isDriving ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>{isDriving ? 'กำลังทดสอบวิ่ง...' : 'ทดสอบวิ่ง (Test Drive)'}</span>
                  </button>
                )}
              </div>
            </div>
          </GravityExplosionWrapper>
        </div>

        {/* Right Column: Problem Info & Multiple Choice Quiz wrapped in Gravity Physics */}
        <div className="lg:col-span-5 space-y-5">
          {/* Level Header Card */}
          <GravityExplosionWrapper isExploding={isExploding} delay={60}>
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-none space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full font-bold">
                    {level.difficulty}
                  </span>
                  <span className="text-[11px] px-2.5 py-0.5 bg-slate-800 text-slate-300 rounded-lg flex items-center space-x-1">
                    <FileText className="w-3 h-3 text-cyan-400" />
                    <span>{level.sourceDoc}</span>
                  </span>
                </div>

                <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
                  Target: {level.targetXText}
                </span>
              </div>

              <h2 className="text-lg font-extrabold text-slate-100">{level.titleTh}</h2>
              <p className="text-xs text-slate-400 leading-relaxed">{level.subtitle}</p>

              {/* LaTeX Math Expression */}
              <div className="py-4 px-4 bg-slate-950 rounded-none border border-slate-800/80 text-center shadow-inner">
                <MathFormula math={level.fullFormulaLaTeX} displayMode={true} className="text-cyan-300 text-xl" />
              </div>
            </div>
          </GravityExplosionWrapper>

          {/* Hint Card */}
          {showHint && (
            <GravityExplosionWrapper isExploding={isExploding} delay={90}>
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-none space-y-1.5 animate-fadeIn">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>คำใบ้การวิเคราะห์ (Hint)</span>
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed">{level.hintTh}</p>
              </div>
            </GravityExplosionWrapper>
          )}

          {/* CASIO Table Exploration View Toggle */}
          {level.tableData && level.tableData.length > 0 && (
            <GravityExplosionWrapper isExploding={isExploding} delay={110}>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-none space-y-3 shadow-lg">
                <button
                  onClick={() => setShowTable(!showTable)}
                  className="w-full flex items-center justify-between text-xs font-bold text-cyan-400 hover:text-cyan-300 transition"
                >
                  <div className="flex items-center space-x-2">
                    <Table className="w-4 h-4" />
                    <span>{showTable ? 'ซ่อนตารางสำรวจค่า f(x)' : '📊 แสดงตารางสำรวจค่า f(x) (CASIO fx-991EX)'}</span>
                  </div>
                  <span>{showTable ? '▲' : '▼'}</span>
                </button>

                {showTable && (
                  <div className="overflow-x-auto pt-2 animate-fadeIn">
                    <table className="w-full text-xs text-center border-collapse">
                      <thead>
                        <tr className="bg-slate-800/80 text-slate-300 border-b border-slate-700">
                          <th className="py-1.5 px-2 font-mono text-cyan-400">x (ทางซ้าย)</th>
                          <th className="py-1.5 px-2 font-mono text-cyan-300">f(x)</th>
                          <th className="py-1.5 px-2 font-mono text-pink-400">x (ทางขวา)</th>
                          <th className="py-1.5 px-2 font-mono text-pink-300">f(x)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                        {level.tableData.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            <td className="py-1 px-2 text-cyan-400">{row.xLeft}</td>
                            <td className="py-1 px-2 text-slate-200 font-bold">{row.fxLeft}</td>
                            <td className="py-1 px-2 text-pink-400">{row.xRight}</td>
                            <td className="py-1 px-2 text-slate-200 font-bold">{row.fxRight}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </GravityExplosionWrapper>
          )}

          {/* Multiple Choice Quiz Option Buttons wrapped in Gravity Physics */}
          <GravityExplosionWrapper isExploding={isExploding} delay={130}>
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-none space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200 tracking-wide">
                  เลือกคำตอบค่าลิมิตที่ถูกต้อง:
                </h3>
                <button
                  onClick={() => setIsExplanationOpen(true)}
                  className="text-xs text-cyan-400 hover:underline flex items-center space-x-1 font-normal"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>ดูวิธีคิด</span>
                </button>
              </div>

              {/* Question Input */}
              <div className="space-y-3">
                {level.questionType === 'slider' && level.sliderOptions ? (
                  <div className="bg-slate-950/50 p-6 rounded-xl border border-cyan-500/30 flex flex-col items-center space-y-6 shadow-inner">
                    <div className="text-4xl font-mono text-cyan-400 font-bold bg-slate-900 px-8 py-3 rounded-xl border border-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                      {selectedChoice !== null ? selectedChoice : '?'}
                    </div>
                    <input 
                      type="range"
                      min={level.sliderOptions.min}
                      max={level.sliderOptions.max}
                      step={level.sliderOptions.step}
                      value={selectedChoice !== null ? Number(selectedChoice) : Math.floor((level.sliderOptions.min + level.sliderOptions.max)/2)}
                      onChange={(e) => handleSelectChoice(Number(e.target.value))}
                      disabled={isDriving}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                    <div className="flex justify-between w-full text-xs text-slate-500 font-mono font-bold">
                      <span>{level.sliderOptions.min}</span>
                      <span>{level.sliderOptions.max}</span>
                    </div>
                  </div>
                ) : (
                  level.choices.map((choice, idx) => {
                    const isSelected = selectedChoice === choice.value;
                    return (
                      <GravityExplosionWrapper key={choice.id} isExploding={isExploding} delay={150 + idx * 40}>
                        <div className="cyber-radio-wrapper">
                          <input 
                            type="radio" 
                            name="quiz-choice" 
                            className="cyber-input" 
                            checked={isSelected}
                            onChange={() => handleSelectChoice(choice.value)}
                            disabled={isDriving}
                          />
                          <div className="cyber-btn">
                            {choice.label}
                            <span aria-hidden="true" className="cyber-btn__glitch">{choice.label}</span>
                            <label className="cyber-number">CH{idx + 1}</label>
                          </div>
                        </div>
                      </GravityExplosionWrapper>
                    );
                  })
                )}
              </div>
            </div>
          </GravityExplosionWrapper>
        </div>
      </main>

      {/* Scratchpad (กระดาษทดเลข) Modal */}
      <ScratchpadModal
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
      />

      {/* Level Selector Modal */}
      <LevelSelector
        levels={LEVELS}
        progress={progress}
        currentLevelId={currentLevelId}
        onSelectLevel={(id) => {
          setCurrentLevelId(id);
          setViewMode('game');
          setIsLevelSelectorOpen(false);
        }}
        isOpen={isLevelSelectorOpen}
        onClose={() => setIsLevelSelectorOpen(false)}
      />

      {/* Explanation Solution Modal */}
      <ExplanationModal
        level={level}
        isOpen={isExplanationOpen}
        onClose={() => {
          setIsExplanationOpen(false);
          if (driveResult === 'success') {
            setIsWinModalOpen(true);
          } else if (driveResult === 'crashed') {
            setIsRetryModalOpen(true);
          }
        }}
      />

      {/* Garage Modal */}
      <GarageModal
        isOpen={isGarageOpen}
        onClose={() => setIsGarageOpen(false)}
        availableStars={availableStars}
        unlockedVehicles={unlockedVehicles}
        equippedVehicle={equippedVehicle}
        onBuyVehicle={handleBuyVehicle}
        onEquipVehicle={handleEquipVehicle}
      />

      {/* Retry Screen Modal (Pops up 1.5s after crash) */}
      <RetryModal
        isOpen={isRetryModalOpen}
        onRetry={handleResetLevel}
        onViewSolution={() => {
          setIsRetryModalOpen(false);
          setIsExplanationOpen(true);
        }}
      />

      {/* Win Stage Modal */}
      {isWinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-none p-6 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(0,255,157,0.4)]">
              <Award className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-slate-100">ด่านสำเร็จอย่างสมบูรณ์!</h3>
              <p className="text-xs text-slate-400 mt-1">คุณหาค่าลิมิตของฟังก์ชันถูกต้อง</p>
            </div>

            {/* Stars Awarded */}
            <div className="flex justify-center items-center space-x-2 py-2">
              {[1, 2, 3].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 ${
                    star <= (showHint ? 2 : 3)
                      ? 'text-yellow-400 fill-yellow-400 animate-bounce'
                      : 'text-slate-700'
                  }`}
                />
              ))}
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleNextLevel}
                className="btn-uiverse w-full shadow-[0_0_20px_rgba(0,240,255,0.3)]"
              >
                <span>ด่านถัดไป (Next Stage)</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setIsWinModalOpen(false);
                  setIsExplanationOpen(true);
                }}
                className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 font-semibold text-xs rounded-xl border border-slate-700/50 hover:border-cyan-500/30 hover:shadow-[0_0_15px_rgba(0,240,255,0.15)] transition-all duration-300 active:scale-95 backdrop-blur-sm"
              >
                ดูเฉลยและวิธีคิด (View Solution)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
