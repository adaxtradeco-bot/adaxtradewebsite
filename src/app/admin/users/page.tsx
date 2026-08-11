import { requireAdmin } from '@/lib/auth-server';
import { UsersManagementClient } from '@/components/admin/UsersManagementClient';

export default async function UsersPage() {
  await requireAdmin();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage admin and editor accounts
        </p>
      </div>

      <UsersManagementClient />
    </div>
  );
}
