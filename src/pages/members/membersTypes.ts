import type { AsyncState } from '../../types/common'
import type { BaseListQuery } from '../../types/listQuery'

export interface MemberListQuery extends BaseListQuery {
  status?: number | null
  role_ids?: string | null
}

export const defaultMemberListQuery: MemberListQuery = {
  page_no: 1,
  page_size: 10,
  sort_by: 'created_at',
  sort_order: 'desc',
  status: null,
  search: null,
  role_ids: '2',
}

export interface Contact {
  id: number
  poc_name: string
  phone_number: string
  contact_type: number
  is_default: boolean
}

export interface Account {
  id: number
  name: string
  account_type_id: number
  status: number
}

export interface Member {
  id: number
  email_id: string
  first_name: string | null
  last_name: string | null
  status: number
  created_at: string | null
  updated_at: string | null
  contacts?: Contact[]
  accounts?: Account[]
}

export interface MemberFormValues {
  email_id: string
  first_name: string
  last_name: string
  phone_number: string
  permission_group_ids: number[]
  role_id: number | null
  child_account_ids?: number[]
}

export const defaultMemberFormValues: MemberFormValues = {
  email_id: '',
  first_name: '',
  last_name: '',
  phone_number: '',
  permission_group_ids: [],
  role_id: null,
}

export interface MembersState {
  lastQuery: MemberListQuery
  membersList: AsyncState<Member[]>
  membersCount: AsyncState<number>
  selectedMember: AsyncState<Member | null>
  inviteMember: AsyncState<any>
  updateMember: AsyncState<Member | null>
  deleteMember: AsyncState<number | null>
}
