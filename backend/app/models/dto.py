from pydantic import BaseModel

class GrowthWeekly(BaseModel):
    time: int
    height: float
    leaf_count: float