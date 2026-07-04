import { getSettingsData } from "@/lib/settings-data";

export function getBrandLogoSrc(
  logoData: Uint8Array | null | undefined,
  logoMimeType: string | null | undefined,
) {
  if (!logoData || !logoMimeType) {
    return null;
  }

  return `data:${logoMimeType};base64,${Buffer.from(logoData).toString("base64")}`;
}

export async function getGuestBranding() {
  const settings = await getSettingsData();
  const logoSrc = getBrandLogoSrc(
    settings.branding?.logoData,
    settings.branding?.logoMimeType,
  );

  return {
    welcomeMessage: settings.branding?.welcomeMessage ?? null,
    logoSrc,
  };
}
