const isSafeInternalPath = (value: string | null): value is string => Boolean(value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/auth"));

export const getPostLoginPath = (search: string) => {
  const next = new URLSearchParams(search).get("next");
  return isSafeInternalPath(next) ? next : "/dashboard";
};

export const signInPathFor = (path: string) => `/auth?next=${encodeURIComponent(path)}`;
