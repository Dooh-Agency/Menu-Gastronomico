import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { MenuPublico } from "@/components/menu-publico";
import { getPublicMenu } from "@/lib/supabase/public-menu";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
};

function minutes(value: string) {
  const [hour, minute] = value.slice(0, 5).split(":").map(Number);
  return hour * 60 + minute;
}

function restaurantMinutes(timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

function activeDaypartId(menu: NonNullable<Awaited<ReturnType<typeof getPublicMenu>>>) {
  if (!menu.settings.uses_dayparts) return null;
  const now = restaurantMinutes(menu.restaurant.timezone);
  const match = menu.dayparts.find((daypart) => {
    const start = minutes(daypart.starts_at);
    const end = minutes(daypart.ends_at);
    return start < end ? now >= start && now < end : now >= start || now < end;
  });
  return match?.id ?? null;
}

function preferredLocale(acceptLanguage: string | null, supportedLocales: string[], fallback: string) {
  const requestedLocales = (acceptLanguage ?? "")
    .split(",")
    .map((value) => value.trim().split(";")[0]?.toLowerCase())
    .filter(Boolean);
  return requestedLocales
    .map((requested) => supportedLocales.find((supported) => supported.toLowerCase() === requested || supported.toLowerCase() === requested?.split("-")[0]))
    .find((locale): locale is string => Boolean(locale)) ?? fallback;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const menu = await getPublicMenu(slug);
  if (!menu) return { title: "Menú no encontrado" };
  return {
    title: `${menu.restaurant.name} | Menú`,
    description: `Menú digital de ${menu.restaurant.name}.`,
  };
}

export default async function PublicMenuPage({ params, searchParams }: PageProps) {
  const [{ slug }, { lang }] = await Promise.all([params, searchParams]);
  const menu = await getPublicMenu(slug);
  if (!menu) notFound();
  const requestHeaders = await headers();
  const locale = lang && menu.restaurant.supported_locales.includes(lang)
    ? lang
    : preferredLocale(requestHeaders.get("accept-language"), menu.restaurant.supported_locales, menu.restaurant.default_locale);
  return <MenuPublico currentDaypartId={activeDaypartId(menu)} locale={locale} menu={menu} />;
}
