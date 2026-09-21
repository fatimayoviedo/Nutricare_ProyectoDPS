import Link from "next/link";
import Image from "next/image";

export function Brand({ compact = false, prominent = false }: { compact?: boolean; prominent?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2 text-[var(--ink)]">
      <span className={`relative block overflow-hidden rounded-full border-2 border-[var(--lime)] bg-white ${prominent ? "size-11 sm:size-12" : "size-11"}`}>
        <Image
          src="/images/nutricare-logo-oficial.png"
          alt=""
          width={prominent ? 150 : 138}
          height={prominent ? 150 : 138}
          className={prominent ? "h-auto w-[138px] max-w-none -translate-x-[47px] -translate-y-[29px] sm:w-[150px] sm:-translate-x-[51px] sm:-translate-y-[32px]" : "max-w-none -translate-x-[47px] -translate-y-[29px]"}
          priority
        />
      </span>
      {!compact ? <span className={`${prominent ? "text-xl sm:text-2xl" : "text-xl"} font-extrabold tracking-[-0.03em]`}>NutriCare</span> : null}
    </Link>
  );
}
