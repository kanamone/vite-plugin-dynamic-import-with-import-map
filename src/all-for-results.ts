import { Result, createOk } from "option-t/PlainResult"

export const allForResults =  <T, E>(results: Result<T,E>[]): Result<T[], E> => {
  if(results.every(x => x.ok)) {
    return createOk(results.map(r => {
      if(r.ok) {
        return r.val
      }
      throw new Error("unreachable")
    }))
  }

  const e = results.find(r => !r.ok)

  if(e) {
    return e as Result<T[], E>
  }

  throw new Error("unreachable")

}
