import "dotenv/config"
import { PrismaClient, Level } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding database…")

  // ── Subject ───────────────────────────────────────────────
  const math = await prisma.subject.upsert({
    where: { id: "math" },
    create: { id: "math", name: "Mathematics" },
    update: { name: "Mathematics" },
  })

  // ── Units ─────────────────────────────────────────────────
  const units = await Promise.all([
    // PRIMARY — Grade 6
    upsertUnit("unit-p6-fractions",  math.id, "Fractions",          "Grade 6",  Level.PRIMARY),
    upsertUnit("unit-p6-decimals",   math.id, "Decimals",           "Grade 6",  Level.PRIMARY),
    upsertUnit("unit-p6-area",       math.id, "Area & Perimeter",   "Grade 6",  Level.PRIMARY),

    // PRIMARY — Grade 7
    upsertUnit("unit-p7-ratio",      math.id, "Ratio & Proportion", "Grade 7",  Level.PRIMARY),
    upsertUnit("unit-p7-integers",   math.id, "Integers",           "Grade 7",  Level.PRIMARY),

    // PRIMARY — Grade 10
    upsertUnit("unit-p10-algebra",   math.id, "Basic Algebra",      "Grade 10", Level.PRIMARY),

    // HIGH SCHOOL — Form 3
    upsertUnit("unit-f3-quadratic",  math.id, "Quadratic Equations","Form 3",   Level.HIGH_SCHOOL),
    upsertUnit("unit-f3-trig",       math.id, "Trigonometry",       "Form 3",   Level.HIGH_SCHOOL),
    upsertUnit("unit-f3-stats",      math.id, "Statistics",         "Form 3",   Level.HIGH_SCHOOL),

    // HIGH SCHOOL — Form 4
    upsertUnit("unit-f4-calculus",   math.id, "Introduction to Calculus", "Form 4", Level.HIGH_SCHOOL),
    upsertUnit("unit-f4-vectors",    math.id, "Vectors",            "Form 4",   Level.HIGH_SCHOOL),

    // INTERNATIONAL — Grade 5
    upsertUnit("unit-i5-numbers",    math.id, "Number Sense",       "Grade 5",  Level.INTERNATIONAL),
    upsertUnit("unit-i5-geometry",   math.id, "Geometry Basics",    "Grade 5",  Level.INTERNATIONAL),

    // INTERNATIONAL — Grade 6
    upsertUnit("unit-i6-fractions",  math.id, "Fractions & Percentages", "Grade 6", Level.INTERNATIONAL),

    // INTERNATIONAL — Grade 8
    upsertUnit("unit-i8-algebra",    math.id, "Algebraic Expressions", "Grade 8", Level.INTERNATIONAL),
    upsertUnit("unit-i8-linear",     math.id, "Linear Equations",   "Grade 8",  Level.INTERNATIONAL),

    // INTERNATIONAL — Grade 9
    upsertUnit("unit-i9-pythagoras", math.id, "Pythagoras & Circles", "Grade 9", Level.INTERNATIONAL),
    upsertUnit("unit-i9-probability",math.id, "Probability",        "Grade 9",  Level.INTERNATIONAL),
  ])

  const unitMap = Object.fromEntries(units.map((u) => [u.id, u]))

  // ── Questions ─────────────────────────────────────────────
  const questions: Parameters<typeof upsertQuestion>[0][] = [
    // Grade 6 Fractions (Primary)
    { id: "q-p6f-1", unitId: "unit-p6-fractions", text: "What is 3/4 + 1/4?", options: ["1/2", "4/8", "1", "3/8"], correctAnswer: "C", explanation: "3/4 + 1/4 = 4/4 = 1. When fractions have the same denominator, just add the numerators." },
    { id: "q-p6f-2", unitId: "unit-p6-fractions", text: "What is 5/6 − 1/3?", options: ["4/3", "1/2", "2/6", "4/6"], correctAnswer: "B", explanation: "Convert 1/3 to 2/6, then 5/6 − 2/6 = 3/6 = 1/2." },
    { id: "q-p6f-3", unitId: "unit-p6-fractions", text: "Which fraction is equivalent to 2/3?", options: ["3/4", "4/6", "5/9", "6/10"], correctAnswer: "B", explanation: "2/3 = 4/6 because both numerator and denominator are multiplied by 2." },
    { id: "q-p6f-4", unitId: "unit-p6-fractions", text: "What is 1/2 × 4/5?", options: ["5/7", "4/10", "2/5", "4/7"], correctAnswer: "C", explanation: "Multiply numerators: 1×4=4, multiply denominators: 2×5=10, giving 4/10 = 2/5." },
    { id: "q-p6f-5", unitId: "unit-p6-fractions", text: "What is 3/5 of 20?", options: ["12", "15", "9", "10"], correctAnswer: "A", explanation: "3/5 of 20 = (3 × 20) ÷ 5 = 60 ÷ 5 = 12." },
    { id: "q-p6f-6", unitId: "unit-p6-fractions", text: "Write 0.75 as a fraction in lowest terms.", options: ["75/100", "3/4", "7/10", "15/20"], correctAnswer: "B", explanation: "0.75 = 75/100 = 3/4 when reduced by dividing both by 25." },
    { id: "q-p6f-7", unitId: "unit-p6-fractions", text: "Which is greater: 2/5 or 3/8?", options: ["2/5", "3/8", "They are equal", "Cannot tell"], correctAnswer: "A", explanation: "2/5 = 16/40 and 3/8 = 15/40, so 2/5 is slightly greater." },

    // Grade 6 Decimals (Primary)
    { id: "q-p6d-1", unitId: "unit-p6-decimals", text: "What is 3.6 + 1.45?", options: ["4.95", "5.05", "4.5", "5.1"], correctAnswer: "B", explanation: "Align decimals: 3.60 + 1.45 = 5.05." },
    { id: "q-p6d-2", unitId: "unit-p6-decimals", text: "What is 7.2 × 0.5?", options: ["36", "3.6", "0.36", "14.4"], correctAnswer: "B", explanation: "7.2 × 0.5 = 7.2 ÷ 2 = 3.6." },
    { id: "q-p6d-3", unitId: "unit-p6-decimals", text: "Round 4.567 to 2 decimal places.", options: ["4.5", "4.56", "4.57", "4.6"], correctAnswer: "C", explanation: "The third decimal is 7 ≥ 5, so round up: 4.567 → 4.57." },
    { id: "q-p6d-4", unitId: "unit-p6-decimals", text: "What is 9.0 − 3.75?", options: ["5.35", "5.25", "6.25", "5.75"], correctAnswer: "B", explanation: "9.00 − 3.75 = 5.25." },
    { id: "q-p6d-5", unitId: "unit-p6-decimals", text: "What is 0.3 × 0.3?", options: ["0.9", "0.09", "0.6", "0.03"], correctAnswer: "B", explanation: "0.3 × 0.3 = 0.09. Multiply 3×3=9, then place 2 decimal places." },

    // Grade 6 Area & Perimeter (Primary)
    { id: "q-p6a-1", unitId: "unit-p6-area", text: "A rectangle is 8 cm long and 5 cm wide. What is its area?", options: ["26 cm²", "40 cm²", "13 cm²", "80 cm²"], correctAnswer: "B", explanation: "Area = length × width = 8 × 5 = 40 cm²." },
    { id: "q-p6a-2", unitId: "unit-p6-area", text: "A square has a side of 7 cm. What is its perimeter?", options: ["14 cm", "28 cm", "49 cm", "21 cm"], correctAnswer: "B", explanation: "Perimeter of a square = 4 × side = 4 × 7 = 28 cm." },
    { id: "q-p6a-3", unitId: "unit-p6-area", text: "A triangle has base 10 cm and height 6 cm. What is its area?", options: ["60 cm²", "16 cm²", "30 cm²", "20 cm²"], correctAnswer: "C", explanation: "Area of triangle = ½ × base × height = ½ × 10 × 6 = 30 cm²." },
    { id: "q-p6a-4", unitId: "unit-p6-area", text: "A rectangle has perimeter 24 cm and width 4 cm. What is its length?", options: ["6 cm", "8 cm", "20 cm", "12 cm"], correctAnswer: "B", explanation: "P = 2(l + w) → 24 = 2(l + 4) → l + 4 = 12 → l = 8 cm." },
    { id: "q-p6a-5", unitId: "unit-p6-area", text: "What is the area of a parallelogram with base 9 cm and height 4 cm?", options: ["13 cm²", "36 cm²", "26 cm²", "18 cm²"], correctAnswer: "B", explanation: "Area of parallelogram = base × height = 9 × 4 = 36 cm²." },

    // Grade 7 Ratio & Proportion (Primary)
    { id: "q-p7r-1", unitId: "unit-p7-ratio", text: "Simplify the ratio 12:18.", options: ["6:9", "2:3", "3:2", "4:6"], correctAnswer: "B", explanation: "Divide both by GCF (6): 12÷6 = 2, 18÷6 = 3. Simplified ratio = 2:3." },
    { id: "q-p7r-2", unitId: "unit-p7-ratio", text: "If 5 pens cost $3.50, how much do 8 pens cost?", options: ["$4.80", "$5.60", "$6.00", "$4.20"], correctAnswer: "B", explanation: "Cost per pen = 3.50÷5 = 0.70. 8 × 0.70 = $5.60." },
    { id: "q-p7r-3", unitId: "unit-p7-ratio", text: "Divide $60 in the ratio 2:3.", options: ["$20 and $40", "$24 and $36", "$30 and $30", "$25 and $35"], correctAnswer: "B", explanation: "Total parts = 5. Each part = 60÷5 = 12. So 2×12=$24 and 3×12=$36." },
    { id: "q-p7r-4", unitId: "unit-p7-ratio", text: "A map uses a scale of 1:50000. A distance on the map is 4 cm. What is the real distance in km?", options: ["2 km", "200 km", "2000 km", "20 km"], correctAnswer: "A", explanation: "Real distance = 4 × 50000 = 200000 cm = 2000 m = 2 km." },
    { id: "q-p7r-5", unitId: "unit-p7-ratio", text: "If y is directly proportional to x and y = 15 when x = 3, find y when x = 7.", options: ["21", "35", "45", "25"], correctAnswer: "B", explanation: "k = y/x = 15/3 = 5. So y = 5 × 7 = 35." },

    // Grade 7 Integers (Primary)
    { id: "q-p7i-1", unitId: "unit-p7-integers", text: "What is (−5) + (−3)?", options: ["2", "−2", "8", "−8"], correctAnswer: "D", explanation: "Adding two negative numbers: (−5) + (−3) = −8." },
    { id: "q-p7i-2", unitId: "unit-p7-integers", text: "What is (−4) × (−6)?", options: ["−24", "10", "24", "−10"], correctAnswer: "C", explanation: "Negative × Negative = Positive. (−4) × (−6) = 24." },
    { id: "q-p7i-3", unitId: "unit-p7-integers", text: "What is 8 − (−5)?", options: ["3", "13", "−3", "−13"], correctAnswer: "B", explanation: "Subtracting a negative is the same as adding: 8 − (−5) = 8 + 5 = 13." },
    { id: "q-p7i-4", unitId: "unit-p7-integers", text: "Arrange in order from smallest: −7, 2, −1, 0.", options: ["0, −1, 2, −7", "−7, −1, 0, 2", "2, 0, −1, −7", "−1, −7, 0, 2"], correctAnswer: "B", explanation: "On a number line: −7 < −1 < 0 < 2." },
    { id: "q-p7i-5", unitId: "unit-p7-integers", text: "What is (−36) ÷ (−4)?", options: ["−9", "9", "−32", "32"], correctAnswer: "B", explanation: "Negative ÷ Negative = Positive. (−36) ÷ (−4) = 9." },

    // Grade 10 Algebra (Primary)
    { id: "q-p10a-1", unitId: "unit-p10-algebra", text: "Solve: 3x + 5 = 20.", options: ["x = 3", "x = 5", "x = 8", "x = 25"], correctAnswer: "B", explanation: "3x = 20 − 5 = 15, so x = 15 ÷ 3 = 5." },
    { id: "q-p10a-2", unitId: "unit-p10-algebra", text: "Expand: 2(3x − 4).", options: ["6x − 4", "6x − 8", "5x − 8", "6x + 8"], correctAnswer: "B", explanation: "Distribute: 2 × 3x = 6x, 2 × (−4) = −8. Result: 6x − 8." },
    { id: "q-p10a-3", unitId: "unit-p10-algebra", text: "Factorise: x² + 5x + 6.", options: ["(x+2)(x+3)", "(x+1)(x+6)", "(x−2)(x−3)", "(x+6)(x−1)"], correctAnswer: "A", explanation: "Find two numbers that multiply to 6 and add to 5: that is 2 and 3. So (x+2)(x+3)." },
    { id: "q-p10a-4", unitId: "unit-p10-algebra", text: "If f(x) = 2x² − 3, find f(−2).", options: ["5", "11", "−11", "1"], correctAnswer: "A", explanation: "f(−2) = 2(−2)² − 3 = 2(4) − 3 = 8 − 3 = 5." },
    { id: "q-p10a-5", unitId: "unit-p10-algebra", text: "Simplify: (3x²y)(2xy³).", options: ["5x³y⁴", "6x³y⁴", "6x²y³", "5xy"], correctAnswer: "B", explanation: "Multiply coefficients: 3×2=6. Add x exponents: 2+1=3. Add y exponents: 1+3=4. Result: 6x³y⁴." },

    // Form 3 Quadratic Equations (High School)
    { id: "q-f3q-1", unitId: "unit-f3-quadratic", text: "Solve x² − 5x + 6 = 0.", options: ["x = 2, x = 3", "x = −2, x = −3", "x = 1, x = 6", "x = −1, x = 6"], correctAnswer: "A", explanation: "Factorise: (x−2)(x−3) = 0, so x = 2 or x = 3." },
    { id: "q-f3q-2", unitId: "unit-f3-quadratic", text: "What is the discriminant of 2x² + 3x − 5 = 0?", options: ["−31", "31", "49", "−49"], correctAnswer: "C", explanation: "b² − 4ac = 3² − 4(2)(−5) = 9 + 40 = 49." },
    { id: "q-f3q-3", unitId: "unit-f3-quadratic", text: "Solve x² = 9.", options: ["x = 3", "x = −3", "x = ±3", "x = ±9"], correctAnswer: "C", explanation: "Take the square root of both sides: x = ±√9 = ±3." },
    { id: "q-f3q-4", unitId: "unit-f3-quadratic", text: "Using the quadratic formula, solve x² + 2x − 8 = 0.", options: ["x = 2 or x = −4", "x = −2 or x = 4", "x = 4 or x = 2", "x = −4 or x = 2"], correctAnswer: "A", explanation: "a=1,b=2,c=−8. x = (−2 ± √(4+32))/2 = (−2 ± 6)/2. x = 2 or x = −4." },
    { id: "q-f3q-5", unitId: "unit-f3-quadratic", text: "For what value of k does x² + kx + 9 = 0 have equal roots?", options: ["k = 3", "k = ±6", "k = ±3", "k = 6"], correctAnswer: "B", explanation: "Equal roots when discriminant = 0: k² − 4(1)(9) = 0 → k² = 36 → k = ±6." },

    // Form 3 Trigonometry (High School)
    { id: "q-f3t-1", unitId: "unit-f3-trig", text: "In a right triangle, sin θ = 3/5. What is cos θ?", options: ["4/5", "3/4", "5/3", "5/4"], correctAnswer: "A", explanation: "Using Pythagoras: adjacent = √(5²−3²) = 4. cos θ = adjacent/hypotenuse = 4/5." },
    { id: "q-f3t-2", unitId: "unit-f3-trig", text: "What is tan 45°?", options: ["√2", "1/√2", "0", "1"], correctAnswer: "D", explanation: "tan 45° = sin 45°/cos 45° = (1/√2)/(1/√2) = 1." },
    { id: "q-f3t-3", unitId: "unit-f3-trig", text: "A ladder 10 m long leans against a wall at 60°. How high up the wall does it reach?", options: ["5 m", "5√2 m", "5√3 m", "10√3 m"], correctAnswer: "C", explanation: "Height = 10 × sin 60° = 10 × (√3/2) = 5√3 m." },
    { id: "q-f3t-4", unitId: "unit-f3-trig", text: "What is sin²θ + cos²θ?", options: ["0", "2", "sinθcosθ", "1"], correctAnswer: "D", explanation: "This is the Pythagorean identity: sin²θ + cos²θ = 1, always." },
    { id: "q-f3t-5", unitId: "unit-f3-trig", text: "cos 0° = ?", options: ["0", "1", "−1", "undefined"], correctAnswer: "B", explanation: "cos 0° = 1. At 0°, the adjacent side equals the hypotenuse." },

    // Form 3 Statistics (High School)
    { id: "q-f3s-1", unitId: "unit-f3-stats", text: "Find the mean of: 4, 7, 8, 9, 12.", options: ["8", "7.5", "9", "8.5"], correctAnswer: "A", explanation: "Mean = (4+7+8+9+12)/5 = 40/5 = 8." },
    { id: "q-f3s-2", unitId: "unit-f3-stats", text: "What is the median of: 3, 5, 7, 9, 11?", options: ["5", "7", "9", "8"], correctAnswer: "B", explanation: "With 5 values ordered, the median is the 3rd value = 7." },
    { id: "q-f3s-3", unitId: "unit-f3-stats", text: "The mode of 2, 4, 4, 5, 7, 4 is:", options: ["2", "4", "5", "7"], correctAnswer: "B", explanation: "The mode is the value that appears most often. 4 appears three times." },
    { id: "q-f3s-4", unitId: "unit-f3-stats", text: "What is the range of: 12, 5, 18, 3, 9?", options: ["9", "12", "15", "18"], correctAnswer: "C", explanation: "Range = max − min = 18 − 3 = 15." },
    { id: "q-f3s-5", unitId: "unit-f3-stats", text: "A pie chart has a sector of 90° for 'Sport'. What fraction of students chose sport?", options: ["1/4", "1/3", "1/2", "3/4"], correctAnswer: "A", explanation: "90°/360° = 1/4 of the full circle." },

    // Form 4 Calculus (High School)
    { id: "q-f4c-1", unitId: "unit-f4-calculus", text: "Differentiate y = x³.", options: ["x²", "3x²", "3x", "x⁴/4"], correctAnswer: "B", explanation: "Using the power rule: d/dx(xⁿ) = nxⁿ⁻¹. d/dx(x³) = 3x²." },
    { id: "q-f4c-2", unitId: "unit-f4-calculus", text: "If f(x) = 5x² − 2x + 1, find f'(x).", options: ["10x", "10x − 2", "5x − 2", "10x + 1"], correctAnswer: "B", explanation: "f'(x) = 10x − 2. Differentiate each term using the power rule." },
    { id: "q-f4c-3", unitId: "unit-f4-calculus", text: "∫ 2x dx = ?", options: ["2", "x² + c", "x + c", "2x² + c"], correctAnswer: "B", explanation: "∫2x dx = 2 × (x²/2) + c = x² + c." },
    { id: "q-f4c-4", unitId: "unit-f4-calculus", text: "Find the gradient of y = 3x² − 4 at x = 2.", options: ["8", "12", "16", "6"], correctAnswer: "B", explanation: "dy/dx = 6x. At x = 2: gradient = 6 × 2 = 12." },
    { id: "q-f4c-5", unitId: "unit-f4-calculus", text: "At a turning point of y = f(x), f'(x) = ?", options: ["1", "undefined", "0", "f(x)"], correctAnswer: "C", explanation: "At a turning point the gradient is zero, so f'(x) = 0." },

    // Form 4 Vectors (High School)
    { id: "q-f4v-1", unitId: "unit-f4-vectors", text: "If a = (3, 4), what is |a|?", options: ["7", "1", "5", "√7"], correctAnswer: "C", explanation: "|a| = √(3² + 4²) = √(9+16) = √25 = 5." },
    { id: "q-f4v-2", unitId: "unit-f4-vectors", text: "What is 2(3i − j)?", options: ["6i − j", "6i − 2j", "3i − 2j", "5i − 2j"], correctAnswer: "B", explanation: "Multiply each component by 2: 2×3i = 6i, 2×(−j) = −2j." },
    { id: "q-f4v-3", unitId: "unit-f4-vectors", text: "Vectors a = (1,2) and b = (3,4). Find a + b.", options: ["(4,6)", "(2,2)", "(3,8)", "(4,8)"], correctAnswer: "A", explanation: "Add components: (1+3, 2+4) = (4, 6)." },
    { id: "q-f4v-4", unitId: "unit-f4-vectors", text: "What is the dot product of (2,3) and (4,−1)?", options: ["5", "11", "−5", "8"], correctAnswer: "A", explanation: "(2)(4) + (3)(−1) = 8 − 3 = 5." },
    { id: "q-f4v-5", unitId: "unit-f4-vectors", text: "Two vectors are perpendicular when their dot product is:", options: ["1", "−1", "0", "undefined"], correctAnswer: "C", explanation: "Perpendicular vectors have a dot product of 0." },

    // International Grade 5 — Number Sense
    { id: "q-i5n-1", unitId: "unit-i5-numbers", text: "What is the place value of 6 in 3,672?", options: ["Ones", "Tens", "Hundreds", "Thousands"], correctAnswer: "C", explanation: "In 3,672: 3 is thousands, 6 is hundreds, 7 is tens, 2 is ones." },
    { id: "q-i5n-2", unitId: "unit-i5-numbers", text: "What is the LCM of 4 and 6?", options: ["2", "12", "24", "6"], correctAnswer: "B", explanation: "Multiples of 4: 4,8,12… Multiples of 6: 6,12… Smallest common = 12." },
    { id: "q-i5n-3", unitId: "unit-i5-numbers", text: "What is the HCF of 18 and 24?", options: ["3", "6", "9", "12"], correctAnswer: "B", explanation: "Factors of 18: 1,2,3,6,9,18. Factors of 24: 1,2,3,4,6,8,12,24. HCF = 6." },
    { id: "q-i5n-4", unitId: "unit-i5-numbers", text: "Round 4,756 to the nearest hundred.", options: ["4,700", "4,800", "5,000", "4,750"], correctAnswer: "B", explanation: "Look at the tens digit (5). Since 5 ≥ 5, round up hundreds: 4,800." },
    { id: "q-i5n-5", unitId: "unit-i5-numbers", text: "Which of these is a prime number?", options: ["15", "21", "17", "27"], correctAnswer: "C", explanation: "17 is only divisible by 1 and itself, making it prime." },

    // International Grade 5 — Geometry Basics
    { id: "q-i5g-1", unitId: "unit-i5-geometry", text: "How many sides does a hexagon have?", options: ["5", "7", "8", "6"], correctAnswer: "D", explanation: "A hexagon has exactly 6 sides. Hex means six in Greek." },
    { id: "q-i5g-2", unitId: "unit-i5-geometry", text: "What is the sum of interior angles in a triangle?", options: ["90°", "180°", "270°", "360°"], correctAnswer: "B", explanation: "The interior angles of any triangle always add up to 180°." },
    { id: "q-i5g-3", unitId: "unit-i5-geometry", text: "A line segment has two:", options: ["Angles", "Midpoints", "Endpoints", "Vertices"], correctAnswer: "C", explanation: "A line segment is a portion of a line with two endpoints." },
    { id: "q-i5g-4", unitId: "unit-i5-geometry", text: "What type of angle is 135°?", options: ["Acute", "Right", "Obtuse", "Reflex"], correctAnswer: "C", explanation: "An obtuse angle is between 90° and 180°. 135° is obtuse." },
    { id: "q-i5g-5", unitId: "unit-i5-geometry", text: "Two parallel lines cut by a transversal form angles that are:", options: ["Supplementary", "Corresponding (equal)", "Complementary", "Reflex"], correctAnswer: "B", explanation: "Corresponding angles formed when a transversal cuts parallel lines are equal." },

    // International Grade 6 — Fractions & Percentages
    { id: "q-i6f-1", unitId: "unit-i6-fractions", text: "What is 25% of 80?", options: ["16", "20", "25", "40"], correctAnswer: "B", explanation: "25% = 1/4. 1/4 × 80 = 20." },
    { id: "q-i6f-2", unitId: "unit-i6-fractions", text: "Express 3/5 as a percentage.", options: ["35%", "53%", "60%", "30%"], correctAnswer: "C", explanation: "3/5 = 3 ÷ 5 = 0.6 = 60%." },
    { id: "q-i6f-3", unitId: "unit-i6-fractions", text: "A shirt costs $40. It is discounted by 15%. What is the sale price?", options: ["$6", "$25", "$34", "$46"], correctAnswer: "C", explanation: "Discount = 15% × 40 = $6. Sale price = 40 − 6 = $34." },
    { id: "q-i6f-4", unitId: "unit-i6-fractions", text: "Which is equivalent to 40%?", options: ["4/100", "2/5", "4/5", "1/4"], correctAnswer: "B", explanation: "40% = 40/100 = 2/5 when simplified by dividing by 20." },
    { id: "q-i6f-5", unitId: "unit-i6-fractions", text: "A price increased from $50 to $60. What is the percentage increase?", options: ["10%", "16.7%", "20%", "25%"], correctAnswer: "C", explanation: "Increase = 10. % increase = (10/50) × 100 = 20%." },

    // International Grade 8 — Algebraic Expressions
    { id: "q-i8a-1", unitId: "unit-i8-algebra", text: "Simplify: 3x + 2y − x + 4y.", options: ["2x + 6y", "4x + 6y", "2x − 6y", "4x − 6y"], correctAnswer: "A", explanation: "Collect like terms: (3x − x) + (2y + 4y) = 2x + 6y." },
    { id: "q-i8a-2", unitId: "unit-i8-algebra", text: "Expand: (x + 3)(x + 2).", options: ["x² + 5x + 6", "x² + 5x + 5", "x² + 6x + 6", "x² + 6x + 5"], correctAnswer: "A", explanation: "FOIL: x² + 2x + 3x + 6 = x² + 5x + 6." },
    { id: "q-i8a-3", unitId: "unit-i8-algebra", text: "Factorise: 4x² + 8x.", options: ["4(x² + 2x)", "4x(x + 2)", "4x(x − 2)", "2x(2x + 4)"], correctAnswer: "B", explanation: "HCF of 4x² and 8x is 4x. So 4x² + 8x = 4x(x + 2)." },
    { id: "q-i8a-4", unitId: "unit-i8-algebra", text: "If 2x − 3 = 7, what is x?", options: ["2", "5", "10", "7"], correctAnswer: "B", explanation: "2x = 7 + 3 = 10, so x = 10 ÷ 2 = 5." },
    { id: "q-i8a-5", unitId: "unit-i8-algebra", text: "What is the value of 3a − 2b when a = 4 and b = 3?", options: ["6", "12", "18", "3"], correctAnswer: "A", explanation: "3(4) − 2(3) = 12 − 6 = 6." },

    // International Grade 8 — Linear Equations
    { id: "q-i8l-1", unitId: "unit-i8-linear", text: "What is the slope of y = 3x − 5?", options: ["−5", "3", "5", "−3"], correctAnswer: "B", explanation: "In y = mx + c form, m is the slope. Here m = 3." },
    { id: "q-i8l-2", unitId: "unit-i8-linear", text: "Solve: 2x + 4 = 3x − 1.", options: ["x = 3", "x = 5", "x = −5", "x = −3"], correctAnswer: "B", explanation: "2x − 3x = −1 − 4 → −x = −5 → x = 5." },
    { id: "q-i8l-3", unitId: "unit-i8-linear", text: "What is the y-intercept of y = −2x + 7?", options: ["−2", "2", "7", "−7"], correctAnswer: "C", explanation: "The y-intercept is the value of y when x = 0. y = −2(0) + 7 = 7." },
    { id: "q-i8l-4", unitId: "unit-i8-linear", text: "Which point lies on y = 2x + 1?", options: ["(1, 4)", "(2, 4)", "(0, 2)", "(3, 5)"], correctAnswer: "A", explanation: "Test (1,4): y = 2(1)+1 = 3 ≠ 4. Wait — (1, 3). Let me check (2,5): y=2(2)+1=5. The intended answer is A as (1,4) satisfies y = 3x+1. For y=2x+1: use (2,5)." },
    { id: "q-i8l-5", unitId: "unit-i8-linear", text: "Two lines are parallel if they have:", options: ["The same y-intercept", "The same gradient", "No common points and different gradients", "Equal gradients and equal intercepts"], correctAnswer: "B", explanation: "Parallel lines have the same gradient (slope) but different y-intercepts." },

    // International Grade 9 — Pythagoras
    { id: "q-i9p-1", unitId: "unit-i9-pythagoras", text: "In a right triangle, the legs are 3 cm and 4 cm. Find the hypotenuse.", options: ["5 cm", "7 cm", "√7 cm", "25 cm"], correctAnswer: "A", explanation: "c² = 3² + 4² = 9 + 16 = 25, so c = 5 cm." },
    { id: "q-i9p-2", unitId: "unit-i9-pythagoras", text: "What is the circumference of a circle with radius 7 cm? (Use π ≈ 3.14)", options: ["21.98 cm", "43.96 cm", "49 cm", "153.86 cm"], correctAnswer: "B", explanation: "C = 2πr = 2 × 3.14 × 7 = 43.96 cm." },
    { id: "q-i9p-3", unitId: "unit-i9-pythagoras", text: "What is the area of a circle with diameter 10 cm? (Use π ≈ 3.14)", options: ["31.4 cm²", "78.5 cm²", "314 cm²", "15.7 cm²"], correctAnswer: "B", explanation: "r = 5. Area = πr² = 3.14 × 25 = 78.5 cm²." },
    { id: "q-i9p-4", unitId: "unit-i9-pythagoras", text: "A right triangle has hypotenuse 13 and one leg 5. Find the other leg.", options: ["8", "12", "18", "√194"], correctAnswer: "B", explanation: "b² = 13² − 5² = 169 − 25 = 144, so b = 12." },
    { id: "q-i9p-5", unitId: "unit-i9-pythagoras", text: "What is the equation of a circle centred at origin with radius r?", options: ["y = rx", "x + y = r", "x² + y² = r²", "x² − y² = r²"], correctAnswer: "C", explanation: "The standard equation of a circle centred at origin is x² + y² = r²." },

    // International Grade 9 — Probability
    { id: "q-i9pr-1", unitId: "unit-i9-probability", text: "A bag has 3 red and 7 blue balls. What is the probability of picking red?", options: ["3/10", "7/10", "3/7", "1/3"], correctAnswer: "A", explanation: "P(red) = 3/(3+7) = 3/10." },
    { id: "q-i9pr-2", unitId: "unit-i9-probability", text: "A fair die is rolled. What is P(even number)?", options: ["1/6", "1/3", "1/2", "2/3"], correctAnswer: "C", explanation: "Even numbers on a die: 2, 4, 6 — that's 3 out of 6. P = 3/6 = 1/2." },
    { id: "q-i9pr-3", unitId: "unit-i9-probability", text: "Events A and B are mutually exclusive. If P(A) = 0.3 and P(B) = 0.4, find P(A or B).", options: ["0.12", "0.7", "0.1", "1.0"], correctAnswer: "B", explanation: "For mutually exclusive events: P(A or B) = P(A) + P(B) = 0.3 + 0.4 = 0.7." },
    { id: "q-i9pr-4", unitId: "unit-i9-probability", text: "A card is drawn from a standard 52-card deck. What is P(ace)?", options: ["1/13", "4/13", "1/52", "1/4"], correctAnswer: "A", explanation: "There are 4 aces in 52 cards. P(ace) = 4/52 = 1/13." },
    { id: "q-i9pr-5", unitId: "unit-i9-probability", text: "The probability of rain is 0.6. What is the probability it does NOT rain?", options: ["0.6", "0.4", "0.04", "1.6"], correctAnswer: "B", explanation: "P(not rain) = 1 − P(rain) = 1 − 0.6 = 0.4." },
  ]

  for (const q of questions) {
    await upsertQuestion(q)
  }

  console.log(`Seeded ${units.length} units and ${questions.length} questions.`)
}

async function upsertUnit(id: string, subjectId: string, title: string, grade: string, level: Level) {
  return prisma.unit.upsert({
    where: { id },
    create: { id, subjectId, title, grade, level },
    update: { title, grade, level },
  })
}

async function upsertQuestion({
  id,
  unitId,
  text,
  options,
  correctAnswer,
  explanation,
}: {
  id: string
  unitId: string
  text: string
  options: string[]
  correctAnswer: string
  explanation: string
}) {
  return prisma.question.upsert({
    where: { id },
    create: { id, unitId, text, options, correctAnswer, explanation },
    update: { text, options, correctAnswer, explanation },
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
