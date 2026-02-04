
type LoaderParams = {
  src: string;
  width: number;
  quality?: number;
};

const normalizeSrc = (src: string): string => {
  const trimmed = src.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }
  const withoutPrefix = trimmed.replace(/^srcset=/i, "");
  const firstEntry = withoutPrefix.split(",")[0]?.trim();
  if (!firstEntry) return trimmed;
  const [url] = firstEntry.split(/\s+/);
  return url || trimmed;
};

const GlobalImageLoader = ({ src, width, quality }: LoaderParams): string => {
  const normalizedSrc = normalizeSrc(src);
  if (!normalizedSrc) return "";
  if (normalizedSrc.startsWith("data:") || normalizedSrc.startsWith("blob:")) {
    return normalizedSrc;
  }
  // Add ?w=...&q=... only if not already present
  const hasQuery = normalizedSrc.includes("?");
  const separator = hasQuery ? "&" : "?";

  return `${normalizedSrc}${separator}w=${width}&q=${quality || 75}`;
};

export default GlobalImageLoader;
