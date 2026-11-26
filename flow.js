'use strict';
const flow = document.querySelector('#flow');
const demos = [
  { name: 'Top up wallet', target: 'Test card •• 4242', balance: 10000, ref: 'T-101', type: 'credit' },
  { name: 'Withdraw money', target: 'Test bank •• 4001', balance: 10000, ref: 'T-102', type: 'debit' },
  { name: 'Send money', target: 'Customer B', balance: 10000, ref: 'T-103', type: 'transfer' },
  { name: 'Merchant checkout', target: 'Campus Bookshop', balance: 10000, ref: 'O-104', type: 'debit' },
  { name: 'Merchant checkout', target: 'Campus Bookshop', balance: 7500, ref: 'O-104', type: 'debit', paid: true },
  { name: 'Pay a utility bill', target: 'Demo electricity biller', balance: 10000, ref: 'B-106', type: 'debit', otp: true },
];
const demo = demos[Number(flow.dataset.case) - 1];
const money = cents => 'RM ' + (cents / 100).toFixed(2);
const row = (label, value) => `<div class="row"><span>${label}</span><span>${value}</span></div>`;
const details = (...rows) => `<section class="detail" aria-label="Payment details">${rows.join('')}</section>`;
let cents;
let rawAmount = '';
function amountScreen() {
  flow.innerHTML = `<h1>${demo.name}</h1><p>Use your demo wallet to continue.</p>
    ${details(row('To / from', demo.target), row('Available balance', money(demo.balance)), row('Reference', demo.ref))}
    <form><label for="amount">Amount (RM)<input id="amount" type="number" inputmode="decimal" min="0.01" max="10000" step="0.01" required placeholder="0.00"></label>
    <button class="action">Continue</button></form>`;
  const input = flow.querySelector('#amount');
  input.value = rawAmount;
  flow.querySelector('form').addEventListener('submit', event => {
    event.preventDefault();
    rawAmount = input.value;
    cents = Math.round(Number(rawAmount) * 100);
    if (Number.isSafeInteger(cents) && cents > 0) reviewScreen();
  });
}
function reviewScreen() {
  flow.innerHTML = `<h1>Review transaction</h1><p>Check the details before confirming.</p><div class="amount">${money(cents)}</div>
    ${details(row('Transaction', demo.name), row('To / from', demo.target), row('Reference', demo.ref), row('Fee', 'RM 0.00'))}
    <form>${demo.otp ? '<label for="otp">Verification code<input id="otp" inputmode="numeric" autocomplete="off" required pattern="[0-9]{6}" maxlength="6" placeholder="6-digit code"></label><p>Demo code: 123456</p>' : ''}
    <button class="action">Confirm transaction</button></form><button type="button" class="back" id="edit">Edit amount</button>`;
  flow.querySelector('#edit').addEventListener('click', amountScreen);
  flow.querySelector('form').addEventListener('submit', event => {
    event.preventDefault();
    resultScreen(flow.querySelector('#otp')?.value);
  });
}
function resultScreen(code) {
  let balance = demo.balance;
  let title = 'Payment successful';
  let message = 'Your transaction has been recorded.';
  let approved = false;
  if (demo.paid) {
    title = 'This order is already paid';
    message = 'Your original payment is recorded. No new charge was made.';
  } else if (demo.otp && code !== '654321') {
    title = code === '123456' ? 'Your code has expired' : 'Incorrect verification code';
    message = 'The bill is still unpaid. Your wallet was not charged.';
  } else if (demo.type !== 'credit' && cents > balance) {
    title = 'Insufficient balance';
    message = 'The amount is higher than your available balance.';
  } else {
    approved = true;
    balance += demo.type === 'credit' ? cents : -cents;
    if (demo.type === 'credit') title = 'Top-up successful';
    if (demo.type === 'transfer') title = 'Transfer complete';
    if (demo.name === 'Withdraw money') title = 'Withdrawal successful';
  }
  flow.innerHTML = `<div class="hero ${approved ? '' : 'warn'}"><div class="icon" aria-hidden="true">${approved ? '✓' : '!'}</div>
    <h1>${title}</h1><p>${message}</p><div class="amount">${money(cents)}</div></div>
    ${details(row('To / from', demo.target), row('Reference', demo.ref), row('Wallet balance', money(balance)),
      ...(approved && demo.type === 'transfer' ? [row('Recipient balance', money(2000 + cents))] : []))}
    <a class="action" href="index.html">Back to wallet</a>`;
}
amountScreen();
