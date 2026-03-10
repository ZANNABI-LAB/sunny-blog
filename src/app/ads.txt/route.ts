export const GET = () => {
  return new Response(
    "google.com, pub-6873591317343081, DIRECT, f08c47fec0942fa0\n",
    {
      headers: { "Content-Type": "text/plain" },
    }
  );
};
