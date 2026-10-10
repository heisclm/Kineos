import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  includeJsonLd?: boolean;
}

export function Breadcrumbs({
  items,
  className,
  includeJsonLd = true,
}: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kineos.fun";

  const jsonLd = includeJsonLd
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.label,
          item: item.href
            ? item.href.startsWith("http")
              ? item.href
              : `${siteUrl}${item.href}`
            : undefined,
        })),
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <nav
        aria-label="Breadcrumb"
        className={cn(
          "w-full flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-medium text-white/50 overflow-x-auto no-scrollbar whitespace-nowrap py-1 select-none",
          className
        )}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <div key={`${item.label}-${index}`} className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-white transition-colors duration-200 truncate max-w-[120px] sm:max-w-[200px] md:max-w-none"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    "truncate",
                    isLast
                      ? "text-white/95 font-semibold max-w-[170px] sm:max-w-[320px] md:max-w-none"
                      : "text-white/50"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}

              {!isLast && (
                <ChevronRight className="w-3 h-3 text-white/30 shrink-0" aria-hidden="true" />
              )}
            </div>
          );
        })}
      </nav>
    </>
  );
}
