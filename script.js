const WORDS = [
  {word:'apple', transcr:'ˈæpəl', translation:'яблуко', example:'I ate a red apple after school.', exampleTrans:'Я з’їв червоне яблуко після школи.'},
  {word:'book', transcr:'bʊk', translation:'книга', example:'She opened the book and read the first page.', exampleTrans:'Вона відкрила книгу і прочитала першу сторінку.'},
  {word:'school', transcr:'skuːl', translation:'школа', example:'He goes to school by bus every day.', exampleTrans:'Він їздить до школи автобусом щодня.'},
  {word:'friend', transcr:'frɛnd', translation:'друг', example:'My friend called me yesterday.', exampleTrans:'Мій друг подзвонив мені вчора.'},
  {word:'family', transcr:'ˈfæməli', translation:'сімʼя', example:'We visit our family on Sundays.', exampleTrans:'Ми відвідуємо нашу сімʼю по неділях.'},
  {word:'learn', transcr:'lɜːrn', translation:'вчити(ся)', example:'I want to learn new words.', exampleTrans:'Я хочу вивчати нові слова.'},
  {word:'study', transcr:'ˈstʌdi', translation:'вчитися, вивчати', example:'They study English every evening.', exampleTrans:'Вони вивчають англійську кожного вечора.'},
  {word:'teacher', transcr:'ˈtiːtʃər', translation:'вчитель', example:'The teacher explained the rule clearly.', exampleTrans:'Вчитель чітко пояснив правило.'},
  {word:'home', transcr:'hoʊm', translation:'дім', example:'I am happy to be home.', exampleTrans:'Я радий бути вдома.'},
  {word:'play', transcr:'pleɪ', translation:'грати', example:'Children play in the park.', exampleTrans:'Діти грають в парку.'},
  {word:'happy', transcr:'ˈhæpi', translation:'щасливий', example:'She is happy today.', exampleTrans:'Вона сьогодні щаслива.'},
  {word:'important', transcr:'ɪmˈpɔːrtənt', translation:'важливий', example:'This homework is important.', exampleTrans:'Це домашнє завдання важливе.'}
];

// --- Елементи ---
const wordText = document.getElementById('wordText');
const wordTranscr = document.getElementById('wordTranscr');
const wordExample = document.getElementById('wordExample');
const wordExampleTrans = document.getElementById('wordExampleTrans');
const wordTranslation = document.getElementById('wordTranslation');
const speakBtn = document.getElementById('speakBtn');
const testBtn = document.getElementById('testBtn');
const repeatBtn = document.getElementById('repeatBtn');
const showRepeatsBtn = document.getElementById('showRepeats');
const statsBox = document.getElementById('statsBox');
const testArea = document.getElementById('testArea');
const questionsDiv = document.getElementById('questions');
const submitTest = document.getElementById('submitTest');
const cancelTest = document.getElementById('cancelTest');
const resultArea = document.getElementById('resultArea');
const resetStats = document.getElementById('resetStats');
const repeatsList = document.getElementById('repeatsList');
const showAnalysisBtn = document.getElementById('showAnalysisBtn');
const analysisPanel = document.getElementById('analysisPanel');
const analysisContent = document.getElementById('analysisContent');

let todayWord = null;
let currentTest = null;
let lastAnalysis = [];
const STORAGE_KEY = 'wordaday_mvp_v3';

// --- LocalStorage ---
function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {tests:0, correct:0, repeats:[]};
  }catch(e){ return {tests:0, correct:0, repeats:[]}; }
}
function saveState(s){ localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }
let state = loadState();

// --- Статистика ---
function updateStatsUI(){
  const totalAnswers = state.tests * 2;
  const pct = totalAnswers ? Math.round(state.correct / totalAnswers * 100) : 0;
  statsBox.innerHTML = `Тести пройдено: ${state.tests}<br>% правильних відповідей: ${pct}%<br>Слів для повторення: ${state.repeats.length}`;
  renderRepeats();
}

function renderRepeats(){
  if (!state.repeats.length){
    repeatsList.innerHTML = '<div class="muted" style="margin-top:12px">Немає слів для повторення</div>';
    return;
  }
  repeatsList.innerHTML = '<div class="muted" style="margin-top:12px">Слова для повторення:</div>';
  const list = document.createElement('div');
  list.style.marginTop = '8px';
  state.repeats.forEach(w=>{
    const el = document.createElement('div');
    el.textContent = w;
    el.style.padding = '6px 8px';
    el.style.border = '1px solid #eef6ff';
    el.style.borderRadius = '8px';
    el.style.marginTop = '6px';
    list.appendChild(el);
  });
  repeatsList.appendChild(list);
}

// --- Слово дня ---
function pickWordOfDay(){
  const d = new Date();
  const idx = (d.getFullYear()*10000 + (d.getMonth()+1)*100 + d.getDate()) % WORDS.length;
  return WORDS[idx];
}

function showWord(wordObj){
  todayWord = wordObj;
  wordText.textContent = wordObj.word;
  wordTranscr.textContent = wordObj.transcr ? ('/' + wordObj.transcr + '/') : '';
  wordExample.textContent = wordObj.example;
  wordExampleTrans.textContent = wordObj.exampleTrans ? ('Переклад прикладу: ' + wordObj.exampleTrans) : '';
  wordTranslation.textContent = 'Переклад слова: ' + wordObj.translation;
}

// --- Кнопки ---
speakBtn.addEventListener('click', ()=>{
  if (!todayWord) return;
  const ut = new SpeechSynthesisUtterance(todayWord.word);
  ut.lang = 'en-US';
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(ut);
});

repeatBtn.addEventListener('click', ()=>{
  if (!todayWord) return;
  if (!state.repeats.includes(todayWord.word)) state.repeats.push(todayWord.word);
  saveState(state);
  updateStatsUI();
});

showRepeatsBtn.addEventListener('click', ()=>{
  renderRepeats();
  alert('Слова для повторення показані в бічній панелі.');
});

resetStats.addEventListener('click', ()=>{
  if (confirm('Скинути локальну статистику?')) {
    state = {tests:0, correct:0, repeats:[]};
    saveState(state);
    updateStatsUI();
    alert('Статистика очищена.');
  }
});

// --- Генерація тесту ---
function shuffle(arr){ return arr.slice().sort(()=>Math.random()-0.5); }

function generateTest(n=2){
  const words = shuffle(WORDS);
  const chosen = words.slice(0, n);
  const q0 = {kind:'translate', word:chosen[0], prompt:`Перекладіть слово "${chosen[0].word}" українською:`};
  const choices = shuffle([chosen[1].translation, ...shuffle(WORDS).slice(0,3).map(x=>x.translation)]);
  const q1 = {kind:'mcq', word:chosen[1], prompt:`Виберіть правильний переклад слова "${chosen[1].word}":`, choices};
  return [q0,q1];
}

testBtn.addEventListener('click', ()=>startTest());

function startTest(){
  currentTest = generateTest(2);
  questionsDiv.innerHTML = '';
  analysisPanel.style.display = 'none';
  showAnalysisBtn.style.display = 'none';
  lastAnalysis = [];
  currentTest.forEach((q, idx)=>{
    const div = document.createElement('div');
    div.className='question';
    const label = document.createElement('div');
    label.innerHTML = `<strong>Питання ${idx+1}:</strong> <span class="muted">${q.prompt}</span>`;
    div.appendChild(label);

    if (q.kind==='translate'){
      const inp = document.createElement('input');
      inp.type='text';
      inp.id = 'ans_'+idx;
      inp.placeholder = 'Введіть відповідь';
      div.appendChild(inp);
    } else if (q.kind==='mcq'){
      q.choices.forEach(c=>{
        const rb = document.createElement('div');
        rb.className='opt';
        rb.innerHTML = `<label><input type="radio" name="q${idx}" value="${c}"> ${c}</label>`;
        div.appendChild(rb);
      });
    }
    questionsDiv.appendChild(div);
  });
  testArea.style.display='block';
  resultArea.innerHTML='';
  window.scrollTo({top:document.body.scrollHeight, behavior:'smooth'});
}

cancelTest.addEventListener('click', ()=>{
  testArea.style.display='none';
  currentTest=null;
});

// --- Відповіді ---
function levenshtein(a,b){
  if(!a) return b?b.length:0;
  if(!b) return a.length;
  a=a.toLowerCase(); b=b.toLowerCase();
  const m=a.length,n=b.length;
  const dp=Array.from({length:m+1},()=>new Array(n+1).fill(0));
  for(let i=0;i<=m;i++) dp[i][0]=i;
  for(let j=0;j<=n;j++) dp[0][j]=j;
  for(let i=1;i<=m;i++){
    for(let j=1;j<=n;j++){
      const cost = a[i-1]===b[j-1]?0:1;
      dp[i][j]=Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+cost);
    }
  }
  return dp[m][n];
}

function fuzzyMatch(a,b,threshold=0.7){
  if(!a || !b) return false;
  const d=levenshtein(a.trim(),b.trim());
  if(d===0) return true;
  const len=Math.max(a.trim().length,b.trim().length);
  const ratio=1-d/len;
  return ratio>=threshold;
}

submitTest.addEventListener('click', ()=>{
  if(!currentTest) return;
  let correctCount = 0;
  const feedback = document.createElement('div');
  feedback.className='feedback';
  lastAnalysis = [];

  currentTest.forEach((q, idx)=>{
    let userAns = '';
    let ok = false;
    if(q.kind==='translate'){
      const inp = document.getElementById('ans_'+idx);
      userAns = inp?inp.value.trim():'';
      ok = fuzzyMatch(userAns, q.word.translation);
    } else if(q.kind==='mcq'){
      const chosen = document.querySelector(`input[name="q${idx}"]:checked`);
      userAns = chosen?chosen.value:'';
      ok = userAns.toLowerCase().trim() === q.word.translation.toLowerCase().trim();
    }
    const fb = document.createElement('div');
    fb.style.marginTop='8px';
    if(ok){
      fb.innerHTML = `<div class="correct">Питання ${idx+1}: Правильно ✅</div>`;
      correctCount++;
    } else {
      fb.innerHTML = `<div class="wrong">Питання ${idx+1}: Неправильно ❌</div>`;
      if(!state.repeats.includes(q.word.word)) state.repeats.push(q.word.word);
    }
    feedback.appendChild(fb);
    lastAnalysis.push({question:q.prompt,userAnswer:userAns,correctAnswer:q.word.translation});
  });

  state.tests += 1;
  state.correct += correctCount;
  saveState(state);
  updateStatsUI();
  resultArea.innerHTML=`<div class="result-line">Результат: ${correctCount} / ${currentTest.length}</div>`;
  resultArea.appendChild(feedback);

  if(lastAnalysis.length){
    analysisContent.innerHTML = '';
    lastAnalysis.forEach((a,i)=>{
      const wrap = document.createElement('div');
      wrap.style.marginBottom='10px';
      wrap.innerHTML = `<strong>Питання ${i+1}:</strong> <div class="muted">${a.question}</div>
      <div style="margin-top:6px"><strong>Ваша відповідь:</strong> ${a.userAnswer || '(немає)'}</div>
      <div style="margin-top:4px"><strong>Правильна відповідь:</strong> ${a.correctAnswer}</div>`;
      analysisContent.appendChild(wrap);
    });
    showAnalysisBtn.style.display='inline-block';
    showAnalysisBtn.onclick = ()=>{ analysisPanel.style.display='block'; analysisPanel.scrollIntoView({behavior:'smooth'}); };
  } else showAnalysisBtn.style.display='none';

  currentTest=null;
  testArea.style.display='none';
});

// --- Старт ---
showWord(pickWordOfDay());
updateStatsUI();
