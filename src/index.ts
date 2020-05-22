
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
		const type = action.type;
		let promise = action.payload;
		const id = promise.id || uid++;
		const request = promise.request;

		promise.started = true;
		promise.finished = false;
		promise.success = false;
		promise.failure = false;
		promise.id = id;

		promise = promise
			.then(
				(result) => {
					promise.started = true;
					promise.finished = true;
					promise.success = true;
					promise.failure = false;
					promise.result = result;
					dispatch({ type, payload: promise });
				}
			)
			.catch(
				(error) => {
					promise.started = true;
					promise.finished = true;
					promise.success = false;
					promise.failure = true;
					promise.error = error;
					dispatch({ type, payload: promise });
				}
			);

		promise.id = id;
		promise.request = request;
	}

  return next(action);
};

export default reduxPromiseHook;
