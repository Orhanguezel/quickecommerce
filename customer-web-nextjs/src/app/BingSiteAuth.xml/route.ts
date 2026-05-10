const BING_SITE_AUTH_XML = `<?xml version="1.0"?>
<users>
	<user>6B11B1EDCC5A2E9C729111D7D01F5EED</user>
</users>`;

export function GET() {
  return new Response(BING_SITE_AUTH_XML, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
