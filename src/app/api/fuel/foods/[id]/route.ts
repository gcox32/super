import { NextRequest } from 'next/server';
import { withAuth, parseBody } from '@/lib/api/helpers';
import { getFoodById, updateFood, deleteFood } from '@/lib/db/crud/fuel';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const food = await getFoodById(id);
    if (!food) {
      throw { status: 404, message: 'Food not found' };
    }
    return food;
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const body = await parseBody(request);
    const updatedFood = await updateFood(id, body);

    if (!updatedFood) {
      throw { status: 404, message: 'Food not found' };
    }

    return updatedFood;
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (userId) => {
    const { id } = await params;
    const success = await deleteFood(id);

    if (!success) {
      throw { status: 404, message: 'Food not found' };
    }

    return { success: true };
  });
}

