const LEGACY_PAGES = {
  "/tarifs": "/prestations",
  "/prestations-1": "/prestations",
};

export default defineEventHandler((event) => {
  if (!["GET", "HEAD"].includes(event.method)) return;
  const url = getRequestURL(event);
  const pathname = url.pathname.replace(/\/+$/, "") || "/";

  if (
    pathname === "/tirages-photo" ||
    pathname.startsWith("/tirages-photo/")
  ) {
    return sendRedirect(
      event,
      pathname.replace("/tirages-photo", "/tirage-photo") + url.search,
      301,
    );
  }

  const destination = LEGACY_PAGES[pathname];
  if (destination) {
    return sendRedirect(event, destination + url.search, 301);
  }
});
