// apply.js — Trust Livraison 応募フォーム
// CGI: /freecgi/FormMail/index.cgi

const form = document.getElementById('applyForm');
const agreeCheck = document.getElementById('agreeCheck');
const agreeError = document.getElementById('agreeError');

// 必須フィールドのバリデーション
function validateField(input) {
  const group = input.closest('.form-group');
  if (!group) return true;
  const val = input.value.trim();
  let ok = true;
  if (input.hasAttribute('required') && !val) ok = false;
  if (input.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) ok = false;
  group.classList.toggle('has-error', !ok);
  return ok;
}

// リアルタイムバリデーション
form.querySelectorAll('input[required], select[required]').forEach(el => {
  el.addEventListener('change', () => validateField(el));
  el.addEventListener('blur',   () => validateField(el));
});

// 送信前処理
form.addEventListener('submit', (e) => {
  e.preventDefault();

  let valid = true;

  // テキスト必須チェック（name / tel / email）
  ['name','tel','email'].forEach(name => {
    const el = form.querySelector(`[name="${name}"]`);
    if (el && !el.value.trim()) {
      el.closest('.form-group').classList.add('has-error');
      valid = false;
    } else if (el) {
      el.closest('.form-group').classList.remove('has-error');
    }
  });

  // メール形式チェック
  const emailEl = form.querySelector('[name="email"]');
  if (emailEl && emailEl.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
    emailEl.closest('.form-group').classList.add('has-error');
    valid = false;
  }

  // セレクト必須チェック（年齢・免許・軽自動車・経験）
  ['ageSelect','licenseSelect','carSelect','experienceSelect'].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.value) {
      el.closest('.form-group').classList.add('has-error');
      valid = false;
    } else if (el) {
      el.closest('.form-group').classList.remove('has-error');
    }
  });

  // 同意チェック
  if (!agreeCheck.checked) {
    agreeError.style.display = 'block';
    valid = false;
  } else {
    agreeError.style.display = 'none';
  }

  if (!valid) {
    const firstErr = form.querySelector('.has-error');
    if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // CGIのcommentフィールドに各選択項目を集約
  const age        = document.getElementById('ageSelect').value;
  const license    = document.getElementById('licenseSelect').value;
  const car        = document.getElementById('carSelect').value;
  const experience = document.getElementById('experienceSelect').value;
  const area       = document.getElementById('areaSelect').value;
  const freeText   = document.getElementById('freecomment').value.trim();

  const workStyles = [...document.querySelectorAll('.workStyle:checked')]
    .map(cb => cb.value).join('・') || '未選択';

  const commentLines = [
    '【年齢】'     + age,
    '【運転免許】' + license,
    '【軽自動車】' + car,
    '【稼働希望】' + workStyles,
    '【配送経験】' + experience,
    '【希望エリア】' + area,
  ];
  if (freeText) commentLines.push('\n【ご質問・メッセージ】\n' + freeText);

  document.getElementById('commentField').value = commentLines.join('\n');

  // CGIへ送信
  form.submit();
});
