import axios from "axios";

// const API_ROUTE_BASE_URL = 'http://127.0.0.1:8000/';
const API_ROUTE_BASE_URL = 'https://nodezilla.onrender.com/';

export async function GetCombinedAVSData() {
    try {
        const res = await axios.get(`${API_ROUTE_BASE_URL}all/`);
        
        const nodes = res.data;

        return nodes;
    } catch (error) {
        console.error('Error combining AVS data:', error);
        throw new Error('Failed to combine AVS data');
    }
}


export async function GetOperatorData(address:string) {
    try {
        const res = await axios.get(`${API_ROUTE_BASE_URL}operators/${address}/`);
        const operator = res.data;
        
        return operator;
    } catch (error) {
        console.error('Error fetch data for operator:', error);
        throw new Error('Failed to combine AVS data');
    }
}