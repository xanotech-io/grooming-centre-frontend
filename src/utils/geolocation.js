let cachedCoords;
let cachedPromise;

// Resolves to a "lat,lng" string, or null if unavailable/denied. Cached for
// the life of the tab so we don't re-prompt the browser permission dialog
// on every proctoring event / submission.
export const getGeolocationString = () => {
  if (cachedCoords !== undefined) return Promise.resolve(cachedCoords);
  if (cachedPromise) return cachedPromise;

  if (typeof navigator === "undefined" || !navigator.geolocation) {
    cachedCoords = null;
    return Promise.resolve(cachedCoords);
  }

  cachedPromise = new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        cachedCoords = `${position.coords.latitude},${position.coords.longitude}`;
        resolve(cachedCoords);
      },
      () => {
        cachedCoords = null;
        resolve(cachedCoords);
      },
      { timeout: 5000, maximumAge: 5 * 60 * 1000 }
    );
  });

  return cachedPromise;
};
