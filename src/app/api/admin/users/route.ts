import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authorizeUserManagement } from '@/lib/api-auth';
import { hashPassword } from '@/lib/auth';

const CreateUserSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  name: z.string().trim().min(1, 'Name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'editor'], { message: 'Role must be admin or editor' }),
});

// GET /api/admin/users - List all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const auth = authorizeUserManagement(request);
    if (!auth.ok) return auth.response;

    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Users GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/users - Create a new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const auth = authorizeUserManagement(request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const parsed = CreateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { email, name, password, role } = parsed.data;
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: { email, name, password: hashedPassword, role },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }
    console.error('Users POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
