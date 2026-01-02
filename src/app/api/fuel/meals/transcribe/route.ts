import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { callOpenAI } from '@/lib/ai/openai';
import { buildPrompt } from '@/lib/ai/fuel/mealPrompt';
import { createFood, createMeal, createMealInstance, createPortionedFood, getPortionedFoods, updateFood } from '@/lib/db/crud/fuel';
import { findSimilarFood, findSimilarMeal } from '@/lib/fuel/fuzzyMatching';
import { areUnitsCompatible, calculateNutrients, aggregateNutrients } from '@/lib/fuel/calculations';
import type { Food, Meal } from '@/types/fuel';
import type { ServingSizeMeasurement } from '@/types/measures';

interface TranscriptionRequest {
  transcription: string;
  date?: string; // Optional date override (ISO string)
  timestamp?: string; // Optional timestamp override (ISO string)
}

interface ParsedFoodData {
  name: string;
  portion: ServingSizeMeasurement;
  servingSize?: ServingSizeMeasurement;
  calories?: number;
  macros?: {
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  micros?: Record<string, number>;
}

interface ParsedMealData {
  meal: {
    name: string;
    description?: string;
  };
  foods: ParsedFoodData[];
  date?: string;
  timestamp?: string;
  notes?: string;
}

export async function POST(request: NextRequest) {
  return withAuth(async (userId) => {
    const body = await parseBody<TranscriptionRequest>(request);
    const { transcription, date, timestamp } = body;

    if (!transcription || !transcription.trim()) {
      throw new Error('Transcription text is required');
    }

    // Step 1: Build prompt and call OpenAI
    const prompt = buildPrompt(transcription);
    if (!prompt) {
      throw new Error('Failed to build prompt. Prompt builder not yet implemented.');
    }

    let openAIResponse: string;
    try {
      openAIResponse = await callOpenAI(prompt, {
        jsonMode: true, // Use JSON mode for structured output
        temperature: 0.3, // Lower temperature for more consistent parsing
        maxRetries: 3,
        retryDelay: 1000,
      });
    } catch (error: any) {
      console.error('OpenAI API error:', error);

      // Provide more specific error messages
      if (error.status === 401 || error.status === 403) {
        throw new Error('OpenAI API authentication failed. Please check API key configuration.');
      } else if (error.status === 429) {
        throw new Error('OpenAI API rate limit exceeded. Please try again in a moment.');
      } else if (error.status === 500 || error.status >= 502) {
        throw new Error('OpenAI API is temporarily unavailable. Please try again.');
      } else {
        throw new Error(`Failed to parse meal from transcription: ${error.message || 'Unknown error'}`);
      }
    }

    // Step 2: Parse JSON response from OpenAI
    let parsedData: ParsedMealData;
    try {
      // With JSON mode, the response should be pure JSON, but we'll still handle markdown wrapping as a fallback
      let jsonString = openAIResponse.trim();

      // Remove markdown code blocks if present (fallback for non-JSON mode)
      const jsonMatch = jsonString.match(/```json\s*([\s\S]*?)\s*```/) ||
        jsonString.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonString = jsonMatch[1].trim();
      }

      // Extract JSON object if wrapped in text
      const objectMatch = jsonString.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        jsonString = objectMatch[0];
      }

      parsedData = JSON.parse(jsonString);
    } catch (error: any) {
      console.error('=== Failed to parse OpenAI response ===');
      console.error('Error:', error);
      console.error('Raw response:', openAIResponse);
      throw new Error(`Failed to parse meal data: ${error.message || 'Invalid JSON response. Please try again.'}`);
    }

    // Step 3: Validate parsed data
    if (!parsedData.meal || !parsedData.meal.name) {
      throw new Error('Invalid meal data: meal name is required');
    }
    if (!parsedData.foods || !Array.isArray(parsedData.foods) || parsedData.foods.length === 0) {
      throw new Error('Invalid meal data: at least one food is required');
    }

    // Validate portion units
    const validUnits: ServingSizeMeasurement['unit'][] = ['g', 'ml', 'oz', 'lb', 'kg', 'count', 'fl oz', 'cup', 'tbsp', 'tsp'];

    for (let i = 0; i < parsedData.foods.length; i++) {
      const foodData = parsedData.foods[i];

      // Validate food name
      if (!foodData.name || !foodData.name.trim()) {
        throw new Error(`Invalid food data: food at index ${i} is missing a name`);
      }

      // Validate portion
      if (!foodData.portion) {
        throw new Error(`Invalid food data: food "${foodData.name}" is missing portion information`);
      }
      if (typeof foodData.portion.value !== 'number' || foodData.portion.value <= 0) {
        throw new Error(`Invalid food data: food "${foodData.name}" has invalid portion value (must be a positive number)`);
      }
      if (!validUnits.includes(foodData.portion.unit)) {
        throw new Error(`Invalid food data: food "${foodData.name}" has invalid portion unit "${foodData.portion.unit}". Valid units: ${validUnits.join(', ')}`);
      }

      // Validate servingSize if provided
      if (foodData.servingSize) {
        if (typeof foodData.servingSize.value !== 'number' || foodData.servingSize.value <= 0) {
          throw new Error(`Invalid food data: food "${foodData.name}" has invalid serving size value (must be a positive number)`);
        }
        if (!validUnits.includes(foodData.servingSize.unit)) {
          throw new Error(`Invalid food data: food "${foodData.name}" has invalid serving size unit "${foodData.servingSize.unit}". Valid units: ${validUnits.join(', ')}`);
        }

        // Warn if portion and serving size units are incompatible (but don't fail - we'll handle it)
        if (!areUnitsCompatible(foodData.portion.unit, foodData.servingSize.unit)) {
          console.warn(`Food "${foodData.name}": portion unit "${foodData.portion.unit}" and serving size unit "${foodData.servingSize.unit}" are incompatible. Using portion as serving size.`);
        }
      }

      // Validate and normalize macros if provided
      if (foodData.macros) {
        // Normalize protein
        if (foodData.macros.protein !== undefined && foodData.macros.protein !== null) {
          if (typeof foodData.macros.protein === 'string') {
            const parsed = parseFloat(foodData.macros.protein);
            foodData.macros.protein = isNaN(parsed) ? undefined : parsed;
          }
          if (foodData.macros.protein !== undefined && (typeof foodData.macros.protein !== 'number' || foodData.macros.protein < 0 || !isFinite(foodData.macros.protein))) {
            foodData.macros.protein = undefined;
          }
        }

        // Normalize carbs
        if (foodData.macros.carbs !== undefined && foodData.macros.carbs !== null) {
          if (typeof foodData.macros.carbs === 'string') {
            const parsed = parseFloat(foodData.macros.carbs);
            foodData.macros.carbs = isNaN(parsed) ? undefined : parsed;
          }
          if (foodData.macros.carbs !== undefined && (typeof foodData.macros.carbs !== 'number' || foodData.macros.carbs < 0 || !isFinite(foodData.macros.carbs))) {
            foodData.macros.carbs = undefined;
          }
        }

        // Normalize fat
        if (foodData.macros.fat !== undefined && foodData.macros.fat !== null) {
          if (typeof foodData.macros.fat === 'string') {
            const parsed = parseFloat(foodData.macros.fat);
            foodData.macros.fat = isNaN(parsed) ? undefined : parsed;
          }
          if (foodData.macros.fat !== undefined && (typeof foodData.macros.fat !== 'number' || foodData.macros.fat < 0 || !isFinite(foodData.macros.fat))) {
            foodData.macros.fat = undefined;
          }
        }

        // Remove macros object if all values are undefined
        if (!foodData.macros.protein && !foodData.macros.carbs && !foodData.macros.fat) {
          foodData.macros = undefined;
        }
      }

      // Validate and normalize calories if provided
      if (foodData.calories !== undefined && foodData.calories !== null) {
        // Convert string to number if needed
        if (typeof foodData.calories === 'string') {
          const parsed = parseFloat(foodData.calories);
          if (isNaN(parsed)) {
            foodData.calories = undefined; // Remove invalid value
          } else {
            foodData.calories = parsed;
          }
        }
        // Validate final value
        if (foodData.calories !== undefined && (typeof foodData.calories !== 'number' || foodData.calories < 0 || !isFinite(foodData.calories))) {
          foodData.calories = undefined; // Remove invalid value instead of throwing
        }
      }
    }

    // Validate date/timestamp if provided
    if (parsedData.date) {
      const dateObj = new Date(parsedData.date);
      if (isNaN(dateObj.getTime())) {
        throw new Error(`Invalid date format: "${parsedData.date}"`);
      }
    }
    if (parsedData.timestamp) {
      const timestampObj = new Date(parsedData.timestamp);
      if (isNaN(timestampObj.getTime())) {
        throw new Error(`Invalid timestamp format: "${parsedData.timestamp}"`);
      }
    }

    // Step 4: Check for existing foods and meals using fuzzy matching
    // Step 5: Create or find foods
    const foodIds: string[] = [];
    const portionedFoods: Array<{ foodId: string; portion: ServingSizeMeasurement }> = [];
    const createdFoods: Food[] = [];
    const matchedFoods: Food[] = [];
    const foodErrors: Array<{ foodName: string; error: string }> = [];

    for (const foodData of parsedData.foods) {
      try {
        // Try to find existing food using fuzzy matching
        const similarFood = await findSimilarFood(foodData.name, 0.7); // 70% similarity threshold

        let food: Food;
        if (similarFood) {
          // Use existing food
          food = similarFood.item;
          matchedFoods.push(food);

          // If existing food doesn't have nutritional data, update it with OpenAI's estimates
          // Otherwise, use existing data (it's likely more accurate)
          const needsNutritionalUpdate = !food.calories || !food.macros;

          if (needsNutritionalUpdate && (foodData.calories || foodData.macros)) {
            // Update the food with OpenAI's nutritional estimates
            await updateFood(food.id, {
              calories: foodData.calories,
              macros: foodData.macros,
              micros: foodData.micros,
            });
            // Refresh food object
            food = { ...food, calories: foodData.calories, macros: foodData.macros, micros: foodData.micros };
          } else {
            // Use existing nutritional data (prefer database over OpenAI estimates)
            if (food.calories !== undefined) {
              foodData.calories = food.calories;
            }
            if (food.macros) {
              foodData.macros = food.macros;
            }
            if (food.micros) {
              foodData.micros = food.micros;
            }
          }
        } else {
          // Create new food
          // Use portion as serving size if servingSize not provided or units are incompatible
          let servingSize = foodData.servingSize;
          if (!servingSize || !areUnitsCompatible(foodData.portion.unit, servingSize.unit)) {
            servingSize = foodData.portion;
          }

          food = await createFood({
            name: foodData.name,
            servingSize,
            calories: foodData.calories,
            macros: foodData.macros,
            micros: foodData.micros,
          });
          createdFoods.push(food);
        }

        foodIds.push(food.id);
        portionedFoods.push({
          foodId: food.id,
          portion: foodData.portion,
        });
      } catch (error: any) {
        // Track errors but continue processing other foods
        foodErrors.push({
          foodName: foodData.name,
          error: error.message || 'Failed to create or find food',
        });
        console.error(`Failed to process food "${foodData.name}":`, error);
      }
    }

    // If we failed to process any foods, throw an error
    if (foodErrors.length > 0) {
      const errorMessages = foodErrors.map(e => `"${e.foodName}": ${e.error}`).join('; ');
      throw new Error(`Failed to process some foods: ${errorMessages}`);
    }

    // Ensure we have at least one food
    if (foodIds.length === 0) {
      throw new Error('No foods were successfully processed');
    }

    // Step 6: Calculate meal totals from all foods
    // Calculate nutrients for each food portion
    const foodNutrients = parsedData.foods.map((foodData: ParsedFoodData, index: number) => {
      const food = index < foodIds.length ?
        (matchedFoods.find(f => f.id === foodIds[index]) || createdFoods.find(f => f.id === foodIds[index])) :
        null;

      if (!food) {
        // Fallback: use OpenAI's estimates directly if food not found
        return {
          calories: foodData.calories,
          macros: foodData.macros,
          micros: foodData.micros,
        };
      }

      // Calculate nutrients based on portion size
      return calculateNutrients(food, foodData.portion);
    });

    // Aggregate all nutrients for the meal
    const mealNutrients = aggregateNutrients(foodNutrients);

    // Step 7: Create or find meal using fuzzy matching
    const similarMeal = await findSimilarMeal(parsedData.meal.name, userId, 0.7); // 70% similarity threshold

    let meal: Meal;
    if (similarMeal) {
      // Use existing meal
      meal = similarMeal.item;
    } else {
      // Create new meal with calculated totals
      meal = await createMeal(userId, {
        name: parsedData.meal.name,
        description: parsedData.meal.description,
        userId,
        calories: mealNutrients.calories,
        macros: mealNutrients.macros,
        micros: mealNutrients.micros,
      });
    }

    // Step 8: Create portioned foods for the meal (only if meal is new or doesn't have these foods)
    // Check if meal already has portioned foods
    const existingPortionedFoods = await getPortionedFoods({ mealId: meal.id });
    const existingFoodIds = new Set(existingPortionedFoods.map(pf => pf.foodId));

    for (const pf of portionedFoods) {
      // Only add if this food isn't already in the meal
      if (!existingFoodIds.has(pf.foodId)) {
        await createPortionedFood(
          { mealId: meal.id },
          {
            id: '', // Will be generated by DB
            foodId: pf.foodId,
            mealId: meal.id,
            portion: pf.portion,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        );
      }
    }

    // Step 9: Create meal instance (but don't save it yet - return for confirmation)
    // We'll create a temporary structure that the frontend can use to confirm
    // The actual MealInstance will be created after user confirmation

    // Parse date/timestamp (handles relative times parsed by OpenAI)
    let mealDate: Date;
    if (date) {
      mealDate = new Date(date);
    } else if (parsedData.date) {
      mealDate = new Date(parsedData.date);
    } else {
      mealDate = new Date();
    }

    // Validate date
    if (isNaN(mealDate.getTime())) {
      mealDate = new Date(); // Fallback to current date if invalid
    }

    let mealTimestamp: Date | null = null;
    if (timestamp) {
      mealTimestamp = new Date(timestamp);
      if (isNaN(mealTimestamp.getTime())) {
        mealTimestamp = null; // Invalid timestamp, set to null
      }
    } else if (parsedData.timestamp) {
      mealTimestamp = new Date(parsedData.timestamp);
      if (isNaN(mealTimestamp.getTime())) {
        mealTimestamp = null; // Invalid timestamp, set to null
      }
    }

    // Return the parsed meal data for confirmation
    // The frontend will call the regular POST /api/fuel/meals/instances endpoint after confirmation
    return {
      meal: {
        ...meal,
        calories: mealNutrients.calories,
        macros: mealNutrients.macros,
        micros: mealNutrients.micros,
      },
      foods: parsedData.foods.map((foodData, index) => {
        const food = index < foodIds.length ?
          (matchedFoods.find(f => f.id === foodIds[index]) || createdFoods.find(f => f.id === foodIds[index])) :
          null;

        // Calculate nutrients for this specific portion
        const portionNutrients = food ? calculateNutrients(food, foodData.portion) : {
          calories: foodData.calories,
          macros: foodData.macros,
          micros: foodData.micros,
        };

        return {
          ...foodData,
          foodId: foodIds[index],
          calories: portionNutrients.calories,
          macros: portionNutrients.macros,
          micros: portionNutrients.micros,
        };
      }),
      suggestedMealInstance: {
        mealId: meal.id,
        date: mealDate.toISOString(),
        timestamp: mealTimestamp?.toISOString() || null,
        notes: parsedData.notes,
        complete: false,
        calories: mealNutrients.calories,
        macros: mealNutrients.macros,
        micros: mealNutrients.micros,
      },
      // Include metadata about what was created vs matched
      metadata: {
        foodsCreated: createdFoods.length,
        foodsMatched: matchedFoods.length,
        mealMatched: !!similarMeal,
      },
    };
  });
}

