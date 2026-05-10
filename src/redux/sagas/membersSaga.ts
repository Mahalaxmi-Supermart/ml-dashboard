import type { PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import { call, fork, put, takeLatest } from 'redux-saga/effects'
import type { Member, MemberListQuery, MemberFormValues } from '../../pages/members/membersTypes'
import {
  inviteMemberFailure,
  inviteMemberRequest,
  inviteMemberSuccess,
  deleteMemberFailure,
  deleteMemberRequest,
  deleteMemberSuccess,
  fetchCountFailure,
  fetchCountSuccess,
  fetchMemberDetailFailure,
  fetchMemberDetailRequest,
  fetchMemberDetailSuccess,
  fetchListFailure,
  fetchListSuccess,
  fetchPageRequest,
  updateMemberFailure,
  updateMemberRequest,
  updateMemberSuccess,
} from '../reducers/membersSlice'
import {
  inviteMember,
  deleteMember,
  fetchMemberDetail,
  fetchMembersCount,
  fetchMembersList,
  updateMember,
} from '../services/membersService'

function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; error?: string } | undefined
    if (typeof data?.message === 'string' && data.message) return data.message
    if (typeof data?.error === 'string' && data.error) return data.error
    return err.message ?? 'Request failed'
  }
  if (err instanceof Error) return err.message
  return 'Request failed'
}

function* listWorker(query: MemberListQuery) {
  try {
    const rows: Awaited<ReturnType<typeof fetchMembersList>> = yield call(fetchMembersList, query)
    yield put(fetchListSuccess(rows))
  } catch (err: unknown) {
    yield put(fetchListFailure(getErrorMessage(err)))
  }
}

function* countWorker(query: MemberListQuery) {
  try {
    const n: Awaited<ReturnType<typeof fetchMembersCount>> = yield call(fetchMembersCount, query)
    yield put(fetchCountSuccess(n))
  } catch (err: unknown) {
    yield put(fetchCountFailure(getErrorMessage(err)))
  }
}

function* fetchPageWorker(action: PayloadAction<MemberListQuery>) {
  const query = action.payload
  yield fork(listWorker, query)
  yield fork(countWorker, query)
}

function* fetchMemberDetailWorker(action: PayloadAction<number>) {
  try {
    const detail: Awaited<ReturnType<typeof fetchMemberDetail>> = yield call(
      fetchMemberDetail,
      action.payload,
    )
    yield put(fetchMemberDetailSuccess(detail))
  } catch (err: unknown) {
    yield put(fetchMemberDetailFailure(getErrorMessage(err)))
  }
}

function* inviteMemberWorker(action: PayloadAction<MemberFormValues>) {
  try {
    const detail: Awaited<ReturnType<typeof inviteMember>> = yield call(inviteMember, action.payload)
    yield put(inviteMemberSuccess(detail))
  } catch (err: unknown) {
    yield put(inviteMemberFailure(getErrorMessage(err)))
  }
}

function* updateMemberWorker(action: PayloadAction<{ memberId: number; body: Partial<Member> }>) {
  try {
    const { memberId, body } = action.payload
    const detail: Awaited<ReturnType<typeof updateMember>> = yield call(updateMember, memberId, body)
    yield put(updateMemberSuccess(detail))
  } catch (err: unknown) {
    yield put(updateMemberFailure(getErrorMessage(err)))
  }
}

function* deleteMemberWorker(action: PayloadAction<number>) {
  try {
    yield call(deleteMember, action.payload)
    yield put(deleteMemberSuccess(action.payload))
  } catch (err: unknown) {
    yield put(deleteMemberFailure(getErrorMessage(err)))
  }
}

export function* membersWatcher() {
  yield takeLatest(fetchPageRequest.type, fetchPageWorker)
  yield takeLatest(fetchMemberDetailRequest.type, fetchMemberDetailWorker)
  yield takeLatest(inviteMemberRequest.type, inviteMemberWorker)
  yield takeLatest(updateMemberRequest.type, updateMemberWorker)
  yield takeLatest(deleteMemberRequest.type, deleteMemberWorker)
}
