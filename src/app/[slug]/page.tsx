import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { MenuPublico } from "@/components/menu-publico";
import { getPublicMenu } from "@/lib/supabase/public-menu";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string; menu?: string }>;
};

function minutes(value: string) {
  const [hour, minute] = value.slice(0, 5).split(":").map(Number);
  return hour * 60 + minute;
}

function restaurantNowInfo(timezone: string) {
  const date = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  }).formatToParts(date);

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  const dayStr = parts.find((part) => part.type === "weekday")?.value?.toLowerCase() ?? "";

  const dayMap: Record<string, number> = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
  };
  const dayOfWeek = dayMap[dayStr] ?? date.getDay();
  const currentMinutes = hour * 60 + minute;

  return { currentMinutes, dayOfWeek };
}

function activeDaypartId(menu: NonNullable<Awaited<ReturnType<typeof getPublicMenu>>>) {
  if (!menu.settings.uses_dayparts) return null;
  const { currentMinutes: now } = restaurantNowInfo(menu.restaurant.timezone);
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
  return (
    requestedLocales
      .map((requested) =>
        supportedLocales.find(
          (supported) =>
            supported.toLowerCase() === requested ||
            supported.toLowerCase() === requested?.split("-")[0]
        )
      )
      .find((locale): locale is string => Boolean(locale)) ?? fallback
  );
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
  const [{ slug }, { lang, menu: menuParam }] = await Promise.all([params, searchParams]);
  const menu = await getPublicMenu(slug);
  if (!menu) notFound();
  const requestHeaders = await headers();
  const locale =
    lang && menu.restaurant.supported_locales.includes(lang)
      ? lang
      : preferredLocale(
          requestHeaders.get("accept-language"),
          menu.restaurant.supported_locales,
          menu.restaurant.default_locale
        );

  const activeMenus = menu.menus.filter((m) => m.is_active);

  let initialMenuId: string | null = null;
  if (menuParam) {
    const matched = activeMenus.find((m) => m.id === menuParam);
    if (matched) initialMenuId = matched.id;
  } else if (activeMenus.length === 1) {
    initialMenuId = activeMenus[0].id;
  }

  return (
    <MenuPublico
      currentDaypartId={activeDaypartId(menu)}
      initialMenuId={initialMenuId}
      locale={locale}
      menu={menu}
    />
  );
}
