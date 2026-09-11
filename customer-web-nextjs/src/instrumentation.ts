/**
 * Next.js instrumentation — sunucu tarafı istek hatalarını yakalar.
 *
 * Amaç: "Cannot convert argument to a ByteString" (Türkçe karakterin HTTP
 * header'ına girmesi) hatasının HANGİ istek/route tarafından tetiklendiğini
 * net görmek. Stack "ignore-listed" olduğu için normal logta kaynak görünmüyor;
 * burada path + route + referer ile [REQ-ERROR-CAPTURE] olarak loglarız.
 */
export async function onRequestError(
  error: unknown,
  request: {
    path?: string;
    method?: string;
    headers?: Record<string, string | string[] | undefined>;
  },
  context: {
    routePath?: string;
    routeType?: string;
    renderSource?: string;
    revalidateReason?: string;
  }
): Promise<void> {
  try {
    const msg = error instanceof Error ? error.message : String(error);
    if (
      msg.includes("ByteString") ||
      msg.includes("greater than 255") ||
      msg.includes("transformAlgorithm")
    ) {
      const h = request?.headers ?? {};
      // eslint-disable-next-line no-console
      console.error(
        "[REQ-ERROR-CAPTURE] " +
          JSON.stringify({
            msg,
            path: request?.path,
            method: request?.method,
            routePath: context?.routePath,
            routeType: context?.routeType,
            renderSource: context?.renderSource,
            referer: h["referer"] ?? h["referrer"],
            host: h["host"],
            ua: String(h["user-agent"] ?? "").slice(0, 80),
          })
      );
    }
  } catch {
    // logging hatasi uygulamayi etkilemesin
  }
}
