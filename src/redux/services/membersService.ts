import type { Member, MemberListQuery, MemberFormValues, Account } from '../../pages/members/membersTypes'
import dashboardAxiosInstance from '../../services/dashboardAxiosInstance'

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null
}

function normalizeMembersResponse(body: unknown): Member[] {
  if (isRecord(body) && isRecord(body.data) && Array.isArray(body.data.members)) {
    return body.data.members
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

export async function fetchMembersList(query: MemberListQuery): Promise<Member[]> {
  const { data } = await dashboardAxiosInstance.get<unknown>('/members/', {
    params: {
      page_no: query.page_no,
      page_size: query.page_size,
      sort_by: query.sort_by,
      sort_order: query.sort_order,
      search: query.search,
      status: query.status,
      role_ids: query.role_ids,
    },
  })
  return normalizeMembersResponse(data)
}

export async function fetchMembersCount(query: MemberListQuery): Promise<number> {
  const { data } = await dashboardAxiosInstance.get<unknown>('/members/count', {
    params: {
      page_no: query.page_no,
      page_size: query.page_size,
      sort_by: query.sort_by,
      sort_order: query.sort_order,
      search: query.search,
      status: query.status,
      role_ids: query.role_ids,
    },
  })
  return normalizeCountResponse(data)
}

export async function fetchMemberDetail(memberId: number): Promise<Member> {
  const { data } = await dashboardAxiosInstance.get<unknown>(`/members/${memberId}`)
  if (isRecord(data) && isRecord(data.data) && isRecord(data.data.member)) {
    return data.data.member as unknown as Member
  }
  throw new Error('Member not found')
}

export async function inviteMember(body: MemberFormValues): Promise<any> {
  const { data } = await dashboardAxiosInstance.post<unknown>('/invites/', body)
  if (isRecord(data) && isRecord(data.data) && isRecord(data.data.invite)) {
    return data.data.invite
  }
  return data
}

export async function updateMember(memberId: number, body: Partial<Member>): Promise<Member> {
  const { data } = await dashboardAxiosInstance.put<unknown>(`/members/${memberId}`, body)
  if (isRecord(data) && isRecord(data.data) && isRecord(data.data.member)) {
    return data.data.member as unknown as Member
  }
  return fetchMemberDetail(memberId)
}

export async function deleteMember(memberId: number): Promise<void> {
  await dashboardAxiosInstance.delete(`/members/${memberId}`)
}

export async function fetchPermissionGroups(): Promise<any[]> {
  const { data } = await dashboardAxiosInstance.get<unknown>('/access-control/permission-groups')
  if (isRecord(data) && isRecord(data.data) && Array.isArray(data.data.permission_groups)) {
    return data.data.permission_groups
  }
  return []
}

export async function fetchAccounts(): Promise<Account[]> {
  const { data } = await dashboardAxiosInstance.get<unknown>('/accounts/')
  if (isRecord(data) && isRecord(data.data) && Array.isArray(data.data.accounts)) {
    return data.data.accounts as Account[]
  }
  return []
}
