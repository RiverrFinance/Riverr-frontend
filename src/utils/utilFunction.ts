export const fetchDetails = async (id: string) => {
  const response = fetch(`https://quotex-backend.onrender.com/api/price/${id}`);
  return response;
};

export const ICP_API_HOST = "https://icp-api.io/";
