export const dynamic = 'force-dynamic';

import { SITE_URL } from "@/lib/seo";

export function GET() {
  return Response.redirect(`${SITE_URL}/sitemap.xml`, 308);
}
