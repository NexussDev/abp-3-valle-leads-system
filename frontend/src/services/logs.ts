import { client } from './leadsApi';

export interface SystemLogEntry {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string | null;
  createdAt: string;
  user?: { id: string; name: string; email: string; role: string } | null;
}

export interface ListLogsParams {
  userId?: string;
  action?: string;
  entity?: string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface ListLogsResponse {
  logs: SystemLogEntry[];
  total: number;
  limit: number;
  offset: number;
}

export async function listLogs(params: ListLogsParams = {}): Promise<ListLogsResponse> {
  const query: Record<string, string | number> = {};
  if (params.userId)    query.userId    = params.userId;
  if (params.action)    query.action    = params.action;
  if (params.entity)    query.entity    = params.entity;
  if (params.entityId)  query.entityId  = params.entityId;
  if (params.startDate) query.startDate = params.startDate;
  if (params.endDate)   query.endDate   = params.endDate;
  if (params.limit !== undefined)  query.limit  = params.limit;
  if (params.offset !== undefined) query.offset = params.offset;

  const { data } = await client.get<ListLogsResponse>('/logs', { params: query });
  return data;
}
