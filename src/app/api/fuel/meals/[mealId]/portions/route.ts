import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { 
  createPortionedFood, 
  getPortionedFoods, 
} from '@/lib/db/crud/fuel';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mealId: string }> }
) {
  return withAuth(async (userId) => {
    const { mealId } = await params; // MEAL ID
    const portions = await getPortionedFoods({ mealId });
    return { portions };
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ mealId: string }> }
) {
  return withAuth(async (userId) => {
    const { mealId } = await params; // MEAL ID
    const body = await parseBody(request);
    const newPortion = await createPortionedFood({ mealId }, body);
    return newPortion;
  });
}

