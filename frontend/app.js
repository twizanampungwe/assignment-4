// Same origin when served by Express; falls back to localhost if opened as a file.
// After deploying separately, set API to your live URL, e.g. 'https://your-app.onrender.com/api/destinations'
const API = location.protocol === 'file:'
  ? 'http://localhost:3000/api/destinations'
  : '/api/destinations';

const FIELDS = ['destination', 'country', 'category', 'best_season', 'avg_cost_usd', 'rating', 'description'];
const $ = (id) => document.getElementById(id);

function show(text, isError = false) {
  $('msg').textContent = text;
  $('msg').style.color = isError ? '#d93025' : '#188038';
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function loadAll() {
  const res = await fetch(API);
  const data = await res.json();
  $('rows').innerHTML = data.map((d) => `
    <tr>
      <td>${d.id}</td><td>${esc(d.destination)}</td><td>${esc(d.country)}</td>
      <td>${esc(d.category)}</td><td>${esc(d.best_season)}</td>
      <td>${d.avg_cost_usd != null ? '$' + d.avg_cost_usd : ''}</td>
      <td>${d.rating ?? ''}</td><td>${esc(d.description)}</td>
      <td>
        <button onclick="editItem(${d.id})">Edit</button>
        <button class="danger" onclick="deleteItem(${d.id})">Delete</button>
      </td>
    </tr>`).join('');
}

function resetForm() {
  $('form').reset();
  $('id').value = '';
  $('saveBtn').textContent = 'Add destination';
  $('cancelBtn').hidden = true;
}

async function editItem(id) {
  const d = await (await fetch(`${API}/${id}`)).json();
  $('id').value = d.id;
  FIELDS.forEach((f) => ($(f).value = d[f] ?? ''));
  $('saveBtn').textContent = 'Update destination';
  $('cancelBtn').hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteItem(id) {
  if (!confirm('Delete this destination?')) return;
  const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
  const body = await res.json();
  res.ok ? show(body.message) : show(body.error, true);
  loadAll();
}

$('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {};
  FIELDS.forEach((f) => (payload[f] = $(f).value));
  const id = $('id').value;
  const res = await fetch(id ? `${API}/${id}` : API, {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await res.json();
  if (!res.ok) return show(body.error, true);
  show(id ? 'Destination updated' : 'Destination added');
  resetForm();
  loadAll();
});

$('cancelBtn').addEventListener('click', resetForm);
loadAll();