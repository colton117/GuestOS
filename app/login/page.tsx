import { GuestLogin } from "@/components/guest-login";

type LoginPageProps = {
  searchParams?: Promise<{
    identifier?: string;
    error?: string;
    smsOptInPending?: string;
    remember?: string;
    passkeySetupPending?: string;
    destination?: string;
    otpPending?: string;
    sent?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const {
    identifier,
    error,
    smsOptInPending,
    remember,
    passkeySetupPending,
    destination,
    otpPending,
    sent,
  } = (await searchParams) ?? {};

  return (
    <GuestLogin
      identifier={identifier}
      error={error}
      smsOptInPending={smsOptInPending}
      remember={remember}
      passkeySetupPending={passkeySetupPending}
      destination={destination}
      otpPending={otpPending}
      sent={sent}
    />
  );
}
