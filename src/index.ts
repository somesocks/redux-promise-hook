
const isHookable = (action) => (
	(action.payload != null)
	&& (typeof action.payload === 'object')
	&& (typeof action.payload.then === 'function')
	&& (typeof action.payload.catch === 'function')
	&& (action.payload.finished == null)
);

let uid = 0;

const reduxPromiseHook = (store) => (next) => (action) => {
	const dispatch = store.dispatch;

	if (isHookable(action)) {
		let promise = action.payload;
		const id = promise.id || uid++;
		const request = promise.request;

		promise = promise
			.then(
				(result) => {
					const payload = Promise.resolve(result) as any;
					payload.id = id;
					payload.request = request;
					payload.finished = true;
					payload.success = true;
					payload.failure = false;
					payload.result = result;
					dispatch({ ...action, payload: payload });
					return result;
				},
				(error) => {
					const payload = Promise.reject(error) as any;
					// ugly little hack to deal with future consequences of DEP0018
					// https://github.com/nodejs/node/issues/20392
					payload.catch((err) => {});
					payload.id = id;
					payload.request = request;
					payload.finished = true;
					payload.success = false;
					payload.failure = true;
					payload.error = error;
					dispatch({ ...action, payload: payload });
				}
			);

		promise.id = id;
		promise.request = request;
		promise.finished = false;
		promise.success = false;
		promise.failure = false;

		// clone original action with new promise
		return next({ ...action, payload: promise });
	} else {
		return next(action);
	}

};

export default reduxPromiseHook;
