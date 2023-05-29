import axios from 'axios';

export async function getEmbedding(query:string) {
  const headers = {
    "Content-Type": "application/json",
    "Authorization": process.env.AI_TOOLS_AUTH_HEADER || ''
  };

  const data = {
    text: [query],
  };

  const url = `${process.env.AI_TOOLS_BASE_URL}/t2embedding/openai/remote`;

  try {
    const response = await axios.post(url, data, { headers });
    return response.data;
  } catch (error) {
    console.log("error", error);
    return [];
  }
}