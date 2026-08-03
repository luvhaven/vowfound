import { PasswordForm } from "@/components/account/password-form";
import { getSessionUser } from "@/lib/supabase/server";

export default async function AccountSecurityPage() {
  const user = await getSessionUser();
  const mustChange = Boolean(
    (user?.user_metadata as { must_change_password?: boolean } | undefined)
      ?.must_change_password,
  );

  return (
    <div className="max-w-2xl">
      <h1 className="display-lg text-onink">Security</h1>
      <p className="measure mt-5 text-onink-dim">
        Your password is the only thing standing between a stranger and every
        answer you have given us. Change it whenever you want to.
      </p>
      <div className="mt-10">
        <PasswordForm mustChange={mustChange} />
      </div>
    </div>
  );
}
