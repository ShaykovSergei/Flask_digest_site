const cardsGrid = document.getElementById('cardsGrid');
const searchInput = document.getElementById('search');
const tagsFilter = document.getElementById('tagsFilter');
const cardCount = document.getElementById('cardCount');
const resetBtn = document.getElementById('resetBtn');

let allCards = [];
let activeTag = null;

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function loadCards() {
  try {
    const res = await fetch('/api/cards');
    allCards = await res.json();
    const tagsRes = await fetch('/api/tags');
    const tags = await tagsRes.json();
    renderTags(tags);
    renderCards(allCards);
  } catch (err) {
    cardsGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠</div>
        <h3>Ошибка загрузки</h3>
        <p>Не удалось загрузить карточки. Попробуйте обновить страницу.</p>
      </div>`;
  }
}

function renderTags(tags) {
  tagsFilter.innerHTML = tags.map(tag =>
    `<button class="tag-btn" data-tag="${tag}">${tag}</button>`
  ).join('');

  tagsFilter.querySelectorAll('.tag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.dataset.tag;
      if (activeTag === tag) {
        activeTag = null;
        btn.classList.remove('active');
      } else {
        tagsFilter.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
        activeTag = tag;
        btn.classList.add('active');
      }
      filterCards();
    });
  });
}

function renderCards(cards) {
  if (cards.length === 0) {
    cardsGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h3>Ничего не найдено</h3>
        <p>Попробуйте изменить запрос или сбросить фильтры.</p>
      </div>`;
    cardCount.textContent = 'Найдено: 0';
    return;
  }

  cardsGrid.innerHTML = cards.map((card, i) => `
    <div class="card" style="animation-delay: ${i * 0.06}s">
      <span class="card-number">${String(card.id).padStart(2, '0')}</span>
      <div class="card-tags">
        ${card.tags.map(tag => `<span class="card-tag">${tag}</span>`).join('')}
      </div>
      <h2 class="card-title">${card.title}</h2>
      <p class="card-description">${card.description}</p>
      <div class="card-actions">
        <a href="${card.url}" target="_blank" rel="noopener noreferrer" class="card-btn">
          Открыть материал
          <span class="card-btn-arrow">→</span>
        </a>
      </div>
    </div>
  `).join('');

  cardCount.textContent = `Найдено: ${cards.length}`;
}

function filterCards() {
  const query = searchInput.value.trim().toLowerCase();
  let filtered = allCards;

  if (query) {
    const escaped = escapeRegExp(query);
    const regex = new RegExp(escaped, 'i');
    filtered = filtered.filter(card =>
      regex.test(card.title) ||
      regex.test(card.description) ||
      card.tags.some(tag => regex.test(tag))
    );
  }

  if (activeTag) {
    filtered = filtered.filter(card => card.tags.includes(activeTag));
  }

  renderCards(filtered);
  updateResetBtn();
}

function updateResetBtn() {
  const hasFilters = searchInput.value.trim() !== '' || activeTag !== null;
  resetBtn.classList.toggle('visible', hasFilters);
}

searchInput.addEventListener('input', filterCards);

resetBtn.addEventListener('click', () => {
  searchInput.value = '';
  activeTag = null;
  tagsFilter.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
  filterCards();
  searchInput.focus();
});

loadCards();
