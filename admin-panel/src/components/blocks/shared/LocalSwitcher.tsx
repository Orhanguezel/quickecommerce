"use client";
import { useLocale } from "next-intl";
import { Link, routing, usePathname } from "@/routing";
import { Button, Card } from "../../ui";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { Locale } from "@/config/config";
import { getLanguageName } from "@/lib/language";

export default function PublicNavigationLocaleSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentLocale = useLocale();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative flex gap-1 py-5" ref={dropdownRef}>
      <Button
        onClick={toggleDropdown}
        className="flex gap-2 app-input sidebar-select w-[120px] lg:w-[130px] bg-transparent hover:bg-transparent text-blue-500 font-normal px-0"
      >
        <Globe size={16} /> {getLanguageName(currentLocale)}
        <ChevronDown size={16} />
      </Button>
      {isOpen && (
        <Card className="rounded-md border shadow-md absolute mt-12 px-1 w-full pb-1 flex flex-col z-50">
          {routing.locales.map((locale) => (
            <LocaleLink key={locale} locale={locale as Locale} />
          ))}
        </Card>
      )}
    </div>
  );
}

function LocaleLink({ locale }: { locale: Locale }) {
  const pathname: any = usePathname();
  const isActive = useLocale() === locale;

  return (
    <Link
      className={`mb-1 p-2 text-sm font-semibold rounded-sm ${
        isActive ? "text-blue-500 bg-blue-50" : "text-gray-500 hover:bg-blue-50"
      }`}
      href={pathname}
      locale={locale}
    >
      {getLanguageName(locale)}
    </Link>
  );
}
