export const fetchDetails = async (id: string) => {
  try {
    return await fetch(`https://quotex-backend.onrender.com/api/price/${id}`);
  } catch {}
};

export const fetchTopMovers = async (ids: string) => {
  try {
    return await fetch(`https://quotex-backend.onrender.com/api/prices/${ids}`);
  } catch {
    //  console.log(`this error occured ${err}`);
  }
};

export const ICP_API_HOST = "https://ic0.app";
