import { GuestLogin } from "@/components/guest-login";

type HomePageProps = {
  searchParams?: Promise<{
    identifier?: string;
    error?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const { identifier, error } = (await searchParams) ?? {};

  return <GuestLogin identifier={identifier} error={error} />;
}
