"use client";
import { useRef } from "react";
import Image from "next/image";

const ScrollImage = ({ src, alt }: { src: string; alt: string }) => {
  const imgRef = useRef<HTMLImageElement>(null);

  const handleMouseEnter = () => {
    if (!imgRef.current) return;
    const containerHeight = imgRef.current.parentElement!.offsetHeight;
    const imageHeight = imgRef.current.offsetHeight;

    const scrollDistance = imageHeight - containerHeight;
    imgRef.current.style.transform = `translateY(-${scrollDistance}px)`;
  };

  const handleMouseLeave = () => {
    if (!imgRef.current) return;
    imgRef.current.style.transform = "translateY(0)";
  };

  return (
    <div className="h-80 w-full relative overflow-hidden">
      <Image
        ref={imgRef}
        src={src}
        alt={alt}
        width={500}
        height={3000} // tall image
        className="w-full scroll-on-hover object-cover"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        priority
      />
    </div>
  );
};

export default ScrollImage;
