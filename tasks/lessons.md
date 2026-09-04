# Lessons

- For Nuxt nested routes, use `pages/section/index.vue` for the collection page when `pages/section/[slug].vue` is also present. A sibling `pages/section.vue` becomes the route parent and must contain `<NuxtPage />`; otherwise it masks child routes.
- For every new nested Nuxt route, verify the parent route does not mask it before testing the payment redirect in production.
- This Strapi Upload plugin does not accept REST relation filters for media folders and returns its complete media list in one response. Do not apply collection-type filters or pagination loops to `/api/upload/files`; inspect the deployed endpoint before using query parameters.
- For a photographer’s portfolio, never assume Strapi-derived formats meet the required visual quality. Verify the rendered result; when they are visibly compressed, use the Cloudflare original with lazy loading and a stronger editorial layout.
- Full-quality photography originals can be tens of megabytes. Preserve quality, but keep the initial portfolio set small and reveal later photos in explicit batches so the first view remains responsive.
- A portfolio sourced from upload order can visibly group photos with a similar treatment. Apply a stable deterministic mix based on file names so the page stays varied without changing at every visit.
- Enabling Cloudflare Transformations does not guarantee that a custom R2 hostname accepts the URL transformation path. Verify a transformed response; if it fails, use a dedicated Worker domain with `cf.image` and keep its URL configurable through a server environment variable.
- When the user prioritizes both performance and photographic quality, do not lower compression by default. First use responsive `srcset`, modern automatic formats, lazy loading, and a small initial batch so the browser downloads only the pixels the screen can display.
- When a curator specifies an exact opening order across media folders, encode that order explicitly in Strapi captions and make the frontend parse the full requested marker range; do not infer it from the visual layout alone.
- When the user says selection must come only from media folders, treat root-level media as ineligible even when filenames look like matching portfolio assets; clear their markers before assigning the final folder-only sequence.
- A Strapi media caption cannot be reliably cleared to an empty value in this UI. Replace obsolete selection markers with neutral text, then inspect the public ordering for duplicate numbered markers.
- CSS multi-column layouts may leave a noticeably short column when portrait and landscape photos are mixed. For a photography portfolio, distribute items by their intrinsic aspect ratio into the shortest column while retaining their natural, uncropped dimensions.
- When a balanced masonry view still ends with a visually distracting gap, add a small number of already-available, uncurated photos to the initial album batch rather than altering the curated opening order.
