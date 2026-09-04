const publicStrapiUrl = () => {
  const runtimeConfig = useRuntimeConfig();
  return (runtimeConfig.strapi?.url || process.env.STRAPI_URL || "").replace(/\/$/, "");
};

export default defineEventHandler(async () => {
  const strapiUrl = publicStrapiUrl();
  if (!strapiUrl) return [];

  try {
    const query = new URLSearchParams({
      "fields[0]": "slug",
      "fields[1]": "updatedAt",
      "filters[publishedAt][$notNull]": "true",
      "pagination[pageSize]": "100",
      "sort": "updatedAt:desc",
    });
    const response = await $fetch(`${strapiUrl}/api/produits?${query}`);
    return (response.data || [])
      .filter((product) => typeof product.slug === "string" && product.slug)
      .map((product) => ({
        loc: `/tirages-photo/${product.slug}`,
        lastmod: product.updatedAt,
      }));
  } catch (error) {
    console.error("Impossible de charger les produits pour le sitemap.", error?.message || error);
    return [];
  }
});
