import { IPlugMessageBus, ParallelCall, ParallelHandler, SerialCall, SerialHandler } from "./types";

/**
 * A framework-agnostic spy implementation to be used in tests
**/
export type SpyFn = SerialHandler<unknown, unknown> | ParallelHandler<unknown, unknown>;

export const mockPlug = (spyFn?: SpyFn) => {

	const series = spyFn?.() as SerialCall<any, any>;
	const parallel = spyFn?.() as ParallelCall<any, any>;

	const mock = series as IPlugMessageBus;
	mock.serial = series;
	mock.parallel = parallel;
	mock.map = parallel;
	mock.reduce = mock.serial;
	// mock.chain = mock.serial;

	const p = Promise.resolve(mock)

	// p.serial = series;
	// p.parallel = parallel;
	// p.map = parallel;
	// p.reduce = mock.series;
	// p.chain = mock.series;

	//p.then(xx =>
	//	Object.entries(xx)
	//		.forEach(([k, v]) => p[k] = x[k])
	//);

	// Object.entries(mock)
	// 	.forEach(([k, v]) => {
	// 		if(p.hasOwnProperty(k)) {
	// 			p[k] = mock[k]
	// 		}
	// 	});

	return p
}

