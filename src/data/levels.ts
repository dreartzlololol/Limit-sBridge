import type { Level, TableRow } from '../types/game';

// Helper to generate numerical table data for any function
const generateTable = (evalLeft: (x: number) => number, evalRight: (x: number) => number, targetX: number): TableRow[] => {
  const deltas = [0.1, 0.01, 0.001];
  return deltas.map((d) => {
    const xL = Number((targetX - d).toFixed(4));
    const xR = Number((targetX + d).toFixed(4));
    const yL = evalLeft(xL);
    const yR = evalRight(xR);
    return {
      xLeft: xL,
      fxLeft: Number.isFinite(yL) ? Number(yL.toFixed(3)) : 999,
      xRight: xR,
      fxRight: Number.isFinite(yR) ? Number(yR.toFixed(3)) : 999,
    };
  });
};

// Base 11 levels from M.6 Worksheet
const baseLevels: Level[] = [
  {
    id: 1,
    title: 'Level 1: Basic Substitution Limit',
    titleTh: 'ด่าน 1: การแทนค่าฟังก์ชันพหุนาม',
    subtitle: 'ใบกิจกรรมที่ 1 ข้อที่ 1 - สำรวจค่าเมื่อ x → 2',
    sourceDoc: 'ใบกิจกรรมที่ 1 (ข้อ 1)',
    difficulty: 'Basic',
    targetX: 2,
    targetXText: 'x → 2',
    leftExprText: 'f(x) = x² + 2x + 3',
    rightExprText: 'f(x) = x² + 2x + 3',
    fullFormulaLaTeX: '\\lim_{x \\to 2} (x^2 + 2x + 3)',
    evalLeft: (x) => x * x + 2 * x + 3,
    evalRight: (x) => x * x + 2 * x + 3,
    correctChoiceValue: 11,
    questionType: 'slider',
    sliderOptions: { min: 0, max: 20, step: 1 },
    xMin: -1,
    xMax: 5,
    yMin: 0,
    yMax: 20,
    choices: [
      { id: 'c1', label: 'Limit = 11', value: 11, isCorrect: true },
      { id: 'c2', label: 'Limit = 7', value: 7, isCorrect: false },
      { id: 'c3', label: 'Limit = 9', value: 9, isCorrect: false },
      { id: 'c4', label: 'DNE (ไม่มีค่า - หาค่าไม่ได้)', value: 'DNE', isCorrect: false },
    ],
    tableData: [
      { xLeft: 1.9, fxLeft: 10.41, xRight: 2.1, fxRight: 11.61 },
      { xLeft: 1.99, fxLeft: 10.94, xRight: 2.01, fxRight: 11.06 },
      { xLeft: 1.999, fxLeft: 10.994, xRight: 2.001, fxRight: 11.006 },
    ],
    hintTh: 'พิจารณาเมื่อ x เข้าใกล้ 2 ทั้งทางซ้าย (1.999) และทางขวา (2.001) ค่า f(x) วิ่งเข้าหา 11 เท่ากัน',
    explanationSteps: [
      {
        title: '1. แทนค่าตรงๆ ในฟังก์ชันพหุนาม',
        math: '\\lim_{x \\to 2} (x^2 + 2x + 3) = 2^2 + 2(2) + 3 = 11',
        desc: 'เนื่องจากเป็นพหุนามต่อเนื่อง ลิมิตซ้ายและขวาเท่ากับ 11'
      }
    ]
  },
  {
    id: 2,
    title: 'Level 2: Removable Discontinuity',
    titleTh: 'ด่าน 2: ลิมิตรูปแบบไม่กำหนด 0/0',
    subtitle: 'ใบกิจกรรมที่ 1 ข้อที่ 2 - สำรวจค่าเมื่อ x → 5',
    sourceDoc: 'ใบกิจกรรมที่ 1 (ข้อ 2)',
    difficulty: 'Basic',
    targetX: 5,
    targetXText: 'x → 5',
    leftExprText: 'f(x) = (x² - 25) / (x - 5)',
    rightExprText: 'f(x) = (x² - 25) / (x - 5)',
    fullFormulaLaTeX: '\\lim_{x \\to 5} \\frac{x^2 - 25}{x - 5}',
    evalLeft: (x) => (Math.abs(x - 5) < 0.0001 ? 10 : (x * x - 25) / (x - 5)),
    evalRight: (x) => (Math.abs(x - 5) < 0.0001 ? 10 : (x * x - 25) / (x - 5)),
    correctChoiceValue: 10,
    xMin: 0,
    xMax: 10,
    yMin: 0,
    yMax: 16,
    choices: [
      { id: 'c1', label: 'Limit = 0', value: 0, isCorrect: false },
      { id: 'c2', label: 'Limit = 10', value: 10, isCorrect: true },
      { id: 'c3', label: 'Limit = 5', value: 5, isCorrect: false },
      { id: 'c4', label: 'DNE (ไม่มีค่า - หาค่าไม่ได้)', value: 'DNE', isCorrect: false },
    ],
    tableData: [
      { xLeft: 4.9, fxLeft: 9.9, xRight: 5.1, fxRight: 10.1 },
      { xLeft: 4.99, fxLeft: 9.99, xRight: 5.01, fxRight: 10.01 },
      { xLeft: 4.999, fxLeft: 9.999, xRight: 5.001, fxRight: 10.001 },
    ],
    hintTh: 'แยกตัวประกอบ x² - 25 = (x - 5)(x + 5) ตัดพจน์ (x - 5) ออก แล้วแทนค่า x = 5',
    explanationSteps: [
      {
        title: '1. แยกตัวประกอบผลต่างกำลังสอง',
        math: '\\frac{(x - 5)(x + 5)}{x - 5} = x + 5 \\implies \\lim_{x \\to 5} (x + 5) = 10',
        desc: 'ตัดทอนพจน์ (x - 5)'
      }
    ]
  },
  {
    id: 3,
    title: 'Level 3: Absolute Value Shifted Point',
    titleTh: 'ด่าน 3: ค่าสัมบูรณ์ที่จุด x → 4',
    subtitle: 'ใบกิจกรรมที่ 1 ข้อที่ 3 - สำรวจค่าเมื่อ x → 4',
    sourceDoc: 'ใบกิจกรรมที่ 1 (ข้อ 3)',
    difficulty: 'Intermediate',
    targetX: 4,
    targetXText: 'x → 4',
    leftExprText: 'f(x) = (x - 5) / |x - 5|',
    rightExprText: 'f(x) = (x - 5) / |x - 5|',
    fullFormulaLaTeX: '\\lim_{x \\to 4} \\frac{x - 5}{|x - 5|}',
    evalLeft: (x) => (Math.abs(x - 5) < 0.0001 ? -1 : (x - 5) / Math.abs(x - 5)),
    evalRight: (x) => (Math.abs(x - 5) < 0.0001 ? -1 : (x - 5) / Math.abs(x - 5)),
    correctChoiceValue: -1,
    xMin: 0,
    xMax: 8,
    yMin: -3,
    yMax: 3,
    choices: [
      { id: 'c1', label: 'Limit = 1', value: 1, isCorrect: false },
      { id: 'c2', label: 'Limit = -1', value: -1, isCorrect: true },
      { id: 'c3', label: 'Limit = 0', value: 0, isCorrect: false },
      { id: 'c4', label: 'DNE (ไม่มีค่า - หาค่าไม่ได้)', value: 'DNE', isCorrect: false },
    ],
    tableData: [
      { xLeft: 3.9, fxLeft: -1, xRight: 4.1, fxRight: -1 },
      { xLeft: 3.99, fxLeft: -1, xRight: 4.01, fxRight: -1 },
    ],
    hintTh: 'เมื่อ x เข้าใกล้ 4 พจน์ (x - 5) มีค่าเป็นลบเสมอ เช่น (4 - 5 = -1) ดังนั้น |x - 5| = -(x - 5)',
    explanationSteps: [
      {
        title: '1. ถอดค่าสัมบูรณ์รอบๆ x = 4',
        math: 'x - 5 < 0 \\implies |x - 5| = -(x - 5) \\implies \\frac{x - 5}{-(x - 5)} = -1',
        desc: 'มีค่าเป็น -1 ทั้งฝั่งซ้ายและขวา'
      }
    ]
  },
  {
    id: 4,
    title: 'Level 4: Jump Discontinuity (DNE)',
    titleTh: 'ด่าน 4: ค่าสัมบูรณ์เกิดจุดกระโดด (DNE)',
    subtitle: 'ใบกิจกรรมที่ 1 ข้อที่ 4 - สำรวจค่าเมื่อ x → 1',
    sourceDoc: 'ใบกิจกรรมที่ 1 (ข้อ 4)',
    difficulty: 'Intermediate',
    targetX: 1,
    targetXText: 'x → 1',
    leftExprText: 'f(x) = (x - 1) / |x - 1|',
    rightExprText: 'f(x) = (x - 1) / |x - 1|',
    fullFormulaLaTeX: '\\lim_{x \\to 1} \\frac{x - 1}{|x - 1|}',
    evalLeft: (x) => (Math.abs(x - 1) < 0.0001 ? -1 : (x - 1) / Math.abs(x - 1)),
    evalRight: (x) => (Math.abs(x - 1) < 0.0001 ? 1 : (x - 1) / Math.abs(x - 1)),
    correctChoiceValue: 'DNE',
    xMin: -1,
    xMax: 3,
    yMin: -2,
    yMax: 2,
    choices: [
      { id: 'c1', label: 'Limit = 1', value: 1, isCorrect: false },
      { id: 'c2', label: 'Limit = -1', value: -1, isCorrect: false },
      { id: 'c3', label: 'Limit = 0', value: 0, isCorrect: false },
      { id: 'c4', label: 'DNE (ไม่มีค่า - หาค่าไม่ได้)', value: 'DNE', isCorrect: true },
    ],
    tableData: [
      { xLeft: 0.9, fxLeft: -1, xRight: 1.1, fxRight: 1 },
      { xLeft: 0.99, fxLeft: -1, xRight: 1.01, fxRight: 1 },
    ],
    hintTh: 'ลิมิตซ้าย (x < 1) ได้ -1 แต่ลิมิตขวา (x > 1) ได้ 1 ลิมิตสองฝั่งไม่เท่ากัน!',
    explanationSteps: [
      {
        title: '1. เปรียบเทียบลิมิตซ้ายและลิมิตขวา',
        math: '\\lim_{x \\to 1^-} f(x) = -1 \\quad \\text{และ} \\quad \\lim_{x \\to 1^+} f(x) = 1 \\implies \\text{DNE}',
        desc: 'ลิมิตสองฝั่งไม่เท่ากัน'
      }
    ]
  },
  {
    id: 5,
    title: 'Level 5: Reversed Absolute Value (DNE)',
    titleTh: 'ด่าน 5: ค่าสัมบูรณ์สลับตำแหน่งที่ x → 2',
    subtitle: 'ใบกิจกรรมที่ 1 ข้อที่ 5 - สำรวจค่าเมื่อ x → 2',
    sourceDoc: 'ใบกิจกรรมที่ 1 (ข้อ 5)',
    difficulty: 'Intermediate',
    targetX: 2,
    targetXText: 'x → 2',
    leftExprText: 'f(x) = |2 - x| / (2 - x)',
    rightExprText: 'f(x) = |2 - x| / (2 - x)',
    fullFormulaLaTeX: '\\lim_{x \\to 2} \\frac{|2 - x|}{2 - x}',
    evalLeft: (x) => (Math.abs(2 - x) < 0.0001 ? 1 : Math.abs(2 - x) / (2 - x)),
    evalRight: (x) => (Math.abs(2 - x) < 0.0001 ? -1 : Math.abs(2 - x) / (2 - x)),
    correctChoiceValue: 'DNE',
    xMin: 0,
    xMax: 4,
    yMin: -2,
    yMax: 2,
    choices: [
      { id: 'c1', label: 'Limit = 1', value: 1, isCorrect: false },
      { id: 'c2', label: 'Limit = -1', value: -1, isCorrect: false },
      { id: 'c3', label: 'DNE (ไม่มีค่า - หาค่าไม่ได้)', value: 'DNE', isCorrect: true },
      { id: 'c4', label: 'Limit = 0', value: 0, isCorrect: false },
    ],
    tableData: [
      { xLeft: 1.9, fxLeft: 1, xRight: 2.1, fxRight: -1 },
    ],
    hintTh: 'เมื่อ x < 2 ได้ 1 แต่เมื่อ x > 2 ได้ -1',
    explanationSteps: [
      {
        title: '1. เปรียบเทียบลิมิตสองทาง',
        math: '1 \\neq -1 \\implies \\text{ไม่มีค่า (DNE)}',
        desc: 'เกิดจุดกระโดด'
      }
    ]
  },
  {
    id: 6,
    title: 'Level 6: Rational Absolute Value at Origin',
    titleTh: 'ด่าน 6: ค่าสัมบูรณ์ตัวส่วนที่ x → 0',
    subtitle: 'ใบกิจกรรมที่ 1 ข้อที่ 6 - สำรวจค่าเมื่อ x → 0',
    sourceDoc: 'ใบกิจกรรมที่ 1 (ข้อ 6)',
    difficulty: 'Advanced',
    targetX: 0,
    targetXText: 'x → 0',
    leftExprText: 'f(x) = |x| / (x² + x)',
    rightExprText: 'f(x) = |x| / (x² + x)',
    fullFormulaLaTeX: '\\lim_{x \\to 0} \\frac{|x|}{x^2 + x}',
    evalLeft: (x) => {
      if (Math.abs(x) < 0.0001) return -1;
      const denom = x * x + x;
      return Math.abs(denom) < 0.0001 ? -1 : Math.abs(x) / denom;
    },
    evalRight: (x) => {
      if (Math.abs(x) < 0.0001) return 1;
      const denom = x * x + x;
      return Math.abs(denom) < 0.0001 ? 1 : Math.abs(x) / denom;
    },
    correctChoiceValue: 'DNE',
    xMin: -0.8,
    xMax: 1.5,
    yMin: -3,
    yMax: 3,
    choices: [
      { id: 'c1', label: 'Limit = 0', value: 0, isCorrect: false },
      { id: 'c2', label: 'Limit = 1', value: 1, isCorrect: false },
      { id: 'c3', label: 'Limit = -1', value: -1, isCorrect: false },
      { id: 'c4', label: 'DNE (ไม่มีค่า - หาค่าไม่ได้)', value: 'DNE', isCorrect: true },
    ],
    hintTh: 'ดึงตัวประกอบ x ออกจากตัวส่วน x(x + 1) แล้วแยกกรณี x < 0 และ x > 0',
    explanationSteps: [
      {
        title: '1. ลิมิตซ้าย -1 ลิมิตขวา 1',
        math: '\\lim_{x \\to 0^-} = -1, \\quad \\lim_{x \\to 0^+} = 1 \\implies \\text{DNE}',
        desc: 'ลิมิตหาค่าไม่ได้'
      }
    ]
  },
  {
    id: 7,
    title: 'Level 7: Polynomial at Origin',
    titleTh: 'ด่าน 7: ลิมิตพหุนามที่ x → 0',
    subtitle: 'แบบฝึกทักษะที่ 1 ข้อที่ 1 - สำรวจค่าเมื่อ x → 0',
    sourceDoc: 'แบบฝึกทักษะที่ 1 (ข้อ 1)',
    difficulty: 'Basic',
    targetX: 0,
    targetXText: 'x → 0',
    leftExprText: 'f(x) = x² - 5x + 3',
    rightExprText: 'f(x) = x² - 5x + 3',
    fullFormulaLaTeX: '\\lim_{x \\to 0} (x^2 - 5x + 3)',
    evalLeft: (x) => x * x - 5 * x + 3,
    evalRight: (x) => x * x - 5 * x + 3,
    correctChoiceValue: 3,
    questionType: 'slider',
    sliderOptions: { min: -5, max: 10, step: 1 },
    xMin: -2,
    xMax: 4,
    yMin: -5,
    yMax: 10,
    choices: [
      { id: 'c1', label: 'Limit = 3', value: 3, isCorrect: true },
      { id: 'c2', label: 'Limit = -2', value: -2, isCorrect: false },
      { id: 'c3', label: 'Limit = 0', value: 0, isCorrect: false },
      { id: 'c4', label: 'DNE (ไม่มีค่า - หาค่าไม่ได้)', value: 'DNE', isCorrect: false },
    ],
    hintTh: 'แทนค่า x = 0 ลงในสมการตรงๆ ได้ 3',
    explanationSteps: [
      {
        title: '1. แทนค่าโดยตรง',
        math: '0^2 - 5(0) + 3 = 3',
        desc: 'แทนค่าได้ทันที'
      }
    ]
  },
  {
    id: 8,
    title: 'Level 8: Perfect Square Trinomial 0/0',
    titleTh: 'ด่าน 8: กำลังสองสมบูรณ์รูปแบบ 0/0',
    subtitle: 'แบบฝึกทักษะที่ 1 ข้อที่ 2 - สำรวจค่าเมื่อ x → 1',
    sourceDoc: 'แบบฝึกทักษะที่ 1 (ข้อ 2)',
    difficulty: 'Intermediate',
    targetX: 1,
    targetXText: 'x → 1',
    leftExprText: 'f(x) = (x² - 2x + 1) / (x - 1)',
    rightExprText: 'f(x) = (x² - 2x + 1) / (x - 1)',
    fullFormulaLaTeX: '\\lim_{x \\to 1} \\frac{x^2 - 2x + 1}{x - 1}',
    evalLeft: (x) => (Math.abs(x - 1) < 0.0001 ? 0 : (x * x - 2 * x + 1) / (x - 1)),
    evalRight: (x) => (Math.abs(x - 1) < 0.0001 ? 0 : (x * x - 2 * x + 1) / (x - 1)),
    correctChoiceValue: 0,
    xMin: -1,
    xMax: 3,
    yMin: -2,
    yMax: 4,
    choices: [
      { id: 'c1', label: 'Limit = 1', value: 1, isCorrect: false },
      { id: 'c2', label: 'Limit = 0', value: 0, isCorrect: true },
      { id: 'c3', label: 'Limit = -1', value: -1, isCorrect: false },
      { id: 'c4', label: 'DNE (ไม่มีค่า - หาค่าไม่ได้)', value: 'DNE', isCorrect: false },
    ],
    hintTh: 'เศษกระจายได้เป็น (x - 1)² หารด้วย (x - 1) เหลือ x - 1 แทนค่า x = 1 ได้ 0',
    explanationSteps: [
      {
        title: '1. แยกตัวประกอบและตัดทอน',
        math: '\\frac{(x - 1)^2}{x - 1} = x - 1 \\implies 1 - 1 = 0',
        desc: 'ตอบ 0'
      }
    ]
  },
  {
    id: 9,
    title: 'Level 9: Radical Difference 0/0',
    titleTh: 'ด่าน 9: ติดเครื่องหมายรากรูปแบบ 0/0',
    subtitle: 'แบบฝึกทักษะที่ 1 ข้อที่ 3 - สำรวจค่าเมื่อ x → 4',
    sourceDoc: 'แบบฝึกทักษะที่ 1 (ข้อ 3)',
    difficulty: 'Advanced',
    targetX: 4,
    targetXText: 'x → 4',
    leftExprText: 'f(x) = (x - 4) / (√x - 2)',
    rightExprText: 'f(x) = (x - 4) / (√x - 2)',
    fullFormulaLaTeX: '\\lim_{x \\to 4} \\frac{x - 4}{\\sqrt{x} - 2}',
    evalLeft: (x) => {
      const safeX = Math.max(0.01, x);
      return Math.abs(safeX - 4) < 0.0001 ? 4 : (safeX - 4) / (Math.sqrt(safeX) - 2);
    },
    evalRight: (x) => {
      const safeX = Math.max(0.01, x);
      return Math.abs(safeX - 4) < 0.0001 ? 4 : (safeX - 4) / (Math.sqrt(safeX) - 2);
    },
    correctChoiceValue: 4,
    xMin: 0.1,
    xMax: 9,
    yMin: 0,
    yMax: 8,
    choices: [
      { id: 'c1', label: 'Limit = 2', value: 2, isCorrect: false },
      { id: 'c2', label: 'Limit = 4', value: 4, isCorrect: true },
      { id: 'c3', label: 'Limit = 0', value: 0, isCorrect: false },
      { id: 'c4', label: 'DNE (ไม่มีค่า - หาค่าไม่ได้)', value: 'DNE', isCorrect: false },
    ],
    hintTh: 'แยกตัวประกอบเศษ x - 4 = (√x - 2)(√x + 2)',
    explanationSteps: [
      {
        title: '1. แยกตัวประกอบผลต่างกำลังสอง',
        math: '\\frac{(\\sqrt{x} - 2)(\\sqrt{x} + 2)}{\\sqrt{x} - 2} = \\sqrt{x} + 2 \\implies \\sqrt{4} + 2 = 4',
        desc: 'ตอบ 4'
      }
    ]
  },
  {
    id: 10,
    title: 'Level 10: Absolute Value Outside Boundary',
    titleTh: 'ด่าน 10: ค่าสัมบูรณ์นอกจุดรอยต่อ (x → 3)',
    subtitle: 'แบบฝึกทักษะที่ 1 ข้อที่ 4 - สำรวจค่าเมื่อ x → 3',
    sourceDoc: 'แบบฝึกทักษะที่ 1 (ข้อ 4)',
    difficulty: 'Intermediate',
    targetX: 3,
    targetXText: 'x → 3',
    leftExprText: 'f(x) = |x - 2| / (x - 2)',
    rightExprText: 'f(x) = |x - 2| / (x - 2)',
    fullFormulaLaTeX: '\\lim_{x \\to 3} \\frac{|x - 2|}{x - 2}',
    evalLeft: (x) => (Math.abs(x - 2) < 0.0001 ? 1 : Math.abs(x - 2) / (x - 2)),
    evalRight: (x) => (Math.abs(x - 2) < 0.0001 ? 1 : Math.abs(x - 2) / (x - 2)),
    correctChoiceValue: 1,
    xMin: 0,
    xMax: 6,
    yMin: -2,
    yMax: 3,
    choices: [
      { id: 'c1', label: 'Limit = 1', value: 1, isCorrect: true },
      { id: 'c2', label: 'Limit = -1', value: -1, isCorrect: false },
      { id: 'c3', label: 'Limit = 3', value: 3, isCorrect: false },
      { id: 'c4', label: 'DNE (ไม่มีค่า - หาค่าไม่ได้)', value: 'DNE', isCorrect: false },
    ],
    hintTh: 'สังเกตจุด x → 3 ดังนั้น x - 2 > 0 เป็นบวกเสมอ |x - 2| = x - 2',
    explanationSteps: [
      {
        title: '1. ถอดค่าสัมบูรณ์',
        math: '\\frac{x - 2}{x - 2} = 1',
        desc: 'ตอบ 1'
      }
    ]
  },
  {
    id: 11,
    title: 'Level 11: Absolute Value On Boundary',
    titleTh: 'ด่าน 11: ค่าสัมบูรณ์ตรงจุดรอยต่อ (x → 2)',
    subtitle: 'แบบฝึกทักษะที่ 1 ข้อที่ 5 - สำรวจค่าเมื่อ x → 2',
    sourceDoc: 'แบบฝึกทักษะที่ 1 (ข้อ 5)',
    difficulty: 'Advanced',
    targetX: 2,
    targetXText: 'x → 2',
    leftExprText: 'f(x) = |x - 2| / (x - 2)',
    rightExprText: 'f(x) = |x - 2| / (x - 2)',
    fullFormulaLaTeX: '\\lim_{x \\to 2} \\frac{|x - 2|}{x - 2}',
    evalLeft: (x) => (Math.abs(x - 2) < 0.0001 ? -1 : Math.abs(x - 2) / (x - 2)),
    evalRight: (x) => (Math.abs(x - 2) < 0.0001 ? 1 : Math.abs(x - 2) / (x - 2)),
    correctChoiceValue: 'DNE',
    xMin: 0,
    xMax: 4,
    yMin: -2,
    yMax: 2,
    choices: [
      { id: 'c1', label: 'Limit = 1', value: 1, isCorrect: false },
      { id: 'c2', label: 'Limit = -1', value: -1, isCorrect: false },
      { id: 'c3', label: 'Limit = 0', value: 0, isCorrect: false },
      { id: 'c4', label: 'DNE (ไม่มีค่า - หาค่าไม่ได้)', value: 'DNE', isCorrect: true },
    ],
    hintTh: 'จุด x → 2 คือจุดแบ่งรอยต่อ ลิมิตซ้ายได้ -1 แต่ลิมิตขวาได้ 1',
    explanationSteps: [
      {
        title: '1. เปรียบเทียบลิมิตสองทาง',
        math: '-1 \\neq 1 \\implies \\text{DNE}',
        desc: 'ลิมิตหาค่าไม่ได้'
      }
    ]
  }
];

// GENERATE ADDITIONAL LEVELS TO REACH 100 LEVELS SAFELY
const generatedLevels: Level[] = [];

for (let i = 12; i <= 100; i++) {
  const typeIndex = Math.floor(Math.random() * 8);
  let levelItem: Level;

  if (typeIndex === 0) {
    // Polynomial Direct limit
    const a = Math.floor(Math.random() * 5) + 1;
    const c = Math.floor(Math.random() * 7);
    const val = a * a + c;
    const fnText = `x² + ${c}`;
    const latex = `\\lim_{x \\to ${a}} (x^2 + ${c})`;
    const evalFn = (x: number) => x * x + c;
    
    const useSlider = Math.random() > 0.5;

    levelItem = {
      id: i,
      title: `Level ${i}: Polynomial Direct Limit`,
      titleTh: `ด่าน ${i}: ลิมิตพหุนามโดยตรง (x → ${a})`,
      subtitle: `คำนวณค่าลิมิตเมื่อ x เข้าใกล้ ${a}`,
      sourceDoc: `ชุดแบบฝึกหัดแคลคูลัส 100 ข้อ (ข้อ ${i})`,
      difficulty: 'Basic',
      targetX: a,
      targetXText: `x → ${a}`,
      leftExprText: `f(x) = ${fnText}`,
      rightExprText: `f(x) = ${fnText}`,
      fullFormulaLaTeX: latex,
      evalLeft: evalFn,
      evalRight: evalFn,
      correctChoiceValue: val,
      ...(useSlider && {
        questionType: 'slider',
        sliderOptions: { min: Math.max(-5, val - 10), max: val + 15, step: 1 }
      }),
      xMin: Math.max(-2, a - 4),
      xMax: a + 4,
      yMin: Math.max(-2, val - 10),
      yMax: val + 15,
      choices: [
        { id: `c1-${i}`, label: `Limit = ${val}`, value: val, isCorrect: true },
        { id: `c2-${i}`, label: `Limit = ${val + 2}`, value: val + 2, isCorrect: false },
        { id: `c3-${i}`, label: `Limit = ${val - 3}`, value: val - 3, isCorrect: false },
        { id: `c4-${i}`, label: 'DNE (ไม่มีค่า)', value: 'DNE', isCorrect: false },
      ],
      tableData: generateTable(evalFn, evalFn, a),
      hintTh: `แทนค่า x = ${a} ลงในสมการ ${fnText} โดยตรง`,
      explanationSteps: [
        {
          title: '1. แทนค่าโดยตรง',
          math: `${a}^2 + ${c} = ${val}`,
          desc: `ได้ค่าลิมิตเท่ากับ ${val}`
        }
      ]
    };
  } else if (typeIndex === 1 || typeIndex === 2) {
    // Factoring 0/0 limit: (x^2 - a^2) / (x - a) -> 2a
    const a = Math.floor(Math.random() * 6) + 1;
    const a2 = a * a;
    const limitVal = 2 * a;
    const latex = `\\lim_{x \\to ${a}} \\frac{x^2 - ${a2}}{x - ${a}}`;
    const evalFn = (x: number) => (Math.abs(x - a) < 0.0001 ? limitVal : (x * x - a2) / (x - a));

    levelItem = {
      id: i,
      title: `Level ${i}: Factoring Difference of Squares`,
      titleTh: `ด่าน ${i}: การแยกตัวประกอบ 0/0 (x → ${a})`,
      subtitle: `แยกตัวประกอบเพื่อกำจัดพจน์ 0/0`,
      sourceDoc: `ชุดแบบฝึกหัดแคลคูลัส 100 ข้อ (ข้อ ${i})`,
      difficulty: 'Intermediate',
      targetX: a,
      targetXText: `x → ${a}`,
      leftExprText: `f(x) = (x² - ${a2}) / (x - ${a})`,
      rightExprText: `f(x) = (x² - ${a2}) / (x - ${a})`,
      fullFormulaLaTeX: latex,
      evalLeft: evalFn,
      evalRight: evalFn,
      correctChoiceValue: limitVal,
      xMin: Math.max(-2, a - 5),
      xMax: a + 5,
      yMin: Math.max(-2, limitVal - 8),
      yMax: limitVal + 10,
      choices: [
        { id: `c1-${i}`, label: `Limit = ${limitVal}`, value: limitVal, isCorrect: true },
        { id: `c2-${i}`, label: `Limit = ${a}`, value: a, isCorrect: false },
        { id: `c3-${i}`, label: `Limit = 0`, value: 0, isCorrect: false },
        { id: `c4-${i}`, label: 'DNE (ไม่มีค่า)', value: 'DNE', isCorrect: false },
      ],
      tableData: generateTable(evalFn, evalFn, a),
      hintTh: `แยกตัวประกอบ (x - ${a})(x + ${a}) ตัดทอนกับตัวส่วน`,
      explanationSteps: [
        {
          title: '1. แยกตัวประกอบผลต่างกำลังสอง',
          math: `\\frac{(x - ${a})(x + ${a})}{x - ${a}} = x + ${a} \\implies ${a} + ${a} = ${limitVal}`,
          desc: `ได้ค่าลิมิตเท่ากับ ${limitVal}`
        }
      ]
    };
  } else if (typeIndex === 3 || typeIndex === 4) {
    // Absolute value DNE at boundary: |x - a| / (x - a) -> DNE
    const a = Math.floor(Math.random() * 7) + 1;
    const latex = `\\lim_{x \\to ${a}} \\frac{|x - ${a}|}{x - ${a}}`;
    const evalLeftFn = (x: number) => (Math.abs(x - a) < 0.0001 ? -1 : Math.abs(x - a) / (x - a));
    const evalRightFn = (x: number) => (Math.abs(x - a) < 0.0001 ? 1 : Math.abs(x - a) / (x - a));

    levelItem = {
      id: i,
      title: `Level ${i}: Absolute Value Boundary DNE`,
      titleTh: `ด่าน ${i}: ค่าสัมบูรณ์ที่จุดรอยต่อ (x → ${a})`,
      subtitle: `ตรวจสอบลิมิตซ้ายและขวาของ |x - ${a}|`,
      sourceDoc: `ชุดแบบฝึกหัดแคลคูลัส 100 ข้อ (ข้อ ${i})`,
      difficulty: 'Advanced',
      targetX: a,
      targetXText: `x → ${a}`,
      leftExprText: `f(x) = |x - ${a}| / (x - ${a})`,
      rightExprText: `f(x) = |x - ${a}| / (x - ${a})`,
      fullFormulaLaTeX: latex,
      evalLeft: evalLeftFn,
      evalRight: evalRightFn,
      correctChoiceValue: 'DNE',
      xMin: Math.max(-1, a - 3),
      xMax: a + 3,
      yMin: -2,
      yMax: 2,
      choices: [
        { id: `c1-${i}`, label: 'Limit = 1', value: 1, isCorrect: false },
        { id: `c2-${i}`, label: 'Limit = -1', value: -1, isCorrect: false },
        { id: `c3-${i}`, label: 'Limit = 0', value: 0, isCorrect: false },
        { id: `c4-${i}`, label: 'DNE (ไม่มีค่า - หาค่าไม่ได้)', value: 'DNE', isCorrect: true },
      ],
      tableData: generateTable(evalLeftFn, evalRightFn, a),
      hintTh: `ลิมิตทางซ้าย (x < ${a}) ได้ -1 แต่ลิมิตทางขวา (x > ${a}) ได้ 1`,
      explanationSteps: [
        {
          title: '1. พิจารณาลิมิตซ้ายและขวา',
          math: '\\lim_{x \\to ' + a + '^-} = -1 \\quad \\text{และ} \\quad \\lim_{x \\to ' + a + '^+} = 1 \\implies \\text{DNE}',
          desc: 'ลิมิตสองทางไม่เท่ากัน จึงไม่มีค่า (DNE)'
        }
      ]
    };
  } else if (typeIndex === 5) {
    // Radical conjugate limit: (sqrt(x + a) - sqrt(a)) / x at x -> 0 => 1 / (2 sqrt(a))
    const k = Math.floor(Math.random() * 4) + 1; // 1, 4, 9, 16
    const a = k * k; // 1, 4, 9, 16
    const sqrtA = k;
    const limitVal = Number((1 / (2 * sqrtA)).toFixed(3));
    const latex = `\\lim_{x \\to 0} \\frac{\\sqrt{x + ${a}} - ${sqrtA}}{x}`;
    const evalFn = (x: number) => {
      const safeX = Math.max(-a + 0.01, x);
      return Math.abs(safeX) < 0.0001 ? 1 / (2 * sqrtA) : (Math.sqrt(safeX + a) - sqrtA) / safeX;
    };

    levelItem = {
      id: i,
      title: `Level ${i}: Square Root Conjugate Limit`,
      titleTh: `ด่าน ${i}: การคูณคอนจูเกตถอดรูท (x → 0)`,
      subtitle: `ใช้คอนจูเกตเพื่อกำจัดเครื่องหมายราก`,
      sourceDoc: `ชุดแบบฝึกหัดแคลคูลัส 100 ข้อ (ข้อ ${i})`,
      difficulty: 'Advanced',
      targetX: 0,
      targetXText: 'x → 0',
      leftExprText: `f(x) = (√(x+${a}) - ${sqrtA}) / x`,
      rightExprText: `f(x) = (√(x+${a}) - ${sqrtA}) / x`,
      fullFormulaLaTeX: latex,
      evalLeft: evalFn,
      evalRight: evalFn,
      correctChoiceValue: limitVal,
      xMin: -1.5,
      xMax: 4,
      yMin: -0.5,
      yMax: 1.5,
      choices: [
        { id: `c1-${i}`, label: `Limit = ${limitVal}`, value: limitVal, isCorrect: true },
        { id: `c2-${i}`, label: `Limit = ${sqrtA}`, value: sqrtA, isCorrect: false },
        { id: `c3-${i}`, label: `Limit = 0`, value: 0, isCorrect: false },
        { id: `c4-${i}`, label: 'DNE (ไม่มีค่า)', value: 'DNE', isCorrect: false },
      ],
      tableData: generateTable(evalFn, evalFn, 0),
      hintTh: `คูณด้วยคอนจูเกต (√(x + ${a}) + ${sqrtA}) ทั้งเศษและส่วน`,
      explanationSteps: [
        {
          title: '1. คูณด้วย Conjugate',
          math: `\\frac{1}{\\sqrt{0 + ${a}} + ${sqrtA}} = \\frac{1}{${sqrtA} + ${sqrtA}} = \\frac{1}{${2 * sqrtA}} = ${limitVal}`,
          desc: `ได้ค่าลิมิตเท่ากับ ${limitVal}`
        }
      ]
    };
  } else if (typeIndex === 6) {
    // Trig limit: sin(k*x) / x -> k at x -> 0
    const k = Math.floor(Math.random() * 5) + 2; // 2, 3, 4, 5, 6
    const latex = `\\lim_{x \\to 0} \\frac{\\sin(${k}x)}{x}`;
    const evalFn = (x: number) => (Math.abs(x) < 0.0001 ? k : Math.sin(k * x) / x);

    levelItem = {
      id: i,
      title: `Level ${i}: Trigonometric Special Limit`,
      titleTh: `ด่าน ${i}: ลิมิตตรีโกณมิติ sin(${k}x)/x (x → 0)`,
      subtitle: `ใช้สมบัติ lim (u → 0) sin(u)/u = 1`,
      sourceDoc: `ชุดแบบฝึกหัดแคลคูลัส 100 ข้อ (ข้อ ${i})`,
      difficulty: 'Expert',
      targetX: 0,
      targetXText: 'x → 0',
      leftExprText: `f(x) = sin(${k}x) / x`,
      rightExprText: `f(x) = sin(${k}x) / x`,
      fullFormulaLaTeX: latex,
      evalLeft: evalFn,
      evalRight: evalFn,
      correctChoiceValue: k,
      xMin: -3,
      xMax: 3,
      yMin: -2,
      yMax: k + 2,
      choices: [
        { id: `c1-${i}`, label: `Limit = ${k}`, value: k, isCorrect: true },
        { id: `c2-${i}`, label: 'Limit = 1', value: 1, isCorrect: false },
        { id: `c3-${i}`, label: 'Limit = 0', value: 0, isCorrect: false },
        { id: `c4-${i}`, label: 'DNE (ไม่มีค่า)', value: 'DNE', isCorrect: false },
      ],
      tableData: generateTable(evalFn, evalFn, 0),
      hintTh: `ปรับสมการเป็น ${k} · (sin(${k}x) / ${k}x) โดยที่ sin(u)/u → 1`,
      explanationSteps: [
        {
          title: '1. ใช้สมบัติลิมิตตรีโกณมิติ',
          math: `\\lim_{x \\to 0} \\left(${k} \\cdot \\frac{\\sin(${k}x)}{${k}x}\\right) = ${k} \\times 1 = ${k}`,
          desc: `ได้ค่าลิมิตเท่ากับ ${k}`
        }
      ]
    };
  } else {
    // Quadratic Polynomial limit: x^2 - k*x
    const k = Math.floor(Math.random() * 6) + 1;
    const target = 3;
    const val = target * target - k * target;
    const latex = `\\lim_{x \\to ${target}} (x^2 - ${k}x)`;
    const evalFn = (x: number) => x * x - k * x;
    const useSlider = Math.random() > 0.5;

    levelItem = {
      id: i,
      title: `Level ${i}: Quadratic Function Limit`,
      titleTh: `ด่าน ${i}: ลิมิตพหุนามกำลังสอง (x → ${target})`,
      subtitle: `หาค่าลิมิตพหุนาม x² - ${k}x`,
      sourceDoc: `ชุดแบบฝึกหัดแคลคูลัส 100 ข้อ (ข้อ ${i})`,
      difficulty: 'Basic',
      targetX: target,
      targetXText: `x → ${target}`,
      leftExprText: `f(x) = x² - ${k}x`,
      rightExprText: `f(x) = x² - ${k}x`,
      fullFormulaLaTeX: latex,
      evalLeft: evalFn,
      evalRight: evalFn,
      correctChoiceValue: val,
      ...(useSlider && {
        questionType: 'slider',
        sliderOptions: { min: Math.min(-10, val - 5), max: val + 15, step: 1 }
      }),
      xMin: -1,
      xMax: 6,
      yMin: Math.min(-5, val - 5),
      yMax: val + 10,
      choices: [
        { id: `c1-${i}`, label: `Limit = ${val}`, value: val, isCorrect: true },
        { id: `c2-${i}`, label: `Limit = ${val + 4}`, value: val + 4, isCorrect: false },
        { id: `c3-${i}`, label: `Limit = ${val - 2}`, value: val - 2, isCorrect: false },
        { id: `c4-${i}`, label: 'DNE (ไม่มีค่า)', value: 'DNE', isCorrect: false },
      ],
      tableData: generateTable(evalFn, evalFn, target),
      hintTh: `แทนค่า x = ${target} ในสมการ x² - ${k}x`,
      explanationSteps: [
        {
          title: '1. แทนค่าโดยตรง',
          math: `${target}^2 - ${k}(${target}) = ${val}`,
          desc: `ได้ค่าลิมิตเท่ากับ ${val}`
        }
      ]
    };
  }

  generatedLevels.push(levelItem);
}

const shuffleArray = <T>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

export const LEVELS: Level[] = [...baseLevels, ...generatedLevels].map(level => ({
  ...level,
  choices: shuffleArray(level.choices)
}));
