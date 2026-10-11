import { getProfile } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const profile = await getProfile();

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="font-display text-2xl font-bold">Profile</h1>

      <Card>
        <CardHeader className="flex-row items-center gap-4">
          <Avatar name={profile?.name || "User"} className="h-14 w-14 text-base" />
          <div>
            <CardTitle>{profile?.name || "User"}</CardTitle>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
          </div>
        </CardHeader>
        <CardContent>
          <ProfileForm initialName={profile?.name ?? ""} />
        </CardContent>
      </Card>
    </div>
  );
}
