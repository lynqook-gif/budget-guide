/* Presentation only: original text, copy, checkbox, storage and file handlers stay in the HTML. */
(() => {
  const view = document.getElementById('view');
  const steps = document.getElementById('steps');
  let selected = 0, version = '', docSelections = [];
  const homeHero = document.querySelector('.hero');
  homeHero.innerHTML = '<div class="budget-welcome">교행e와 함께하는 예산 편성</div><h1><span class="budget-title-line">학교 예산 편성,</span><span class="budget-title-line">차근차근 준비하세요.</span></h1><p>학교 유형을 선택하면 편성 절차와 공문 문안을 확인할 수 있어요.</p><div class="budget-welcome-mascot" role="img" aria-label="서류를 들고 안내하는 교행이"></div>';
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
  rail.innerHTML = '<div class="budget-rail-title">편성 단계<span>단계별 할 일과 문안을 확인하세요.</span></div><nav aria-label="예산편성 일정"></nav>';
  steps.before(workspace); workspace.append(rail, steps);

  const schedule = document.querySelector('.sched');
  const scheduleDetails = document.createElement('details'); scheduleDetails.className = 'budget-schedule-details';
  const summary = document.createElement('summary'); summary.textContent = '전체 편성 일정 보기';
  schedule.before(scheduleDetails); scheduleDetails.append(summary, schedule);
  const vars = document.getElementById('vars');
  const schoolDetails = document.createElement('details'); schoolDetails.className = 'budget-school-details';
  const schoolSummary = document.createElement('summary'); schoolSummary.textContent = '학교 정보와 공문 날짜'; schoolDetails.open = true;
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


/* Readable budget workspace: presentation only. */
(() => {
 document.body.classList.add('budget-readable');
 const brand=document.querySelector('.top .brand');
 if(brand) brand.innerHTML='<img class="budget-brand-logo" src="design/brand-logo.png" alt="교행e"><span class="budget-brand-name">본예산 길라잡이</span>';
 const top=document.querySelector('.top-in');
 const contact=document.querySelector('a[href*="open.kakao.com"]');
 if(top && contact){ const chat=contact.cloneNode(true);chat.className='budget-chat';chat.textContent='문의·건의 ↗';top.append(chat); }
 const heading=document.querySelector('.vhead');
 if(heading){const mascot=document.createElement('div');mascot.className='budget-work-mascot';mascot.setAttribute('role','img');mascot.setAttribute('aria-label','교행이');heading.append(mascot);}
 const dates=document.querySelector('#vars .dates');
 if(dates){const details=document.createElement('details');details.className='budget-date-details';const summary=document.createElement('summary');summary.textContent='공문 날짜·장소 더 보기';dates.before(details);details.append(summary,dates);}
 const credit=document.querySelector('footer.credit');
 if(credit && contact){credit.replaceChildren();const author=document.createElement('div');author.textContent='제작자: 정주고등학교 박지은';const link=contact.cloneNode(true);link.textContent='문의·건의: 카카오톡 오픈채팅 ↗';credit.append(author,link);}
})();
