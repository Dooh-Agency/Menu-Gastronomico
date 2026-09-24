import { useId } from "react";

type Translation = { locale: string; name: string; description: string | null };

type LocalizationFieldsProps = {
  locales: string[];
  translations: Translation[];
  variant?: "fieldset" | "section";
};

export function LocalizationFields({ locales, translations, variant = "fieldset" }: LocalizationFieldsProps) {
  const headingId = useId();
  const editableLocales = locales.filter((locale) => locale !== "es");
  if (!editableLocales.length) return null;

  const fields = (
    <>
      <input name="translation_locales" type="hidden" value={editableLocales.join(",")} />
      {editableLocales.map((locale) => {
        const translation = translations.find((item) => item.locale === locale);
        return <div className="translation-locale" key={locale}>
          <strong>{locale.toUpperCase()}</strong>
          <label>Nombre<input defaultValue={translation?.name ?? ""} name={`translation_${locale}_name`} /></label>
          <label>Descripción <span className="field-optional">Opcional</span><input defaultValue={translation?.description ?? ""} name={`translation_${locale}_description`} /></label>
        </div>;
      })}
    </>
  );

  if (variant === "section") {
    return (
      <section aria-labelledby={headingId} className="translation-fields translation-fields-section">
        <h3 id={headingId}>Traducciones</h3>
        {fields}
      </section>
    );
  }

  return <fieldset className="translation-fields"><legend>Traducciones</legend>{fields}</fieldset>;
}
