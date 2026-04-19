export interface AsyncState<T> {
  pending: boolean
  data: T
  error: string | null
}

export function asyncState<T>(initial: T): AsyncState<T> {
  return { pending: false, data: initial, error: null }
}
