export default defineEventHandler((event) => {
  if (!["GET", "HEAD"].includes(event.method)) return;
  const url = getRequestURL(event);
  if (
    url.pathname === "/tirages-photo" ||
    url.pathname.startsWith("/tirages-photo/")
  ) {
    return sendRedirect(
      event,
      url.pathname.replace("/tirages-photo", "/tirage-photo") + url.search,
      301,
    );
  }
});
