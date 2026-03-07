/**
 * Hook to resolve ALL images for a project.
 * Returns an array of resolved image URLs (from IndexedDB or direct URLs).
 * Falls back to the primary imageUrl if no imageIds are present.
 */

import { useEffect, useState } from "react";
import { loadImages } from "../lib/imageStore";

interface UseProjectImagesResult {
  images: string[];
  isLoading: boolean;
}

export function useProjectImages(
  imageIds: string[] | undefined,
  primaryImageUrl: string,
  fallback?: string,
): UseProjectImagesResult {
  const hasIds = imageIds && imageIds.length > 0;

  const [images, setImages] = useState<string[]>(() => {
    // If primary URL is a direct URL (not idb:), use it immediately
    if (!hasIds && !primaryImageUrl.startsWith("idb:")) {
      return [primaryImageUrl || fallback || ""].filter(Boolean);
    }
    return fallback ? [fallback] : [];
  });
  const [isLoading, setIsLoading] = useState(
    !!(hasIds || primaryImageUrl.startsWith("idb:")),
  );

  useEffect(() => {
    let cancelled = false;

    if (hasIds) {
      // Load all images from IndexedDB by their IDs
      setIsLoading(true);
      loadImages(imageIds).then((results) => {
        if (cancelled) return;
        const valid = results
          .map((r, _i) => r ?? fallback ?? "")
          .filter(Boolean);
        setImages(valid.length > 0 ? valid : [fallback || ""].filter(Boolean));
        setIsLoading(false);
      });
    } else if (primaryImageUrl.startsWith("idb:")) {
      // Single idb: reference
      setIsLoading(true);
      const id = primaryImageUrl.slice(4);
      loadImages([id]).then((results) => {
        if (cancelled) return;
        const url = results[0] || fallback || "";
        setImages(url ? [url] : []);
        setIsLoading(false);
      });
    } else {
      // Direct URL or empty
      const url = primaryImageUrl || fallback || "";
      setImages(url ? [url] : []);
      setIsLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [imageIds, primaryImageUrl, fallback, hasIds]);

  return { images, isLoading };
}
