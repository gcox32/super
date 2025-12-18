import {
    BodyFatInput,
    Gender,
    LengthUnit,
    WeightUnit,
    SanityFlag,
    MethodEstimate,
    CompositeOptions,
    CompositeStrategy,
    BodyFatResult,
} from '@/types/stats';

/** ---------------------------
 *  Unit normalization
 *  --------------------------- */

const IN_TO_CM = 2.54;
const LB_TO_KG = 0.45359237;

function toCm(value: number, unit: LengthUnit): number {
    return unit === "cm" ? value : value * IN_TO_CM;
}

function toKg(value: number, unit: WeightUnit): number {
    return unit === "kg" ? value : value * LB_TO_KG;
}

function round1(n: number): number {
    return Math.round(n * 10) / 10;
}

function clamp(n: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, n));
}

/** ---------------------------
 *  Method calculators
 *  --------------------------- */

/**
 * Navy formula expects consistent linear units (cm or in).
 * We implement using cm to avoid ambiguity.
 */
export function bodyFatNavyCm(args: {
    gender: Gender;
    heightCm: number;
    neckCm: number;
    waistCm: number;
    hipCm?: number;
}): number {
    const { gender, heightCm, neckCm, waistCm, hipCm } = args;

    // Domain checks for log10 inputs:
    // male: (waist - neck) > 0
    // female: (waist + hip - neck) > 0
    if (gender === "male") {
        const x = waistCm - neckCm;
        if (x <= 0 || heightCm <= 0) return NaN;
        const bf =
            86.010 * Math.log10(x) - 70.041 * Math.log10(heightCm) + 36.76;
        return bf;
    } else {
        if (hipCm == null) return NaN;
        const x = waistCm + hipCm - neckCm;
        if (x <= 0 || heightCm <= 0) return NaN;
        const bf =
            163.205 * Math.log10(x) - 97.684 * Math.log10(heightCm) - 78.387;
        return bf;
    }
}

/**
 * Deurenberg BMI-based estimate.
 * Uses BMI in kg/m^2.
 */
export function bodyFatBMI(args: {
    gender: Gender;
    age: number;
    heightCm: number;
    weightKg: number;
}): number {
    const { gender, age, heightCm, weightKg } = args;
    const heightM = heightCm / 100;
    if (heightM <= 0 || weightKg <= 0) return NaN;

    const bmi = weightKg / (heightM * heightM);
    const sex = gender === "male" ? 1 : 0;

    return 1.2 * bmi + 0.23 * age - 10.8 * sex - 5.4;
}

/**
 * YMCA formula (commonly expressed with inches + pounds).
 * We'll implement by converting normalized metrics back to (in, lb) internally.
 */
export function bodyFatYMCA(args: {
    gender: Gender;
    waistIn: number;
    weightLb: number;
}): number {
    const { gender, waistIn, weightLb } = args;
    if (waistIn <= 0 || weightLb <= 0) return NaN;

    const base = 4.15 * waistIn - 0.082 * weightLb;
    const subtract = gender === "male" ? 98.42 : 76.76;

    const bf = ((base - subtract) / weightLb) * 100;
    return bf;
}

/** ---------------------------
 *  Sanity checks
 *  --------------------------- */

function validateNumerics(input: BodyFatInput): SanityFlag[] {
    const flags: SanityFlag[] = [];

    const nums: Array<[string, number | undefined]> = [
        ["age", input.age],
        ["height", input.height],
        ["weight", input.weight],
        ["neck", input.neck],
        ["waist", input.waist],
        ["hip", input.hip],
    ];

    for (const [k, v] of nums) {
        if (v == null) continue;
        if (!Number.isFinite(v)) {
            flags.push({
                code: "INVALID_NUMERIC",
                message: `Input '${k}' is not a finite number.`,
                severity: "error",
            });
        }
        if (v <= 0 && k !== "hip") {
            flags.push({
                code: "OUT_OF_RANGE",
                message: `Input '${k}' must be > 0.`,
                severity: "error",
            });
        }
    }

    return flags;
}

function plausibilityChecks(norm: {
    heightCm: number;
    weightKg: number;
    neckCm: number;
    waistCm: number;
    hipCm?: number;
    bmi: number;
    waistToHeight: number;
}): SanityFlag[] {
    const flags: SanityFlag[] = [];

    // Waist must generally be >= neck in most adults; not always, but a good QA tripwire.
    if (norm.waistCm < norm.neckCm) {
        flags.push({
            code: "WAIST_LESS_THAN_NECK",
            message:
                "Waist is smaller than neck. This may indicate a tape placement or unit issue.",
            severity: "warn",
        });
    }

    // WHtR sanity band: <0.35 unusually small, >0.75 unusually large.
    if (norm.waistToHeight < 0.35 || norm.waistToHeight > 0.75) {
        flags.push({
            code: "UNREALISTIC_WH_RATIO",
            message:
                "Waist-to-height ratio is outside typical human ranges. Re-check measurements and units.",
            severity: "warn",
        });
    }

    // BMI sanity band: <15 or >45 is unusual (not impossible).
    if (norm.bmi < 15 || norm.bmi > 45) {
        flags.push({
            code: "OUT_OF_RANGE",
            message: "BMI is outside a typical adult range. Re-check height/weight units.",
            severity: "warn",
        });
    }

    return flags;
}

/** ---------------------------
 *  Composite logic
 *  --------------------------- */

function mean(values: number[]): number {
    return values.reduce((a, b) => a + b, 0) / values.length;
}

function median(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 1
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;
}

function stddev(values: number[]): number {
    if (values.length < 2) return 0;
    const m = mean(values);
    const v = mean(values.map((x) => (x - m) ** 2));
    return Math.sqrt(v);
}

function compositeEstimate(
    estimates: MethodEstimate[],
    options: CompositeOptions
): {
    bf: number;
    strategy: CompositeStrategy;
    dispersion: number;
} {
    const bfs = estimates.map((e) => e.bf);

    if (bfs.length === 0) {
        return { bf: NaN, strategy: options.strategy, dispersion: NaN };
    }

    let bf: number;

    switch (options.strategy) {
        case "mean": {
            bf = mean(bfs);
            break;
        }

        case "weighted_mean": {
            const weights = options.weights ?? {};

            // Assign default weight = 1 if not specified
            const weighted = estimates.map((e) => ({
                bf: e.bf,
                w: weights[e.method] ?? 1,
            }));

            const totalWeight = weighted.reduce((s, x) => s + x.w, 0);

            // Fallback safety
            if (totalWeight === 0) {
                bf = mean(bfs);
                break;
            }

            bf =
                weighted.reduce((s, x) => s + x.bf * x.w, 0) / totalWeight;
            break;
        }

        case "median":
        default: {
            bf = median(bfs);
            break;
        }
    }

    const dispersion = stddev(bfs);

    return { bf, strategy: options.strategy, dispersion };
}


function confidenceBands(
    bf: number,
    dispersion: number
): { ci68: [number, number]; ci95: [number, number] } {
    /**
     * Heuristic: use inter-method dispersion as uncertainty signal, but enforce a floor.
     * Floor matters because methods can “agree” and still be collectively wrong by ~2–4%.
     */
    const sigma = Math.max(2.0, dispersion); // percentage points
    const ci68: [number, number] = [bf - sigma, bf + sigma];
    const ci95: [number, number] = [bf - 2 * sigma, bf + 2 * sigma];
    return { ci68, ci95 };
}

/** ---------------------------
 *  Public API: estimate body fat
 *  --------------------------- */

export function estimateBodyFat(input: BodyFatInput): BodyFatResult {
    const flags: SanityFlag[] = [...validateNumerics(input)];

    // Normalize
    const heightCm = toCm(input.height, input.heightUnit);
    const weightKg = toKg(input.weight, input.weightUnit);

    const neckCm = toCm(input.neck, input.circumferenceUnit);
    const waistCm = toCm(input.waist, input.circumferenceUnit);
    const hipCm =
        input.hip != null ? toCm(input.hip, input.circumferenceUnit) : undefined;

    const heightM = heightCm / 100;
    const bmi = heightM > 0 ? weightKg / (heightM * heightM) : NaN;
    const waistToHeight = heightCm > 0 ? waistCm / heightCm : NaN;

    flags.push(
        ...plausibilityChecks({
            heightCm,
            weightKg,
            neckCm,
            waistCm,
            hipCm,
            bmi,
            waistToHeight,
        })
    );

    // Compute methods
    const navy = bodyFatNavyCm({
        gender: input.gender,
        heightCm,
        neckCm,
        waistCm,
        hipCm,
    });

    if (input.gender === "female" && hipCm == null) {
        flags.push({
            code: "MISSING_HIP_FOR_FEMALE_NAVY",
            message: "Hip measurement is required for the female Navy formula.",
            severity: "error",
        });
    }

    if (!Number.isFinite(navy)) {
        flags.push({
            code: "NAVY_LOG_DOMAIN_ERROR",
            message:
                "Navy formula could not be computed (likely due to an invalid log10 domain). Check tape measurements.",
            severity: "error",
        });
    }

    const bfBmi = bodyFatBMI({
        gender: input.gender,
        age: input.age,
        heightCm,
        weightKg,
    });

    // YMCA uses inches + pounds internally
    const waistIn = waistCm / IN_TO_CM;
    const weightLb = weightKg / LB_TO_KG;
    const ymca = bodyFatYMCA({
        gender: input.gender,
        waistIn,
        weightLb,
    });

    // Clean + clamp results into plausible bounds
    const estimatesRaw: MethodEstimate[] = [
        { method: "navy", bf: navy },
        { method: "bmi", bf: bfBmi },
        { method: "ymca", bf: ymca },
    ];

    const estimates: MethodEstimate[] = estimatesRaw
        .filter((e) => Number.isFinite(e.bf))
        .map((e) => ({ ...e, bf: clamp(e.bf, 0, 60) }));

    // Extreme disagreement flag
    if (estimates.length >= 2) {
        const bfs = estimates.map((e) => e.bf);
        const spread = Math.max(...bfs) - Math.min(...bfs);
        if (spread >= 20) {
            flags.push({
                code: "EXTREME_METHOD_DISAGREEMENT",
                message:
                    "Methods disagree by 20+ percentage points. This often indicates tape placement issues or a body type outside these formulas' assumptions.",
                severity: "warn",
            });
        }
    }

    // Composite
    const compositeOptions: CompositeOptions = {
        strategy: input.composite?.strategy ?? "median",
        weights: input.composite?.weights,
    };

    const { bf, strategy, dispersion } = compositeEstimate(
        estimates,
        compositeOptions
    );

    const { ci68, ci95 } = confidenceBands(bf, dispersion);

    return {
        inputsNormalized: {
            heightCm: round1(heightCm),
            weightKg: round1(weightKg),
            neckCm: round1(neckCm),
            waistCm: round1(waistCm),
            hipCm: hipCm != null ? round1(hipCm) : undefined,
            bmi: round1(bmi),
            waistToHeight: round1(waistToHeight),
        },
        estimates: estimates.map((e) => ({ ...e, bf: round1(e.bf) })),
        composite: {
            bf: round1(bf),
            strategy,
            ci68: [round1(ci68[0]), round1(ci68[1])],
            ci95: [round1(ci95[0]), round1(ci95[1])],
        },
        flags,
    };
}

/* 

Example input:
{
  "gender": "male",
  "age": 33,
  "height": 74,
  "heightUnit": "in",
  "weight": 182,
  "weightUnit": "lb",
  "neck": 16,
  "waist": 33.5,
  "circumferenceUnit": "in",
  "composite": {
    "strategy": "median"
  }
}
*/