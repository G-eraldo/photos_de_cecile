export function deduplicatePortfolioPhotos(photos) {
  const urls = new Set();
  const signatures = new Set();

  return photos.filter((photo) => {
    // Strapi attribue une nouvelle URL à chaque réimportation. Le nom seul
    // ne suffit pas : deux prises de vue peuvent porter le même nom de fichier.
    const signature = photo.name && photo.width && photo.height && photo.size
      ? JSON.stringify([photo.name, photo.width, photo.height, photo.size])
      : null;
    const duplicate = urls.has(photo.url) || (signature && signatures.has(signature));
    urls.add(photo.url);
    if (signature) signatures.add(signature);
    return !duplicate;
  });
}
