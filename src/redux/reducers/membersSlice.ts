import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
  defaultMemberListQuery,
  type Member,
  type MemberListQuery,
  type MembersState,
  type MemberFormValues,
} from '../../pages/members/membersTypes'
import { asyncState } from '../../types/common'

const initialState: MembersState = {
  lastQuery: defaultMemberListQuery,
  membersList: asyncState([]),
  membersCount: asyncState(0),
  selectedMember: asyncState(null),
  inviteMember: asyncState(null),
  updateMember: asyncState(null),
  deleteMember: asyncState(null),
}

const membersSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    fetchPageRequest: (state, action: PayloadAction<MemberListQuery>) => {
      state.lastQuery = action.payload
      state.membersList.pending = true
      state.membersList.error = null
      state.membersCount.pending = true
      state.membersCount.error = null
    },
    fetchListSuccess: (state, action: PayloadAction<Member[]>) => {
      state.membersList.pending = false
      state.membersList.data = action.payload
      state.membersList.error = null
    },
    fetchListFailure: (state, action: PayloadAction<string>) => {
      state.membersList.pending = false
      state.membersList.error = action.payload
    },
    fetchCountSuccess: (state, action: PayloadAction<number>) => {
      state.membersCount.pending = false
      state.membersCount.data = action.payload
      state.membersCount.error = null
    },
    fetchCountFailure: (state, action: PayloadAction<string>) => {
      state.membersCount.pending = false
      state.membersCount.error = action.payload
    },
    clearMembersList: (state) => {
      state.lastQuery = defaultMemberListQuery
      state.membersList = asyncState([])
      state.membersCount = asyncState(0)
    },

    fetchMemberDetailRequest: (state, _action: PayloadAction<number>) => {
      state.selectedMember.pending = true
      state.selectedMember.error = null
      state.selectedMember.data = null
    },
    fetchMemberDetailSuccess: (state, action: PayloadAction<Member>) => {
      state.selectedMember.pending = false
      state.selectedMember.data = action.payload
      state.selectedMember.error = null
    },
    fetchMemberDetailFailure: (state, action: PayloadAction<string>) => {
      state.selectedMember.pending = false
      state.selectedMember.error = action.payload
    },
    clearSelectedMember: (state) => {
      state.selectedMember = asyncState(null)
    },

    inviteMemberRequest: (state, _action: PayloadAction<MemberFormValues>) => {
      state.inviteMember.pending = true
      state.inviteMember.error = null
      state.inviteMember.data = null
    },
    inviteMemberSuccess: (state, action: PayloadAction<Member>) => {
      state.inviteMember.pending = false
      state.inviteMember.data = action.payload
      state.inviteMember.error = null
    },
    inviteMemberFailure: (state, action: PayloadAction<string>) => {
      state.inviteMember.pending = false
      state.inviteMember.error = action.payload
    },
    clearInviteMember: (state) => {
      state.inviteMember = asyncState(null)
    },

    updateMemberRequest: (
      state,
      _action: PayloadAction<{ memberId: number; body: Partial<Member> }>,
    ) => {
      state.updateMember.pending = true
      state.updateMember.error = null
      state.updateMember.data = null
    },
    updateMemberSuccess: (state, action: PayloadAction<Member>) => {
      state.updateMember.pending = false
      state.updateMember.data = action.payload
      state.updateMember.error = null
      if (state.selectedMember.data?.id === action.payload.id) {
        state.selectedMember.data = action.payload
      }
    },
    updateMemberFailure: (state, action: PayloadAction<string>) => {
      state.updateMember.pending = false
      state.updateMember.error = action.payload
    },
    clearUpdateMember: (state) => {
      state.updateMember = asyncState(null)
    },

    deleteMemberRequest: (state, _action: PayloadAction<number>) => {
      state.deleteMember.pending = true
      state.deleteMember.error = null
      state.deleteMember.data = null
    },
    deleteMemberSuccess: (state, action: PayloadAction<number>) => {
      state.deleteMember.pending = false
      state.deleteMember.data = action.payload
      state.deleteMember.error = null
    },
    deleteMemberFailure: (state, action: PayloadAction<string>) => {
      state.deleteMember.pending = false
      state.deleteMember.error = action.payload
    },
    clearDeleteMember: (state) => {
      state.deleteMember = asyncState(null)
    },
  },
})

export const {
  fetchPageRequest,
  fetchListSuccess,
  fetchListFailure,
  fetchCountSuccess,
  fetchCountFailure,
  clearMembersList,
  fetchMemberDetailRequest,
  fetchMemberDetailSuccess,
  fetchMemberDetailFailure,
  clearSelectedMember,
  inviteMemberRequest,
  inviteMemberSuccess,
  inviteMemberFailure,
  clearInviteMember,
  updateMemberRequest,
  updateMemberSuccess,
  updateMemberFailure,
  clearUpdateMember,
  deleteMemberRequest,
  deleteMemberSuccess,
  deleteMemberFailure,
  clearDeleteMember,
} = membersSlice.actions

export default membersSlice.reducer
