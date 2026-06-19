/* ══ ESTADO GLOBAL ══ */
const state = {
  nivel: 4, pct: 80,
  checkinFeito: false,
  humor: null,
  conversa: null,
  horta: null,
  settings: {
    fonte: false, voz: false, cmds: false,
    contraste: false, botoes: false, lingua: false
  },
  notifCount: 2,
  diasSeguidos: 12
};

const plantEmojis = ['🌱','🌿','🪴','🌾','🌻','🌳'];
const plantLabels = ['Nível 1','Nível 2','Nível 3','Nível 4','Nível 5','Nível 6'];

/* ══ RELÓGIO ══ */
function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent =
    now.getHours().toString().padStart(2,'0') + ':' +
    now.getMinutes().toString().padStart(2,'0');
}
updateClock();
setInterval(updateClock, 10000);

/* ══ NAVEGAÇÃO ══ */
function goTo(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('screen-' + screen).classList.add('active');
  const nav = document.getElementById('nav-' + screen);
  if(nav) nav.classList.add('active');
  document.querySelector('.screens').scrollTop = 0;
  if(state.settings.voz) lerTexto('Tela: ' + screen.replace('inicio','início').replace('checkin','check-in').replace('planta','minha planta').replace('apoio','meu apoio').replace('ubs','painel UBS').replace('ajustes','ajustes').replace('notifs','notificações'));
}

/* ══ HUMOR ══ */
function selectMood(btn, ctx) {
  btn.closest('.mood-options').querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  if(state.settings.voz) lerTexto('Você selecionou: ' + btn.textContent.trim());
}

/* ══ CHECK-IN ══ */
let checkinStep = 0;
function selectMoodCheckin(btn, step, score) {
  btn.closest('.mood-options').querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  state.humor = score;
  advanceDot(step);
  if(state.settings.voz) lerTexto('Humor registrado: ' + btn.textContent.trim());
}

function selectYN(btn, val, step) {
  btn.closest('.yes-no-row').querySelectorAll('.btn-yn').forEach(b => { b.classList.remove('selected-yes','selected-no'); });
  btn.classList.add(val==='sim' ? 'selected-yes' : 'selected-no');
  if(step===2) state.conversa = val;
  if(step===3) state.horta = val;
  advanceDot(step);
  if(state.settings.voz) lerTexto(val==='sim' ? 'Sim, registrado!' : 'Não, registrado.');
}

function advanceDot(step) {
  for(let i=1;i<=3;i++){
    const d = document.getElementById('dot'+i);
    if(i < step){ d.className='step-dot done'; d.textContent='✓'; }
    else if(i===step){ d.className='step-dot active'; d.textContent=i; }
    else { d.className='step-dot'; d.textContent=i; }
  }
  if(step < 3){ document.getElementById('dot'+(step+1)).className='step-dot active'; }
}

function concluirCheckin() {
  state.checkinFeito = true;
  state.diasSeguidos++;
  // Aumenta o progresso
  state.pct = Math.min(state.pct + 8, 99);
  if(state.pct >= 99){ state.nivel = Math.min(state.nivel+1, 5); state.pct = 10; }
  updatePlantUI();
  // Atualiza check-ins
  const ci = document.getElementById('inicio-checkins');
  const cp = document.getElementById('planta-checkins');
  if(ci) ci.textContent = '7/7';
  if(cp) cp.textContent = '7/7';
  document.getElementById('dias-seguidos').textContent = state.diasSeguidos;
  showOverlay('success-overlay');
  if(state.settings.voz) lerTexto('Parabéns! Check-in concluído com sucesso. Sua planta cresceu!');
}

function closeSuccess() {
  hideOverlay('success-overlay');
  goTo('inicio');
  // Reset check-in form
  document.querySelectorAll('#screen-checkin .mood-btn').forEach(b=>b.classList.remove('selected'));
  document.querySelectorAll('#screen-checkin .btn-yn').forEach(b=>{ b.classList.remove('selected-yes','selected-no'); });
  for(let i=1;i<=3;i++){ const d=document.getElementById('dot'+i); d.className='step-dot'+(i===1?' active':''); d.textContent=i; }
}

/* ══ PLANTA UI ══ */
function updatePlantUI() {
  const lvl = state.nivel - 1;
  const emoji = plantEmojis[lvl] || '🌳';
  const label = plantLabels[lvl] || 'Nível ' + state.nivel;
  const pctStr = state.pct + '%';

  // Home
  const hp = document.getElementById('home-progress');
  const hl = document.getElementById('home-pct-label');
  const hlt = document.getElementById('home-level-text');
  const he = document.getElementById('home-plant-emoji');
  if(hp) hp.style.width = pctStr;
  if(hl) hl.textContent = state.pct + '% para o próximo nível';
  if(hlt) hlt.textContent = label;
  if(he) he.textContent = emoji;

  // Planta screen
  const pp = document.getElementById('planta-progress');
  const pl = document.getElementById('planta-pct-label');
  const pll = document.getElementById('planta-level');
  const pe = document.getElementById('planta-emoji');
  if(pp) pp.style.width = pctStr;
  if(pl) pl.textContent = state.pct + '% para o próximo nível — continue assim!';
  if(pll) pll.textContent = label;
  if(pe) pe.textContent = emoji;
}

/* ══ CONTATOS ══ */
function ligar(numero, nome) {
  document.getElementById('call-title').textContent = '📞 Ligando para ' + nome;
  document.getElementById('call-body').textContent = numero;
  showOverlay('call-overlay');
  if(state.settings.voz) lerTexto('Ligando para ' + nome);
}

/* ══ OVERLAYS ══ */
function showOverlay(id) { document.getElementById(id).classList.add('show'); }
function hideOverlay(id) { document.getElementById(id).classList.remove('show'); }

/* ══ UBS ══ */
const ubsData = {
  mes:      { total:32, estaveis:25, atencao:5,  criticos:2, pe:'78%', pa:'16%', pc:'6%',  freq:'85%', horta:'72%', eng:'76%', alertas:7  },
  anterior: { total:29, estaveis:22, atencao:5,  criticos:2, pe:'76%', pa:'17%', pc:'7%',  freq:'80%', horta:'68%', eng:'72%', alertas:9  },
  tri:      { total:35, estaveis:28, atencao:5,  criticos:2, pe:'80%', pa:'14%', pc:'6%',  freq:'88%', horta:'75%', eng:'79%', alertas:5  }
};
function updateUBS() {
  const key = document.getElementById('ubs-period').value;
  const d = ubsData[key];
  document.getElementById('ubs-total').textContent    = d.total;
  document.getElementById('ubs-estaveis').textContent = d.estaveis;
  document.getElementById('ubs-atencao').textContent  = d.atencao;
  document.getElementById('ubs-criticos').textContent = d.criticos;
  document.getElementById('ubs-pct-e').textContent    = d.pe;
  document.getElementById('ubs-pct-a').textContent    = d.pa;
  document.getElementById('ubs-pct-c').textContent    = d.pc;
  document.getElementById('ubs-freq').textContent     = d.freq;
  document.getElementById('ubs-horta').textContent    = d.horta;
  document.getElementById('ubs-eng').textContent      = d.eng;
  document.getElementById('ubs-alertas').textContent  = d.alertas;
}
function ubsTab(btn) {
  document.querySelectorAll('.ubs-sub-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  if(state.settings.voz) lerTexto('Aba ' + btn.textContent.trim());
}

/* ══ AJUSTES ══ */
function applySetting(key, val) {
  state.settings[key] = val;
  const phone = document.getElementById('phone');
  phone.classList.toggle('fonte-ampliada', state.settings.fonte);
  phone.classList.toggle('alto-contraste',  state.settings.contraste);
  phone.classList.toggle('botoes-grandes',  state.settings.botoes);
  phone.classList.toggle('linguagem-simples', state.settings.lingua);

  if(key === 'voz' && val) {
    lerTexto('Leitura por voz ativada. Posso falar o conteúdo do aplicativo para você.');
  }
  if(key === 'cmds' && val) {
    iniciarComandosVoz();
  } else if(key === 'cmds' && !val) {
    pararComandosVoz();
  }
  saveSettings();
}

function resetSettings() {
  ['fonte','voz','contraste','botoes','lingua','cmds'].forEach(k=>{
    state.settings[k] = false;
    const el = document.getElementById('set-'+k);
    if(el) el.checked = false;
  });
  const phone = document.getElementById('phone');
  phone.classList.remove('fonte-ampliada','alto-contraste','botoes-grandes','linguagem-simples');
  pararComandosVoz();
  saveSettings();
  showToast('✔ Configurações restauradas!');
}

function saveSettings() {
  try { localStorage.setItem('mv_settings', JSON.stringify(state.settings)); } catch(e) {}
}
function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem('mv_settings') || '{}');
    Object.keys(s).forEach(k=>{
      if(k in state.settings) {
        state.settings[k] = s[k];
        const el = document.getElementById('set-'+k);
        if(el) el.checked = s[k];
      }
    });
    applySetting('_load', false); // re-apply classes
  } catch(e) {}
}

/* ══ LEITURA POR VOZ (TTS) ══ */
function lerTexto(txt) {
  if(!state.settings.voz) return;
  if(!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(txt);
  u.lang = 'pt-BR';
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

/* ══ COMANDOS DE VOZ (STT) ══ */
let recognition = null;
function iniciarComandosVoz() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){ showToast('⚠️ Comandos de voz não suportados neste navegador'); return; }
  recognition = new SR();
  recognition.lang = 'pt-BR';
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.onresult = (e) => {
    const cmd = e.results[e.results.length-1][0].transcript.toLowerCase().trim();
    processarComando(cmd);
  };
  recognition.onerror = () => {};
  recognition.onend = () => { if(state.settings.cmds) recognition.start(); };
  recognition.start();
  document.getElementById('voice-bar').classList.add('show');
}
function pararComandosVoz() {
  if(recognition){ try { recognition.stop(); } catch(e){} recognition = null; }
  document.getElementById('voice-bar').classList.remove('show');
}
function processarComando(cmd) {
  if(cmd.includes('início') || cmd.includes('inicio') || cmd.includes('home'))   goTo('inicio');
  else if(cmd.includes('check') || cmd.includes('check-in'))  goTo('checkin');
  else if(cmd.includes('planta'))  goTo('planta');
  else if(cmd.includes('apoio') || cmd.includes('contato'))   goTo('apoio');
  else if(cmd.includes('ubs') || cmd.includes('painel'))      goTo('ubs');
  else if(cmd.includes('ajuste') || cmd.includes('config'))   goTo('ajustes');
  else if(cmd.includes('notif'))   goTo('notifs');
  else lerTexto('Comando não reconhecido: ' + cmd);
}

/* ══ NOTIFICAÇÕES ══ */
function markRead(el) {
  if(el.classList.contains('unread')) {
    el.classList.remove('unread');
    state.notifCount = Math.max(0, state.notifCount - 1);
    updateBadge();
  }
}
function clearAllNotifs() {
  document.querySelectorAll('.notif-item.unread').forEach(n=>n.classList.remove('unread'));
  state.notifCount = 0;
  updateBadge();
  showToast('✔ Todas as notificações marcadas como lidas!');
}
function updateBadge() {
  const badge = document.getElementById('bell-badge');
  badge.style.display = state.notifCount > 0 ? 'block' : 'none';
}

/* ══ TOAST ══ */
function showToast(msg) {
  let t = document.getElementById('toast');
  if(!t){ t = document.createElement('div'); t.id='toast'; t.style.cssText='position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:#2D5016;color:#fff;padding:12px 22px;border-radius:30px;font-size:14px;font-weight:700;z-index:200;box-shadow:0 4px 16px rgba(0,0,0,0.3);white-space:nowrap;'; document.body.appendChild(t); }
  t.textContent = msg; t.style.display = 'block';
  setTimeout(()=>{ t.style.display='none'; }, 2800);
}

/* ══ INIT ══ */
loadSettings();
updatePlantUI();
updateBadge();