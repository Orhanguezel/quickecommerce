
type LoaderParams = {
  src: string;
  width: number;
  quality?: number;
};

const stripQuotes = (value: string): string =>
  value.replace(/^['"]+|['"]+$/g, "");

const normalizeSrc = (src: string): string => {
  const trimmed = src.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }
  const withoutPrefix = trimmed.replace(/^(srcset|src)=/i, "");
  const firstEntry = withoutPrefix.split(",")[0]?.trim();
  if (!firstEntry) return stripQuotes(trimmed);
  const [rawUrl] = firstEntry.split(/\s+/);
  const url = stripQuotes(rawUrl ?? "");
  return url || stripQuotes(trimmed);
};

export const resolveImageSrc = (src: string): string => normalizeSrc(src);

const GlobalImageLoader = ({ src, width, quality }: LoaderParams): string => {
  const normalizedSrc = normalizeSrc(src);
  if (!normalizedSrc) return "";
  if (normalizedSrc.startsWith("data:") || normalizedSrc.startsWith("blob:")) {
    return normalizedSrc;
  }
  if (/[?&]w=\d+/.test(normalizedSrc)) {
    return normalizedSrc;
  }
  // Add ?w=...&q=... only if not already present
  const hasQuery = normalizedSrc.includes("?");
  const separator = hasQuery ? "&" : "?";

  return `${normalizedSrc}${separator}w=${width}&q=${quality || 75}`;
};

export default GlobalImageLoader;
