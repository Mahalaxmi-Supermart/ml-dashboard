import dashboardAxiosInstance from '../../services/dashboardAxiosInstance'
import type { Invite, InvitesState } from '../../pages/members/invitesTypes'

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null
}

function normalizeInvitesResponse(body: unknown): Invite[] {
  if (isRecord(body) && isRecord(body.data) && Array.isArray(body.data.invites)) {
    return body.data.invites
  }
  return []
}

function normalizeCountResponse(body: unknown): number {
  if (isRecord(body) && isRecord(body.data)) {
    if (typeof body.data.count === 'number') return body.data.count
    if (typeof body.data.total === 'number') return body.data.total
  }
  return 0
}

export async function fetchInvitesList(query: InvitesState['lastQuery']): Promise<Invite[]> {
  const { data } = await dashboardAxiosInstance.get<unknown>('/invites/', {
    params: {
      page_no: query.page_no,
      page_size: query.page_size,
      sort_by: query.sort_by,
      sort_order: query.sort_order,
      search: query.search,
      role_ids: query.role_ids,
    },
  })
  return normalizeInvitesResponse(data)
}

export async function fetchInvitesCount(query: InvitesState['lastQuery']): Promise<number> {
  const { data } = await dashboardAxiosInstance.get<unknown>('/invites/count', {
    params: {
      page_no: query.page_no,
      page_size: query.page_size,
      sort_by: query.sort_by,
      sort_order: query.sort_order,
      search: query.search,
      role_ids: query.role_ids,
    },
  })
  return normalizeCountResponse(data)
}

export async function deleteInvite(inviteId: number): Promise<void> {
  await dashboardAxiosInstance.delete(`/invites/${inviteId}`)
}
