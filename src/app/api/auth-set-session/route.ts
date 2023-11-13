export async function GET(req: Request) {
  const appSession = req.headers.get("Authorization");
  if (!appSession) {
    throw new Error(
      "Unable to set appSession cookie while Authorization header is unset"
    );
  }
  return new Response("success", {
    status: 200,
    headers: { "Set-Cookie": `appSession=${appSession}` },
  });
}
