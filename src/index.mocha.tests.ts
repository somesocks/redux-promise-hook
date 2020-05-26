
import Assert from 'callback-patterns/Assert';
import InSeries from 'callback-patterns/InSeries';
import Delay from 'callback-patterns/Delay';
import Logging from 'callback-patterns/Logging';
import TestCase from 'callback-patterns/testing/AssertionTest';

import { createStore, combineReducers, applyMiddleware } from 'redux'

import reduxPromiseHook from './';

const PromiseAction = (promise) => ({
	type: 'PromiseAction',
	payload: promise,
});

const reducer = (state = { count: 0 }, action) => {
	console.log('reducer', state, action);

	return {
		...state,
		promise: action.payload,
		count: state.count++,
	};
};

const _setup = (next) => {
	const setup = {
		store : createStore(reducer, applyMiddleware(reduxPromiseHook))
	};

	next(null, setup);
};

describe(
	'redux-promise-hook',
	() => {
		it('can import', () => {});

		it('can dispatch promise',
			TestCase()
				.setup(_setup)
				.prepare(
					(next, setup) => next(
						null,
						{
							store: setup.store,
							action: PromiseAction(Promise.resolve(2))
						}
					)
				)
				.execute(
					InSeries(
						(next, setup) => {
							setup.store.dispatch(setup.action);
							next();
						},
						Delay(100)
					)
				)
				.verify(
					Assert(
						({ setup }) => setup.store.getState().promise.finished === true,
						'promise not finished'
					),
					Assert(
						({ setup }) => setup.store.getState().promise.result === 2,
						'promise bad result'
					),
					Assert(
						({ request }) => request.action.payload.id == null,
						'original promise was modified'
					)
				)
				.build()
		);

		it('can dispatch rejected promise',
		TestCase()
			.setup(_setup)
			.prepare(
				(next, setup) => next(
					null,
					{
						store: setup.store,
						action: PromiseAction(Promise.reject(2))
					}
				)
			)
			.execute(
				InSeries(
					(next, setup) => {
						setup.store.dispatch(setup.action);
						next();
					},
					Delay(100)
				)
			)
			.verify(
				Assert(
					({ setup }) => setup.store.getState().promise.finished === true,
					'promise not finished'
				),
				Assert(
					({ setup }) => setup.store.getState().promise.error === 2,
					'promise bad result'
				),
				Assert(
					({ request }) => request.action.payload.id == null,
					'original promise was modified'
				)
			)
			.build()

		);

	}
);
