/**
 * Hook to resolve a project imageUrl that may be:
 * - An "idb:<id>" reference stored in IndexedDB (new format)
 * - A regular URL or base64 data URL (old format)
 */

import { useEffect, useState } from "react";
import { loadImage } from "../lib/imageStore";

export function useProjectImage(imageUrl: string, fallback?: string): string {
  const [resolved, setResolved] = useState<string>(() => {
    // If it's not an idb: reference, resolve immediately
    if (!imageUrl.startsWith("idb:")) return imageUrl || fallback || "";
    return fallback || "";
  });

  useEffect(() => {
    if (!imageUrl.startsWith("idb:")) {
      setResolved(imageUrl || fallback || "");
      return;
    }

    const id = imageUrl.slice(4); // strip "idb:"
    let cancelled = false;

    loadImage(id).then((dataUrl) => {
      if (!cancelled) {
        setResolved(dataUrl || fallback || "");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [imageUrl, fallback]);

  return resolved;
}

/**
 * Resolve an idb: image URL synchronously if possible, or trigger a load.
 * Returns [resolvedUrl, isLoading]
 */
export function useProjectImageWithLoading(
  imageUrl: string,
  fallback?: string,
): [string, boolean] {
  const isIdb = imageUrl.startsWith("idb:");
  const [resolved, setResolved] = useState<string>(
    !isIdb ? imageUrl || fallback || "" : fallback || "",
  );
  const [loading, setLoading] = useState(isIdb);

  useEffect(() => {
    if (!imageUrl.startsWith("idb:")) {
      setResolved(imageUrl || fallback || "");
      setLoading(false);
      return;
    }

    const id = imageUrl.slice(4);
    let cancelled = false;
    setLoading(true);

    loadImage(id).then((dataUrl) => {
      if (!cancelled) {
        setResolved(dataUrl || fallback || "");
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [imageUrl, fallback]);

  return [resolved, loading];
}
