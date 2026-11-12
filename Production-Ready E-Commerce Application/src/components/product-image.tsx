"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductImageProps = Omit<ImageProps, "onError"> & {
  /** Classes applied to the fallback placeholder */
  fallbackClassName?: string;
};

/**
 * next/image wrapper that shows a neutral placeholder if the source fails
 * to load, instead of a broken-image icon.
 */
export function ProductImage({
  className,
  fallbackClassName,
  alt,
  ...props
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-300",
          fallbackClassName,
        )}
      >
        <ImageOff className="size-8" />
      </div>
    );
  }

  return (
    <Image
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      {...props}
    />
  );
}

