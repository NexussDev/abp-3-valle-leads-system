import { client } from './leadsApi';

export interface Team {
  id: string;
  name: string;
  _count?: {
    users?: number;
    leads?: number;
  };
  users?: {
    id: string;
    name: string;
    email: string;
    role: string;
  }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  teamId?: string | null;
}

export async function fetchTeams(): Promise<Team[]> {
  const { data } = await client.get<Team[]>('/teams');
  return data;
}

export async function createTeam(name: string): Promise<Team> {
  const { data } = await client.post<Team>('/teams', { name });
  return data;
}

export async function updateTeam(id: string, name: string): Promise<Team> {
  const { data } = await client.put<Team>(`/teams/${id}`, { name });
  return data;
}

export async function deleteTeam(id: string): Promise<void> {
  await client.delete(`/teams/${id}`);
}

export async function fetchUsers(): Promise<User[]> {
  const { data } = await client.get<User[]>('/users');
  return data;
}

export async function updateUserTeam(userId: string, teamId: string | null): Promise<User> {
  const { data } = await client.put<User>(`/users/${userId}`, { teamId });
  return data;
}