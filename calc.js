let current = '0', prev = null, op = null, fresh = false;

const display = document.getElementById('result');
const expr    = document.getElementById('expr');

function fmt(n) {
  if (isNaN(n) || !isFinite(n)) return 'Error';
  let s = parseFloat(n.toPrecision(12)).toString();
  if (s.length > 12) s = parseFloat(n.toPrecision(9)).toExponential();
  return s;
}

function updateDisplay(err) {
  display.textContent = current;
  display.className = 'result' + (err ? ' error' : '');
}

function compute(a, b, o) {
  a = parseFloat(a); b = parseFloat(b);
  if (o === '+') return a + b;
  if (o === '−') return a - b;
  if (o === '×') return a * b;
  if (o === '÷') return b === 0 ? NaN : a / b;
}

document.getElementById('keypad').addEventListener('click', function(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action, val = btn.dataset.val;

  if (action === 'digit') {
    if (current === '0' || fresh) { current = val; fresh = false; }
    else if (current.length < 12) current += val;
    updateDisplay();
  }
  else if (action === 'dot') {
    if (fresh) { current = '0.'; fresh = false; }
    else if (!current.includes('.')) current += '.';
    updateDisplay();
  }
  else if (action === 'clear') {
    current = '0'; prev = null; op = null; fresh = false;
    expr.textContent = '';
    updateDisplay();
  }
  else if (action === 'sign') {
    current = fmt(parseFloat(current) * -1);
    updateDisplay();
  }
  else if (action === 'percent') {
    current = fmt(parseFloat(current) / 100);
    updateDisplay();
  }
  else if (action === 'op') {
    if (op && !fresh) current = fmt(compute(prev, current, op));
    prev = current; op = val; fresh = true;
    expr.textContent = current + ' ' + val;
    updateDisplay();
  }
  else if (action === 'equals') {
    if (!op) return;
    const res = compute(prev, current, op);
    expr.textContent = prev + ' ' + op + ' ' + current + ' =';
    current = isNaN(res) || !isFinite(res) ? 'Error' : fmt(res);
    prev = null; op = null; fresh = true;
    updateDisplay(!isFinite(res) || isNaN(res));
  }
});

document.addEventListener('keydown', function(e) {
  const map = {
    '0':'0','1':'1','2':'2','3':'3','4':'4',
    '5':'5','6':'6','7':'7','8':'8','9':'9',
    '.':'.','Enter':'=','=':'=','+':'+',
    '-':'−','*':'×','/':'÷',
    'Backspace':'back','Escape':'clear','%':'percent'
  };
  const k = map[e.key];
  if (!k) return;
  e.preventDefault();

  if (k === 'back') {
    current = current.length > 1 ? current.slice(0, -1) : '0';
    updateDisplay();
    return;
  }

  let sel;
  if (k === '=')            sel = '[data-action="equals"]';
  else if (k === 'clear')   sel = '[data-action="clear"]';
  else if (k === 'percent') sel = '[data-action="percent"]';
  else if ('÷×−+'.includes(k)) sel = `[data-val="${k}"]`;
  else if (k === '.')       sel = '[data-action="dot"]';
  else                      sel = `[data-action="digit"][data-val="${k}"]`;

  const el = document.querySelector(sel);
  if (el) el.click();
});
