import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getProfileUser, getProfileStats } from '@/lib/db/profile';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileStatsSection from '@/components/profile/ProfileStats';
import ChangePasswordForm from '@/components/profile/ChangePasswordForm';
import DeleteAccountSection from '@/components/profile/DeleteAccountSection';

export const metadata = {
  title: 'Profile — DevStash',
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const [user, stats] = await Promise.all([
    getProfileUser(session.user.id),
    getProfileStats(session.user.id),
  ]);

  if (!user) redirect('/sign-in');

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Manage your account and view usage stats
        </p>
      </div>

      <ProfileHeader user={user} />
      <ProfileStatsSection stats={stats} />
      {user.hasPassword && <ChangePasswordForm />}
      <DeleteAccountSection />
    </div>
  );
}
