
'use strict';

var jestUtil;
function _load_jestUtil() {
  return jestUtil = require('jest-util');
}

var jestMock;

function _load_jestMock() {
  return jestMock = _interopRequireDefault(require('jest-mock'));
}

var jsDom;

function _load_jsdom() {
  return jsDom = _interopRequireDefault(require('jsdom'));
}

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

class JSDomEnvironmentWithImages {
  constructor(config) {
    // lazy require
    const jsdom = jsDom || _load_jsdom();
    // prepare virtual console
    const virtualConsole = jsdom.default.createVirtualConsole();
    virtualConsole.sendTo(console);
    this.document = jsdom.default.jsdom('<!DOCTYPE html>', {
      url: config.testURL,
      // added support for loading images
      features: {
        FetchExternalResources: ['img']
      },
      // added virtual console to report test failure details
      virtualConsole
    });

    const global = this.global = this.document.defaultView;
    // Node's error-message stack size is limited at 10, but it's pretty useful
    // to see more than that when a test fails.
    this.global.Error.stackTraceLimit = 100;

    // tslint:disable-next-line:no-unused-expression
    (0, (jestUtil || _load_jestUtil()).installCommonGlobals)(global, config.globals);

    this.moduleMocker = new (jestMock || _load_jestMock()).default.ModuleMocker(global);
    this.fakeTimers = new (jestUtil || _load_jestUtil()).FakeTimers(global, this.moduleMocker, config);
  }

  dispose() {
    if (this.fakeTimers) {
      this.fakeTimers.dispose();
    }
    if (this.global) {
      this.global.close();
    }
    this.global = null;
    this.document = null;
    this.fakeTimers = null;
  }

  runScript(script) {
    if (this.global) {
      return (jsDom || _load_jsdom()).default.evalVMScript(this.global, script);
    }
    return null;
  }
}

module.exports = JSDomEnvironmentWithImages;
