import Image from "next/image";

export default function Avatar({
  src,
  fallback,
  size = 52,
  className = "",
}: {
  src?: string | null;
  fallback: string;
  size?: number;
  className?: string;
}) {
  if (src) {
    return (
      <div
        className={`relative rounded-full overflow-hidden flex-shrink-0 border-2 border-maroon ${className}`}
        style={{ width: size, height: size }}
      >
        <Image src={src} alt="" fill className="object-cover" />
      </div>
    );
  }

  return (
    <span
      className={`seal flex-shrink-0 ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(size * 0.22, 10) }}
    >
      {fallback}
    </span>
  );
}
