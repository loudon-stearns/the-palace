// Runs v2-ltc-checks-tests.js here, against the patched ltc.js beside it, with
// the same check/section shape GoButton's tests/run-v2-tests.js gives them.
//     node run-checks.js
const path = require('path');
const util = require('util');
const Ltc = require(path.join(__dirname, 'ltc.js'));
let passed = 0, failed = 0;
const check = (name, got, want) => {
  if (util.isDeepStrictEqual(got, want)) { passed++; console.log('  ✓ ' + name); }
  else { failed++; console.log('  ✗ ' + name + '\n      expected: ' + JSON.stringify(want) + '\n      got:      ' + JSON.stringify(got)); }
};
const section = (name, body) => {
  console.log('\n' + name);
  try { body(); } catch (e) { failed++; console.log('  ✗ STOPPED by an error: ' + (e.stack || e)); }
};
require('./v2-ltc-checks-tests.js').run(check, section, null, Ltc);
console.log('\n' + (failed ? failed + ' of ' + (passed + failed) + ' checks FAILED' : 'all ' + passed + ' checks passed'));
process.exit(failed ? 1 : 0);
