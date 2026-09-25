(function () {
  const STORAGE_KEY = 'tasks-v1';
  const listEl = document.getElementById('list');
  const emptyState = document.getElementById('empty-state');
  const emptyMsg = document.getElementById('empty-msg');
  const input = document.getElementById('new-task');
  const addBtn = document.getElementById('add-btn');
  const countPill = document.getElementById('count-pill');
  const leftLabel = document.getElementById('left-label');
  const clearDoneBtn = document.getElementById('clear-done');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const dotBtns = document.querySelectorAll('.dot-btn');
  const dateEl = document.getElementById('today-date');

  let tasks = [];
  let filter = 'todas';
  let selectedPriority = 'media';

  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      tasks = raw ? JSON.parse(raw) : [];
    } catch (e) {
      tasks = [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) { /* storage indisponível — segue só em memória */ }
  }

  function setDate() {
    const d = new Date();
    const formatted = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    dateEl.textContent = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function priorityLabel(p) {
    return { alta: 'Alta', media: 'Média', baixa: 'Baixa' }[p] || 'Média';
  }

  function render() {
    const filtered = tasks.filter(t => {
      if (filter === 'pendentes') return !t.done;
      if (filter === 'concluidas') return t.done;
      return true;
    });

    listEl.innerHTML = '';

    if (filtered.length === 0) {
      emptyState.hidden = false;
      emptyMsg.textContent =
        filter === 'concluidas' ? 'Nenhuma tarefa concluída ainda.' :
        filter === 'pendentes' ? 'Tudo em dia — nenhuma pendência.' :
        'Nada por aqui ainda. Adicione a primeira tarefa acima.';
    } else {
      emptyState.hidden = true;
    }

    filtered
      .slice()
      .sort((a, b) => a.done - b.done || b.createdAt - a.createdAt)
      .forEach(t => listEl.appendChild(buildTaskEl(t)));

    const pending = tasks.filter(t => !t.done).length;
    const done = tasks.length - pending;
    countPill.textContent = tasks.length ? `${done} de ${tasks.length} concluídas` : '';
    leftLabel.textContent = pending === 1 ? '1 tarefa pendente' : `${pending} tarefas pendentes`;
  }

  function buildTaskEl(t) {
    const li = document.createElement('li');
    li.className = 'task' + (t.done ? ' done' : '');
    li.dataset.id = t.id;
    li.dataset.priority = t.priority;

    li.innerHTML = `
      <button class="check" aria-label="Marcar como concluída">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
      </button>
      <div class="task-body">
        <div class="task-text" contenteditable="true" spellcheck="false">${escapeHtml(t.text)}</div>
        <div class="task-meta">${t.dateLabel}</div>
      </div>
      <span class="prio-badge">${priorityLabel(t.priority)}</span>
      <button class="del-btn" aria-label="Excluir tarefa">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 7h16M9 7V4h6v3m-8 0l1 13h8l1-13"/></svg>
      </button>
    `;

    li.querySelector('.check').addEventListener('click', () => toggleDone(t.id));

    const textEl = li.querySelector('.task-text');
    textEl.addEventListener('blur', () => {
      const val = textEl.textContent.trim();
      if (val) {
        updateText(t.id, val);
      } else {
        textEl.textContent = t.text;
      }
    });
    textEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); textEl.blur(); }
    });

    li.querySelector('.del-btn').addEventListener('click', () => removeTask(t.id, li));

    return li;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function addTask() {
    const val = input.value.trim();
    if (!val) { input.focus(); return; }
    const now = new Date();
    tasks.push({
      id: uid(),
      text: val,
      done: false,
      priority: selectedPriority,
      createdAt: now.getTime(),
      dateLabel: now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    });
    input.value = '';
    saveTasks();
    render();
    input.focus();
  }

  function toggleDone(id) {
    const t = tasks.find(t => t.id === id);
    if (t) { t.done = !t.done; saveTasks(); render(); }
  }

  function updateText(id, text) {
    const t = tasks.find(t => t.id === id);
    if (t) { t.text = text; saveTasks(); render(); }
  }

  function removeTask(id, li) {
    li.classList.add('removing');
    li.addEventListener('animationend', () => {
      tasks = tasks.filter(t => t.id !== id);
      saveTasks();
      render();
    }, { once: true });
  }

  addBtn.addEventListener('click', addTask);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTask(); });

  dotBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      dotBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedPriority = btn.dataset.p;
    });
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filter = btn.dataset.filter;
      render();
    });
  });

  clearDoneBtn.addEventListener('click', () => {
    tasks = tasks.filter(t => !t.done);
    saveTasks();
    render();
  });

  setDate();
  loadTasks();
  render();
})();
