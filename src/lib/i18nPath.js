// src/lib/i18nPath.js
export function currentLangFromPath(pathname = "/") {
  if (pathname.startsWith("/en/") || pathname === "/en") return "en";
  if (pathname.startsWith("/hi/") || pathname === "/hi") return "hi";
  return "en"; // default
}

export function switchLangInPath(pathname = "/", to = "en") {
  const parts = pathname.split("/").filter(Boolean);
  // if first seg is en/hi, replace it; else prepend
  if (parts[0] === "en" || parts[0] === "hi") {
    parts[0] = to;
  } else {
    parts.unshift(to);
  }
  return "/" + parts.join("/");
}
