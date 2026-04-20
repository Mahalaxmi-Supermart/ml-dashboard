import { useEffect } from 'react'
import { Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks'
import { inviteMemberRequest, clearInviteMember } from '../../redux/reducers/membersSlice'
import { MemberForm } from './components/MemberForm'

export function MemberNewPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { inviteMember } = useAppSelector((state) => state.members)

  useEffect(() => {
    if (inviteMember.data) {
      dispatch(clearInviteMember())
      navigate('/invites')
    }
  }, [inviteMember.data, navigate, dispatch])

  return (
    <Box>
      <MemberForm
        heroTitle="Invite New Delivery Partner"
        heroDescription="Send an invitation to a new team member to join your dashboard."
        onSubmit={(values: any) => dispatch(inviteMemberRequest({ ...values, role_id: 2, permission_group_ids: [2] }))}
        loading={inviteMember.pending}
      />
    </Box>
  )
}
