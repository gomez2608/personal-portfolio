export type DocLang = "en" | "es";

const SPANISH_ONLY = ["/blog", "/mentoria", "/privacidad"];

/** Spanish-only routes force lang="es"; everything else follows the user's choice. */
export function documentLang(pathname: string, lang: DocLang): DocLang {
  const spanish = SPANISH_ONLY.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  return spanish ? "es" : lang;
}
