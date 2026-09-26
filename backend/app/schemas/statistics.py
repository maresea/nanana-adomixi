from pydantic import BaseModel
from typing import Dict, List

class DepartmentStat(BaseModel):
    department_name: str
    total_documents: int
    overdue_tasks: int

class DashboardStatsResponse(BaseModel):
    total_documents: int
    incoming_count: int
    outgoing_count: int
    internal_count: int
    pending_tasks: int
    overdue_tasks: int
    completed_tasks: int
    department_stats: List[DepartmentStat] = []
