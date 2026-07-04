/**
 * Best-effort, client-only label for the device registering a passkey (e.g.
 * "iPhone (Safari)") so a guest with multiple passkeys can tell them apart
 * in the list later. Never blocks registration if it can't guess — falls
 * back to a generic "Device".
 */
export function guessDeviceLabel(): string {
  if (typeof navigator === "undefined") {
    return "Device";
  }

  const ua = navigator.userAgent;

  let device = "Device";
  if (/iPhone/.test(ua)) device = "iPhone";
  else if (/iPad/.test(ua)) device = "iPad";
  else if (/Macintosh/.test(ua)) device = "Mac";
  else if (/Android/.test(ua)) device = "Android";
  else if (/Windows/.test(ua)) device = "Windows PC";

  let browser = "";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/CriOS\//.test(ua) || (/Chrome\//.test(ua) && !/Edg\//.test(ua))) browser = "Chrome";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Safari\//.test(ua) && !/Chrome\//.test(ua) && !/CriOS\//.test(ua)) browser = "Safari";

  return browser ? `${device} (${browser})` : device;
}
