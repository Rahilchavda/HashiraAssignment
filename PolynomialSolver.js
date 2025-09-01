// polynomial_solver.js
// Node.js script — uses BigInt for exact integer arithmetic
const fs = require('fs');
const path = require('path');

function charToDigit(ch) {
  ch = ch.toLowerCase();
  if (ch >= '0' && ch <= '9') return ch.charCodeAt(0) - '0'.charCodeAt(0);
  if (ch >= 'a' && ch <= 'z') return 10 + (ch.charCodeAt(0) - 'a'.charCodeAt(0));
  throw new Error(`Invalid digit character: ${ch}`);
}

// decode a base-N string into a BigInt, allow optional leading +/-
function decodeBigInt(baseStr, valueStr) {
  const baseInt = parseInt(baseStr, 10);
  if (!Number.isInteger(baseInt) || baseInt < 2 || baseInt > 36) {
    throw new Error(`Invalid base '${baseStr}'. Supported range: 2..36`);
  }
  const base = BigInt(baseInt);

  let s = valueStr.trim().toLowerCase();
  if (s.length === 0) throw new Error('Empty value string');

  let negative = false;
  if (s[0] === '+' || s[0] === '-') {
    negative = (s[0] === '-');
    s = s.slice(1);
    if (s.length === 0) throw new Error('Value is only sign, no digits');
  }

  let acc = 0n;
  for (let i = 0; i < s.length; i++) {
    const d = charToDigit(s[i]);
    if (BigInt(d) >= base) {
      throw new Error(`Digit '${s[i]}' not valid for base ${baseInt}`);
    }
    acc = acc * base + BigInt(d);
  }
  return negative ? -acc : acc;
}

// Build polynomial coefficients from roots (coeffs as BigInt, low->high powers)
function buildPolynomialFromRoots(roots) {
  let coeffs = [1n]; // polynomial 1
  for (const r of roots) {
    const newCoeffs = new Array(coeffs.length + 1).fill(0n);
    for (let i = 0; i < coeffs.length; i++) {
      // multiply P(x) by (x - r):
      newCoeffs[i] += -r * coeffs[i];       // x^i term gets -r * coeffs[i]
      newCoeffs[i + 1] += coeffs[i];        // x^(i+1) term gets coeffs[i]
    }
    coeffs = newCoeffs;
  }
  return coeffs; // low->high
}

function processSingleTestCase(tc, idx) {
  const n = tc.keys && tc.keys.n;
  const k = tc.keys && tc.keys.k;
  if (typeof n !== 'number' || typeof k !== 'number') {
    throw new Error(`Testcase ${idx+1}: missing or invalid keys.n / keys.k`);
  }
  const degree = k - 1;

  // decode all available roots in numeric index order (1..n)
  const roots = [];
  for (let i = 1; i <= n; i++) {
    const key = String(i);
    if (tc[key]) {
      const base = tc[key].base;
      const value = tc[key].value;
      const decoded = decodeBigInt(base, value);
      roots.push(decoded);
    }
  }

  if (roots.length < degree) {
    throw new Error(`Testcase ${idx+1}: Not enough roots for this test: need ${degree}, found ${roots.length}`);
  }

  const usedRoots = roots.slice(0, degree);
  const coeffsLowToHigh = buildPolynomialFromRoots(usedRoots); // BigInt array
  const coeffsHighToLow = [...coeffsLowToHigh].reverse();

  // Print summary
  console.log(`\n--- Test Case ${idx+1} summary ---`);
  console.log(`n = ${n}, k = ${k}, degree = ${degree}`);
  console.log('Used roots (decimal):');
  usedRoots.forEach((r, i) => console.log(` r${i+1}: ${r.toString()}`));
  console.log('Coefficients (highest -> constant):');
  console.log(coeffsHighToLow.map(c => c.toString()).join(' '));
  console.log('Constant c =', coeffsLowToHigh[0].toString());
  console.log('------------------------------');

  return {
    n, k, degree,
    usedRoots: usedRoots.map(r => r.toString()),
    coeffs_low_to_high: coeffsLowToHigh.map(c => c.toString()),
    coeffs_high_to_low: coeffsHighToLow.map(c => c.toString()),
    constant_c: coeffsLowToHigh[0].toString()
  };
}

function main() {
  const inputPath = path.join(process.cwd(), 'input.json');
  if (!fs.existsSync(inputPath)) {
    console.error('Error: input.json not found in current directory.');
    process.exit(1);
  }

  const raw = fs.readFileSync(inputPath, 'utf8');
  const doc = JSON.parse(raw);
  const tests = doc.testcases || [];
  if (!Array.isArray(tests) || tests.length === 0) {
    console.error('Error: no testcases found in input.json (expecting "testcases" array).');
    process.exit(1);
  }

  const out = {};
  for (let i = 0; i < tests.length; i++) {
    process.stdout.write(`Processing Test Case ${i+1} ... `);
    try {
      out['testcase' + (i+1)] = processSingleTestCase(tests[i], i);
      console.log('done.');
    } catch (err) {
      console.log('failed.');
      console.error(`Testcase ${i+1} error:`, err.message);
    }
  }

  const outPath = path.join(process.cwd(), 'computed_coeffs.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
  console.log('\nWrote computed coefficients to:', outPath);
}

main();
