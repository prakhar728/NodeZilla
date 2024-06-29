

PyObjectId = Annotated[str, BeforeValidator(str)]


class historic_data(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    timestamp: datetime.datetime
    address: str
    value: object
    

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