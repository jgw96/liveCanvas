let wakeLock: any = undefined;

export const randoRoom = () => {
  return  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export const requestWakeLock = async () => {
  try {
    wakeLock = await (navigator as any).wakeLock.request();

    wakeLock.addEventListener('release', () => {
      console.log('Screen Wake Lock released:', wakeLock.released);
    });
    console.log('Screen Wake Lock released:', wakeLock.released);
  } catch (err) {
    console.error(`${err.name}, ${err.message}`);
  }
};

export const releaseWakeLock = async () => {
  if (wakeLock) {
    wakeLock.release();
  }
}