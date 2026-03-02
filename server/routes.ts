
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { getDrawType, type DrawResult, type DrawResponse, type PredictionResponse, type StatsResponse } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // === ROUTES ===

  app.get(api.draws.list.path, async (req, res) => {
    const limit = req.query.limit ? Number(req.query.limit) : 100;
    const draws = await storage.getDraws(limit);
    res.json(draws);
  });

  app.post(api.draws.create.path, async (req, res) => {
    try {
      const input = api.draws.create.input.parse(req.body);
      const draw = await storage.createDraw(input);
      res.status(201).json(draw);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.stats.get.path, async (req, res) => {
    const draws = await storage.getDraws(100); // Analyze last 100 for general stats
    const stats = calculateStats(draws);
    res.json(stats);
  });

  app.get(api.prediction.get.path, async (req, res) => {
    const draws = await storage.getDraws(50); // Need recent history for prediction
    const prediction = calculatePrediction(draws);
    res.json(prediction);
  });

  // Seed Data Endpoint (Optional, or auto-run)
  // We'll auto-seed in main index logic if needed, but here's a helper if requested.
  await seedDatabase();
  
  return httpServer;
}

// === ANALYSIS LOGIC ===

function calculateStats(draws: DrawResponse[]): StatsResponse {
  const total = draws.length;
  if (total === 0) {
    return {
      totalDraws: 0,
      small: { count: 0, percentage: 0, currentStreak: 0 },
      draw: { count: 0, percentage: 0, currentStreak: 0 },
      large: { count: 0, percentage: 0, currentStreak: 0 },
      last30Stats: { small: 0, draw: 0, large: 0 }
    };
  }

  const counts = { small: 0, draw: 0, large: 0 };
  let currentStreak = { type: null as DrawResult | null, count: 0 };
  
  // Calculate counts
  draws.forEach(d => {
    counts[d.resultType]++;
  });

  // Calculate current streak (iterate backwards from most recent)
  if (draws.length > 0) {
    const latest = draws[0];
    currentStreak.type = latest.resultType;
    for (let i = 0; i < draws.length; i++) {
      if (draws[i].resultType === currentStreak.type) {
        currentStreak.count++;
      } else {
        break;
      }
    }
  }

  const streaks = {
    small: currentStreak.type === 'small' ? currentStreak.count : 0,
    draw: currentStreak.type === 'draw' ? currentStreak.count : 0,
    large: currentStreak.type === 'large' ? currentStreak.count : 0,
  };

  // Last 30 stats
  const last30 = draws.slice(0, 30);
  const counts30 = { small: 0, draw: 0, large: 0 };
  last30.forEach(d => counts30[d.resultType]++);
  const total30 = last30.length || 1; // avoid div by 0

  return {
    totalDraws: total,
    small: { 
      count: counts.small, 
      percentage: Math.round((counts.small / total) * 100),
      currentStreak: streaks.small 
    },
    draw: { 
      count: counts.draw, 
      percentage: Math.round((counts.draw / total) * 100),
      currentStreak: streaks.draw 
    },
    large: { 
      count: counts.large, 
      percentage: Math.round((counts.large / total) * 100),
      currentStreak: streaks.large 
    },
    last30Stats: {
      small: Math.round((counts30.small / total30) * 100),
      draw: Math.round((counts30.draw / total30) * 100),
      large: Math.round((counts30.large / total30) * 100),
    }
  };
}

function calculatePrediction(draws: DrawResponse[]): PredictionResponse {
  if (draws.length < 5) {
    return {
      suggestion: null,
      confidence: 0,
      reasons: ["Not enough data to predict"],
      filters: { streakSafe: true, regression: false, notExtreme: true }
    };
  }

  const latest = draws[0];
  const history30 = draws.slice(0, 30);
  
  // Calculate streaks
  let streakCount = 0;
  const streakType = latest.resultType;
  for (const d of draws) {
    if (d.resultType === streakType) streakCount++;
    else break;
  }

  // Calculate percentages in last 30
  const counts30 = { small: 0, draw: 0, large: 0 };
  history30.forEach(d => counts30[d.resultType]++);
  const total30 = history30.length;
  const pct30 = {
    small: (counts30.small / total30) * 100,
    draw: (counts30.draw / total30) * 100,
    large: (counts30.large / total30) * 100,
  };

  // Check recent absence (not appeared in >= 2 turns)
  const isAbsentRecent = (type: DrawResult) => {
    if (draws.length < 2) return false;
    return draws[0].resultType !== type && draws[1].resultType !== type;
  };

  // === ALGORITHM RULES ===

  // Candidate evaluation
  const candidates: { type: DrawResult, score: number, reasons: string[] }[] = [
    { type: 'small', score: 0, reasons: [] },
    { type: 'draw', score: 0, reasons: [] },
    { type: 'large', score: 0, reasons: [] },
  ];

  let filters = {
    streakSafe: true,
    regression: false,
    notExtreme: true // This depends on the *potential* next value, which we can't fully know, but we check if the *last* was extreme to warn. 
                     // The prompt says "Avoid extremes: Sum = 3,4,17,18 -> mark dangerous". 
                     // Since we predict the *category*, we can't predict the exact sum 3/4/17/18 directly, but we can warn if the trend suggests volatility. 
                     // However, the rule is "Sum = 3,4,17,18 -> mark dangerous, reduce weight". 
                     // This likely means if the *previous* result was extreme, or if we are betting on a number, but here we bet on Small/Large.
                     // A safer interpretation: If the last result was extreme, the market is volatile.
  };

  // Check for extreme previous result
  const lastValue = latest.value;
  const isLastExtreme = [3, 4, 17, 18].includes(lastValue);
  if (isLastExtreme) {
    filters.notExtreme = false;
  }

  for (const candidate of candidates) {
    // A. Filter 1 - Long Streaks
    // If this type is currently on a streak >= 4, DO NOT suggest it.
    // Also, if the *current* running streak is >= 4 (of any type), we might want to bet *against* it (reversion), 
    // OR the rule says "If 1 type appears >= 4 consecutive -> NO suggest next (high risk)". 
    // Wait, "KHÔNG gợi ý tiếp" means don't suggest *that same type* again.
    const isCurrentStreakType = streakType === candidate.type;
    if (isCurrentStreakType && streakCount >= 4) {
      candidate.score = -100; // Kill it
      candidate.reasons.push(`Streak too long (${streakCount})`);
      continue;
    }

    // B. Filter 2 - Regression Priority
    // If < 20% in last 30 AND not appeared >= 2 turns -> Priority
    if (pct30[candidate.type] < 20 && isAbsentRecent(candidate.type)) {
      candidate.score += 50;
      candidate.reasons.push("Regression candidate (<20% & absent >2 turns)");
      filters.regression = true;
    }

    // Historical Rate check (Decision Rule: History >= 40%)
    // The user rule says: "Bot CHỈ GỢI Ý khi... Có tỷ lệ lịch sử >= 40%"
    // This is strict. 40% for Small/Large is high (since Draw is 10-11, small/large usually ~45-48%).
    // But for "Draw" type (prob ~5%), 40% is impossible. 
    // I assume this rule applies mainly to Small/Large.
    const overallRate = candidate.type === 'draw' ? 0 : pct30[candidate.type]; // Use last 30 as "history" proxy
    
    if (candidate.type !== 'draw') {
      if (overallRate >= 40) {
        candidate.score += 20;
        candidate.reasons.push(`Good historical rate (${overallRate.toFixed(1)}%)`);
      } else {
        candidate.score -= 10;
        candidate.reasons.push(`Low historical rate (${overallRate.toFixed(1)}%)`);
      }
    }

    // C. Filter 3 - Extremes
    // "Sum = 3, 4, 17, 18 -> mark dangerous". 
    // If we are predicting 'small', and 3/4 are small extremes.
    // This filter is hard to apply to a *prediction* of a category unless we predict specific numbers.
    // Interpretation: If the category *contains* extremes, maybe reduce weight? 
    // Or maybe if the *last* result was extreme?
    // Let's stick to the prompt's context: "avoid extreme... mark dangerous, reduce weight".
    // We will apply a small penalty to all to represent general caution if the last result was extreme.
    if (isLastExtreme) {
        candidate.score -= 5;
        candidate.reasons.push("Market volatile (last was extreme)");
    }
  }

  // Select best candidate
  const sorted = candidates.sort((a, b) => b.score - a.score);
  const best = sorted[0];

  // Final Decision Rule Check
  // Bot CHỈ GỢI Ý khi thỏa ĐỒNG THỜI:
  // •  Không nằm trong chuỗi ≥ 4 (Handled by score -100)
  // •  Có tỷ lệ lịch sử ≥ 40% (Handled by score penalty, but let's enforce strictness for "Suggestion")
  // •  Không phải cực trị (Handled by penalty)
  
  let validSuggestion = false;
  if (best.score > 0) {
      // Check strict 40% rule for Small/Large
      if (best.type !== 'draw') {
          if (pct30[best.type] >= 40) validSuggestion = true;
      } else {
          // Draw rules might be different, usually we don't predict draws easily.
          // If the algo predicts draw, we let it pass if score is high.
          if (best.score > 30) validSuggestion = true; 
      }
  }

  if (validSuggestion) {
      return {
          suggestion: best.type,
          confidence: Math.min(85, 50 + best.score), // Cap at 85%
          reasons: best.reasons,
          filters: {
              streakSafe: streakCount < 4 || best.type !== streakType,
              regression: filters.regression,
              notExtreme: !isLastExtreme
          }
      };
  }

  return {
      suggestion: null,
      confidence: 0,
      reasons: ["No candidate met strict criteria (Rate < 40% or risky)"],
      filters
  };
}

// Seed function to be called from index (or we can export a seeder)
export async function seedDatabase() {
  const existing = await storage.getDraws(1);
  if (existing.length === 0) {
    console.log("Seeding database with 100 random draws...");
    const sampleValues = [];
    // Simulate 100 draws with some realistic distribution
    // 3-18 (bell curve-ish)
    for (let i = 0; i < 100; i++) {
        // Roll 3 dice (standard Bingo18/Sicbo mechanic)
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const d3 = Math.floor(Math.random() * 6) + 1;
        const val = d1 + d2 + d3;
        
        // Add spread in time
        // We can't easily Insert with custom createdAt in schema unless we modify schema or use sql
        // For simple MVP, we just insert them. They will have same timestamp approx.
        // To make charts look good, we might want to manually space them if possible, 
        // but `createdAt` is defaultNow(). 
        // We will insert them sequentially.
        await storage.createDraw({ value: val });
    }
    console.log("Seeding complete.");
  }
}
