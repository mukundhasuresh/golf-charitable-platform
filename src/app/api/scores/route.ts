import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/services/auth.service';
import { addScore, getScores, deleteScore } from '@/services/score.service';

/**
 * GET /api/scores - Fetch user's scores
 * POST /api/scores - Add a new score
 * DELETE /api/scores - Delete a score
 */

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { scores, error } = await getScores(user.id);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ scores });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { score, date } = await request.json();

    // Validate input
    if (!score || !date) {
      return NextResponse.json(
        { error: 'Score and date are required' },
        { status: 400 }
      );
    }

    if (typeof score !== 'number' || score < 1 || score > 45) {
      return NextResponse.json(
        { error: 'Score must be between 1 and 45' },
        { status: 400 }
      );
    }

    const { score: newScore, error } = await addScore(user.id, score, date);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ score: newScore }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { scoreId } = await request.json();

    if (!scoreId) {
      return NextResponse.json({ error: 'Score ID is required' }, { status: 400 });
    }

    const { error } = await deleteScore(scoreId, user.id);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
