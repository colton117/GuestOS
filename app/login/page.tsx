import { GuestLogin } from "@/components/guest-login";

type LoginPageProps = {
  searchParams?: Promise<{
    identifier?: string;
    error?: string;
    smsOptInPending?: string;
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
      passkeySetupPending={passkeySetupPending}
      destination={destination}
      otpPending={otpPending}
      sent={sent}
    />
  );
}
