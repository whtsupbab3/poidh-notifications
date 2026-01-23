const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;

export async function sendNotification({
  title,
  messageBody,
  targetUrl,
  targetFIds = [],
}: {
  title: string;
  messageBody: string;
  targetUrl: string;
  targetFIds?: Array<number>;
}) {
  if (!NEYNAR_API_KEY) {
    throw Error("Neynar key not found");
  }

  const url = "https://api.neynar.com/v2/farcaster/frame/notifications/";

  const options = {
    method: "POST",
    headers: {
      "x-api-key": NEYNAR_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      target_fids: targetFIds,
      notification: { title: title, body: messageBody, target_url: targetUrl },
    }),
  };

  let i = 3;
  while (i-- !== 0) {
    try {
      await (await fetch(url, options)).json();
      break;
    } catch (error) {
      console.error(error);
    }
  }
}

