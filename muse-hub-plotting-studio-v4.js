(function(){'use strict';
const root=document.getElementById('root');
const el=(tag,cls,txt)=>{let x=document.createElement(tag);if(cls)x.className=cls;if(txt!==undefined)x.textContent=String(txt);return x};
const put=(p,...items)=>{p.append(...items.filter(Boolean));return p};
const sec=(c,k)=>(c.sections?.[k]||[]).filter(x=>x.kind!=='break');
const txt=(v)=>String(v||'');
const safe=(url)=>/^https:\/\//i.test(url||'')?url:'';
const link=(t,url)=>{let a=el('a','',t);a.href=url;return a};
const url=(id,section)=>{let u=new URL(location.href);if(!/\/(?:dev|exec)(?:[?#]|$)/.test(u.pathname)&&KH_APP_URL)u=new URL(KH_APP_URL);u.searchParams.set('page','biography');if(id)u.searchParams.set('character',id);else u.searchParams.delete('character');if(section)u.searchParams.set('section',section);else u.searchParams.delete('section');return u.toString()};
function parseBirthDate(raw) {
  if (!raw) return null;

  let y, m, d;
  const value = String(raw).trim();
  let match;

  // YYYY-MM-DD, including ISO timestamps
  if ((match = value.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})(?:$|[T\s])/
  ))) {
    y = +match[1];
    m = +match[2];
    d = +match[3];
  }

  // MM/DD/YYYY or MM-DD-YYYY
  else if ((match = value.match(
    /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/
  ))) {
    m = +match[1];
    d = +match[2];
    y = +match[3];
  }

  // March 18, 1982 or Mar 18, 1982
  else if ((match = value.match(
    /^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/
  ))) {
    const months = [
      'january', 'february', 'march', 'april',
      'may', 'june', 'july', 'august',
      'september', 'october', 'november', 'december'
    ];
    const name = match[1].toLowerCase();
    const index = months.findIndex(
      month => month === name || month.slice(0, 3) === name
    );

    if (index < 0) return null;

    m = index + 1;
    d = +match[2];
    y = +match[3];
  }

  else {
    return null;
  }

  if (y < 1850 || y > 2150) return null;

  const date = new Date(y, m - 1, d);

  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }

  return { y, m, d };
}
function ageFromBirthday(raw){const b=parseBirthDate(raw);if(!b)return '';
 const now=new Date();let age=now.getFullYear()-b.y;if(now.getMonth()+1<b.m||(now.getMonth()+1===b.m&&now.getDate()<b.d))age--;return age>=0&&age<130?String(age):'';
}
function shortBirthday(raw){const b=parseBirthDate(raw);if(!b)return String(raw||'');return new Date(b.y,b.m-1,b.d).toLocaleDateString('en-US',{month:'short',day:'numeric'});}
function theme(p){document.documentElement.style.setProperty('--accent',/^#[0-9a-f]{6}$/i.test(p?.primary||'')?p.primary:'#b8572a');document.documentElement.style.setProperty('--light',/^#[0-9a-f]{6}$/i.test(p?.light||'')?p.light:'#f7f2ee');document.documentElement.style.setProperty('--dark',/^#[0-9a-f]{6}$/i.test(p?.dark||'')?p.dark:'#4d3530');document.body.style.setProperty('--accent',/^#[0-9a-f]{6}$/i.test(p?.primary||'')?p.primary:'#b8572a');document.body.style.setProperty('--light',/^#[0-9a-f]{6}$/i.test(p?.light||'')?p.light:'#f7f2ee');document.body.style.setProperty('--dark',/^#[0-9a-f]{6}$/i.test(p?.dark||'')?p.dark:'#4d3530')}
function pic(p){let d=el('div','portrait',(p.name||'?').slice(0,2).toLowerCase());if(safe(p.portrait)){let im=el('img');im.src=p.portrait;im.alt='Portrait of '+p.name;im.loading='lazy';im.decoding='async';im.onerror=()=>im.remove();d.replaceChildren(im)}return d}
function rich(parent,b){let runs=b.runs||[];if(!runs.length){parent.textContent=b.text||'';return parent}runs.forEach(r=>{let n=document.createTextNode(r.text||'');if(r.bold){let s=el('strong');s.append(n);n=s}if(r.italic){let i=el('em');i.append(n);n=i}if(safe(r.link)){let a=link('',r.link);a.target='_blank';a.rel='noopener noreferrer';a.append(n);n=a}parent.append(n)});return parent}
function paragraphs(holder,blocks){(blocks||[]).forEach(b=>{if(b.kind==='break')return;let n=el('p');if(b.kind==='bullet')n.style.paddingLeft='12px';rich(n,b);if(b.kind==='bullet')n.prepend('• ');holder.append(n)});return holder}
function numberCard(b,i){let d=el('div','number-card');put(d,el('span','number',String(i+1).padStart(2,'0')),rich(el('div'),typeof b==='string'?{text:b}:b));return d}
function numbered(target,items,limit){let expanded=false,place=el('div'),button=el('button','more');target.append(place);if(items.length>limit)target.append(button);function draw(){place.replaceChildren(...items.slice(0,expanded?items.length:limit).map((b,i)=>numberCard(b,i)));button.textContent=expanded?'show fewer':`show ${items.length-limit} more`;button.hidden=items.length<=limit}button.onclick=()=>{expanded=!expanded;draw()};draw()}
function cards(target,items){items.forEach(([label,value])=>{let d=el('div','item-card');put(d,el('div','key',label),el('div','value',value));target.append(d)})}
function group(blocks){let arr=[],cur=null;blocks.forEach(b=>{let t=txt(b.text).trim();if(!t)return;if((b.kind==='bullet'&&b.level===0)||(/^.{1,80}:$/.test(t)&&b.level===0)){let match=t.match(/^([^:]{1,80}):\s*(.+)$/);cur={label:match?match[1]:t.replace(/:$/,''),answers:match?[match[2]]:[]};arr.push(cur)}else if(cur)cur.answers.push(t);else arr.push({label:'',answers:[t]})});return arr}
function getGroups(blocks){return group(blocks).map(g=>[g.label,g.answers.join(' ').trim()||g.label]).filter(g=>g[1])}
function copyKhLink(value,button){
  function feedback(ok){button.textContent=ok?'copied!':'copy unavailable';setTimeout(()=>button.textContent='copy section link',1800)}
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(value).then(()=>feedback(true)).catch(()=>legacyCopy());}
  else legacyCopy();
  function legacyCopy(){const input=document.createElement('textarea');input.value=value;input.style.position='fixed';input.style.opacity='0';document.body.append(input);input.select();let ok=false;try{ok=document.execCommand('copy')}catch(e){}input.remove();feedback(ok);}
}

// Plotting Shortlist stores IDs only, on this browser. Every display is revalidated
// against live published available records; localStorage may be unavailable in an iframe.
const KH23_SHORTLIST_KEY='kh_musehub_shortlist_v1';
let kh23Fallback=[],kh23Catalog=null,kh23ShortlistView=null;
function kh23Stored(){try{const a=JSON.parse(localStorage.getItem(KH23_SHORTLIST_KEY)||'[]');return Array.isArray(a)?a.filter(x=>typeof x==='string'&&/^(connection|starter):[^:]+$/.test(x)).slice(0,100):[];}catch(e){return kh23Fallback.slice();}}
function kh23Store(items){kh23Fallback=items.slice();try{localStorage.setItem(KH23_SHORTLIST_KEY,JSON.stringify(items))}catch(e){}}
function kh23Key(type,id){return type+':'+id;}
function kh23Toggle(type,id){const key=kh23Key(type,id),next=kh23Stored();const index=next.indexOf(key);if(index<0){if(next.length>=100)return false;next.push(key)}else next.splice(index,1);kh23Store(next);kh23RefreshButtons();if(kh23ShortlistView&&kh23ShortlistView.open)kh23DrawSaved();return index<0;}
function kh23SaveButton(type,id){const b=el('button','kh23-save');b.type='button';b.dataset.key=kh23Key(type,id);b.onclick=()=>kh23Toggle(type,id);kh23SetButton(b);return b;}
function kh23SetButton(b){const saved=kh23Stored().includes(b.dataset.key);b.textContent=saved?'★ Saved':'☆ Save idea';b.setAttribute('aria-pressed',String(saved));b.title=saved?'Remove from my plotting shortlist':'Save to my plotting shortlist';}
function kh23RefreshButtons(){document.querySelectorAll('.kh23-save[data-key]').forEach(kh23SetButton);}
function kh23ShortlistPanel(){const panel=el('details','kh23-shortlist'),summary=el('summary','','☆ My Plotting Shortlist ('+kh23Stored().length+')'),area=el('div');panel.append(summary,area);kh23ShortlistView=panel;panel.addEventListener('toggle',()=>{summary.textContent='☆ My Plotting Shortlist ('+kh23Stored().length+')';if(panel.open)kh23DrawSaved()});panel._content=area;panel._label=summary;return panel;}
function kh23DrawSaved(){const panel=kh23ShortlistView;if(!panel)return;panel._label.textContent='☆ My Plotting Shortlist ('+kh23Stored().length+')';const area=panel._content;area.replaceChildren();const keys=kh23Stored();if(!keys.length){area.append(el('p','muted','Your shortlist is empty. Save an available connection or starter idea as you browse.'));return;}
 const clear=el('button','kh-button','Clear shortlist');clear.type='button';clear.onclick=()=>{if(confirm('Clear all saved ideas on this browser?')){kh23Store([]);kh23RefreshButtons();kh23DrawSaved();}};area.append(clear,el('p','muted','Saved here on this browser only. Saving an idea does not reserve it.'));
 function render(catalog){area.querySelectorAll('.kh23-saved').forEach(n=>n.remove());const lookup=new Map(catalog.map(r=>[kh23Key(r.type,r.id),r]));keys.forEach(key=>{const r=lookup.get(key),row=el('div','kh23-saved'),inner=el('div');if(r){const a=link(r.title,url(r.characterId,r.type==='starter'?'starters':'open-connections'));const u=new URL(a.href);u.searchParams.set('opportunity',r.id);a.href=u.toString();inner.append(a,el('p','',r.muse+' · '+r.category));}else{inner.append(el('strong','','Unavailable or unpublished idea'),el('p','muted','This saved item is no longer publicly available.'));}const del=el('button','kh23-shortcut','Remove');del.onclick=()=>{kh23Toggle(...key.split(':'));};row.append(inner,del);area.append(row);});}
 if(kh23Catalog)render(kh23Catalog);else{const note=el('p','muted','Loading available saved ideas…');area.append(note);google.script.run.withSuccessHandler(rows=>{kh23Catalog=rows||[];note.remove();render(kh23Catalog)}).withFailureHandler(e=>note.textContent='Unable to check saved ideas: '+e.message).kh23PublicOpportunityCatalog();}}
function kh23PlottingPreferences(pane){const holder=el('div');pane.prepend(holder);google.script.run.withSuccessHandler(info=>{holder.replaceChildren();const fields=[['Plotting Interests',info.interests],['Open To',info.openTo],['Not Seeking',info.notSeeking]].filter(x=>x[1]);if(!fields.length)return;const box=el('section','kh23-preferences');box.append(el('h3','','Plotting Preferences'));fields.forEach(([title,val])=>{const p=el('p');p.append(el('strong','',title+': '),document.createTextNode(val));box.append(p)});holder.append(box)}).withFailureHandler(()=>holder.remove()).kh23PublicPreferences(activeId);}
function kh23MatchPanel(){const wrapper=el('section','kh23-match');wrapper.append(el('h2','','Find Your Plotting Match'),el('p','muted','Choose a dynamic and discover available connections across my muses.'));
 const controls=el('div','kh23-match-controls'),category=el('select'),keyword=el('input'),button=el('button','kh-button primary','Find Matches');
 [['','Any dynamic'],['Friendship & Community','Friendship & Community'],['Career & Professional','Career & Professional'],['Creative & Hobbies','Creative & Hobbies'],['Romantic Possibilities','Romantic Possibilities'],['Everyday Connections','Everyday Connections'],['Other Connections','Other Connections'],['Surprise Me','Surprise Me']].forEach(([v,label])=>{let option=el('option','',label);option.value=v;category.append(option)});
 const lbl=el('label','','Connection type'),search=el('label','','Optional keyword');lbl.append(category);keyword.placeholder='e.g. rivalry, gardening, neighbor';search.append(keyword);controls.append(lbl,search,button);wrapper.append(controls);
 const result=el('div');wrapper.append(result);let last=[];
 button.onclick=()=>{button.disabled=true;result.replaceChildren(el('p','muted','Finding published, available connections…'));google.script.run.withSuccessHandler(data=>{button.disabled=false;last=data.results||[];result.replaceChildren(el('p','muted',data.count+' matching connections found. Showing up to 24 across different muses.'));if(!last.length)return;const grid=el('div','kh23-match-grid');last.forEach(r=>{const card=el('article','kh23-match-card');card.style.setProperty('--match-accent',r.primary);card.style.setProperty('--match-dark',r.dark);card.style.setProperty('--match-light',r.light);card.append(el('span','kh-eyebrow',r.category),el('h3','',r.title),el('p','',r.description),el('p','muted','With '+r.muse));const a=link('View connection & request',url(r.characterId,'open-connections'));const dest=new URL(a.href);dest.searchParams.set('opportunity',r.id);a.href=dest.toString();card.append(a,el('span','','  '),kh23SaveButton('connection',r.id));grid.append(card)});result.append(grid);}).withFailureHandler(e=>{button.disabled=false;result.replaceChildren(el('p','demo-message','Unable to find matches: '+e.message))}).kh23PublicPlottingMatches({category:category.value,keyword:keyword.value});};
 return wrapper;
}

function khOpUrl(item){const u=new URL(url(item.characterId,item.type==='starter'?'starters':'open-connections'));u.searchParams.set('opportunity',item.id);if(item.plot?.id)u.searchParams.set('plot',item.plot.id);return u.toString();}
function focusOpportunity(pane,type){const params=new URLSearchParams(location.search),id=INITIAL_OPPORTUNITY||params.get('opportunity');if(!id)return;const card=Array.from(pane.querySelectorAll('[data-opportunity-id]')).find(x=>x.dataset.opportunityId===id);if(!card)return;card.classList.add('kh-highlight');card.scrollIntoView({behavior:'smooth',block:'center'});if(!card.querySelector('.form')){let request=card.querySelector('button.request');if(request)request.click();}let selected=card.querySelector('.form select');if(selected&&(INITIAL_PLOT||params.get('plot')))selected.value=INITIAL_PLOT||params.get('plot');}
function navTabs(wrap,characterDefs,writingDefs){
  const switcher=el('div','group-switch'),choices=[['character','character'],['writing','connections & writing']];
  const groupButtons={},bar=el('nav','tabbar'),label=el('div','nav-label'),stage=el('div');
  const defs={character:characterDefs,writing:writingDefs},buttons={},panes={},loaded={};
  let currentId=null;
  bar.setAttribute('aria-label','Character sections');
  choices.forEach(([key,title])=>{const b=el('button','',title);b.type='button';b.onclick=()=>openGroup(key);switcher.append(b);groupButtons[key]=b;});
  wrap.append(switcher,label,bar,stage);
  function openGroup(key){
    Object.keys(groupButtons).forEach(k=>groupButtons[k].classList.toggle('active',k===key));
    label.textContent=key==='character'?'character details':'connections & writing';
    bar.replaceChildren();
    defs[key].forEach(([id,title,render])=>{
      if(!buttons[id]){let btn=el('button','',title);btn.type='button';btn.onclick=()=>activate(id);buttons[id]=btn;}
      bar.append(buttons[id]);
    });
    const first=defs[key][0];if(first)activate(first[0]);
  }
  function activate(id){
    let found=null;
    for(let key of ['character','writing'])for(let def of defs[key])if(def[0]===id)found=def;
    if(!found)return;
    currentId=id;
    const selectedGroup=writingDefs.some(d=>d[0]===id)?'writing':'character';
    if(!groupButtons[selectedGroup].classList.contains('active')){
      Object.keys(groupButtons).forEach(k=>groupButtons[k].classList.toggle('active',k===selectedGroup));
      label.textContent=selectedGroup==='character'?'character details':'connections & writing';
      bar.replaceChildren(...defs[selectedGroup].map(d=>buttons[d[0]]||makeButton(d)));
    }
    if(!panes[id]){const pane=el('section','tab-panel');pane.id='panel-'+id;const heading=el('h2','',found[1]);pane.append(heading);panes[id]=pane;stage.append(pane);}
    if(!loaded[id]){loaded[id]=true;try{found[2](panes[id]);}catch(err){panes[id].append(el('p','demo-message','Unable to display section: '+err.message));}}
    Object.keys(buttons).forEach(k=>buttons[k].classList.toggle('active',k===id));
    Array.from(stage.children).forEach(x=>x.classList.toggle('active',x===panes[id]));
    try{if(history.replaceState){const u=new URL(location.href);u.searchParams.set('section',id);history.replaceState(null,'',u.toString());}}catch(e){}
  }
  function makeButton(def){const b=el('button','',def[1]);b.type='button';b.onclick=()=>activate(def[0]);buttons[def[0]]=b;return b;}
  // Prefer the section received by doGet; iframe location.search may be empty.
  const initial=INITIAL_SECTION||new URLSearchParams(location.search).get('section');
  const all=[...characterDefs,...writingDefs];
  const def=all.find(d=>d[0]===initial)||characterDefs[0]||writingDefs[0];
  const initGroup=writingDefs.some(d=>d[0]===def?.[0])?'writing':'character';
  if(!def)return;
  openGroup(initGroup);
  if(def&&def[0]!==defs[initGroup][0][0])activate(def[0]);
  return {updateCharacterDefs(next){
    const previous=defs.character;
    previous.forEach(([id])=>{
      if(panes[id]){panes[id].remove();delete panes[id];}
      delete loaded[id];
      if(!next.some(d=>d[0]===id)){delete buttons[id];}
    });
    defs.character=next;
    const isWriting=defs.writing.some(d=>d[0]===currentId);
    if(isWriting)return; // Do not interrupt open requests or forms.
    const wanted=next.some(d=>d[0]===currentId)?currentId:next[0]?.[0];
    bar.replaceChildren();
    next.forEach(d=>bar.append(buttons[d[0]]||makeButton(d)));
    if(wanted)activate(wanted);
  }};
}
function labelValueFields(blocks){
  const fields=[];
  let current=null;
  (blocks||[]).forEach(block=>{
    const line=txt(block.text).trim();
    if(!line)return;
    const match=line.match(/^([^:]{1,90}):(?:\s*(.*))?$/);
    if(match){
      current={label:match[1].trim(),values:[]};
      // For on-the-same-line values, retain text without creating a second card.
      if(match[2]&&match[2].trim())current.values.push({text:match[2].trim(),kind:'paragraph'});
      fields.push(current);
    }else if(current){current.values.push(block)}
    else{fields.push({label:'',values:[block]})}
  });
  return fields;
}
function labeledFields(target,blocks,className){
  const grid=el('div',className||'glance-grid');
  labelValueFields(blocks).forEach(field=>{
    const card=el('div','glance-field');
    if(field.label)card.append(el('span','glance-field-label',field.label+':'));
    const value=el('div','glance-field-value');
    field.values.forEach(block=>{let para=el('p');rich(para,block);value.append(para)});
    card.append(value);grid.append(card);
  });
  target.append(grid);
}
// Known For also supports Google Docs where labels have no colon,
// labels are bold, or labels and descriptions occupy consecutive list lines.
function knownForFields(target,blocks){
  const rows=(blocks||[]).filter(b=>b&&b.kind!=='break'&&txt(b.text).trim());
  const fields=[];let current=null;
  function add(label,block){current={label:label,values:[]};fields.push(current);if(block)current.values.push(block)}
  rows.forEach((b,i)=>{
    const line=txt(b.text).trim(),next=rows[i+1];
    const colon=line.match(/^([^:]{1,95}):\s*(.*)$/);
    if(colon){add(colon[1].trim(),colon[2]?{...b,text:colon[2],runs:[{text:colon[2]}]}:null);return}
    // Bold label followed by non-bold description on the same Google Docs line.
    const runs=b.runs||[];let boldPrefix='';let consumed=0;
    for(const r of runs){if(r.bold){boldPrefix+=r.text||'';consumed+=(r.text||'').length}else break}
    const remainder=line.slice(consumed).replace(/^\s*[:—–-]\s*/, '').trim();
    if(boldPrefix.trim() && remainder && boldPrefix.trim().length<95){
      add(boldPrefix.trim().replace(/:$/,''),{...b,text:remainder,runs:[{text:remainder}]});return;
    }
    // Standalone labels: a short bold line, heading, or a short line before a longer description.
    const nextLine=next?txt(next.text).trim():'';
    const likelyLabel=(b.heading || (runs.length&&runs.every(r=>r.bold||!String(r.text||'').trim())) ||
      (line.length<=75 && nextLine.length>line.length+12 && !/[.!?]$/.test(line))) && !!next;
    if(likelyLabel){add(line.replace(/:$/,''));return}
    if(current)current.values.push(b);
    else add('',b);
  });
  const grid=el('div','glance-grid');
  fields.forEach(field=>{
    const card=el('div','glance-field');
    if(field.label)card.append(el('span','glance-field-label',field.label+':'));
    const content=el('div','glance-field-value');
    field.values.forEach(b=>{const para=el('p');rich(para,b);content.append(para)});
    card.append(content);grid.append(card);
  });
  target.append(grid);
}
function overviewPane(pane,p,c){
  // "At a Glance" lives in the Overview tab, and uses compact cards.
  // Preserve the original text (including bold/italics) from the Google Doc.
  const glance=sec(c,'glance').filter(b=>b && b.text && b.text.trim());
  if(glance.length){
    const section=el('section','overview-glance-cards');
    put(section,el('h3','','at a glance'));
    labeledFields(section,glance,'glance-grid');
    pane.append(section);
  }else{
    const note=el('p','muted','At a Glance details will appear here when added to the Google Doc.');
    pane.append(note);
  }
}
function personalityPane(pane,c){
  const raw=sec(c,'personality');
  let text=[],inTraits=false;
  raw.forEach(b=>{
    const label=txt(b.text).trim().toLowerCase();
    if(/^(positive traits?|negatives? traits?|negative traits?|positives?|negatives?)\s*:?$/.test(label)){
      inTraits=true;return;
    }
    if(/^(personality description|description|personality)\s*:?$/.test(label)){
      inTraits=false;return;
    }
    if(!inTraits)text.push(b);
  });
  // Some Docs do not give the traits their own labels. Prefer the prose
  // paragraphs when present; never show an empty Personality tab.
  const prose=text.filter(b=>b.kind==='paragraph' && b.text && b.text.trim().length>75);
  if(prose.length)text=prose;
  if(!text.length)text=raw.filter(b=>b.kind==='paragraph'&&b.text&&b.text.trim().length>75);
  if(!text.length)text=raw;
  const reader=pane.appendChild(el('div','reading'));reader.style.backgroundColor='var(--light)';paragraphs(reader,text);
}
function interestPane(pane,c){let grid=el('div','interests-grid');let all=sec(c,'interests');[['likes','likes'],['dislikes','dislikes'],['pet peeves','pet peeves']].forEach(([key,label])=>{let items=sec(c,key);if(!items.length&&all.length){let mode='';all.forEach(b=>{let n=txt(b.text).toLowerCase();if(/^likes?\b/.test(n))mode='likes';else if(/^dislikes?\b/.test(n))mode='dislikes';else if(/^pet peeves\b|^is irked by\b/.test(n))mode='pet peeves';if(mode===key&&b.kind!=='break'&&!/^likes?\s*:?$|^dislikes?\s*:?$|^pet peeves\s*:?$/i.test(b.text))items.push(b)})}let groupEl=el('section','interest-group');put(groupEl,el('h3','',label));items.filter(x=>x.level===0||x.kind!=='bullet').forEach((x,i)=>groupEl.append(numberCard(x,i)));grid.append(groupEl)});pane.append(grid)}
function establishedPane(pane,extras){
  const established=el('div','est-grid');
  (extras.established||[]).forEach(r=>{
    const box=el('div','est');
    put(box,el('h3','',r.name),el('div','relationship',r.category),el('p','',r.description));
    const button=el('button','request secondary','request a change');
    button.onclick=()=>requestForm(box,'established',{name:r.name});
    box.append(button);established.append(box);
  });
  pane.append(established);
  if(!extras.established?.length)pane.append(el('p','muted','No established relationships listed.'));
}
function khConnectionGroup(category){
  const t=txt(category).toLowerCase();
  if(t.includes('everyday'))return 'Everyday Connections';
  if(t.includes('friend')||t.includes('community')||t.includes('family')||t.includes('neighbor'))return 'Friendship & Community';
  if(t.includes('career')||t.includes('profession')||t.includes('work')||t.includes('business'))return 'Career & Professional';
  if(t.includes('creative')||t.includes('hobb')||t.includes('art')||t.includes('sport'))return 'Creative & Hobbies';
  if(t.includes('romanc')||t.includes('flirt')||t.includes('dating'))return 'Romantic Possibilities';
  return 'Other Connections';
}
function openConnectionsPane(pane,extras){
  kh23PlottingPreferences(pane);
  const categories=['Everyday Connections','Friendship & Community','Career & Professional','Creative & Hobbies','Romantic Possibilities','Other Connections'];
  const groups=categories.map(x=>[x,[]]);
  (extras.connections||[]).forEach(r=>{
    let label=khConnectionGroup(r.category);
    // Featured is now a legacy classification. Untagged legacy entries remain
    // in Other until the owner has reviewed the suggested migration.
    groups.find(x=>x[0]===label)[1].push(r);
  });
  groups.forEach(([heading,items])=>{
    if(!items.length)return;
    const group=el('details','kh-category-group');const title=el('summary','',heading+' · '+items.length+' connections');group.append(title);if(heading==='Everyday Connections')group.open=true;
    const grid=el('div','open-connections-grid');
    items.forEach(r=>{
    const card=el('article','open-connection-card');card.dataset.opportunityId=r.id;
    const header=el('div','open-connection-header');
    const heading=el('h3','',r.title||'connection');
    const badges=el('div','open-connection-badges');
    const rawStatus=String(r.status||'').trim();
    const capMatch=rawStatus.match(/^(\d+)\s*\/\s*(\d+)$/);
    const unavailable=!!(r.full||r.paused);
    const stateLabel=r.paused?'paused':r.full?'closed':/^closed$/i.test(rawStatus)?'closed':'open';
    badges.append(el('span','open-connection-badge '+(unavailable?'is-closed':'is-open'),stateLabel));
    if(capMatch){
      badges.append(el('span','open-connection-badge is-cap','cap '+capMatch[2]));
      badges.append(el('span','open-connection-badge is-count',capMatch[1]+'/'+capMatch[2]+' claimed'));
    } else if(rawStatus && !/^(open|closed|paused)$/i.test(rawStatus)){
      badges.append(el('span','open-connection-badge is-cap',rawStatus));
    }
    put(header,heading,badges);
    card.append(header);
    if(r.description)card.append(el('p','open-connection-description',r.description));
    if(r.plots?.length){
      const detail=el('details','open-plot-details');
      const summary=el('summary','','possible directions ('+r.plots.length+')');
      const list=el('div','open-plot-list');
      r.plots.forEach(x=>{
        const plot=el('div','open-plot-item');
        put(plot,el('strong','',x.title||'plot direction'),el('p','',x.description||''));
        list.append(plot);
      });
      put(detail,summary,list);card.append(detail);
    }
    const actions=el('div','open-connection-actions');
    if(!unavailable){
      const button=el('button','request','request this connection');
      button.onclick=()=>requestForm(card,'connection',r);
      actions.append(button);
    } else {
      actions.append(el('span','open-unavailable','requests unavailable'));
    }
    actions.append(kh23SaveButton('connection',r.id));
    card.append(actions);
    grid.append(card);
    });
    group.append(grid);pane.append(group);
  });
  khIdeaSubmission(pane,'connection');
  if(!(extras.connections||[]).length)pane.append(el('p','muted','No open connections listed.'));
}
function khStarterCallPanel(pane,starters){
 const channel=INITIAL_EVENT==='1'?'event':'individual';
 const container=el('section','kh-call-box kh22-call');const top=el('div','kh22-call-title'),title=el('h3','','Starter Calls'),badge=el('span','kh22-call-badge','Checking…'),availability=el('p','kh22-call-count','Checking available thread spots…'),meter=el('div','kh22-call-meter'),fill=el('div'),controls=el('div');
 meter.append(fill);top.append(title,badge);container.append(top,availability,meter,controls);pane.append(container);
 const eligible=(starters||[]).filter(r=>!/^closed$/i.test(r.availability||''));
 function refresh(){google.script.run.withSuccessHandler(state=>{
  badge.textContent=state.state==='closed'?'Closed':state.state==='full'?'Full':'Open';
  availability.textContent=state.state==='closed'?`Starter calls are currently closed · ${state.used} outstanding thread(s)`:state.state==='full'?`All ${state.capacity} thread spots are currently filled`:`${state.remaining} of ${state.capacity} thread spots available`;
  fill.style.width=(state.capacity?Math.min(100,state.used/state.capacity*100):0)+'%';controls.replaceChildren();
  if(!state.open)return;
  const reveal=el('button','request','Request a Starter'),form=el('form','kh-call-form');form.hidden=true;
  reveal.type='button';reveal.onclick=()=>{form.hidden=!form.hidden;reveal.textContent=form.hidden?'Request a Starter':'Hide request form';};controls.append(reveal,form);
  function field(label,kind,required){const holder=el('label','',label),input=el(kind==='textarea'?'textarea':'input');if(kind!=='textarea')input.type='text';input.required=!!required;input.maxLength=kind==='textarea'?2000:100;holder.append(input);form.append(holder);return input;}
  const writer=field('writer name','text',true),partner=field('character name','text',true);
  const modeWrap=el('label','','starter choice'),mode=el('select');[['surprise','surprise me'],['specific','choose an existing idea'],['custom','suggest my own']].forEach(([v,t])=>{const o=el('option','',t);o.value=v;mode.append(o)});modeWrap.append(mode);form.append(modeWrap);
  const specifics=el('label','','select a starter idea'),select=el('select');eligible.forEach(r=>{const o=el('option','',r.title);o.value=r.id;select.append(o)});specifics.append(select);form.append(specifics);
  const customWrap=el('label','','your starter idea'),custom=el('textarea');custom.maxLength=2000;customWrap.append(custom);form.append(customWrap);
  const notes=field('notes or preferences (optional)','textarea',false);notes.maxLength=1500;
  const trap=el('input');trap.name='website';trap.tabIndex=-1;trap.style.display='none';form.append(trap);
  const submit=el('button','request','Submit Starter Call'),feedback=el('p','form-status');submit.type='submit';form.append(submit,feedback);
  function update(){specifics.hidden=mode.value!=='specific';customWrap.hidden=mode.value!=='custom';select.required=mode.value==='specific';custom.required=mode.value==='custom';submit.disabled=mode.value==='specific'&&!eligible.length;}
  mode.onchange=update;update();
  form.onsubmit=ev=>{ev.preventDefault();submit.disabled=true;feedback.textContent='Submitting…';google.script.run.withSuccessHandler(r=>{form.replaceChildren(el('p','kh-call-confirm',r.message||'Request received.'));reveal.remove();refreshStatus();}).withFailureHandler(e=>{feedback.textContent=e.message||String(e);submit.disabled=false;}).kh22SubmitStarterCallUI({channel,characterId:activeId,writerName:writer.value,partnerName:partner.value,choice:mode.value,starterId:mode.value==='specific'?select.value:'',customIdea:mode.value==='custom'?custom.value:'',notes:notes.value,website:trap.value});};
 }).withFailureHandler(err=>availability.textContent='Unable to check starter calls: '+err.message).kh2RestoredStarterAvailability(activeId);}
 function refreshStatus(){google.script.run.withSuccessHandler(s=>{badge.textContent=s.state==='open'?'Open':s.state==='full'?'Full':'Closed';availability.textContent=s.state==='open'?`${s.remaining} of ${s.capacity} thread spots available`:`${s.used} outstanding · ${s.state}`;fill.style.width=(s.capacity?Math.min(100,s.used/s.capacity*100):0)+'%';}).kh22PublicCallState(activeId,channel);}
 refresh();
}
let khCurrentMuseName='',khStarterSeed='';
function khCharacterRoulette(pane){
  const currentName=khCurrentMuseName;
  const roulette=el('div','kh-roulette kh-starter-panel'),rouletteBody=el('div','kh-roulette-body');
  roulette.append(rouletteBody);const controls=el('div','kh-roulette-controls');rouletteBody.append(controls);
  function rouletteSelect(label,options){const holder=el('label','',label),select=el('select');options.forEach(([value,text])=>{let o=el('option','',text);o.value=value;select.append(o)});holder.append(select);controls.append(holder);return select;}
  const mode=rouletteSelect('opportunity type',[['all','connections & starters'],['connection','connections only'],['starter','starters only']]);
  // Character is fixed to the current profile, never drawn from another muse.
  const spin=el('button','kh-button primary','surprise me!'),output=el('div','');let prior='';rouletteBody.append(spin,output);
  spin.onclick=()=>{spin.disabled=true;output.replaceChildren(el('p','muted','finding an available opportunity…'));
    google.script.run.withSuccessHandler(res=>{spin.disabled=false;output.replaceChildren();if(!res.item){output.append(el('p','muted',res.message||'Nothing matches these filters.'));return;}
      const item=res.item;prior=item.key;const card=el('div','kh-result');put(card,el('div','kh-eyebrow',item.type+' · '+currentName),el('h3','',item.title),el('p','',item.description));
      if(item.plot){put(card,el('div','kh-eyebrow','possible direction: '+item.plot.title),el('p','',item.plot.description));}
      card.append(link('view opportunity & request ↗',khOpUrl(item)));output.append(card);
    }).withFailureHandler(err=>{spin.disabled=false;output.textContent='Unable to generate a plot: '+err.message;}).kh2RestoredRoulette({type:mode.value,characterId:activeId,excludeKey:prior});
  };
   // Optional starter builder, backed by active spreadsheet ingredients.
   const builder=el('details','kh-roulette'),bs=el('summary','','starter builder · optional prompt & setting'),bb=el('div','kh-roulette-body');
   builder.append(bs,bb);
   const buttons=el('div','row'),builderResult=el('div','kh-result');
   let ingredients=null,previous={};
   function spinIngredient(mode){
     function draw(rows){
       const category=x=>txt(x.category).toLowerCase().trim();
       const prompts=rows.filter(x=>/prompt|twist|scenario|conflict|starter/.test(txt(x.type).toLowerCase()));
       const locations=rows.filter(x=>/location|setting|place/.test(txt(x.type).toLowerCase()));
       const pick=(arr,key)=>{const pool=arr.filter(x=>x.text!==previous[key]);const candidates=pool.length?pool:arr;const item=candidates[Math.floor(Math.random()*candidates.length)]||null;if(item)previous[key]=item.text;return item};
       const p=mode==='setting'?null:pick(prompts,'prompt');
       let l=null;
       if(mode!=='prompt'){
         // Pair only matching category tags or generic locations; do not force an incompatible pairing.
         const suitable=p?locations.filter(x=>category(x)&&category(p)&&category(x)===category(p)):locations;
         l=pick(suitable,'location');
       }
       builderResult.replaceChildren();
       if(!p&&!l){builderResult.append(el('p','muted','No compatible active ingredients found in Roulette Ingredients. Try Prompt Only or update the sheet.'));return;}
       if(l)builderResult.append(el('div','kh-eyebrow','optional setting'),el('p','',l.text));
       if(p)builderResult.append(el('div','kh-eyebrow','prompt / twist'),el('p','',p.text));
       if(mode==='both'&&!l)builderResult.append(el('p','muted','No compatible location was found, so only the prompt is shown.'));
     }
     if(ingredients){draw(ingredients);return;}
     builderResult.replaceChildren(el('p','muted','Loading ingredients…'));
     google.script.run.withSuccessHandler(rows=>{ingredients=rows||[];draw(ingredients)}).withFailureHandler(err=>builderResult.textContent='Unable to load: '+err.message).kh2PublicIngredients();
   }
   [['prompt','spin prompt'],['setting','spin location'],['both','spin both']].forEach(([mode,label])=>{const b=el('button','kh-button',label);b.onclick=()=>spinIngredient(mode);buttons.append(b)});
   if(khStarterSeed){bb.prepend(el('p','kh-selected-idea','Selected idea: '+khStarterSeed));builder.open=true;}
   bb.append(el('p','muted','Locations are optional. Spin Both uses exact setting categories; an unmatched prompt is shown without a location.'),buttons,builderResult);
   rouletteBody.append(builder);pane.append(roulette);
}
function starterPane(pane,starters){
  khStarterCallPanel(pane,starters);
  const actions=el('div','kh22-actions'),rouletteBtn=el('button','','🎲 Plot Roulette  +'),ideaBtn=el('button','','✦ Have Your Own Idea?  +');
  rouletteBtn.type='button';ideaBtn.type='button';actions.append(rouletteBtn,ideaBtn);pane.append(actions);
  const rouletteBox=el('div','kh22-action-panel'),ideaBox=el('div','kh22-action-panel');rouletteBox.hidden=true;ideaBox.hidden=true;khCharacterRoulette(rouletteBox);khIdeaSubmission(ideaBox,'starter');ideaBox.querySelector('details.kh-own-idea').open=true;pane.append(rouletteBox,ideaBox);
  function switchPanel(which){const r=which==='roulette',box=r?rouletteBox:ideaBox,button=r?rouletteBtn:ideaBtn;const next=box.hidden;rouletteBox.hidden=true;ideaBox.hidden=true;rouletteBtn.setAttribute('aria-expanded','false');ideaBtn.setAttribute('aria-expanded','false');if(next){box.hidden=false;button.setAttribute('aria-expanded','true');}}
  rouletteBtn.onclick=()=>switchPanel('roulette');ideaBtn.onclick=()=>switchPanel('idea');
  if(khStarterSeed)switchPanel('roulette');
  const cats=[
    ['everyday','everyday encounters'],
    ['seasonal','seasonal & holiday'],
    ['situational','situational'],
    ['connection-building','connection-building']
  ];
  const groups=el('div','kh-starter-categories');pane.append(groups);
  if(!starters?.length){groups.append(el('p','muted','No thread starters available yet.'));return;}
  const normalizedCategory=r=>{
    const raw=String(r.category||'everyday').toLowerCase().trim();
    if(/season|holiday/.test(raw))return 'seasonal';
    if(/connection|building/.test(raw))return 'connection-building';
    if(/situation|unexpected/.test(raw))return 'situational';
    return 'everyday';
  };
  cats.forEach(([key,title])=>{
    const items=starters.filter(r=>normalizedCategory(r)===key);
    if(!items.length)return;
    const group=el('details','kh-starter-panel kh-starter-category');
    const header=el('summary','',title+' · '+items.length+' '+(items.length===1?'starter':'starters'));
    const grid=el('div','starter-grid');
    group.append(header,grid);
    items.forEach(r=>{
      const card=el('article','starter-card');card.dataset.opportunityId=r.id;
      const categoryText={everyday:'everyday encounter',seasonal:'seasonal & holiday',situational:'unexpected situation','connection-building':'connection-building'}[key];
      put(card,el('div','starter-category',categoryText),el('h3','',r.title),el('p','',r.description));
      const actions=el('div','starter-actions');
      if(!/^closed$/i.test(r.availability||'')){
        const button=el('button','request','request this starter');button.type='button';button.onclick=()=>requestForm(card,'starter',r);actions.append(button);
      }else actions.append(el('span','starter-unavailable','claimed / unavailable'));
      actions.append(kh23SaveButton('starter',r.id));card.append(actions);grid.append(card);
    });
    groups.append(group);
  });
}

// Shared per-page fetches: start once, and reuse the result (or in-flight call)
// when a visitor opens a tab. Recreated on each page visit, so refreshing always
// issues new Sheets reads. Request submissions still go directly to Apps Script.
let khWritingPreloads = { id: null, requests: {} };
function khRequestWritingSection(method,id,callback) {
  if(khWritingPreloads.id!==id)khWritingPreloads={id,requests:{}};
  let item=khWritingPreloads.requests[method];
  if(item){
    if(item.state==='done'){callback?.(item.data,'');return;}
    if(item.state==='error'){callback?.(null,item.error);return;}
    if(callback)item.listeners.push(callback);
    return;
  }
  item={state:'loading',data:null,error:'',listeners:callback?[callback]:[]};
  khWritingPreloads.requests[method]=item;
  google.script.run.withSuccessHandler(data=>{
    if(khWritingPreloads.id!==id)return;
    item.state='done';item.data=data;
    item.listeners.splice(0).forEach(fn=>fn(data,''));
  }).withFailureHandler(err=>{
    if(khWritingPreloads.id!==id)return;
    item.state='error';item.error=err?.message||String(err);
    item.listeners.splice(0).forEach(fn=>fn(null,item.error));
  })[method](id);
}
function loadHubSection(pane,method,renderer){
  const message=el('div','section-loading','loading…');pane.append(message);
  khRequestWritingSection(method,activeId,(data,error)=>{
    if(!message.isConnected)return;
    if(error){message.textContent='Unable to load this section: '+error;return;}
    message.remove();
    try{renderer(pane,data);focusOpportunity(pane,method==='kh2RestoredStarters'?'starter':'connection')}
    catch(err){pane.append(el('p','demo-message','Unable to display section: '+err.message))}
  });
}
// Share one network call and one Mini-Plots/Connections processing pass
// between the two writing tabs. Never cache submissions or availability across reloads.
let khConnBundle = { id: null, state: 'idle', data: null, error: '', listeners: [] };
function khPrimeConnections(id) {
  if(khConnBundle.id!==id)khConnBundle={id,state:'idle',data:null,error:'',listeners:[]};
  if(khConnBundle.state!=='idle')return;
  khConnBundle.state='loading';
  google.script.run.withSuccessHandler(data=>{
    if(khConnBundle.id!==id)return;
    khConnBundle.data=data;khConnBundle.state='done';
    khConnBundle.listeners.splice(0).forEach(fn=>fn(data,''));
  }).withFailureHandler(err=>{
    if(khConnBundle.id!==id)return;
    khConnBundle.error=err?.message||String(err);khConnBundle.state='error';
    khConnBundle.listeners.splice(0).forEach(fn=>fn(null,khConnBundle.error));
  }).kh2RestoredConnectionsBundle(id);
}
function khLoadConnectionGroup(pane,kind,renderer) {
  const id=activeId, message=el('div','section-loading','loading…');
  pane.append(message);
  function paint(bundle,error) {
    if(!message.isConnected)return;
    if(error){message.textContent='Unable to load this section: '+error;return;}
    message.remove();
    try{renderer(pane,bundle[kind]||[]);focusOpportunity(pane,kind==='open'?'connection':'established');}
    catch(err){pane.append(el('p','demo-message','Unable to display section: '+err.message));}
  }
  if(khConnBundle.id!==id)khConnBundle={id,state:'idle',data:null,error:'',listeners:[]};
  if(khConnBundle.state==='done'){paint(khConnBundle.data,'');return;}
  if(khConnBundle.state==='error'){paint(null,khConnBundle.error);return;}
  khConnBundle.listeners.push(paint);
  khPrimeConnections(id);
}

function threadPane(pane,extras){
  let entries=extras.threads||[];
  let section=el('div','thread-section');
  let summary=el('div','thread-summary');
  let total=el('div','thread-metric');
  put(total,el('div','metric-label','CURRENT THREAD COUNT'),el('strong','metric-number',String(entries.length)));
  let recent=el('div','thread-metric');
  put(recent,el('div','metric-label','MOST RECENT UPDATE'),el('strong','metric-date',latestThreadDate(entries)));
  put(summary,total,recent);section.append(summary);
  let tablewrap=el('div','thread-table-wrap'),table=el('table','thread-table'),head=el('tr');
  ['writer','character','type','status','date started','last update'].forEach(n=>{const th=el('th','',n);th.style.backgroundColor='var(--light)';th.style.color='var(--dark)';head.append(th)});
  table.append(put(el('thead'),head));let body=el('tbody');
  entries.forEach(r=>{
    let row=el('tr');
    put(row,el('td','',r.writer),el('td','',r.partner),el('td','',r.threadType||'—'));
    let status=el('td'),pill=el('span','status status-'+r.status.toLowerCase().replace(/ /g,'-'),r.status.toLowerCase());
    pill.style.backgroundColor='var(--light)';pill.style.color='var(--dark)';status.append(pill);row.append(status);
    put(row,el('td','',r.dateStarted||'—'),el('td','',r.lastUpdate||'—'));
    body.append(row);
  });table.append(body);tablewrap.append(table);section.append(tablewrap);
  if(!entries.length)section.append(el('p','muted','No threads listed yet.'));
  pane.append(section);
  const upcoming=el('section','kh22-upcoming'),title=el('h3','','Upcoming Threads'),list=el('div');upcoming.append(title,list);pane.append(upcoming);
  google.script.run.withSuccessHandler(rows=>{list.replaceChildren();if(!rows?.length){list.append(el('p','muted','No upcoming public threads listed yet.'));return;}
   rows.forEach(r=>{const card=el('article','kh22-upcoming-card');card.append(el('h4','',r.title),el('p','muted',r.status||'Planned'));if(r.description)card.append(el('p','',r.description));if(r.partner)card.append(el('p','', 'With: '+r.partner));if(safe(r.link)){const a=link('View thread',r.link);a.target='_blank';a.rel='noopener noreferrer';card.append(a);}list.append(card);});
  }).withFailureHandler(e=>list.textContent='Unable to load upcoming threads: '+e.message).kh22PublicUpcoming(activeId);
}
function latestThreadDate(entries){
  const months={jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11};
  let best=null,label='—';
  entries.forEach(r=>{let raw=(r.lastUpdate||'').trim();if(!raw)return;
    let m=raw.match(/^(\d{1,2})\s*([a-z]{3})\s*(\d{2}|\d{4})$/i);
    let d=null;
    if(m&&months[m[2].toLowerCase()]!==undefined){let year=+m[3];if(year<100)year+=2000;d=new Date(year,months[m[2].toLowerCase()],+m[1]);}
    else if(/^\d{4}-\d{2}-\d{2}$/.test(raw)){const p=raw.split('-').map(Number);d=new Date(p[0],p[1]-1,p[2]);}
    else if((m=raw.match(/^([a-z]{3})\s+(\d{1,2}),?\s+(\d{4})$/i))&&months[m[1].toLowerCase()]!==undefined){d=new Date(+m[3],months[m[1].toLowerCase()],+m[2]);}
    else if((m=raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/))){d=new Date(+m[3],+m[1]-1,+m[2]);}
    if(d&&!isNaN(d.getTime())&&(!best||d>best)){best=d;label=d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});}
  });return label;
}
function inputField(form,title,type,required){let label=el('label','',title),input=el(type==='textarea'?'textarea':'input');if(type!=='textarea')input.type=type||'text';input.required=!!required;label.append(input);form.append(label);return input}
function requestForm(parent,type,record){let old=parent.querySelector('.form');if(old){old.remove();return}let f=el('form','form');put(f,el('strong','',type==='starter'?'request starter':type==='established'?'suggest a change':'request connection'));let writer=inputField(f,'your writer name','text',true);writer.maxLength=100;let name=inputField(f,'your Kismet Harbor character','text',true);name.maxLength=100;let url=type==='starter'?inputField(f,'Tumblr URL (optional)','url',false):null;let mini=null;if(type==='connection'&&record.plots?.length){let label=el('label','','plot direction (or custom idea)'),sel=el('select');let opts=[['','other / custom idea'],...record.plots.map(x=>[x.id,x.title])];opts.forEach(([value,title])=>{let opt=el('option','',title);opt.value=value;sel.append(opt)});label.append(sel);f.append(label);mini=sel}let notes=inputField(f,type==='established'?'proposed change':'notes / custom plot idea','textarea',type==='established');notes.maxLength=type==='established'?2500:1500;let honeypot=inputField(f,'Website','text',false);honeypot.parentNode.style.display='none';honeypot.tabIndex=-1;let status=el('p','form-status');let b=el('button','request','submit request');b.type='submit';f.append(b,status);f.onsubmit=ev=>{ev.preventDefault();if(!name.value.trim()){status.textContent='Please enter your character name.';return}if(type==='connection'&&!mini?.value&&!notes.value.trim()){status.textContent='Choose a direction or provide notes.';return}b.disabled=true;status.textContent='Submitting…';let method=type==='starter'?'kh2RestoredStarterRequest':type==='established'?'kh2RestoredEstablishedChange':'kh2RestoredClaimRequest';let payload=type==='starter'?{starterId:record.id,characterId:activeId,writerName:writer.value,characterName:name.value,tumblrUrl:url.value,notes:notes.value,website:honeypot.value}:type==='established'?{characterId:activeId,establishedName:record.name,writerName:writer.value,characterName:name.value,proposedChanges:notes.value,website:honeypot.value}:{connectionId:record.id,characterId:activeId,writerName:writer.value,characterName:name.value,miniPlotId:mini?.value||'',notes:notes.value,website:honeypot.value};google.script.run.withSuccessHandler(r=>{status.textContent=r.message||'Request received';b.disabled=true}).withFailureHandler(err=>{status.textContent=err?.message||'Unable to submit';b.disabled=false})[method](payload)};parent.append(f)}
let activeId='';
function khIdeaSubmission(pane,defaultKind){
 const section=el('details','kh-own-idea kh-starter-panel');const summary=el('summary','','✦ Have Your Own Idea?');section.append(summary,el('p','muted','Suggest a connection, starter, or plot for '+khCurrentMuseName+'. Submissions are private.'));
 const f=el('form','kh-idea-form');const typeLabel=el('label','','Idea type'),type=el('select');[['general','Connection idea'],['starter','Starter idea'],['plot','General plot idea']].forEach(([value,title])=>{const o=el('option','',title);o.value=value;type.append(o)});type.value=defaultKind==='starter'?'starter':defaultKind==='plot'?'plot':'general';typeLabel.append(type);f.append(typeLabel);
 const writer=inputField(f,'Your Name / Alias','text',true),character=inputField(f,'Your Character','text',true),idea=inputField(f,'Your Idea','textarea',true);writer.maxLength=120;character.maxLength=120;idea.maxLength=2500;
 const website=inputField(f,'Website','text',false);website.parentNode.hidden=true;website.tabIndex=-1;website.autocomplete='off';
 const send=el('button','request','Send Idea'),msg=el('p','form-status');send.type='submit';f.append(send,msg);f.onsubmit=ev=>{ev.preventDefault();send.disabled=true;msg.textContent='Submitting…';google.script.run.withSuccessHandler(r=>{msg.textContent=r.message||'Idea sent for private review.';send.remove()}).withFailureHandler(err=>{msg.textContent=err.message;send.disabled=false}).kh2SubmitOriginalIdea({characterId:activeId,type:type.value,writer:writer.value,characterName:character.value,notes:idea.value,website:website.value})};section.append(f);pane.append(section);
}
// Each Google Doc may repeat the same warning in different lists or phrasing.
// Merge individual topics, preserving their first appearance and original words.
function khNormalizeWarnings_(warnings){
  const seen=new Set(),result=[];
  (warnings||[]).forEach(raw=>{
    String(raw||'').split(/[,;]|\s+&\s+/).forEach(part=>{
      const label=part.trim().replace(/^[•\-–]+\s*/,'').replace(/\s+/g,' ');
      const key=label.toLocaleLowerCase('en-US').replace(/[.!]+$/,'').trim();
      if(label&&key&&!seen.has(key)){seen.add(key);result.push(label);}
    });
  });
  return result;
}
let khCharacterNavigation=null;
function character(data,updateOnly=false){let p=data.profile,c=data.content||{sections:{},warnings:[],timeline:[],family:[]};activeId=p.id;khCurrentMuseName=p.name;if(!updateOnly){theme(p);root.replaceChildren();let museHeaderNav=el('div','topnav');put(museHeaderNav,el('strong','','kismet harbor · muse directory'),link('← all muses',url('')));kh22NavLink(museHeaderNav);khEAddNav(museHeaderNav);root.append(museHeaderNav);let hero=el('section','hero'),info=el('div');put(info,el('h1','',p.name),el('div','byline',[(ageFromBirthday(p.birthday)?ageFromBirthday(p.birthday)+' years old':''),shortBirthday(p.birthday),p.faceclaim].filter(Boolean).join(' · ')));let facts=el('div','facts');[['occupation',p.occupation],['home',p.neighborhood],['from',p.localStatus],['relationship',p.status],['education',p.education]].filter(x=>x[1]).forEach(([key,val])=>{let row=el('p');put(row,el('b','',key+': '),document.createTextNode(val));facts.append(row)});info.append(facts);put(hero,pic(p),info);root.append(hero);root.append(kh23ShortlistPanel());}
// Keep content warnings directly after the character header, even when
// biography data arrives later than the initial fast-loading profile shell.
const existingWarning=Array.from(root.children).find(child=>child.classList?.contains('warn'));
if(existingWarning)existingWarning.remove();
const normalizedWarnings=khNormalizeWarnings_(c.warnings);
if(normalizedWarnings.length){
  const warning=el('div','warn');
  put(warning,el('strong','','⚠ content warnings'),el('p','',normalizedWarnings.join(' · ')));
  const hero=root.querySelector('.hero');
  if(hero)hero.insertAdjacentElement('afterend',warning);
  else root.prepend(warning);
}
if(data.error)root.append(el('p','demo-message',data.error));
let tabs=[['overview','overview',pane=>overviewPane(pane,p,c)],['personality','personality',pane=>personalityPane(pane,c)],['headcanons','headcanons',pane=>numbered(pane,sec(c,'headcanons').filter(b=>b.level===0||b.kind!=='bullet'),10)],['interests','likes & dislikes',pane=>interestPane(pane,c)],['favorites','favorites',pane=>cards(put(pane,el('div','item-grid')).lastChild,getGroups(sec(c,'favorites')))],['known','known for',pane=>knownForFields(pane,sec(c,'known for'))],['feelings','what makes them…',pane=>{const grid=el('div','item-grid feeling-grid');pane.append(grid);cards(grid,getGroups(sec(c,'feelings')))}],['timeline','timeline',pane=>{let holder=el('div','timeline');pane.append(holder);numberedTimeline(holder,c.timeline||[])}],['family','family dynamics',pane=>{(c.family||[]).forEach(x=>{let d=el('details','accordion'),summary=el('summary','',x.title),inside=paragraphs(el('div','accordion-content'),x.blocks);put(d,summary,inside);pane.append(d)})}],['biography','biography',pane=>{let ctrl=el('div','reader-controls'),story=paragraphs(el('div','reading'),sec(c,'biography'));let size=18;let minus=el('button','','A−'),plus=el('button','','A+'),mode=el('button','','reading mode');minus.onclick=()=>story.style.setProperty('--reader-size',(size=Math.max(15,size-1))+'px');plus.onclick=()=>story.style.setProperty('--reader-size',(size=Math.min(24,size+1))+'px');mode.onclick=()=>{story.classList.toggle('zen');mode.setAttribute('aria-pressed',String(story.classList.contains('zen')))};put(ctrl,minus,plus,mode);put(pane,ctrl,story)}]];
function khGoalCategory(g){const c=txt(g.category).toLowerCase();if(/big goals|major|annual|development/.test(c))return 'Big Goals';if(/wanted/.test(c))return 'Wanted Connections';if(/universal/.test(c))return 'Universal Inspiration';return 'Plotting Possibilities';}
function khGoalCard(g){
  // Development goals are informational. Visitors request connections and starters elsewhere.
  const card=el('article','kh-goal-card');
  card.append(
    el('span','kh-goal-tag',g.category||'plotting idea'),
    el('h3','',g.title),
    el('p','',g.description)
  );
  if(g.opportunities){
    card.append(el('p','kh-goal-opportunities','Plot opportunities: '+g.opportunities));
  }
  card.append(el('small','',g.status||'Open'));
  return card;
}

function goalsPane(pane,rows){
 const data=rows||[],title=el('h3','','The Plotting Wishlist');pane.append(title);
 const years=[...new Set(data.map(g=>txt(g.year)).filter(Boolean))].sort().reverse();
 const toolbar=el('div','kh-wishlist-toolbar');toolbar.append(el('label','','Plotting Year'));
 const year=el('select');[['','All years'],...years.map(x=>[x,x])].forEach(([val,label])=>{let o=el('option','',label);o.value=val;year.append(o)});year.value=years.includes('2027')?'2027':years[0]||'';toolbar.append(year);pane.append(toolbar);
 const stage=el('div');pane.append(stage);
const groups=[['Big Goals','🎯'],['Universal Inspiration','✨']];
 function draw(){stage.replaceChildren();const selected=data.filter(g=>!year.value||!g.year||g.year===year.value);const big=selected.filter(g=>khGoalCategory(g)==='Big Goals'),completed=big.filter(g=>/^(complete|completed|done|achieved)$/i.test(txt(g.status))).length;
 const progress=el('div','kh-wishlist-progress');progress.append(el('strong','',(year.value||'All years')+' Plotting Progress'),el('span','',completed+' / '+big.length));const track=el('div','kh-progress-track');for(let i=0;i<big.length;i++){let x=el('div',i<completed?'complete':'');track.append(x)}progress.append(track);stage.append(progress);
 groups.forEach(([name,emoji])=>{let items=selected.filter(g=>khGoalCategory(g)===name);if(!items.length&&name!=='Universal Inspiration')return;const d=el('details','kh-category-group');const summary=el('summary','',emoji+' '+name+' · '+items.length+' ideas');d.append(summary);if(name==='Big Goals')d.open=true;
 if(name==='Universal Inspiration'){
  const space=el('div','kh-inspiration'),prompt=el('div','kh-inspiration-result','Find a new plot possibility.');const spin=el('button','kh-button primary','🎲 Give Me an Idea');spin.onclick=()=>{spin.disabled=true;google.script.run.withSuccessHandler(g=>{spin.disabled=false;prompt.replaceChildren();if(!g){prompt.textContent='No active universal ideas yet.';return}prompt.append(el('strong','',g.title),el('p','',g.description));}).withFailureHandler(err=>{spin.disabled=false;prompt.textContent=err.message}).kh2WishlistInspiration(activeId)};space.append(el('h3','','✦ A Little Plot Inspiration ✦'),prompt,spin);d.append(space);
 }
 const list=el('div','kh-goal-list');items.forEach(g=>list.append(khGoalCard(g)));d.append(list);stage.append(d);});
 if(!data.length)stage.append(el('p','muted','Add published goals to the Goals sheet to begin your Wishlist.'));
 }
 year.onchange=draw;draw();
}

const writingTabs=[
 ['open-connections','open connections',pane=>khLoadConnectionGroup(pane,'open',(p,rows)=>openConnectionsPane(p,{connections:rows}))],
 ['established-connections','established connections',pane=>khLoadConnectionGroup(pane,'established',(p,rows)=>establishedPane(p,{established:rows}))],
 
 ['threads','threads',pane=>loadHubSection(pane,'kh2RestoredThreads',(p,data)=>threadPane(p,data))],
 ['starters','starters',pane=>loadHubSection(pane,'kh2RestoredStarters',starterPane)]
];
// Custom Heading 1 sections in the Google Doc create tabs without code edits.
// Reserved keys remain managed by their dedicated layouts above.
(c.extraSections||[]).forEach(extra=>{
  if(!extra || !extra.id || !extra.title)return;
  if(!sec(c,extra.id).length)return;
  tabs.push([extra.id,extra.title,pane=>{
    const blocks=sec(c,extra.id);
    const listOnly=blocks.every(b=>b.kind==='bullet');
    if(listOnly)numbered(pane,blocks.filter(b=>b.level===0),10);
    else paragraphs(pane,blocks);
  }]);
});
// Only show Known For when the Google Doc actually contains entries.
tabs=tabs.filter(([id])=>id!=='known'||sec(c,'known for').some(b=>String(b.text||'').trim()));
if(data.biographyLoading){
  tabs=tabs.map(([id,title])=>[id,title,pane=>pane.append(el('p','section-loading','Loading biography from Google Docs…'))]);
}
if(updateOnly){
  khCharacterNavigation?.updateCharacterDefs(tabs);
}else{
  khCharacterNavigation=navTabs(root,tabs,writingTabs);
}
}
function numberedTimeline(holder,entries){let shown=false;let list=el('div'),btn=el('button','more');put(holder,list,btn);function draw(){list.replaceChildren();entries.slice(0,shown?entries.length:10).forEach(x=>{let ev=el('div','event'),card=el('article');put(card,el('strong','',x.title));paragraphs(card,x.blocks);ev.append(card);list.append(ev)});btn.hidden=entries.length<=10;btn.textContent=shown?'show fewer events':`show ${entries.length-10} more events`;}btn.onclick=()=>{shown=!shown;draw()};draw()}
function siteFooter(){const f=el('footer','site-footer');put(f,el('strong','','kismet harbor'),el('div','','muse directory · stories in progress'));return f;}
function directory(result){
  theme(null);root.replaceChildren();
  const profiles=result.profiles||[];
  const nav=el('div','topnav');nav.append(el('strong','','kismet harbor · muse directory'));kh22NavLink(nav);khEAddNav(nav);
  const heading=el('div','directory-head'),head=el('div');put(head,el('h1','','muse directory'),el('p','directory-subtitle','the people of kismet harbor'));
  const count=el('span','directory-count');put(heading,head,count);root.append(nav,heading);
  const search=el('input','search');search.type='search';search.placeholder='search muses, occupations, neighborhoods…';search.setAttribute('aria-label','Search muses');
  const actions=el('div','kh-directory-actions'),toggle=el('button','kh-filters-toggle','filters +'),clear=el('button','kh-button','clear all'),msg=el('span','kh-count');
  toggle.type='button';clear.type='button';put(actions,toggle,clear,msg);root.append(search,actions);root.append(kh23MatchPanel(),kh23ShortlistPanel());
  const area=el('div','kh-filter-area');area.hidden=true;const filters=el('div','kh-filter-grid');area.append(filters);root.append(area);
  function field(label,options){const wrapper=el('label','',label),select=el('select');options.forEach(([value,title])=>{const o=el('option','',title);o.value=value;select.append(o)});wrapper.append(select);filters.append(wrapper);return select;}
  const unique=(key)=>[...new Set(profiles.map(p=>String(p[key]||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  const neighborhood=field('neighborhood',[['','all neighborhoods'],...unique('neighborhood').map(v=>[v,v])]);
  const relationship=field('relationship status',[['','all statuses'],...unique('status').map(v=>[v,v])]);
  const age=field('age range',[['','any age'],['18-24','18–24'],['25-34','25–34'],['35-44','35–44'],['45-59','45–59'],['60-130','60+']]);
  const occupation=el('label','','occupation keyword'),job=el('input');job.type='search';job.placeholder='e.g. teacher';occupation.append(job);filters.append(occupation);
  const availLabel=el('label','kh-check'),available=el('input');available.type='checkbox';availLabel.append(available,document.createTextNode('only muses with available connections'));area.append(availLabel);
  let availableIds=null;
  available.onchange=()=>{if(available.checked&&!availableIds){msg.textContent='Checking connection availability…';google.script.run.withSuccessHandler(ids=>{availableIds=new Set(ids);draw();}).withFailureHandler(e=>{available.checked=false;msg.textContent='Unable to check availability: '+e.message}).kh2RestoredAvailableIds();}else draw();};
  [search,job].forEach(x=>x.addEventListener('input',draw));[neighborhood,relationship,age].forEach(x=>x.addEventListener('change',draw));
  toggle.onclick=()=>{area.hidden=!area.hidden;toggle.textContent=area.hidden?'filters +':'filters −'};
  clear.onclick=()=>{search.value='';job.value='';neighborhood.value='';relationship.value='';age.value='';available.checked=false;draw()};
  // All visitors see the same spotlight in a given ISO week. No manual maintenance.
  const sorted=profiles.slice().sort((a,b)=>a.id.localeCompare(b.id));
  if(sorted.length){
    const now=new Date(),utc=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()));
    utc.setUTCDate(utc.getUTCDate()+4-(utc.getUTCDay()||7));const year=utc.getUTCFullYear();const yearStart=new Date(Date.UTC(year,0,1));
    const week=Math.ceil((((utc-yearStart)/86400000)+1)/7),featured=sorted[((year*53+week)%sorted.length)];
    const spot=el('section','kh-spotlight');spot.style.setProperty('--spot-main',featured.primary);spot.style.setProperty('--spot-light',featured.light);spot.style.setProperty('--spot-dark',featured.dark);
    const image=el('div','kh-spot-image');if(safe(featured.portrait)){const img=el('img');img.src=featured.portrait;img.alt='Portrait of '+featured.name;image.append(img)}
    const details=el('div','kh-spot-text');put(details,el('span','kh-eyebrow',"this week's muse spotlight"),el('h3','',featured.name));
    details.append(el('div','',[featured.occupation,featured.neighborhood].filter(Boolean).join(' · ')));details.append(link('explore muse ↗',url(featured.id)));put(spot,image,details);root.append(spot);
  }
  const grid=el('div','directory');root.append(grid);
  function draw(){
    grid.replaceChildren();const needle=search.value.toLowerCase().trim(),jobNeedle=job.value.toLowerCase().trim();
    const filtered=profiles.filter(p=>{
      if(needle&&![p.name,p.occupation,p.neighborhood,p.faceclaim].join(' ').toLowerCase().includes(needle))return false;
      if(neighborhood.value&&p.neighborhood!==neighborhood.value)return false;
      if(relationship.value&&p.status!==relationship.value)return false;
      if(jobNeedle&&!String(p.occupation||'').toLowerCase().includes(jobNeedle))return false;
      if(age.value){const n=Number(ageFromBirthday(p.birthday));const [min,max]=age.value.split('-').map(Number);if(!n||n<min||n>max)return false;}
      if(available.checked&&availableIds&&!availableIds.has(p.id))return false;
      return true;
    });
    filtered.forEach(p=>{
      const card=link('',url(p.id));card.style.setProperty('--accent',p.primary||'#b8572a');card.style.setProperty('--dark',p.dark||'#4d3530');card.style.setProperty('--light',p.light||'#f7f2ee');
      const body=el('div','body');put(body,el('h3','',p.name));const n=ageFromBirthday(p.birthday);
      const subtitle=[n?n+' years old':'',p.faceclaim].filter(Boolean).join(' · ');if(subtitle)body.append(el('p','directory-meta',subtitle));
      if(p.occupation)body.append(el('p','directory-detail',p.occupation));if(p.neighborhood)body.append(el('p','directory-detail',p.neighborhood));
      const view=el('span','directory-link');put(view,el('span','','view muse'),el('span','','↗'));body.append(view);put(card,pic(p),body);grid.append(card);
    });
    count.textContent=filtered.length+' of '+profiles.length+' muses';msg.textContent=available.checked&&!availableIds?'Checking availability…':filtered.length+' matching';
    if(!filtered.length)grid.append(el('p','muted','No muses match those filters. Try clearing them.'));
  }
  draw();root.append(siteFooter());
}
function kh22HubUrl(){const u=new URL(url(''));u.searchParams.set('page','writing');u.searchParams.delete('character');u.searchParams.delete('section');return u.toString();}
function kh22NavLink(nav){khStudioNav(nav);const a=link('Threads',khTDUrl());a.className='pill';nav.append(a);google.script.run.withSuccessHandler(r=>{if(r.published){const a=link('Writing Hub',kh22HubUrl());a.className='pill';nav.append(a);}}).kh22PublicWritingHubVisibility();}
function kh22WritingPage(){
 root.replaceChildren();theme(null);const header=el('div','kh22-writing-head');header.append(el('h1','','Writing Hub'),link('← Muse Directory',url('')));root.append(header);
 const loading=el('p','muted','Loading public writing opportunities…');root.append(loading);
 google.script.run.withSuccessHandler(data=>{
  loading.remove();if(!data.published){root.append(el('p','empty','The Writing Hub is not currently published.'));return;}
  header.querySelector('h1').textContent=data.title||'Writing Hub';if(data.description)root.append(el('p','directory-subtitle',data.description));
  const people=data.participants||[],open=people.filter(p=>p.state.open),spots=people.reduce((n,p)=>n+(p.state.remaining||0),0);
  const stats=el('div','thread-summary');[['Participating muses',people.length],['Open for calls',open.length],['Available spots',spots]].forEach(([name,value])=>{const card=el('div','thread-metric');card.append(el('div','metric-label',name),el('strong','metric-number',value));stats.append(card)});root.append(stats);
  if(!people.length){root.append(el('p','muted','No participating muses have been published for this event.'));return;}
  const filter=el('select');[['all','all participating muses'],['open','accepting starter calls'],['upcoming','with upcoming threads']].forEach(([value,text])=>{const o=el('option','',text);o.value=value;filter.append(o)});filter.style.maxWidth='360px';filter.style.margin='16px 0';root.append(filter);
  const grid=el('div','kh22-writing-grid');root.append(grid);
  function draw(){grid.replaceChildren();const chosen=people.filter(p=>filter.value==='all'||filter.value==='open'&&p.state.open||filter.value==='upcoming'&&p.upcoming.length);
   chosen.forEach(p=>{const card=el('article','kh22-writing-card');card.style.setProperty('--w-accent',p.primary);card.style.setProperty('--w-light',p.light);card.style.setProperty('--w-dark',p.dark);
    card.append(el('h3','',p.name),el('p','kh22-status',p.state.status.toUpperCase()),el('p','',p.state.open?`${p.state.remaining} of ${p.state.capacity} starter spots available`:`Starter calls ${p.state.status}`));
    const eventUrl=new URL(url(p.id,'starters'));eventUrl.searchParams.set('event','1');const dest=link('View character & request',eventUrl.toString());card.append(dest);
    const starterDetails=el('details'),ss=el('summary','','Available starter ideas ('+p.starters.length+')');starterDetails.append(ss);
    if(p.starters.length)p.starters.forEach(st=>{const block=el('p');const a=link(st.title,eventUrl.toString());block.append(a);starterDetails.append(block)});else starterDetails.append(el('p','muted','No starter cards currently listed.'));
    card.append(starterDetails);
    if(p.upcoming.length){const upcoming=el('details');upcoming.append(el('summary','','Upcoming public threads ('+p.upcoming.length+')'));p.upcoming.forEach(t=>upcoming.append(el('p','',t.title)));card.append(upcoming)}
    grid.append(card);});if(!chosen.length)grid.append(el('p','muted','No muses match this filter.'));
  }filter.onchange=draw;draw();
  const threadArea=el('section','kh22-upcoming');threadArea.append(el('h2','','Public Thread Directory'),el('p','muted','Threads that have been deliberately marked Public in the Threads sheet. This list includes all published muses, not only event participants.'));
  const search=el('input','search');search.placeholder='Search muse, partner, or thread title';search.setAttribute('aria-label','Search public threads');
  const statuses=el('select');statuses.style.maxWidth='240px';[['','all statuses'],...Array.from(new Set((data.threads||[]).map(r=>r.status).filter(Boolean))).sort().map(x=>[x,x])].forEach(([v,t])=>{const opt=el('option','',t);opt.value=v;statuses.append(opt)});
  threadArea.append(search,statuses);
  const list=el('div','thread-table-wrap');threadArea.append(list);root.append(threadArea);
  function renderThreads(){list.replaceChildren();const matches=(data.threads||[]).filter(t=>{const needle=search.value.toLowerCase().trim();return (!needle||[t.muse,t.partner,t.title,t.type].join(' ').toLowerCase().includes(needle))&&(!statuses.value||t.status===statuses.value)});
   if(!matches.length){list.append(el('p','muted','No public threads match this selection.'));return;}
   const tbl=el('table','thread-table'),head=el('thead'),tr=el('tr');['muse','with','thread','status','last update'].forEach(t=>tr.append(el('th','',t)));head.append(tr);tbl.append(head);
   const body=el('tbody');matches.forEach(t=>{const r=el('tr'),muse=el('td'),a=link(t.muse,url(t.museId,'threads'));muse.append(a);r.append(muse,el('td','',t.partner||'—'));const title=el('td');if(t.link){const linkOut=link(t.title||t.type||'view thread',t.link);linkOut.target='_blank';linkOut.rel='noopener noreferrer';title.append(linkOut)}else title.textContent=t.title||t.type||'—';r.append(title,el('td','',t.status||'—'),el('td','',t.updated||'—'));body.append(r)});tbl.append(body);list.append(tbl);
  }search.oninput=renderThreads;statuses.onchange=renderThreads;renderThreads();root.append(siteFooter());
 }).withFailureHandler(e=>loading.textContent='Unable to load Writing Hub: '+e.message).kh22PublicWritingHub();
}

// Dedicated, optional public event page. Does not alter any muse card or regular starter.
function khEEventPage(){
  theme(null);root.replaceChildren();
  const nav=el('div','topnav');nav.append(el('strong','','kismet harbor · the gilded hour'),link('← Muse Directory',url('')));root.append(nav);
  const head=el('div','khe-head');head.append(el('div','','THE GILDED HOUR · NEW YEAR’S EVE 2026'),el('h1','','Masquerade Starter Board'),el('p','','Starlight Ridge Country Club · December 31, 2026'));root.append(head);
  const stage=el('div');stage.append(el('p','muted','Checking event availability…'));root.append(stage);
  let chosenMuse='',query='',category='',ticketSearch='';
  const field=(f,title,tag='input',max=120,required=false)=>{const label=el('label','',title),input=el(tag);if(tag==='input')input.type='text';input.required=required;input.maxLength=max;label.append(input);f.append(label);return input;};
  function selectField(f,title,choices,initial){const label=el('label','',title),select=el('select');choices.forEach(([value,text])=>{const o=el('option','',text);o.value=value;select.append(o)});select.value=initial;label.append(select);f.append(label);return select;}
  // All event threads share one exclusive list of published, unreserved prompts.
  // A pairing may retain its own current prompt even though nobody else can select it.
  let liveAvailablePrompts=[];
  function preferenceFields(f,museName,partnerName,initial,defaultIdea,forcePrompt){
    const first=selectField(f,'Who writes the opening starter?', [['undecided','Undecided'],['muse',museName+' starts'],['partner',partnerName+' starts']],initial?.starterChoice||'undecided');
    const idea=selectField(f,'Starter idea preference', [['none','No idea preference'],['listed','Use a listed event prompt'],['suggest','Suggest my own idea']],initial?.ideaPreference||defaultIdea);
    const currentId=initial?.selectedPromptId||forcePrompt||'';
    const promptLabel=el('label','','Choose an available Gilded Hour prompt'),prompt=el('select');promptLabel.append(prompt);f.append(promptLabel);
    const description=el('p','muted');f.append(description);
    const promptChoices=liveAvailablePrompts.slice();
    if(currentId&&!promptChoices.some(p=>p.id===currentId))promptChoices.unshift({id:currentId,title:initial?.selectedPromptTitle||'Your currently reserved prompt',description:initial?.selectedPromptDescription||'This prompt is already assigned to this thread.'});
    [['','Select a prompt…'],...promptChoices.map(p=>[p.id,p.title])].forEach(([value,label])=>{const option=el('option','',label);option.value=value;prompt.append(option)});
    prompt.value=currentId;
    const label=el('label','','Your suggested scene / idea'),suggested=el('textarea');suggested.maxLength=2000;suggested.value=initial?.suggestedIdea||'';label.append(suggested);f.append(label);
    const change=()=>{
      promptLabel.hidden=idea.value!=='listed';description.hidden=idea.value!=='listed';prompt.required=idea.value==='listed';
      label.hidden=idea.value!=='suggest';suggested.required=idea.value==='suggest';
      const selected=promptChoices.find(p=>p.id===prompt.value);
      description.textContent=selected?.description||'Choosing an idea reserves it exclusively for this pairing or claim.';
    };
    idea.onchange=change;prompt.onchange=change;change();
    return {values:()=>({starterChoice:first.value,ideaPreference:idea.value,selectedPromptId:idea.value==='listed'?prompt.value:'',suggestedIdea:idea.value==='suggest'?suggested.value:''}),updateNames:(m,p)=>{first.options[1].textContent=m+' starts';first.options[2].textContent=p+' starts';}};
  }
  function editableCard(card,kind,item,muse,partner){
    const detail=el('details','khe-edit'),summary=el('summary','','Assign starter / change idea preferences'),form=el('form','khe-form');detail.append(summary,form);
    const fields=preferenceFields(form,muse,partner,item,kind==='ticket'?'none':'listed');
    const writer=field(form,'Your writer name / alias','input',100,true);
    const hp=field(form,'Website','input',100,false);hp.parentElement.hidden=true;hp.tabIndex=-1;
    const save=el('button','','Save preferences'),feedback=el('p','form-status');save.type='submit';form.append(save,feedback);
    form.onsubmit=e=>{e.preventDefault();save.disabled=true;feedback.textContent='Saving…';google.script.run.withSuccessHandler(r=>{feedback.textContent=r.message;load();}).withFailureHandler(err=>{feedback.textContent=err.message||String(err);save.disabled=false;}).khEUpdatePreferences({kind,id:item.id,writerName:writer.value,website:hp.value,...fields.values()});};
    card.append(detail);
  }
  function load(){google.script.run.withSuccessHandler(draw).withFailureHandler(err=>stage.replaceChildren(el('p','demo-message',err.message||String(err)))).khEPublicBoard();}
  function draw(d){
    stage.replaceChildren();if(!d.published){stage.append(el('p','empty','The event starter board has not been revealed yet.'));return;}
    const eligible=(d.muses||[]).filter(m=>m.open),available=d.available||[],claimed=d.claimed||[],tickets=d.goldenTickets||[];
    liveAvailablePrompts=available;
    stage.append(el('p','muted',`${available.length} unclaimed prompts · ${d.openSpots} open starter spots across ${d.openMuses} characters. Golden Ticket matches are guaranteed and never use these spots.`));
    stage.append(el('h2','khe-heading','Characters Accepting Event Threads'));
    const row=el('div','khe-muses');stage.append(row);
    (d.muses||[]).forEach(m=>{const b=el('button','khe-muse');b.type='button';b.style.setProperty('--khe-accent',m.primary);b.style.setProperty('--khe-light',m.light);b.append(el('strong','',m.name),el('small','',m.open?`${m.remaining} of ${m.capacity} spots available`:'Fully claimed'));b.disabled=!m.open;b.classList.toggle('selected',chosenMuse===m.id);b.onclick=()=>{chosenMuse=chosenMuse===m.id?'':m.id;draw(d);};row.append(b);});
    if(chosenMuse&&!eligible.some(m=>m.id===chosenMuse))chosenMuse='';
    // Only the 34 imported Golden Tickets involving this Muse Hub's own characters.
    const goldenHeading=el('h2','khe-heading','🎟 Golden Ticket Pairings');stage.append(goldenHeading,el('p','muted','Assigned matches for my muses only. Each pairing is guaranteed and separate from event starter caps. Both character names are shown below.'));
    const tSearch=el('input','khe-search');tSearch.type='search';tSearch.placeholder='Search Golden Ticket by character, partner, writer, or ticket number…';tSearch.value=ticketSearch;stage.append(tSearch);
    const tGrid=el('div','khe-card-grid');stage.append(tGrid);
    const renderTickets=()=>{tGrid.replaceChildren();const filtered=tickets.filter(t=>!ticketSearch||[t.id,t.muse,t.partner,t.partnerWriter].join(' ').toLowerCase().includes(ticketSearch.toLowerCase()));
      filtered.forEach(t=>{const card=el('article','khe-card khe-ticket');card.append(el('div','khe-cat',t.id+' · GOLDEN TICKET'),el('h3','khe-pair-title',t.muse+' × '+t.partner),el('p','muted','Partner writer: '+(t.partnerWriter||'—')),el('p','khe-choice','Opening starter: '+(t.starterName||'Undecided')));
        card.append(el('p','muted','Idea preference: '+(t.ideaPreference==='suggest'?'Own idea suggested':t.ideaPreference==='listed'?'Listed prompt: '+(t.selectedPromptTitle||'Selected idea'):'No idea preference')));if(t.selectedPromptDescription&&t.ideaPreference==='listed')card.append(el('p','',t.selectedPromptDescription));if(t.suggestedIdea)card.append(el('p','',t.suggestedIdea));editableCard(card,'ticket',t,t.muse,t.partner);tGrid.append(card);});
      if(!filtered.length)tGrid.append(el('p','empty',tickets.length?'No pairings match your search.':'Golden Ticket pairings have not been published yet.'));};tSearch.oninput=()=>{ticketSearch=tSearch.value;renderTickets();};renderTickets();
    stage.append(el('h2','khe-heading','Available Event Starters'));
    const filters=el('div','khe-filter'),search=el('input');search.type='search';search.placeholder='Search prompts…';search.value=query;
    const cats=[...new Set(available.map(p=>p.category))].sort(),type=el('select');[['','All categories'],...cats.map(c=>[c,c])].forEach(([v,t])=>{const opt=el('option','',t);opt.value=v;type.append(opt)});type.value=category;
    const museFilter=el('select');[['','All open characters'],...eligible.map(m=>[m.id,m.name+' · '+m.remaining+' open'])].forEach(([v,t])=>{const opt=el('option','',t);opt.value=v;museFilter.append(opt)});museFilter.value=chosenMuse;museFilter.onchange=()=>{chosenMuse=museFilter.value;draw(d)};filters.append(search,type,museFilter);stage.append(filters);
    const grid=el('div','khe-card-grid');stage.append(grid);
    const renderPrompts=()=>{grid.replaceChildren();const filtered=available.filter(p=>(!category||p.category===category)&&(!query||[p.title,p.category,p.description].join(' ').toLowerCase().includes(query.toLowerCase())));
      filtered.forEach(p=>{const card=el('article','khe-card');card.append(el('span','khe-cat',p.category),el('h3','',p.title),el('p','',p.description));
        if(!eligible.length){card.append(el('small','muted','All event starter spots are filled.'));grid.append(card);return;}
        const btn=el('button','','Claim this starter');btn.type='button';card.append(btn);
        btn.onclick=()=>{const old=card.querySelector('.khe-form');if(old){old.remove();return;}const form=el('form','khe-form');form.append(el('p','muted','One confirmed claim reserves this prompt and one event spot. You can choose who starts now or leave it undecided.'));
          const choose=selectField(form,'Choose an available muse',eligible.map(m=>[m.id,m.name+' — '+m.remaining+' spots']),chosenMuse||eligible[0].id);
          const writer=field(form,'Your writer name','input',100,true),partner=field(form,'Your Kismet Harbor character','input',120,true),notes=field(form,'Optional notes','textarea',1000,false);
          const pf=preferenceFields(form,eligible.find(m=>m.id===choose.value)?.name||'My muse','Partner character',{selectedPromptId:p.id,selectedPromptTitle:p.title},'listed',p.id);
          const sync=()=>pf.updateNames(eligible.find(m=>m.id===choose.value)?.name||'My muse',partner.value.trim()||'Partner character');choose.onchange=sync;partner.oninput=sync;
          const hp=field(form,'Website','input',100,false);hp.parentElement.hidden=true;hp.tabIndex=-1;
          const send=el('button','','Confirm claim'),feedback=el('p','form-status');send.type='submit';form.append(send,feedback);
          form.onsubmit=e=>{e.preventDefault();if(!confirm('Claim “'+p.title+'” with '+(eligible.find(m=>m.id===choose.value)?.name||'this muse')+'?'))return;send.disabled=true;feedback.textContent='Confirming claim…';google.script.run.withSuccessHandler(r=>{alert(r.message);chosenMuse='';load();}).withFailureHandler(err=>{feedback.textContent=(err.message||String(err))+' Refresh the board if availability changed.';send.disabled=false;}).khEClaimStarter({starterId:p.id,characterId:choose.value,writerName:writer.value,characterName:partner.value,notes:notes.value,website:hp.value,...pf.values()});};card.append(form);};grid.append(card);});
      if(!filtered.length)grid.append(el('p','empty',!available.length?'No event starters are currently available.':'No prompts match these filters.'));};
    search.oninput=()=>{query=search.value;renderPrompts()};type.onchange=()=>{category=type.value;renderPrompts()};renderPrompts();
    const prior=el('details','khe-claimed');prior.append(el('summary','','Already Claimed ('+claimed.length+')'));
    const claimedGrid=el('div','khe-card-grid');prior.append(claimedGrid);
    claimed.forEach(c=>{const card=el('article','khe-card');card.append(el('span','khe-cat',c.category),el('h3','',c.selectedPromptTitle||c.title),el('p','khe-pair-title',c.muse+' × '+c.partner),el('p','khe-choice','Opening starter: '+(c.starterName||'Undecided')),el('p','muted','Idea preference: '+(c.ideaPreference==='suggest'?'Own idea suggested':c.ideaPreference==='none'?'No idea preference':'Listed prompt: '+(c.selectedPromptTitle||'Selected idea'))));if(c.selectedPromptDescription&&c.ideaPreference==='listed')card.append(el('p','',c.selectedPromptDescription));if(c.suggestedIdea)card.append(el('p','',c.suggestedIdea));editableCard(card,'claim',c,c.muse,c.partner);claimedGrid.append(card);});stage.append(prior);
  }
  load();
}
function khEAddNav(nav){
  google.script.run.withSuccessHandler(state=>{if(!state?.published)return;const a=link('The Gilded Hour',khEPageUrl());a.className='pill';nav.append(a);}).withFailureHandler(()=>{}).khEPublicVisibility();
}
function khEPageUrl(){const u=new URL(url(''));u.searchParams.set('page','event-starters');u.searchParams.delete('character');u.searchParams.delete('section');return u.toString();}


// Public, shareable writing tracker. Refreshed from Google Sheets on each page visit.
function khTDUrl(){const u=new URL(url(''));u.searchParams.set('page','threads');u.searchParams.delete('character');u.searchParams.delete('section');return u.toString();}
function khTDPage(){
 theme(null);root.replaceChildren();const nav=el('div','topnav');nav.append(el('strong','','kismet harbor · the writing directory'),link('← Muse Directory',url('')));root.append(nav);
 root.append(el('h1','','the thread directory'),el('p','khtd-intro','All current threads in one place. Request a thread when a muse has an open spot, or discuss an existing thread. Completed and archived threads are hidden.'));
 const stage=el('div');stage.append(el('p','muted','Loading current threads…'));root.append(stage);
 const state={muse:'all',q:'',status:'all',type:'all',panel:'',thread:null,addMuse:''};
 function fail(e){stage.replaceChildren(el('p','khtd-error',e.message||String(e)));}
 function load(){google.script.run.withSuccessHandler(draw).withFailureHandler(fail).khTDPublicDirectory();}
 function setOptions(sel,options,value){sel.replaceChildren();options.forEach(([v,text])=>{const o=el('option','',text);o.value=v;sel.append(o)});sel.value=value;}
 function formField(form,title,element){const label=el('label');label.append(el('span','',title),element);form.append(label);return element;}
 function submission(form,method,payload,after){const action=el('button','khtd-control khtd-primary','Submit');action.type='submit';const result=el('div','khtd-muted');form.append(action,result);form.onsubmit=e=>{e.preventDefault();action.disabled=true;result.textContent='Submitting…';google.script.run.withSuccessHandler(r=>{result.textContent=r?.message||'Saved';if(after)after()}).withFailureHandler(err=>{action.disabled=false;result.textContent=err.message||String(err);result.className='khtd-error'})[method](payload());};}
 function draw(data){stage.replaceChildren();const muses=data.muses||[],threads=data.threads||[];const byId=new Map(muses.map(m=>[m.id,m]));
  const counts=el('div','khtd-stats');[['Current threads',threads.length],['Muses',muses.length],['Open starter spots',muses.reduce((n,m)=>n+(m.starter?.remaining||0),0)]].forEach(([label,num])=>{const box=el('div','khtd-stat');box.append(el('strong','',String(num)),el('span','khtd-muted',label));counts.append(box)});stage.append(counts);
  // Starter requests now live within each muse section, not in a global
  // form or a separate page-bottom gallery. No changes to the Writing Queue API.
  function addForm(host,m){
   host.replaceChildren();
   const form=el('form','khtd-form');
   form.append(el('strong','','request a thread / starter with '+m.name));
   const writer=formField(form,'Your writer name',el('input'));
   writer.required=true;writer.maxLength=100;
   const character=formField(form,'Your character',el('input'));
   character.required=true;character.maxLength=120;
   const type=formField(form,'Thread type',el('select'));
   setOptions(type,[['regular','Regular'],['event','Event'],['group','Group'],['text','Text'],['discord','Discord'],['para','Para'],['other','Other']],'regular');
   const notes=formField(form,'Notes or starter ideas (optional)',el('textarea'));
   notes.maxLength=1300;
   const hp=el('input');hp.name='website';hp.tabIndex=-1;hp.style.display='none';form.append(hp);
   form.append(el('p','khtd-muted','Your request will be saved as Pending in Writing Queue. The owner adds approved threads to All Threads manually.'));
   submission(form,'khTDRequestStarter',()=>({museId:m.id,writer:writer.value,character:character.value,type:type.value,notes:notes.value,website:hp.value}),()=>load());
   const cancel=el('button','khtd-control','Cancel');cancel.type='button';cancel.style.marginLeft='8px';cancel.onclick=()=>host.replaceChildren();
   form.append(cancel);host.append(form);
   form.scrollIntoView({block:'nearest',behavior:'smooth'});
  }
  const toolbar=el('div','khtd-toolbar'),search=el('input'),museFilter=el('select'),statusFilter=el('select'),typeFilter=el('select');search.placeholder='Search writer or character…';search.value=state.q;
  setOptions(museFilter,[['all','All muses'],...muses.map(m=>[m.id,m.name])],state.muse);
  setOptions(statusFilter,[['all','All statuses'],...Array.from(new Set(threads.map(t=>t.status).filter(Boolean))).sort().map(x=>[x,x])],state.status);
  setOptions(typeFilter,[['all','All types'],...Array.from(new Set(threads.map(t=>t.type).filter(Boolean))).sort().map(x=>[x,x])],state.type);
  toolbar.append(search,museFilter,statusFilter,typeFilter);stage.append(toolbar);const entriesArea=el('div');stage.append(entriesArea);
  function discuss(formParent,t){formParent.replaceChildren();const form=el('form','khtd-form');form.append(el('strong','','Discuss thread with '+t.character));
    const name=formField(form,'Your writer name',el('input'));name.required=true;name.maxLength=100;
    const action=formField(form,'What would you like to suggest?',el('select'));setOptions(action,[['wrap','Start wrapping up'],['end','End this thread'],['pause','Pause temporarily'],['continue','Keep writing'],['other','Other']],'wrap');
    const closing=formField(form,'Who should write the closing reply?',el('select'));setOptions(closing,[['discuss','Discuss together'],['me','I will write it'],['owner','Muse owner will write it']],'discuss');
    const notes=formField(form,'Notes (optional)',el('textarea'));notes.maxLength=1500;
    const hp=el('input');hp.tabIndex=-1;hp.style.display='none';form.append(hp);
    form.append(el('p','khtd-muted','This creates a Pending request in Thread Updates; it does not change All Threads.'));
    submission(form,'khTDRequestUpdate',()=>({threadId:t.id,writer:name.value,action:action.value,closing:closing.value,notes:notes.value,website:hp.value}),()=>form.replaceChildren(el('p','', 'Suggestion received.')));
    formParent.append(form);
  }
  function render(){entriesArea.replaceChildren();const q=state.q.toLowerCase();let matched=0;
   muses.filter(m=>state.muse==='all'||m.id===state.muse).forEach(m=>{const rows=threads.filter(t=>t.museId===m.id&&(state.status==='all'||t.status===state.status)&&(state.type==='all'||t.type===state.type)&&(!q||[m.name,t.writer,t.character,t.type].join(' ').toLowerCase().includes(q)));
    if(q&&!rows.length||state.status!=='all'&&!rows.length||state.type!=='all'&&!rows.length)return;matched+=rows.length;
    const section=el('section','khtd-muse');section.style.setProperty('--td-primary',m.primary);section.style.setProperty('--td-text',m.contrast);
    const head=el('div','khtd-muse-head');
    // Wrap on narrow screens: name and status/actions stay beside each other.
    head.style.display='flex';head.style.alignItems='center';head.style.justifyContent='space-between';
    head.style.gap='12px';head.style.flexWrap='wrap';
    const heading=el('div');heading.style.display='flex';heading.style.alignItems='baseline';
    heading.style.gap='12px';heading.style.flexWrap='wrap';
    heading.append(el('strong','',m.name),el('span','',rows.length+' thread'+(rows.length===1?'':'s')));
    const actions=el('div');actions.style.display='flex';actions.style.alignItems='center';
    actions.style.flexWrap='wrap';actions.style.gap='9px';
    const call=m.starter||{};
    const isOpen=!!call.open&&Number(call.remaining)>0;
    const callStatus=isOpen
      ? call.remaining+' of '+call.capacity+' starter spots open'
      : call.enabled?'Starter calls full':'Starter calls closed';
    const status=el('span','',callStatus);status.style.fontSize='13px';status.style.fontWeight='700';
    status.style.padding='6px 10px';status.style.borderRadius='8px';
    status.style.background='rgba(255,255,255,.9)';status.style.color='#393039';
    actions.append(status);
    const starterLink=link('View starter calls',url(m.id,'starters'));
    starterLink.style.fontSize='13px';starterLink.style.color='inherit';
    starterLink.style.textDecoration='underline';starterLink.style.textUnderlineOffset='3px';
    actions.append(starterLink);
    const body=el('div','khtd-muse-body');const profile=link('view character profile',url(m.id,'threads'));profile.className='khtd-muted';body.append(profile);
    const requestSpace=el('div');body.append(requestSpace);
    if(isOpen){
      const request=el('button','khtd-control','+ Request starter');request.type='button';
      request.style.background='#fffaf5';request.style.color='#45302c';
      request.style.border='1px solid rgba(60,40,40,.22)';request.style.fontWeight='700';
      request.onclick=()=>{
        if(requestSpace.childNodes.length){requestSpace.replaceChildren();request.textContent='+ Request starter';}
        else {addForm(requestSpace,m);request.textContent='Hide request form';}
      };
      actions.append(request);
    }
    head.append(heading,actions);
    if(!rows.length)body.append(el('p','khtd-muted','No current threads yet. New requests are accepted only when starter spots are available.'));
    rows.forEach(t=>{const wrap=el('div','khtd-entry'),left=el('div');left.append(el('b','',t.character),el('div','khtd-muted',t.writer+' · '+(t.type||'Regular')+' · '+(t.updated?'Updated '+t.updated:'No update date')));
      const right=el('div','khtd-status-actions');const statusKey=String(t.status||'').trim().toLowerCase().replace(/[_\s]+/g,'-');const statusClass=['drafted','replied','to-receive','to-start'].includes(statusKey)?' khtd-status--'+statusKey:'';right.append(el('span','khtd-badge'+statusClass,t.status||'Current'));
      const btn=el('button','khtd-control','Discuss');btn.type='button';const panel=el('div');btn.onclick=()=>{if(panel.childNodes.length)panel.replaceChildren();else discuss(panel,t)};right.append(btn);wrap.append(left,right);const container=el('div');container.append(wrap,panel);body.append(container)});
    section.append(head,body);entriesArea.append(section)});
   if(!entriesArea.childNodes.length)entriesArea.append(el('p','muted','No matching threads.'));
  }
  search.oninput=()=>{state.q=search.value;render()};museFilter.onchange=()=>{state.muse=museFilter.value;render()};statusFilter.onchange=()=>{state.status=statusFilter.value;render()};typeFilter.onchange=()=>{state.type=typeFilter.value;render()};render();

 }
 load();
}

function kh2ShowFastProfileShell(profile){
  theme(profile);
  root.replaceChildren();
  const nav=el('div','topnav');
  nav.append(el('strong','','kismet harbor · muse directory'),link('← all muses',url('')));
  kh22NavLink(nav); khEAddNav(nav);
  root.append(nav);
  const hero=el('section','hero'),info=el('div');
  const byline=[ageFromBirthday(profile.birthday)?ageFromBirthday(profile.birthday)+' years old':'',shortBirthday(profile.birthday),profile.faceclaim].filter(Boolean).join(' · ');
  info.append(el('h1','',profile.name),el('div','byline',byline));
  const facts=el('div','facts');
  [['occupation',profile.occupation],['home',profile.neighborhood],['from',profile.localStatus],['relationship',profile.status],['education',profile.education]].filter(x=>x[1]).forEach(([key,value])=>{
    const line=el('p');line.append(el('b','',key+': '),document.createTextNode(value));facts.append(line);
  });
  info.append(facts);hero.append(pic(profile),info);root.append(hero);
  const loading=el('div','section-loading','Loading biography and character sections…');
  loading.id='kh-fast-profile-loading';root.append(loading);
}

// KISMET HARBOR PLOTTING STUDIO — isolated public feature, no changes to existing tabs.
const KHST_COLORS={Family:'#b77859',Friendship:'#639585',Romance:'#b7788c',Rivalry:'#be8d42',Professional:'#718db2',Other:'#9989ac'};
function khStudioUrl(){const u=new URL(url(''));u.searchParams.set('page','studio');u.searchParams.delete('character');u.searchParams.delete('section');return u.toString();}
function khStudioNav(nav){const a=link('✦ Plotting Studio',khStudioUrl());a.className='pill kh-studio-nav';nav.append(a);}
function khStudioType(cat){const n=String(cat||'').toLowerCase();if(/family|sibling|parent|cousin|relative|kin/.test(n))return 'Family';if(/romanc|love|ex|fling|dating|marriage|spouse/.test(n))return 'Romance';if(/rival|enem|antagon|conflict|friction|tension|feud/.test(n))return 'Rivalry';if(/profession|career|work|business|colleague|cowork|office/.test(n))return 'Professional';if(/friend|platonic|bestie|community/.test(n))return 'Friendship';return 'Other';}
function khStudioChoice(title,options){const lab=el('label','',title),sel=el('select');options.forEach(([value,label])=>{const op=el('option','',label);op.value=value;sel.append(op)});lab.append(sel);return {lab,sel};}
function khStudioIdeaForm(host,context){host.replaceChildren();const f=el('form','kh-studio-form');const writer=inputField(f,'Your writer name','text',true);const character=inputField(f,'Your Kismet Harbor character','text',true);const notes=inputField(f,'Your plot idea or notes','textarea',true);notes.maxLength=1800;writer.maxLength=120;character.maxLength=120;notes.value='';notes.placeholder='Describe the plot you would like to explore…';const website=inputField(f,'Website','text',false);website.parentNode.hidden=true;website.tabIndex=-1;website.autocomplete='off';const send=el('button','kh-button primary','Send plotting idea');send.type='submit';const status=el('p','form-status');f.append(send,status);host.append(el('h3','','Suggest this plot'),el('p','muted','Private request for '+context.museName+'. An established relationship is context, not a claim on another writer’s character.'));if(context.prefill){const guide=el('details','kh-studio-extra kh-studio-suggestion');guide.append(el('summary','','Optional plotting inspiration'));guide.append(el('p','',context.prefill));const copy=el('button','kh-button','Use as a starting point');copy.type='button';copy.onclick=()=>{notes.value=context.prefill;notes.focus();};guide.append(copy);host.append(guide);}host.append(f);
 f.onsubmit=ev=>{ev.preventDefault();if(!notes.value.trim())return;send.disabled=true;status.textContent='Submitting…';const prefix='Plotting Studio | '+context.source+'\n';const payload={characterId:context.museId,type:'plot',writer:writer.value.trim(),characterName:character.value.trim(),notes:prefix+notes.value.trim(),website:website.value};google.script.run.withSuccessHandler(r=>{status.textContent=r?.message||'Idea sent for private review.';send.textContent='Sent';}).withFailureHandler(e=>{send.disabled=false;status.textContent=e?.message||'Unable to submit request.';}).kh2SubmitOriginalIdea(payload);};
}
function khPlottingStudio(){theme(null);root.replaceChildren();const nav=el('div','topnav');nav.append(el('strong','','kismet harbor · plotting studio'),link('← muse directory',url('')));kh22NavLink(nav);khEAddNav(nav);root.append(nav);const head=el('header','kh-studio-header');head.append(el('span','kh-eyebrow','explore · imagine · request'),el('h1','','plotting studio'),el('p','',"Discover connections, follow the relationships around my muses, or find a fresh opening for your own character."));root.append(head);
 const tabs=el('div','kh-studio-tabs'),main=el('section','kh-studio-main'),note=el('p','muted','Loading published plotting data…');main.append(note);root.append(tabs,main);const sections=[['web','Relationship Web'],['build','Build a Plot'],['surprise','Surprise Me']];let studio=null,active='web',museId='',selected='',filter='All',query='',page=0;const pageSize=12;
 const selectMuse=(val)=>{museId=val;selected='';filter='All';query='';page=0;render();};
 function muses(){return studio?.muses||[];}function muse(){return muses().find(p=>p.id===museId)||muses()[0]||null;}
 function relationships(){return (studio?.established||[]).filter(x=>x.characterId===museId).map(x=>({...x,type:khStudioType(x.category)}));}
 function makeMuseSelector(){const c=khStudioChoice('Explore a muse',muses().map(x=>[x.id,x.name]));c.sel.value=museId;c.sel.onchange=()=>selectMuse(c.sel.value);return c.lab;}
 function activate(key){active=key;render();}
 function render(){tabs.replaceChildren();sections.forEach(([k,name])=>{const b=el('button','kh-studio-pill'+(active===k?' active':''),name);b.type='button';b.onclick=()=>activate(k);tabs.append(b)});main.replaceChildren();if(!studio){main.append(el('p','muted','Loading plotting data…'));return;}if(!muses().length){main.append(el('p','muted','No published muses available.'));return;}if(!museId)museId=muses()[0].id;if(active==='web')renderWeb();else if(active==='build')renderBuilder();else renderSurprise();}
 function suggestPlot(relationship){const who=relationship.name||'this person';const mode=relationship.type;const intro={Family:'a shared family gathering or obligation',Friendship:'a mutual outing or unexpected introduction',Romance:'a social event where old history becomes relevant',Rivalry:'a community event or situation that puts competing personalities together',Professional:'a shared project or professional gathering',Other:'an unexpected encounter through mutual acquaintances'}[mode];return 'My character encounters '+muse().name+' through '+who+' during '+intro+'. We could explore how the existing relationship affects their first impressions, without deciding anything for the other writer.';}
 function showRelationshipCard(host,item){host.replaceChildren();if(!item){host.append(el('h3','','Select a connection'),el('p','muted','Choose a person in the web to read their established history and propose a plot around it.'));return;}const tag=el('span','kh-studio-tag',item.type);tag.style.setProperty('--tagcolor',KHST_COLORS[item.type]);host.append(el('span','kh-eyebrow','established relationship'),el('h2','',item.name||'Unnamed relationship'),tag);if(item.category)host.append(el('p','muted',item.category));if(item.description)host.append(el('p','kh-studio-description',item.description));if(item.plots?.length){const det=el('details','kh-studio-extra');det.append(el('summary','','Existing plot directions'));item.plots.forEach(p=>{const a=el('p');a.append(el('strong','',p.title||'Direction'),document.createTextNode(p.description?' — '+p.description:''));det.append(a);});host.append(det);}const idea=el('div','kh-studio-idea'),button=el('button','kh-button primary','Plot around this connection');button.onclick=()=>{khStudioIdeaForm(idea,{museId, museName:muse().name,source:'Relationship '+item.id+' — '+item.name+' ('+item.category+')',prefill:suggestPlot(item)});idea.scrollIntoView({behavior:'smooth',block:'nearest'});};host.append(button,el('p','muted','Plot suggestions are reviewed privately; this does not grant permission to write another person’s character.'),idea);}
 function renderWeb(){const h=el('div','kh-studio-controls');h.append(makeMuseSelector());const search=el('input','kh-studio-search');search.type='search';search.placeholder='Search a character or relationship…';search.value=query;search.oninput=()=>{query=search.value;page=0;renderWebBody();};h.append(search);main.append(h);
 const filters=el('div','kh-studio-filters');['All',...Object.keys(KHST_COLORS)].forEach(k=>{const b=el('button','kh-studio-filter'+(filter===k?' active':''),k);b.type='button';b.onclick=()=>{filter=k;selected='';page=0;filters.querySelectorAll('button').forEach(n=>n.classList.toggle('active',n===b));renderWebBody();};filters.append(b)});main.append(filters);const layout=el('div','kh-studio-layout'),graph=el('div','kh-studio-graph'),detail=el('aside','kh-studio-detail');layout.append(graph,detail);main.append(layout);const caption=el('p','muted','Relationships are taken from published Established Connections. If a row describes a role rather than a person, that role will appear as written.');main.append(caption);
 function renderWebBody(){const all=relationships();const shown=all.filter(x=>(filter==='All'||x.type===filter)&&(!query||(x.name+' '+x.category+' '+x.description).toLowerCase().includes(query.toLowerCase())));const pages=Math.max(1,Math.ceil(shown.length/pageSize));page=Math.min(page,pages-1);const subset=shown.slice(page*pageSize,(page+1)*pageSize);graph.replaceChildren();const top=el('div','kh-studio-graph-top');top.append(el('strong','',muse().name+'’s circle'),el('span','muted',shown.length+' relationships'));graph.append(top);const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 720 520');svg.setAttribute('role','img');svg.setAttribute('aria-label','Relationship web centered on '+muse().name);svg.classList.add('kh-studio-svg');const mk=(tag,attrs,text)=>{const n=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs||{}).forEach(([k,v])=>n.setAttribute(k,String(v)));if(text!==undefined)n.textContent=text;return n;};const cx=360,cy=255;subset.forEach((item,i)=>{const a=(i/subset.length)*Math.PI*2-Math.PI/2;const rx=subset.length>8?278:256,ry=subset.length>8?182:175,x=cx+Math.cos(a)*rx,y=cy+Math.sin(a)*ry,c=KHST_COLORS[item.type],hit=item.id===selected;svg.append(mk('line',{x1:cx,y1:cy,x2:x,y2:y,stroke:c,'stroke-width':hit?4:2,opacity:hit?1:.65}));const g=mk('g',{transform:'translate('+x+' '+y+')',tabindex:0,role:'button','aria-label':item.name+'; '+item.type});g.style.cursor='pointer';g.append(mk('circle',{r:hit?30:26,fill:'#fffaf5',stroke:c,'stroke-width':hit?4:2}));g.append(mk('text',{'text-anchor':'middle',y:5,fill:'#62453c','font-size':13,'font-weight':700},item.name.split(/\s+/).map(w=>w[0]||'').slice(0,2).join('').toUpperCase()));let label=item.name;if(label.length>21)label=label.slice(0,19)+'…';g.append(mk('text',{'text-anchor':'middle',y:46,fill:'currentColor','font-size':12},label));g.onclick=()=>{selected=item.id;renderWebBody();};g.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();g.onclick();}};svg.append(g);});svg.append(mk('circle',{cx,cy,r:54,fill:muse().primary||'#b8572a'}));const label=muse().name.split(' ');svg.append(mk('text',{x:cx,y:cy-3,'text-anchor':'middle',fill:'#fff','font-size':18,'font-weight':700},label[0]||''));svg.append(mk('text',{x:cx,y:cy+18,'text-anchor':'middle',fill:'#fff','font-size':12},label.slice(1).join(' ').slice(0,24)));graph.append(svg);if(!shown.length)graph.append(el('p','muted','No published relationships match those filters.'));const footer=el('div','kh-studio-pagination');const prev=el('button','kh-button','← Previous'),next=el('button','kh-button','Next →');prev.disabled=page===0;next.disabled=page>=pages-1;prev.onclick=()=>{page--;selected='';renderWebBody()};next.onclick=()=>{page++;selected='';renderWebBody()};footer.append(prev,el('span','muted','Page '+(page+1)+' of '+pages),next);if(pages>1)graph.append(footer);showRelationshipCard(detail,subset.find(x=>x.id===selected)||null);}
 renderWebBody();}
 const words=x=>String(x||'').toLowerCase();
 function chooseOpportunities(criteria){const kinds=criteria.kind||'all',who=criteria.muse||'',q=words(criteria.keyword),tone=words(criteria.tone);return (studio.opportunities||[]).filter(o=>(!who||o.characterId===who)&&(kinds==='all'||kinds===o.type)&&(!q||(words(o.title+' '+o.description+' '+o.category+' '+(o.plots||[]).map(p=>p.title+' '+p.description).join(' ')).includes(q)))).map(o=>{let score=0;const blob=words(o.title+' '+o.description+' '+o.category+' '+(o.plots||[]).map(p=>p.title+' '+p.description).join(' '));const moods={comfort:['comfort','support','friend','family','warm','trust'],tension:['rival','conflict','tense','friction','argument','secret'],adventure:['travel','adventure','unexpected','event','challenge'],everyday:['everyday','casual','neighbor','coffee','errand'],romance:['romance','flirt','date','love','ex']};if(tone&&moods[tone])score=moods[tone].filter(w=>blob.includes(w)).length*3;return {...o,score};}).sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title));}
 function opportunityCard(o){const card=el('article','kh-studio-opportunity');card.append(el('span','kh-eyebrow',o.type+' · '+o.museName),el('h3','',o.title),el('p','',o.description||'Explore this opportunity with the writer.'));if(o.plots?.length){const det=el('details');det.append(el('summary','','Plot directions ('+o.plots.length+')'));o.plots.forEach(p=>det.append(el('p','',p.title+(p.description?' — '+p.description:''))));card.append(det);}const actions=el('div','kh-studio-actions');const href=url(o.characterId,o.type==='starter'?'starters':'open-connections'),u=new URL(href);u.searchParams.set('opportunity',o.id);actions.append(link('View & request',u.toString()),kh23SaveButton(o.type,o.id));card.append(actions);return card;}
 function renderBuilder(){main.append(el('h2','','Build a Plot'),el('p','muted','Explore available connections and starters using your preferred tone, or send a completely original plot idea.'));const form=el('div','kh-studio-build-form');const mc=khStudioChoice('Your muse',[['','Any muse'],...muses().map(x=>[x.id,x.name])]),kind=khStudioChoice('Opportunity',[['all','Connections or starters'],['connection','Connections'],['starter','Starters']]),tone=khStudioChoice('Preferred mood',[['','Any mood'],['comfort','Comfort & friendship'],['tension','Tension & conflict'],['adventure','Adventure & surprises'],['everyday','Everyday encounters'],['romance','Romantic history / possibilities']]);const key=el('label','','Keywords (optional)'),search=el('input');search.type='search';search.placeholder='e.g. work, neighbor, family';key.append(search);form.append(mc.lab,kind.lab,tone.lab,key);const go=el('button','kh-button primary','Find plot openings');form.append(go);main.append(form);const area=el('div','kh-studio-results');main.append(area);const original=el('details','kh-studio-extra');original.append(el('summary','','Have an original idea instead?'));const originalWrap=el('div');original.append(originalWrap);main.append(original);let visible=12;function draw(reset){if(reset)visible=12;area.replaceChildren();const rows=chooseOpportunities({muse:mc.sel.value,kind:kind.sel.value,tone:tone.sel.value,keyword:search.value});const shown=Math.min(visible,rows.length);area.append(el('p','muted','Showing '+shown+' of '+rows.length+' matching published opportunities. Suggestions use existing text and tags; they do not invent character lore.'));const grid=el('div','kh-studio-cards');rows.slice(0,visible).forEach(r=>grid.append(opportunityCard(r)));area.append(grid);if(visible<rows.length){const more=el('button','kh-button kh-studio-more','Show 12 more ('+(rows.length-visible)+' remaining)');more.type='button';more.onclick=()=>{visible+=12;draw(false)};area.append(more);}if(!rows.length)area.append(el('p','muted','No available opportunities match those filters. Try another muse or remove filters.'));}go.onclick=()=>draw(true);[mc.sel,kind.sel,tone.sel].forEach(x=>x.onchange=()=>draw(true));search.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();draw(true)}};const om=khStudioChoice('Send an idea for',muses().map(x=>[x.id,x.name]));originalWrap.append(om.lab);const compose=el('div');originalWrap.append(compose);function updateOriginal(){const m=muses().find(x=>x.id===om.sel.value);if(m)khStudioIdeaForm(compose,{museId:m.id,museName:m.name,source:'Build a Plot — original suggestion',prefill:''});}om.sel.onchange=updateOriginal;updateOriginal();draw();}
 function renderSurprise(){main.append(el('h2','','Surprise Me'),el('p','muted','Discover a random currently available connection or starter. Reroll as often as you like; nothing gets claimed until you submit a request.'));const panel=el('div','kh-studio-build-form'),mc=khStudioChoice('Muse',[['','Any muse'],...muses().map(x=>[x.id,x.name])]),kind=khStudioChoice('Show me',[['all','Any opportunity'],['connection','A connection'],['starter','A starter']]);panel.append(mc.lab,kind.lab);const roll=el('button','kh-button primary','🎲 Surprise me');panel.append(roll);main.append(panel);const result=el('div','kh-studio-surprise-result');main.append(result);let prior='';function next(){const all=chooseOpportunities({muse:mc.sel.value,kind:kind.sel.value});const options=all.filter(x=>x.type+':'+x.id!==prior);result.replaceChildren();if(!all.length){const total=(studio.opportunities||[]).length;result.append(el('p','muted',total?'No currently open '+(kind.sel.value==='connection'?'connections':kind.sel.value==='starter'?'starters':'opportunities')+' match this muse and selection. Try Any muse or Any opportunity.':'No open connections or starters were returned by the Studio data source. Other published connections may be filled or paused; check your current Published / Capacity Type / Approved Count / Availability settings.'));const counts=studio.counts||{};result.append(el('p','muted','Current Studio data: '+(counts.connections||0)+' open connections, '+(counts.starters||0)+' open starters.'));return;}const row=(options.length?options:all)[Math.floor(Math.random()*(options.length||all.length))];prior=row.type+':'+row.id;result.append(el('p','muted',all.length+' available '+(all.length===1?'idea':'ideas')+' match this selection.'));result.append(opportunityCard(row));}roll.onclick=next;mc.sel.onchange=()=>{prior='';next()};kind.sel.onchange=()=>{prior='';next()};next();}
 google.script.run.withSuccessHandler(data=>{studio=data;museId=muses()[0]?.id||'';render();}).withFailureHandler(e=>{main.replaceChildren(el('p','demo-message','Unable to load Plotting Studio: '+(e?.message||String(e))));}).khStudioPublicData();
}

function start(){
  if(typeof google==='undefined'||!google.script?.run){root.textContent='Open this page through the Apps Script web app.';return;}
  if(INITIAL_PAGE==='studio'||new URLSearchParams(location.search).get('page')==='studio'){khPlottingStudio();return;}
  if(INITIAL_PAGE==='threads'||new URLSearchParams(location.search).get('page')==='threads'){khTDPage();return;}
  if(INITIAL_PAGE==='event-starters'||new URLSearchParams(location.search).get('page')==='event-starters'){khEEventPage();return;}
  if(INITIAL_PAGE==='writing'||new URLSearchParams(location.search).get('page')==='writing'){kh22WritingPage();return;}
  const id=INITIAL_ID||new URLSearchParams(location.search).get('character');
  if(!id){google.script.run.withSuccessHandler(directory).withFailureHandler(err=>root.textContent=err.message).kh2RestoredDirectory();return;}
  // The navigation and writing tabs appear as soon as the profile shell loads.
  // Biography content updates only Character tabs, preserving any active writing tab.
  let profile=null, biography=null, biographyError=null, biographyFinished=false;
  let writingWarmupStarted=false;
  const khProfileLoadStart=performance.now();
  function warmWritingAfterBiography(){
    if(writingWarmupStarted)return;
    writingWarmupStarted=true;
    // Do not compete with initial profile/Docs loading or block Overview painting.
    // All these requests refresh with each page load; no persistent content cache.
    setTimeout(()=>{
      if(activeId!==id)return;
      khPrimeConnections(id);
      khRequestWritingSection('kh2RestoredStarters',id);
      khRequestWritingSection('kh2RestoredThreads',id);
    },300);
  }
  function applyBiography(){
    if(!profile||!biographyFinished)return;
    const empty={sections:{},warnings:[],timeline:[],family:[],extraSections:[]};
    character({profile,content:biography?.content||empty,
      error:biographyError||biography?.error||''},true);
    warmWritingAfterBiography();
  }
  google.script.run.withSuccessHandler(result=>{
    profile=result.profile;
    console.info('[Muse Hub] Character header ready in '+Math.round(performance.now()-khProfileLoadStart)+' ms');
    character({profile,biographyLoading:true});
    // Keep Google Apps Script free for the biography during initial Overview load.
    // Writing data warms only after the biography has finished rendering.
    applyBiography();
  }).withFailureHandler(err=>{
    root.textContent='Unable to load profile: '+(err?.message||String(err));
  }).kh2RestoredCharacterShell(id);
  google.script.run.withSuccessHandler(result=>{
    biography=result;biographyFinished=true;
    console.info('[Muse Hub] Biography data received in '+Math.round(performance.now()-khProfileLoadStart)+' ms');
    applyBiography();
  }).withFailureHandler(err=>{
    biographyError=err?.message||String(err);biographyFinished=true;applyBiography();
  }).kh2RestoredCharacterContent(id);
}start();
})();
