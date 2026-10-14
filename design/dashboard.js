/* Presentation only: original text, copy, checkbox, storage and file handlers stay in the HTML. */
(() => {
  const view = document.getElementById('view');
  const steps = document.getElementById('steps');
  let selected = 0, version = '', docSelections = [];
  const homeHero = document.querySelector('.hero');
  const signHeading = document.createElement('h1');
  const signImage = document.createElement('img');
  signImage.src = 'design/home-signboard-thin.png';
  signImage.alt = '교행e의 본예산 길라잡이';
  signImage.width = 2172; signImage.height = 724;
  signImage.className = 'budget-sign-image';
  signImage.fetchPriority = 'high';
  signHeading.append(signImage); homeHero.replaceChildren(signHeading);
  document.querySelectorAll('.pickcard').forEach((card, index) => {
    const icon = document.createElement('span'); icon.className = 'budget-choice-icon'; icon.setAttribute('aria-hidden', 'true');
    icon.classList.add(index === 0 ? 'budget-character-male' : 'budget-character-female');
    card.prepend(icon);
  });

  const workspace = document.createElement('div'); workspace.className = 'budget-workspace';
  const rail = document.createElement('aside'); rail.className = 'budget-rail';
  rail.setAttribute('aria-label', '예산편성 단계');
  rail.innerHTML = '<div class="budget-rail-title">예산편성 일정<span>단계를 선택해 준비하세요</span></div><nav aria-label="예산편성 일정"></nav><div class="budget-mascot budget-assistant-panel"><span class="budget-assistant-icon" aria-hidden="true"></span><div class="budget-assistant-copy"><b>편성 체크</b><span class="budget-assistant-status"></span><span class="budget-assistant-progress" aria-hidden="true"><i></i></span></div></div>';
  steps.before(workspace); workspace.append(rail, steps);

  const schedule = document.querySelector('.sched');
  const scheduleDetails = document.createElement('details'); scheduleDetails.className = 'budget-schedule-details';
  const summary = document.createElement('summary'); summary.textContent = '전체 일정과 근거 한눈에 보기';
  schedule.before(scheduleDetails); scheduleDetails.append(summary, schedule);
  const vars = document.getElementById('vars');
  const schoolDetails = document.createElement('details'); schoolDetails.className = 'budget-school-details';
  const schoolSummary = document.createElement('summary'); schoolSummary.textContent = '학교명 · 법인명 · 학년도 설정';
  vars.before(schoolDetails); schoolDetails.append(schoolSummary, vars);

  function select(index) {
    selected = Math.max(0, Math.min(index, steps.children.length - 1));
    Array.from(steps.children).forEach((step, i) => step.classList.toggle('budget-current', i === selected));
    rail.querySelectorAll('nav button').forEach((button, i) => {
      button.classList.toggle('selected', i === selected);
      if (i === selected) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current');
    });
    updateAssistant();
  }
  function updateAssistant() {
    const step = steps.children[selected]; if (!step) return;
    const checks = Array.from(step.querySelectorAll('.todo input'));
    const done = checks.filter(input => input.checked).length;
    rail.querySelector('.budget-assistant-status').textContent = '확인한 할 일 ' + done + ' / ' + checks.length;
    rail.querySelector('.budget-assistant-progress i').style.width = (checks.length ? done / checks.length * 100 : 0) + '%';
    rail.dataset.assistant = view.className === 'v-pri' ? 'female' : 'male';
  }
  function updateProgress() {
    Array.from(steps.children).forEach((step, i) => {
      const inputs = Array.from(step.querySelectorAll('.todo input'));
      const done = inputs.filter(input => input.checked).length;
      const button = rail.querySelectorAll('nav button')[i];
      if (!button) return;
      button.querySelector('.budget-rail-status').textContent = done + ' / ' + inputs.length + ' 확인';
      button.classList.toggle('complete', inputs.length > 0 && done === inputs.length);
    });
    updateAssistant();
  }
  function chooseDoc(step, index) {
    const docs = Array.from(step.querySelectorAll('.doc'));
    docs.forEach((doc, i) => doc.classList.toggle('budget-doc-inactive', i !== index));
    step.querySelectorAll('.budget-doc-tabs button').forEach((button, i) => {
      button.classList.toggle('selected', i === index);
      button.setAttribute('aria-pressed', String(i === index));
    });
  }
  function arrange() {
    if (version !== view.className) { version = view.className; selected = 0; docSelections = []; }
    const nav = rail.querySelector('nav'); nav.replaceChildren();
    Array.from(steps.children).forEach((step, i) => {
      const title = step.querySelector('h3').textContent;
      const when = step.querySelector('.when').textContent;
      const button = document.createElement('button'); button.type = 'button';
      button.innerHTML = '<span class="budget-rail-number"></span><span class="budget-rail-copy"><b></b><small></small><em class="budget-rail-status"></em></span>';
      button.querySelector('.budget-rail-number').textContent = String(i + 1).padStart(2, '0');
      button.querySelector('b').textContent = title;
      button.querySelector('small').textContent = when;
      button.addEventListener('click', () => select(i)); nav.append(button);
      const body = step.querySelector('.step-body');
      if (body.querySelector('.budget-task-column')) return;
      const task = document.createElement('section'); task.className = 'budget-task-column';
      const docsColumn = document.createElement('section'); docsColumn.className = 'budget-doc-column';
      const taskTitle = document.createElement('h4'); taskTitle.textContent = '해야 할 일';
      const docTitle = document.createElement('h4'); docTitle.textContent = '작성 문안';
      const docs = Array.from(body.querySelectorAll(':scope > .doc'));
      const todo = body.querySelector('.todo'), law = body.querySelector('.law-box');
      task.append(taskTitle, todo);
      if (law) {
        const details = document.createElement('details'); details.className = 'budget-law';
        const label = document.createElement('summary'); label.textContent = '이 단계의 기준과 참고사항';
        details.append(label, law); task.append(details);
      }
      const help = document.createElement('p'); help.className = 'budget-task-note';
      help.textContent = '체크한 항목은 이 브라우저에 저장됩니다. 필요한 문안을 확인하고 붙임 서식을 준비하세요.';
      task.append(help); docsColumn.append(docTitle);
      const tabs = document.createElement('div'); tabs.className = 'budget-doc-tabs';
      docs.forEach((doc, k) => {
        const tab = document.createElement('button'); tab.type = 'button';
        tab.textContent = doc.querySelector('.doc-label').textContent;
        tab.addEventListener('click', () => { docSelections[i] = k; chooseDoc(step, k); }); tabs.append(tab);
      });
      if (docs.length > 1) docsColumn.append(tabs);
      docs.forEach(doc => docsColumn.append(doc));
      body.append(task, docsColumn); chooseDoc(step, Math.min(docSelections[i] || 0, docs.length - 1));
    });
    select(selected); updateProgress();
    document.body.classList.toggle('budget-working', !view.hidden);
  }
  new MutationObserver(arrange).observe(steps, {childList:true});
  new MutationObserver(() => document.body.classList.toggle('budget-working', !view.hidden)).observe(view, {attributes:true, attributeFilter:['hidden']});
  document.addEventListener('click', event => {
    const jump = event.target.closest('[data-jump]');
    if (jump) select(Number(jump.dataset.jump));
  }, true);
  document.addEventListener('change', event => { if (event.target.matches('.todo input')) updateProgress(); });
  arrange();
})();
