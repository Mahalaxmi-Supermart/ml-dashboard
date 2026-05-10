import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { defaultInvitesState, type Invite, type InvitesState } from '../../pages/members/invitesTypes'

const invitesSlice = createSlice({
  name: 'invites',
  initialState: defaultInvitesState,
  reducers: {
    fetchInvitesRequest: (state, action: PayloadAction<Partial<InvitesState['lastQuery']>>) => {
      state.lastQuery = { ...state.lastQuery, ...action.payload }
      state.invitesList.pending = true
      state.invitesList.error = null
    },
    fetchInvitesSuccess: (state, action: PayloadAction<Invite[]>) => {
      state.invitesList.pending = false
      state.invitesList.data = action.payload
    },
    fetchInvitesFailure: (state, action: PayloadAction<string>) => {
      state.invitesList.pending = false
      state.invitesList.error = action.payload
    },
    fetchInvitesCountRequest: (state, _action: PayloadAction<void>) => {
      state.invitesCount.pending = true
      state.invitesCount.error = null
    },
    fetchInvitesCountSuccess: (state, action: PayloadAction<number>) => {
      state.invitesCount.pending = false
      state.invitesCount.data = action.payload
    },
    fetchInvitesCountFailure: (state, action: PayloadAction<string>) => {
      state.invitesCount.pending = false
      state.invitesCount.error = action.payload
    },
    deleteInviteRequest: (state, _action: PayloadAction<number>) => {
      state.invitesList.pending = true
    },
    deleteInviteSuccess: (state, _action: PayloadAction<number>) => {
      state.invitesList.pending = false
    },
    deleteInviteFailure: (state, action: PayloadAction<string>) => {
      state.invitesList.pending = false
      state.invitesList.error = action.payload
    },
    updateQuery: (state, action: PayloadAction<Partial<InvitesState['lastQuery']>>) => {
      state.lastQuery = { ...state.lastQuery, ...action.payload }
    },
  },
})

export const {
  fetchInvitesRequest,
  fetchInvitesSuccess,
  fetchInvitesFailure,
  fetchInvitesCountRequest,
  fetchInvitesCountSuccess,
  fetchInvitesCountFailure,
  deleteInviteRequest,
  deleteInviteSuccess,
  deleteInviteFailure,
  updateQuery,
} = invitesSlice.actions

export default invitesSlice.reducer
