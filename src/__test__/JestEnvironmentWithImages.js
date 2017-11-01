
'use strict';

var _jestUtil;
function _load_jestUtil() {
  return _jestUtil = require('jest-util');
}

var _jestMock;

function _load_jestMock() {
  return _jestMock = _interopRequireDefault(require('jest-mock'));
}

var _jsdom;

function _load_jsdom() {
  return _jsdom = _interopRequireDefault(require('jsdom'));
}

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

class JSDomEnvironmentWithImages {
  constructor(config) {
    // lazy require
    this.document = (_jsdom || _load_jsdom()).default.jsdom('<!DOCTYPE html>', {
      url: config.testURL,
      // changes begin: added support for loading images
      features: {
        FetchExternalResources: ['img']
      }
      // changes end: added support for loading images
    });

    const global = this.global = this.document.defaultView;
    // Node's error-message stack size is limited at 10, but it's pretty useful
    // to see more than that when a test fails.
    this.global.Error.stackTraceLimit = 100;
    (0, (_jestUtil || _load_jestUtil()).installCommonGlobals)(global, config.globals);

    this.moduleMocker = new (_jestMock || _load_jestMock()).default.ModuleMocker(global);
    this.fakeTimers = new (_jestUtil || _load_jestUtil()).FakeTimers(global, this.moduleMocker, config);
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
      return (_jsdom || _load_jsdom()).default.evalVMScript(this.global, script);
    }
    return null;
  }
};

module.exports = JSDomEnvironmentWithImages;
