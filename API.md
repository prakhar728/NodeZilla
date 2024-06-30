# EigenLayer Metrics API Documentation

## Overview

The EigenLayer Metrics API provides endpoints and WebSocket support to fetch and stream real-time metrics for AVS Operator Nodes on EigenLayer. This API enables users to retrieve metadata, historical data, and real-time updates for operator nodes.

## Table of Contents

1. [Requirements](#requirements)
2. [Endpoints](#endpoints)
    - [Get All Nodes](#get-all-nodes)
    - [Get Node by Address](#get-node-by-address)
3. [WebSocket](#websocket)
4. [Models](#models)
    - [historic_data](#historic_data)
    - [NodeData](#nodedata)
    - [MetaData](#metadata)



## Endpoints

### Get All Nodes

- **URL**: `/all`
- **Method**: `GET`
- **Response**: `List[MetaData]`

#### Description

Fetch metadata for all registered AVS Operator Nodes.

#### Example

```bash
curl -X GET "http://localhost:8000/all" -H "accept: application/json"
```

#### Response

```json
[
    {
        "id": "60b6c2e1b6e2a6a0c8d1b8f1",
        "description": "Node 1",
        "logo": "http://example.com/logo.png",
        "operator_contract_address": "0x1234",
        "operator_name": "Operator 1",
        "twitter": "http://twitter.com/operator1",
        "website": "http://operator1.com",
        "status": "active"
    }
]

```

### Get Node by Address

- **URL**: `/operators/{address}/`
- **Method**: `GET`
- **Response**: `NodeData`

#### Description

Fetch metadata and historical data for a specific operator node by its contract address.

#### Example

```bash
curl -X GET "http://localhost:8000/operators/0x1234/" -H "accept: application/json"
```

#### Response

```json
{
    "id": "60b6c2e1b6e2a6a0c8d1b8f1",
    "description": "Node 1",
    "logo": "http://example.com/logo.png",
    "operator_contract_address": "0x1234",
    "operator_name": "Operator 1",
    "twitter": "http://twitter.com/operator1",
    "website": "http://operator1.com",
    "status": "active",
    "time_series": [
        {
            "id": "60b6c2e1b6e2a6a0c8d1b8f1",
            "timestamp": "2021-06-01T00:00:00Z",
            "address": "0x1234",
            "value": {...}
        }
    ]
}

```


### WebSocket

- **URL**: `/ws`
- **Method**: `WebSocket`

#### Description

Establish a WebSocket connection to receive real-time updates for a specific operator node.

#### Example

```javascript
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onopen = function () {
    ws.send('0x1234');  // Send the operator contract address
};

ws.onmessage = function (event) {
    console.log('Received:', event.data);
};

ws.onclose = function () {
    console.log('WebSocket closed');
};
```

### Models

#### historic_data

```python
class historic_data(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    timestamp: datetime.datetime
    address: str
    value: object
```

#### NodeData

```python
class NodeData(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    description: str
    logo: str
    operator_contract_address: str
    operator_name: str
    twitter: Optional[str] = Field(default='')
    website: Optional[str] = Field(default='')
    status: Optional[str] = Field(default='')
    time_series: List[historic_data]
```

#### MetaData

```python
class MetaData(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    description: str
    logo: str
    operator_contract_address: str
    operator_name: str
    twitter: Optional[str] = Field(default='')
    website: Optional[str] = Field(default='')
    status: Optional[str] = Field(default='')
```