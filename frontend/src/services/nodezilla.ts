import axios from "axios";

const API_ROUTE_BASE_URL = 'http://localhost:8000/';

function getFullUrl(path: string) {
    if (typeof window === 'undefined') {
        // Running on the server, use absolute URL
        return `http://localhost:3000${path}`;
    }
    // Running on the client, use relative URL
    return path;
}

async function fetchFromAPIRoute(url: string) {
    const fullUrl = getFullUrl(url);
    const response = await fetch(fullUrl);
    if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
}


export async function GetAVSData(avsAddresses: string[]) {
    const addresses = avsAddresses.map((addr: string) => `"${addr}"`).join(',');
    const queryParams = `avs-metadata?filters=avs_contract_address in (${encodeURIComponent(addresses)})`;
    const url = `${API_ROUTE_BASE_URL}?url=${encodeURIComponent(queryParams)}`;
    const data = await fetchFromAPIRoute(url);
    return data.result.rows;
}

export async function GetCombinedAVSData() {
    try {
        const res = await axios.get('http://127.0.0.1:8000/all/');
        const nodes = res.data;

        return nodes;
    } catch (error) {
        console.error('Error combining AVS data:', error);
        throw new Error('Failed to combine AVS data');
    }
}


export async function GetOperatorData(address:string) {
    try {
        const res = await axios.get(`http://127.0.0.1:8000/operators/${address}/`);
        const operator = res.data;
        
        return operator;
    } catch (error) {
        console.error('Error fetch data for operator:', error);
        throw new Error('Failed to combine AVS data');
    }
}

export async function GetOperators(avsAddress: string) {
    const queryParams = `operator-to-avs-mapping?filters=avs_contract_address=${encodeURIComponent(avsAddress)}`;
    const url = `${API_ROUTE_BASE_URL}?url=${encodeURIComponent(queryParams)}`;
    const data = await fetchFromAPIRoute(url);
    return data.result.rows.map((op: any) => ({
        operator_contract_address: op.operator_contract_address,
        registered_time: new Date(op.registered_time).getTime(),  // Convert registered_time to timestamp for sorting
        avs_name: op.avs_name
    }));
}

async function fetchOperatorStatsBatch(operatorAddresses: string[]) {
    const addresses = operatorAddresses.map((addr: string) => `"${addr}"`).join(',');
    const queryParams = `operator-stats?filters=operator_contract_address in (${encodeURIComponent(addresses)})`;
    const url = `${API_ROUTE_BASE_URL}?url=${encodeURIComponent(queryParams)}`;
    const data = await fetchFromAPIRoute(url);
    return data.result.rows;
}

async function fetchOperatorMetadataBatch(operatorAddresses: string[]) {
    const addresses = operatorAddresses.map((addr: string) => `"${addr}"`).join(',');
    const queryParams = `operator-metadata?filters=operator_contract_address in (${encodeURIComponent(addresses)})`;
    const url = `${API_ROUTE_BASE_URL}?url=${encodeURIComponent(queryParams)}`;
    const data = await fetchFromAPIRoute(url);
    return data.result.rows;
}

export async function GetOperatorStats(operatorAddresses: string[]) {
    const batchSize = 10; // Adjust batch size as needed
    let allStats: any = [];
    for (let i = 0; i < operatorAddresses.length; i += batchSize) {
        const batch = operatorAddresses.slice(i, i + batchSize);
        const batchStats = await fetchOperatorStatsBatch(batch);
        allStats = [...allStats, ...batchStats];
    }
    return allStats;
}

export async function GetOperatorMetadata(operatorAddresses: string[]) {
    const batchSize = 10; // Adjust batch size as needed
    let allMetadata: any = [];
    for (let i = 0; i < operatorAddresses.length; i += batchSize) {
        const batch = operatorAddresses.slice(i, i + batchSize);
        const batchMetadata = await fetchOperatorMetadataBatch(batch);
        allMetadata = [...allMetadata, ...batchMetadata];
    }
    return allMetadata;
}

export async function GetCombinedOperatorsData(avsAddress: string, batchStart: number, batchSize: number) {
    try {
        const operators = await GetOperators(avsAddress);

        // Sort operators by registered_time
        operators.sort((a: any, b: any) => a.registered_time - b.registered_time);

        const operatorAddresses = operators.map((op: any) => op.operator_contract_address);
        const currentBatchAddresses = operatorAddresses.slice(batchStart, batchStart + batchSize);

        const stats = await GetOperatorStats(currentBatchAddresses);
        const operatorAddressesWithStats = stats.map((stat: any) => stat.operator_contract_address);
        const operatorMetadata = await GetOperatorMetadata(operatorAddressesWithStats);

        const combinedData = stats.map((stat: any) => {
            const meta = operatorMetadata.find((meta: any) => meta.operator_contract_address === stat.operator_contract_address);
            const operator = operators.find((op: any) => op.operator_contract_address === stat.operator_contract_address);
            return { ...meta, ...stat, registered_time: operator.registered_time };
        });

        const hasMore = batchStart + batchSize < operatorAddresses.length;
        const avsName = operators.length > 0 ? operators[0].avs_name : '';

        return { combinedData, hasMore, avsName };
    } catch (error) {
        console.error('Error combining operator data:', error);
        throw new Error('Failed to combine operator data');
    }
}
