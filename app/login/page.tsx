import { GuestLogin } from "@/components/guest-login";

type LoginPageProps = {
  searchParams?: Promise<{
    identifier?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { identifier, error } = (await searchParams) ?? {};

  return <GuestLogin identifier={identifier} error={error} />;
}
