/* Presentation only: original text, copy, checkbox, storage and file handlers stay in the HTML. */
(() => {
  const view = document.getElementById('view');
  const steps = document.getElementById('steps');
  let selected = 0, version = '', docSelections = [];
  const homeHero = document.querySelector('.hero');
  const signHeading = document.createElement('h1');
  const signImage = document.createElement('img');
  signImage.src = 'design/home-signboard-refined.png';
  signImage.alt = '교행e의 본예산 길라잡이';
  signImage.width = 2172; signImage.height = 724;
  signImage.className = 'budget-sign-image';
  signImage.fetchPriority = 'high';
  signHeading.append(signImage); homeHero.replaceChildren(signHeading);
  const basis = document.querySelector('.howto .basis') || document.querySelector('.basis-card');
  const guideline = document.createElement('details'); guideline.className = 'budget-guideline';
  const guidelineSummary = document.createElement('summary');
  guidelineSummary.innerHTML = '<span class="budget-guideline-label">적용 지침</span><strong>2026학년도 기준</strong><span class="budget-guideline-note">2027학년도 지침 시달 시 변경사항 확인</span>';
  guideline.append(guidelineSummary); if (basis) guideline.append(basis); homeHero.after(guideline);
  const workGuideline = guideline.cloneNode(true); workGuideline.classList.add('budget-work-guideline');
  document.querySelector('.vhead').after(workGuideline);
  document.querySelectorAll('.pickcard').forEach((card, index) => {
    const icon = document.createElement('span'); icon.className = 'budget-choice-icon'; icon.setAttribute('aria-hidden', 'true');
    icon.classList.add(index === 0 ? 'budget-character-male' : 'budget-character-female');
    card.prepend(icon);
  });

  const workspace = document.createElement('div'); workspace.className = 'budget-workspace';
  const rail = document.createElement('aside'); rail.className = 'budget-rail';
  rail.setAttribute('aria-label', '예산편성 단계');
  rail.innerHTML = '<div class="budget-rail-title">예산편성 일정</div><nav aria-label="예산편성 일정"></nav>';
  steps.before(workspace); workspace.append(rail, steps);

  const schedule = document.querySelector('.sched');
  const scheduleDetails = document.createElement('details'); scheduleDetails.className = 'budget-schedule-details';
  const summary = document.createElement('summary'); summary.textContent = '예산 편성 일정 한눈에 보기 — 언제까지 무엇을 하나요?';
  schedule.before(scheduleDetails); scheduleDetails.append(summary, schedule);
  const vars = document.getElementById('vars');
  const schoolDetails = document.createElement('details'); schoolDetails.className = 'budget-school-details';
  const schoolSummary = document.createElement('summary'); schoolSummary.textContent = '한 번에 일정 업로드하기 — 학교 정보·공문 날짜 넣기 (엑셀 양식 받기 → 올리기)';
  vars.before(schoolDetails); schoolDetails.append(schoolSummary, vars);

  function select(index) {
    selected = Math.max(0, Math.min(index, steps.children.length - 1));
    Array.from(steps.children).forEach((step, i) => step.classList.toggle('budget-current', i === selected));
    rail.querySelectorAll('nav button').forEach((button, i) => {
      button.classList.toggle('selected', i === selected);
      if (i === selected) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current');
    });
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
      const button = document.createElement('button'); button.type = 'button';
      button.innerHTML = '<span class="budget-rail-number"></span><span class="budget-rail-copy"><b></b></span>';
      button.querySelector('.budget-rail-number').textContent = String(i + 1).padStart(2, '0');
      button.querySelector('b').textContent = title;
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
    select(selected);
    document.body.classList.toggle('budget-working', !view.hidden);
  }
  new MutationObserver(arrange).observe(steps, {childList:true});
  new MutationObserver(() => document.body.classList.toggle('budget-working', !view.hidden)).observe(view, {attributes:true, attributeFilter:['hidden']});
  document.addEventListener('click', event => {
    const jump = event.target.closest('[data-jump]');
    if (jump) select(Number(jump.dataset.jump));
  }, true);
  arrange();
})();
