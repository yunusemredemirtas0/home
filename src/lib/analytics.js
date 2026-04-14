import pb from './pocketbase';

/**
 * Belirli bir içeriğin görüntülenme sayısını 1 artırır.
 * @param {string} collection - Koleksiyon adı ('posts' veya 'projects')
 * @param {string} id - Kayıt ID'si
 */
export const trackView = async (collection, id) => {
  if (!id || !collection) return;

  // LocalStorage kullanarak aynı oturumda mükerrer sayımı önleyelim
  const storageKey = `viewed_${collection}_${id}`;
  const alreadyViewed = sessionStorage.getItem(storageKey);

  if (alreadyViewed) return;

  try {
    await pb.collection(collection).update(id, {
      'views+': 1
    });
    sessionStorage.setItem(storageKey, 'true');
  } catch (error) {
    // Sessizce yutalım, analitik hatası kullanıcı deneyimini bozmamalı
    console.error(`Analytics error for ${collection}/${id}:`, error);
  }
};
