
const isHookable = (action) => (
	(action.payload != null)
	&& (typeof action.payload === 'object')
	&& (typeof action.payload.then === 'function')
	&& (typeof action.payload.catch === 'function')
	&& (action.payload.finished == null)
);

const reduxPromiseHook = (store) => (next) => (action) => {
	const dispatch = store.dispatch;

	if (isHookable(action)) {
		const type = action.type;
		let promise = action.payload;
		promise.started = true;
		promise.finished = false;

		promise = promise
			.then(
				(result) => {
					promise.started = true;
					promise.finished = true;
					promise.result = result;
					dispatch({ type, payload: promise });
				}
			)
			.catch(
				(error) => {
					promise.started = true;
					promise.finished = true;
					promise.error = error;
					dispatch({ type, payload: promise });
				}
			);

	}

  return next(action);
};

export default reduxPromiseHook;
