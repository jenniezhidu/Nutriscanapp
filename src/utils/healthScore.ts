/**
 * Calculate Health Score (Nutri-Score) from A to E
 * Based on the Nutri-Score algorithm
 *
 * A = Green (Excellent)
 * B = Light Green (Good)
 * C = Yellow (Fair)
 * D = Orange (Poor)
 * E = Red (Very Poor)
 */

export type HealthScoreGrade = 'A' | 'B' | 'C' | 'D' | 'E';

export interface HealthScoreResult {
  grade: HealthScoreGrade;
  score: number;
  color: string;
  description: string;
}

export function calculateHealthScore(
  caloriesPer100g: number,
  proteinPer100g: number,
  carbsPer100g: number,
  fatPer100g: number,
  fiberPer100g: number,
  sugarPer100g: number = 0,
  saltPer100g: number = 0,
  saturatedFatPer100g: number = 0
): HealthScoreResult {
  let score = 0;

  // NEGATIVE POINTS (bad nutrients)
  // Energy (calories): 0-10 points
  if (caloriesPer100g <= 80) score += 0;
  else if (caloriesPer100g <= 160) score += 1;
  else if (caloriesPer100g <= 240) score += 2;
  else if (caloriesPer100g <= 320) score += 3;
  else if (caloriesPer100g <= 400) score += 4;
  else if (caloriesPer100g <= 480) score += 5;
  else if (caloriesPer100g <= 560) score += 6;
  else if (caloriesPer100g <= 640) score += 7;
  else if (caloriesPer100g <= 720) score += 8;
  else if (caloriesPer100g <= 800) score += 9;
  else score += 10;

  // Saturated Fat: 0-10 points
  if (saturatedFatPer100g <= 1) score += 0;
  else if (saturatedFatPer100g <= 2) score += 1;
  else if (saturatedFatPer100g <= 3) score += 2;
  else if (saturatedFatPer100g <= 4) score += 3;
  else if (saturatedFatPer100g <= 5) score += 4;
  else if (saturatedFatPer100g <= 6) score += 5;
  else if (saturatedFatPer100g <= 7) score += 6;
  else if (saturatedFatPer100g <= 8) score += 7;
  else if (saturatedFatPer100g <= 9) score += 8;
  else if (saturatedFatPer100g <= 10) score += 9;
  else score += 10;

  // Sugar: 0-10 points
  if (sugarPer100g <= 5) score += 0;
  else if (sugarPer100g <= 10) score += 1;
  else if (sugarPer100g <= 15) score += 2;
  else if (sugarPer100g <= 20) score += 3;
  else if (sugarPer100g <= 25) score += 4;
  else if (sugarPer100g <= 30) score += 5;
  else if (sugarPer100g <= 35) score += 6;
  else if (sugarPer100g <= 40) score += 7;
  else if (sugarPer100g <= 45) score += 8;
  else if (sugarPer100g <= 50) score += 9;
  else score += 10;

  // Sodium (Salt): 0-10 points
  if (saltPer100g <= 0.09) score += 0;
  else if (saltPer100g <= 0.18) score += 1;
  else if (saltPer100g <= 0.27) score += 2;
  else if (saltPer100g <= 0.36) score += 3;
  else if (saltPer100g <= 0.45) score += 4;
  else if (saltPer100g <= 0.54) score += 5;
  else if (saltPer100g <= 0.63) score += 6;
  else if (saltPer100g <= 0.72) score += 7;
  else if (saltPer100g <= 0.81) score += 8;
  else if (saltPer100g <= 0.9) score += 9;
  else score += 10;

  // POSITIVE POINTS (good nutrients) - subtract from score
  // Protein: 0-5 points
  if (proteinPer100g >= 8) score -= 5;
  else if (proteinPer100g >= 6.4) score -= 4;
  else if (proteinPer100g >= 4.8) score -= 3;
  else if (proteinPer100g >= 3.2) score -= 2;
  else if (proteinPer100g >= 1.6) score -= 1;

  // Fiber: 0-5 points
  if (fiberPer100g >= 4.7) score -= 5;
  else if (fiberPer100g >= 3.7) score -= 4;
  else if (fiberPer100g >= 2.8) score -= 3;
  else if (fiberPer100g >= 1.9) score -= 2;
  else if (fiberPer100g >= 0.9) score -= 1;

  // Ensure score is between 0 and 40
  score = Math.max(0, Math.min(40, score));

  // Convert to grade
  let grade: HealthScoreGrade;
  let color: string;
  let description: string;

  if (score <= 1) {
    grade = 'A';
    color = '#27AE60'; // Green
    description = 'Excellent choice';
  } else if (score <= 10) {
    grade = 'B';
    color = '#52C41A'; // Light Green
    description = 'Good choice';
  } else if (score <= 20) {
    grade = 'C';
    color = '#FAAD14'; // Yellow
    description = 'Fair choice';
  } else if (score <= 30) {
    grade = 'D';
    color = '#FF7A45'; // Orange
    description = 'Poor choice';
  } else {
    grade = 'E';
    color = '#F5222D'; // Red
    description = 'Very poor choice';
  }

  return {
    grade,
    score,
    color,
    description,
  };
}

export function getHealthScoreEmoji(grade: HealthScoreGrade): string {
  const emojiMap: Record<HealthScoreGrade, string> = {
    A: '🟢',
    B: '🟢',
    C: '🟡',
    D: '🟠',
    E: '🔴',
  };
  return emojiMap[grade];
}
