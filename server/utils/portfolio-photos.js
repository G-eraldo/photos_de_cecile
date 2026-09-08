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
// Photo commerciale des bons cadeaux : conserver ses deux imports pour la
// page Offrir, mais ne pas les présenter dans l’album de séances.
export function isPortfolioPhoto(photo) {
  const filename = String(photo.url || '').split(/[?#]/)[0].split('/').pop();
  return !['DSC_01434_746f713442.jpg', 'DSC_01434_3ae18f4bf0.jpeg'].includes(filename);
}
