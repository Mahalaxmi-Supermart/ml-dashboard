import { all } from 'redux-saga/effects'
import { authWatcher } from '../redux/sagas/authSaga'
import { categoriesWatcher } from '../redux/sagas/categoriesSaga'
import { productsWatcher } from '../redux/sagas/productsSaga'
import { couponsWatcher } from '../redux/sagas/couponsSaga'
import { membersWatcher } from '../redux/sagas/membersSaga'
import { invitesWatcher } from '../redux/sagas/invitesSaga'
import { customersWatcher } from '../redux/sagas/customersSaga'

export default function* rootSaga() {
  yield all([
    authWatcher(),
    categoriesWatcher(),
    productsWatcher(),
    couponsWatcher(),
    membersWatcher(),
    invitesWatcher(),
    customersWatcher(),
  ])
}
