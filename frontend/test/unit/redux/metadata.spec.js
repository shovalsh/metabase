import { fetchData, updateData } from 'metabase/redux/metadata';

describe("Metadata Actions and Reducers", () => {
    const getDefaultArgs = ({
        // a bit of a hack to avoid reassignment and allow overrides based on named args
        // TODO: think of a more elegant way to do this
        existingData = 'data',
        newData = 'new data',
        requestState = null,
        requestStateLoading = { state: 'LOADING' },
        requestStateLoaded = { state: 'LOADED' },
        requestStateError = { error: new Error('error') },
        statePath = ['test', 'path'],
        statePathFetch = statePath.concat('fetch'),
        statePathUpdate = statePath.concat('update'),
        requestStatePath = statePath,
        existingStatePath = statePath,
        getState = () => ({
            requests: { test: { path: { fetch: requestState, update: requestState } } },
            test: { path: existingData }
        }),
        dispatch = jasmine.createSpy('dispatch'),
        getData = () => Promise.resolve(newData),
        putData = () => Promise.resolve(newData)
    }) => ({dispatch, getState, requestStatePath, existingStatePath, getData, putData,
        // passthrough args constants
        existingData,
        newData,
        requestState,
        requestStateLoading,
        requestStateLoaded,
        requestStateError,
        statePath,
        statePathFetch,
        statePathUpdate
    });

    const args = getDefaultArgs({});

    describe("fetchData()", () => {
        it("should return new data if request hasn't been made", async () => {
            const argsDefault = getDefaultArgs({});
            const data = await fetchData(argsDefault);
            expect(argsDefault.dispatch.calls.count()).toEqual(2);
            expect(data).toEqual(args.newData);
        });

        it("should return existing data if request has been made", async () => {
            const argsLoading = getDefaultArgs({requestState: args.requestStateLoading});
            const dataLoading = await fetchData(argsLoading);
            expect(argsLoading.dispatch.calls.count()).toEqual(0);
            expect(dataLoading).toEqual(args.existingData);

            const argsLoaded = getDefaultArgs({requestState: args.requestStateLoaded});
            const dataLoaded = await fetchData(argsLoaded);
            expect(argsLoaded.dispatch.calls.count()).toEqual(0);
            expect(dataLoaded).toEqual(args.existingData);
        });

        it("should return new data if previous request ended in error", async () => {
            const argsError = getDefaultArgs({requestState: args.requestStateError});
            const dataError = await fetchData(argsError);
            expect(argsError.dispatch.calls.count()).toEqual(2);
            expect(dataError).toEqual(args.newData);
        });

        // FIXME: this seems to make jasmine ignore the rest of the tests
        // is an exception bubbling up from fetchData? why?
        // how else to test return value in the catch case?
        xit("should return existing data if request fails", async () => {
            const argsFail = getDefaultArgs({getData: () => Promise.reject('error')});

            try{
                const dataFail = await fetchData(argsFail).catch((error) => console.log(error));
                expect(argsFail.dispatch.calls.count()).toEqual(2);
                expect(dataFail).toEqual(args.existingData);
            }
            catch(error) {
                return;
            }
        });
    });

    describe("updateData()", () => {
        it("should return new data regardless of previous request state", async () => {
            const argsDefault = getDefaultArgs({});
            const data = await updateData(argsDefault);
            expect(argsDefault.dispatch.calls.count()).toEqual(2);
            expect(data).toEqual(args.newData);

            const argsLoading = getDefaultArgs({requestState: args.requestStateLoading});
            const dataLoading = await updateData(argsLoading);
            expect(argsLoading.dispatch.calls.count()).toEqual(2);
            expect(dataLoading).toEqual(args.newData);

            const argsLoaded = getDefaultArgs({requestState: args.requestStateLoaded});
            const dataLoaded = await updateData(argsLoaded);
            expect(argsLoaded.dispatch.calls.count()).toEqual(2);
            expect(dataLoaded).toEqual(args.newData);

            const argsError = getDefaultArgs({requestState: args.requestStateError});
            const dataError = await updateData(argsError);
            expect(argsError.dispatch.calls.count()).toEqual(2);
            expect(dataError).toEqual(args.newData);
        });

        // FIXME: same problem as fetchData() case
        xit("should return existing data if request fails", async () => {
            const argsFail = getDefaultArgs({putData: () => {throw new Error('test')}});
            const data = await fetchData(argsFail);
            expect(argsFail.dispatch.calls.count()).toEqual(2);
            expect(data).toEqual(args.existingData);
        });
    });
});
