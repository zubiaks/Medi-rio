/** Mediário | Preferências locais dos blocos da página inicial. */
const KEY = "mediario-home-blocks-v1";
export function loadHomeBlockOrder(defaults: string[]): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(value)) return defaults;
    return [...value.filter((id) => defaults.includes(id)), ...defaults.filter((id) => !value.includes(id))];
  } catch { return defaults; }
}
export function saveHomeBlockOrder(values: string[]): void {
  localStorage.setItem(KEY, JSON.stringify(values));
}
export function moveHomeBlock(values: string[], id: string, direction: -1 | 1): string[] {
  const result=[...values]; const from=result.indexOf(id); const to=from+direction;
  if(from<0||to<0||to>=result.length)return result;
  const [item]=result.splice(from,1); result.splice(to,0,item); return result;
}
