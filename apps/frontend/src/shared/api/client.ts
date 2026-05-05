const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';

export type TeamSummary = {
  id: string;
  name: string;
  city: string;
  shortName: string;
  rating: number;
};

type TeamListResponse = {
  items: TeamSummary[];
  total: number;
};

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchTeams() {
  const response = await request<TeamListResponse>('/teams');
  return response.items;
}
