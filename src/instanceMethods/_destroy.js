import globalState from '../globalState.js'
import privateMethods from '../privateMethods.js'
import privateProps from '../privateProps.js'

/**
 * Dispose the current SweetAlert2 instance
 */
export function _destroy() {
  const domCache = privateProps.domCache.get(this)
  const innerParams = privateProps.innerParams.get(this)

  if (!innerParams) {
    disposeWeakMaps(this) // The WeakMaps might have been partly destroyed, we must recall it to dispose any remaining WeakMaps #2335
    return // This instance has already been destroyed
  }

  // Check if there is another Swal closing
  if (domCache.popup && globalState.swalCloseEventFinishedCallback) {
    globalState.swalCloseEventFinishedCallback()
    delete globalState.swalCloseEventFinishedCallback
  }

  if (typeof innerParams.didDestroy === 'function') {
    innerParams.didDestroy()
  }
  disposeSwal(this)
}

/**
 * @param {SweetAlert2} instance
 */
const disposeSwal = (instance) => {
  disposeWeakMaps(instance)
  // Unset this.params so GC will dispose it (#1569)
  // @ts-ignore
  delete instance.params
  // Unset globalState props so GC will dispose globalState (#1569)
  delete globalState.keydownHandler
  delete globalState.keydownTarget
  // Unset currentInstance
  delete globalState.currentInstance
}

/**
 * @param {SweetAlert2} instance
 */
const disposeWeakMaps = (instance) => {
  // If the current instance is awaiting a promise result, we keep the privateMethods to call them once the promise result is retrieved #2335
  // @ts-ignore
  if (instance.isAwaitingPromise()) {
    unsetWeakMaps(privateProps, instance)
    privateProps.awaitingPromise.set(instance, true)
  } else {
    unsetWeakMaps(privateMethods, instance)
    unsetWeakMaps(privateProps, instance)
  }
}

/**
 * @param {object} obj
 * @param {SweetAlert2} instance
 */
const unsetWeakMaps = (obj, instance) => {
  for (const i in obj) {
    obj[i].delete(instance)
  }
}
