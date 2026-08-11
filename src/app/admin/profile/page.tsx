import { requireAuth } from '@/lib/auth-server';
import { ProfileForm } from '@/components/admin/ProfileForm';

export default async function ProfilePage() {
  await requireAuth();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          View your account details and update your email or password
        </p>
      </div>

      <ProfileForm />
    </div>
  );
}
