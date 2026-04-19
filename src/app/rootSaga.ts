import { all } from 'redux-saga/effects'
import { authWatcher } from '../redux/sagas/authSaga'
import { categoriesWatcher } from '../redux/sagas/categoriesSaga'
import { productsWatcher } from '../redux/sagas/productsSaga'

export default function* rootSaga() {
  yield all([authWatcher(), categoriesWatcher(), productsWatcher()])
}
