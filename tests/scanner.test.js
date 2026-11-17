import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeContent } from '../src/utils/scanner.js';

test('ordinary messages avoid partial-word credential and payment matches', () => {
  assert.equal(analyzeContent('Your shipping details are available. Have a great day.').riskScore, 0);
  assert.equal(analyzeContent('A stupid typo in this sentence.').riskScore, 0);
});

test('current weights and risk thresholds are preserved', () => {
  assert.equal(analyzeContent('Enter your OTP').riskScore, 30);
  assert.equal(analyzeContent('Pay now with UPI').riskScore, 25);
  assert.equal(analyzeContent('Claim your prize').riskScore, 20);
  assert.equal(analyzeContent('Police department').riskScore, 18);
  const result = analyzeContent('URGENT: send money and enter your password');
  assert.equal(result.riskScore, 73);
  assert.equal(result.riskLevel, 'HIGH RISK');
  assert.equal(analyzeContent('Enter your OTP and pay now').riskLevel, 'SUSPICIOUS');
});

test('URL analysis checks actual hosts, addresses and embedded credentials', () => {
  for (const url of ['https://bit.ly/test', 'www.bit.ly/test', 'http://192.0.2.10/', 'https://[::1]/', 'https://bank.example@attacker.test/']) {
    assert.equal(analyzeContent(url).threats.some(threat => threat.type === 'url'), true);
  }
  for (const url of ['https://example.test/bit.ly/document', 'https://notbit.ly/document', 'https://example.test/normal']) {
    assert.equal(analyzeContent(url).threats.some(threat => threat.type === 'url'), false);
  }
});

test('combined indicators cap the score and malformed URLs do not crash', () => {
  const result = analyzeContent('URGENT OTP pay now winner account blocked police department install this app https://bit.ly/test');
  assert.equal(result.riskScore, 100);
  assert.equal(result.riskLevel, 'HIGH RISK');
  assert.doesNotThrow(() => analyzeContent('https://%%% www....'));
});
