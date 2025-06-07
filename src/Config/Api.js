import axios from 'axios'

export const ApiLink = "https://taqat-api-33wara.vercel.app"
export const LocalApi = "http://localhost:5000"

const Api = axios.create({
    baseURL: ApiLink ,
    headers: {
        'Content-Type': 'application/json',
        // 'Accept': 'application/json',
    },
    withCredentials: true,
});

export default Api;