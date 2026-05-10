import { call, put, select, takeLatest } from 'redux-saga/effects'
import * as actions from '../reducers/customersSlice'
import * as service from '../services/customersService'
import type { RootState } from '../../app/store'
import type { Customer, CustomersState } from '../../pages/customers/customersTypes'

function* fetchCustomersSaga() {
  try {
    const lastQuery: CustomersState['lastQuery'] = yield select((state: RootState) => state.customers.lastQuery)
    const response: Customer[] = yield call(service.fetchCustomersList, lastQuery)
    yield put(actions.fetchListSuccess(response))
    yield put(actions.fetchCountSuccess(0)) // Trigger count fetch if needed, or just call it directly
    
    // Fetch count in parallel or sequence
    const count: number = yield call(service.fetchCustomersCount, lastQuery)
    yield put(actions.fetchCountSuccess(count))
  } catch (error: any) {
    const msg = error?.message ?? 'Failed to fetch customers'
    yield put(actions.fetchListFailure(msg))
    yield put(actions.fetchCountFailure(msg))
  }
}

function* fetchCustomerDetailSaga(action: ReturnType<typeof actions.fetchDetailRequest>) {
  try {
    const response: Customer | null = yield call(service.fetchCustomerDetail, action.payload)
    if (response) {
      yield put(actions.fetchDetailSuccess(response))
    } else {
      yield put(actions.fetchDetailFailure('Customer not found'))
    }
  } catch (error: any) {
    yield put(actions.fetchDetailFailure(error?.message ?? 'Failed to fetch customer details'))
  }
}

export function* customersWatcher() {
  yield takeLatest(actions.fetchPageRequest.type, fetchCustomersSaga)
  yield takeLatest(actions.fetchDetailRequest.type, fetchCustomerDetailSaga)
}
