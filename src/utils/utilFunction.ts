export const fetchDetails = async (id: string | number) => {
  try {
    return await fetch(
      `https://quotex-backend.onrender.com/api/diadata/price/${id}`
    );
  } catch {}
};

export const fetchTopMovers = async (ids: string) => {
  try {
    return await fetch(`https://quotex-backend.onrender.com/api/prices/${ids}`);
  } catch {
    //  console.log(`this error occured ${err}`);
  }
};
