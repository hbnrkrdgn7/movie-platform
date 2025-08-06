import axios from "axios";

const API_KEY = "cbd398738d36d235dfc790387d06f12d";
const BASE_URL = "https://api.themoviedb.org/3";

export const getPopularMovies = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/movie/popular`, {
      params: {
        api_key: API_KEY,
        language: "tr-TR",
        page: 1,
      },
    });
    return response.data.results;
  } catch (error) {
    console.error("API çağrısında hata:", error);
    return [];
  }
};
