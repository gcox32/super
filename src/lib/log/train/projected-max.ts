import { WeightMeasurement } from "@/types/measures";

function clamp(x: number, min: number, max: number) {
    return Math.max(min, Math.min(max, x));
}

export function calculateProjectedMax(
    reps: number,
    weight: WeightMeasurement,
    options?: {
        estimator?: 'epley' | 'brzycki' | 'blend';
        // Confidence curve tuning
        confidenceMax?: number; // default 0.95
        confidenceMin?: number; // default 0.20
        confidenceMid?: number; // reps where drop is steepest (default 9)
        confidenceK?: number;   // steepness (default 0.6)
        // Practical bounds
        maxRepsForEstimate?: number; // default 15
    }
) {
    const {
        estimator = 'blend',
        confidenceMax = 0.95,
        confidenceMin = 0.20,
        confidenceMid = 9,
        confidenceK = 0.6,
        maxRepsForEstimate = 15,
    } = options ?? {};

    const r = Math.max(1, Math.floor(reps));
    const w = Math.max(0, weight.value);

    // If reps are very high, the estimate becomes less meaningful.
    // We still compute, but we’ll heavily reduce confidence.
    const repsForConfidence = Math.min(r, maxRepsForEstimate);

    // --- 1RM estimators ---
    const epley = w * (1 + r / 30);
    const brzycki = r < 37 ? (w * 36) / (37 - r) : Number.POSITIVE_INFINITY;

    let projectedMaxWeight: number;
    switch (estimator) {
        case 'epley':
            projectedMaxWeight = epley;
            break;
        case 'brzycki':
            projectedMaxWeight = brzycki;
            break;
        case 'blend':
        default:
            projectedMaxWeight = (epley + brzycki) / 2;
            break;
    }

    // --- Confidence (logistic decay) ---
    const logistic =
        confidenceMin +
        (confidenceMax - confidenceMin) /
        (1 + Math.exp(confidenceK * (repsForConfidence - confidenceMid)));

    // If reps exceed the “practical” range, push confidence further down.
    const overagePenalty =
        r > maxRepsForEstimate ? Math.exp(-0.35 * (r - maxRepsForEstimate)) : 1;

    const confidence = clamp(logistic * overagePenalty, confidenceMin, confidenceMax);

    return {
        projectedMax: { value: projectedMaxWeight, unit: weight.unit },
        confidence,
        meta: {
            repsUsed: r,
            estimator,
            epley,
            brzycki,
        },
    };
}
