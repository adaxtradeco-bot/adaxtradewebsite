import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/api-auth';
import { hashPassword, verifyPassword } from '@/lib/auth';

const ProfileUpdateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').optional(),
  email: z.string().trim().email('Invalid email address').optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').optional(),
});

// GET /api/admin/profile - Get the requester's own profile
export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.ok) return auth.response;

    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/profile - Update the requester's own name/email/password
export async function PUT(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const parsed = ProfileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, email, currentPassword, newPassword } = parsed.data;
    const changingSensitiveField = email !== undefined || newPassword !== undefined;

    const existingUser = await prisma.user.findUnique({ where: { id: auth.user.id } });
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (changingSensitiveField) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required' }, { status: 400 });
      }

      const isValid = await verifyPassword(currentPassword, existingUser.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
      }
    }

    if (email !== undefined && email !== existingUser.email) {
      const emailOwner = await prisma.user.findUnique({ where: { email } });
      if (emailOwner && emailOwner.id !== auth.user.id) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
      }
    }

    const updateData: { name?: string; email?: string; password?: string } = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (newPassword !== undefined) updateData.password = await hashPassword(newPassword);

    const updatedUser = await prisma.user.update({
      where: { id: auth.user.id },
      data: updateData,
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }
    console.error('Profile PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
