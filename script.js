const search = document.querySelector('#search');
const cards = [...document.querySelectorAll('.searchable')];
const result = document.querySelector('#search-result');
const filters = [...document.querySelectorAll('.filter')];
let selectedCategory = 'all';

function updateCards() {
  const term = search.value.trim().toLowerCase();
  let matches = 0;
  cards.forEach((card) => {
    const matchesSearch = !term || card.dataset.search.toLowerCase().includes(term);
    const matchesCategory = selectedCategory === 'all' || card.dataset.category === selectedCategory || !card.dataset.category;
    const visible = matchesSearch && matchesCategory;
    card.classList.toggle('hidden', !visible);
    if (visible && card.dataset.category) matches += 1;
  });
  result.textContent = term ? `找到 ${matches} 篇相关笔记` : '';
}

search.addEventListener('input', updateCards);
filters.forEach((button) => button.addEventListener('click', () => {
  selectedCategory = button.dataset.filter;
  filters.forEach((item) => item.classList.toggle('active', item === button));
  updateCards();
}));

document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    search.focus();
  }
});

document.querySelector('.theme-toggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
});
