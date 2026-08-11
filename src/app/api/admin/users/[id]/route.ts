import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authorizeUserManagement } from '@/lib/api-auth';
import { hashPassword } from '@/lib/auth';

const UpdateUserSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  role: z.enum(['admin', 'editor'], { message: 'Role must be admin or editor' }),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

// PUT /api/admin/users/[id] - Update a user's name, role, and optionally password (admin only)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = authorizeUserManagement(request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const parsed = UpdateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, role, password } = parsed.data;
    const updateData: { name: string; role: string; password?: string } = { name, role };
    if (password) {
      updateData.password = await hashPassword(password);
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    console.error('Users PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - Delete a user (admin only, self-delete and last-admin blocked)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = authorizeUserManagement(request);
    if (!auth.ok) return auth.response;

    if (params.id === auth.user.id) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id: params.id } });
    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (target.role === 'admin') {
      const adminCount = await prisma.user.count({ where: { role: 'admin' } });
      if (adminCount <= 1) {
        return NextResponse.json({ error: 'Cannot delete the last remaining admin' }, { status: 400 });
      }
    }

    await prisma.user.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Users DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
