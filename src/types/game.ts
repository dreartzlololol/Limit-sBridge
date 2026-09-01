export type Difficulty = 'Basic' | 'Intermediate' | 'Advanced' | 'Expert';

export type VehicleType = 'car' | 'hoverboard' | 'spaceship' | 'motorcycle' | 'ufo' | 'time_machine';

export interface TableRow {
  xLeft: number;
  fxLeft: number;
  xRight: number;
  fxRight: number;
}

export interface ExplanationStep {
  title: string;
  math: string;
  desc: string;
}

export interface OptionChoice {
  id: string;
  label: string;
  value: number | string; // e.g. 11, -1, or "DNE"
  isCorrect: boolean;
}

export interface Level {
  id: number;
  title: string;
  titleTh: string;
  subtitle: string;
  difficulty: Difficulty;
  sourceDoc: string; // e.g. "ใบกิจกรรมที่ 1 ข้อที่ 1"
  
  // Math definition
  targetX: number; // The point x -> a
  targetXText: string;
  leftExprText: string;
  rightExprText: string;
  fullFormulaLaTeX: string;
  
  // Function logic for graphing
  evalLeft: (x: number) => number;
  evalRight: (x: number) => number;
  
  // Correct Choice
  correctChoiceValue: number | string;
  choices: OptionChoice[];
  
  // Question Type (Default to 'multiple_choice' if undefined)
  questionType?: 'multiple_choice' | 'slider';
  sliderOptions?: {
    min: number;
    max: number;
    step: number;
  };
  
  // Exploration Table (Casio fx-991EX data)
  tableData?: TableRow[];
  
  // Guide & Hints
  hintTh: string;
  explanationSteps: ExplanationStep[];
  
  // Graph domain bounds
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
}

export interface LevelProgress {
  levelId: number;
  unlocked: boolean;
  completed: boolean;
  stars: number; // 0..3
  bestTimeSec?: number;
}
