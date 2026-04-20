import { call, put, select, takeLatest } from 'redux-saga/effects'
import * as actions from '../reducers/invitesSlice'
import * as service from '../services/invitesService'
import type { Invite, InvitesState } from '../../pages/members/invitesTypes'

function* fetchInvitesSaga() {
  try {
    const lastQuery: InvitesState['lastQuery'] = yield select((state: any) => state.invites.lastQuery)
    const response: Invite[] = yield call(service.fetchInvitesList, lastQuery)
    yield put(actions.fetchInvitesSuccess(response))
    yield put(actions.fetchInvitesCountRequest())
  } catch (error: any) {
    yield put(actions.fetchInvitesFailure(error?.message ?? 'Failed to fetch invites'))
  }
}

function* fetchInvitesCountSaga() {
  try {
    const lastQuery: InvitesState['lastQuery'] = yield select((state: any) => state.invites.lastQuery)
    const response: number = yield call(service.fetchInvitesCount, lastQuery)
    yield put(actions.fetchInvitesCountSuccess(response))
  } catch (error: any) {
    yield put(actions.fetchInvitesCountFailure(error?.message ?? 'Failed to fetch invites count'))
  }
}

function* deleteInviteSaga(action: ReturnType<typeof actions.deleteInviteRequest>) {
  try {
    yield call(service.deleteInvite, action.payload)
    yield put(actions.deleteInviteSuccess(action.payload))
    // Refresh list
    const lastQuery: InvitesState['lastQuery'] = yield select((state: any) => state.invites.lastQuery)
    yield put(actions.fetchInvitesRequest(lastQuery))
  } catch (error: any) {
    yield put(actions.deleteInviteFailure(error?.message ?? 'Failed to delete invite'))
  }
}

export function* invitesWatcher() {
  yield takeLatest(actions.fetchInvitesRequest.type, fetchInvitesSaga)
  yield takeLatest(actions.fetchInvitesCountRequest.type, fetchInvitesCountSaga)
  yield takeLatest(actions.deleteInviteRequest.type, deleteInviteSaga)
}
