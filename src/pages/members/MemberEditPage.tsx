import { useEffect, useState } from 'react'
import { Box, CircularProgress } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks'
import {
  fetchMemberDetailRequest,
  updateMemberRequest,
  clearUpdateMember,
  clearSelectedMember,
} from '../../redux/reducers/membersSlice'
import { MemberForm } from './components/MemberForm'

export function MemberEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { selectedMember, updateMember } = useAppSelector((state) => state.members)
  useEffect(() => {
    if (id) {
      dispatch(fetchMemberDetailRequest(Number(id)))
    }
    return () => {
      dispatch(clearSelectedMember())
    }
  }, [id, dispatch])

  useEffect(() => {
    if (updateMember.data) {
      dispatch(clearUpdateMember())
      navigate('/members')
    }
  }, [updateMember.data, navigate, dispatch])

  if (selectedMember.pending || !selectedMember.data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    )
  }

  // Convert Member to MemberFormValues for the form
  const initialValues = {
    email_id: selectedMember.data.email_id,
    first_name: selectedMember.data.first_name || '',
    last_name: selectedMember.data.last_name || '',
    phone_number: selectedMember.data.contacts?.[0]?.phone_number || '',
  }

  return (
    <Box>
      <MemberForm
        heroTitle="Edit Delivery Partner"
        heroDescription="Update the status or profile details of an existing team member."
        initialValues={initialValues as any}
        onSubmit={(values: any) => dispatch(updateMemberRequest({ memberId: Number(id), body: values }))}
        loading={updateMember.pending}
      />
    </Box>
  )
}
