/**
 * Formateador de números telefónicos para menús gastronómicos.
 * Soporta números de Argentina (con formateo de código de área de 2, 3 o 4 dígitos)
 * e internacionales con fallback limpio.
 */

const THREE_DIGIT_AREA_CODES = new Set([
  "221", "223", "261", "264", "266", "299",
  "341", "342", "343", "351", "362", "376",
  "379", "380", "381", "383", "385", "387", "388"
]);

export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone || typeof phone !== "string") return "";

  const trimmed = phone.trim();
  if (!trimmed) return "";

  // Extraer solo dígitos y verificar si venía con '+'
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");

  if (!digits) return trimmed;

  let countryCode = "";
  let isMobile9 = false;
  let nationalDigits = digits;

  // Analizar prefijo de país si empieza con +54, 54, etc.
  if (digits.startsWith("54")) {
    countryCode = "+54";
    nationalDigits = digits.slice(2);
    if (nationalDigits.startsWith("9")) {
      isMobile9 = true;
      nationalDigits = nationalDigits.slice(1);
    }
  } else if (hasPlus) {
    // Si tiene '+' pero no es Argentina, formatear como internacional genérico
    return formatInternational(trimmed, digits);
  }

  // Quitar el '0' inicial de larga distancia nacional si existe
  if (nationalDigits.startsWith("0")) {
    nationalDigits = nationalDigits.slice(1);
  }

  // Quitar el '15' de móvil local si fue ingresado después del código de área o al inicio de 10 dígitos
  // Ej: 111512345678 (12 dígitos) o 1512345678 (10 dígitos en Buenos Aires)
  if (nationalDigits.length === 12 && nationalDigits.startsWith("1115")) {
    nationalDigits = "11" + nationalDigits.slice(4);
  }

  // Si tiene 10 dígitos, formatear según norma nacional de Argentina
  if (nationalDigits.length === 10) {
    const prefix = countryCode ? (isMobile9 ? `${countryCode} 9 ` : `${countryCode} `) : "+54 ";

    // Código de área de 2 dígitos (11 para Buenos Aires / CABA)
    if (nationalDigits.startsWith("11")) {
      const area = nationalDigits.slice(0, 2);
      const firstPart = nationalDigits.slice(2, 6);
      const secondPart = nationalDigits.slice(6, 10);
      return `${prefix}${area} ${firstPart}-${secondPart}`;
    }

    // Código de área de 3 dígitos (ej: 351 Córdoba, 341 Rosario, 261 Mendoza)
    const area3 = nationalDigits.slice(0, 3);
    if (THREE_DIGIT_AREA_CODES.has(area3)) {
      const firstPart = nationalDigits.slice(3, 6);
      const secondPart = nationalDigits.slice(6, 10);
      return `${prefix}${area3} ${firstPart}-${secondPart}`;
    }

    // Código de área de 4 dígitos (resto del país, ej: 2901 Ushuaia, 2966 Río Gallegos)
    const area4 = nationalDigits.slice(0, 4);
    const firstPart = nationalDigits.slice(4, 6);
    const secondPart = nationalDigits.slice(6, 10);
    return `${prefix}${area4} ${firstPart}-${secondPart}`;
  }

  // Si la longitud nacional no es 10 dígitos pero teníamos +54
  if (countryCode) {
    const prefix = isMobile9 ? `${countryCode} 9 ` : `${countryCode} `;
    return `${prefix}${nationalDigits}`;
  }

  // Fallback si no encajó en el patrón estándar
  return trimmed;
}

function formatInternational(raw: string, digits: string): string {
  if (raw.includes(" ")) return raw;
  if (digits.length <= 4) return `+${digits}`;
  if (digits.length <= 7) return `+${digits.slice(0, 3)} ${digits.slice(3)}`;
  if (digits.length <= 10) return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)} ${digits.slice(10)}`;
}

/**
 * Retorna el atributo href seguro para enlaces tel: (sin espacios ni guiones)
 */
export function getTelHref(phone: string | null | undefined): string {
  if (!phone) return "";
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) return `tel:${cleaned}`;
  if (cleaned.startsWith("54")) return `tel:+${cleaned}`;
  if (cleaned.length === 10 && cleaned.startsWith("11")) return `tel:+54${cleaned}`;
  if (cleaned.startsWith("0")) return `tel:+54${cleaned.slice(1)}`;
  return `tel:${cleaned}`;
}
