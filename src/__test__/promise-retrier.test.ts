
import { retryPromise } from '../promise-retrier';

describe('promise retrier', () => {
  /* tslint:disable:no-console */

  function failingPromise() {
    return new Promise((resolve, reject) => {
      reject('failed');
    });
  }
  function succeedingPromise() {
    return new Promise((resolve, reject) => {
      resolve('succeeded');
    });
  }
  it('creates and runs failing promise 3 times before giving up', async () => {
    const alwaysFail = jest.fn();
    alwaysFail.mockImplementation(failingPromise);
    await expect(retryPromise(alwaysFail)).rejects.toBe('failed (3 times)');
    expect(alwaysFail).toHaveBeenCalledTimes(3);
  });

  it('repeats failed execution', async () => {
    const onceFailing = jest.fn();
    onceFailing.mockReturnValueOnce(failingPromise())
      .mockReturnValueOnce(succeedingPromise());
    await expect(retryPromise(onceFailing, 3, 1)).resolves.toBe('succeeded');
    expect(onceFailing).toHaveBeenCalledTimes(2);
  });
});
