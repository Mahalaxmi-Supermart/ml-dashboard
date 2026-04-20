export interface Invite {
  id: number
  email_id: string
  status: number
  role_id: number
  created_at: string
  updated_at: string
  first_name: string
  last_name: string
}

export interface InvitesState {
  invitesList: {
    data: Invite[]
    pending: boolean
    error: string | null
  }
  invitesCount: {
    data: number
    pending: boolean
    error: string | null
  }
  lastQuery: {
    page_no: number
    page_size: number
    sort_by: string
    sort_order: string
    search?: string
    role_ids?: string | null
  }
}

export const defaultInvitesState: InvitesState = {
  invitesList: {
    data: [],
    pending: false,
    error: null,
  },
  invitesCount: {
    data: 0,
    pending: false,
    error: null,
  },
  lastQuery: {
    page_no: 1,
    page_size: 10,
    sort_by: 'created_at',
    sort_order: 'desc',
    role_ids: '2',
  },
}
