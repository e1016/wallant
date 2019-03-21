
/**
* @param {object} object target to be cloned
* @returns {object} clone of object
*/
export function cloneOf (object) {
  return JSON.parse(
    JSON.stringify(
      object
    )
  )
}
