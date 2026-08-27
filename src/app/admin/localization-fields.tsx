type Translation = { locale: string; name: string; description: string | null };

export function LocalizationFields({ locales, translations }: { locales: string[]; translations: Translation[] }) {
  const editableLocales = locales.filter((locale) => locale !== "es");
  if (!editableLocales.length) return null;
  return <fieldset className="translation-fields">
    <legend>Traducciones</legend>
    <input name="translation_locales" type="hidden" value={editableLocales.join(",")} />
    {editableLocales.map((locale) => {
      const translation = translations.find((item) => item.locale === locale);
      return <div className="translation-locale" key={locale}>
        <strong>{locale.toUpperCase()}</strong>
        <label>Nombre<input defaultValue={translation?.name ?? ""} name={`translation_${locale}_name`} /></label>
        <label>Descripción <span className="field-optional">Opcional</span><input defaultValue={translation?.description ?? ""} name={`translation_${locale}_description`} /></label>
      </div>;
    })}
  </fieldset>;
}
