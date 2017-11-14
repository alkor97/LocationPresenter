
function runPromise<T>(createPromise: () => Promise<T>, times: number, timeout: number, resolve: any, reject: any) {
  createPromise().then((outcome) => {
    resolve(outcome);
  }).catch((reason) => {
    if (times > 0) {
      setTimeout(() => {
        runPromise(createPromise, times - 1, timeout, resolve, reject);
      }, timeout);
    } else {
      reject(reason);
    }
  });
}

export function retryPromise<T>(
  createPromise: () => Promise<T>,
  times: number = 2,
  timeout: number = 1000,
): Promise<T> {
  return new Promise((resolve, reject) => {
    runPromise(createPromise, times, timeout, resolve, (reason: string) => {
      reject(`${reason} (${times + 1} times)`);
    });
  });
}
