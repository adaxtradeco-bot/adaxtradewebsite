import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { BlogServiceError } from './post-service';

/** Maps service, validation and unique-constraint errors to JSON responses. */
export function blogErrorResponse(error: unknown) {
  if (error instanceof BlogServiceError) return NextResponse.json({ error: error.message }, { status: error.status });
  if (error instanceof ZodError) {
    return NextResponse.json({ error: 'validation_error', issues: error.issues }, { status: 422 });
  }
  if ((error as { code?: string })?.code === 'P2002') {
    return NextResponse.json({ error: 'Already exists' }, { status: 409 });
  }
  console.error('Blog API error:', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
