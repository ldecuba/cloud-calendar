import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
const script=readFileSync(new URL('../dist/calendar.js',import.meta.url),'utf8');
function app(path='/index.html',search=''){
  const nodes=new Map();
  const get=s=>{if(!nodes.has(s))nodes.set(s,{innerHTML:'',textContent:'',setAttribute(name,value){this[name]=value},focus(){this.focused=true},scrollIntoView(){this.scrolled=true}});return nodes.get(s)};
  const context=vm.createContext({URLSearchParams,location:{pathname:path,search,assign(url){this.destination=url}},console,Intl,Date,setInterval(){},window:{addEventListener(){}},document:{querySelector:get,querySelectorAll:()=>[],addEventListener(){}}});
  vm.runInContext(readFileSync(new URL('../dist/events-data.js',import.meta.url),'utf8'),context);
  vm.runInContext(script,context);
  return {run:code=>vm.runInContext(code,context),get};
}
test('past events disappear after their final day, including the November 3 roundtable',()=>{
 const {run}=app();
 assert.equal(run("isUpcoming({start:'2026-11-03'},new Date(2026,10,6,12))"),false);
 assert.equal(run("isUpcoming({start:'2026-11-06'},new Date(2026,10,6,23,59))"),true);
 assert.equal(run("isUpcoming({start:'2026-11-03',end:'2026-11-06'},new Date(2026,10,6,23,59))"),true);
 assert.equal(run("isUpcoming({start:'2026-11-03',end:'2026-11-06'},new Date(2026,10,7))"),false);
 assert.equal(run("isUpcoming({start:'2099-11-03'},new Date(2026,10,6))"),true);
});
test('combined sidebar removes expired events while calendar data stays available',()=>{
 const {run,get}=app();
 run(`state.filtered=[{id:'old-nl',title:'Expired NL',start:'2000-01-01',format:'In person',cost:'Free'},{id:'old-online',title:'Expired online',start:'2000-01-01',format:'Online',cost:'Free'},{id:'future',title:'Future NL',start:'2099-01-01',format:'In person',cost:'Free'}];renderSide()`);
 assert.doesNotMatch(get('#upcoming').innerHTML,/Expired/);
 assert.match(get('#upcoming').innerHTML,/Future NL/);
 assert.doesNotMatch(get('#upcoming').innerHTML,/Expired/);
 assert.equal(run('state.filtered.length'),3);
});
test('Today opens a separate page',()=>{
 const {run}=app();run('goToToday()');assert.equal(run('location.destination'),'./today.html');
 assert.ok(html.includes('src="./calendar.js"'));assert.ok(!html.includes('id="todayEvents"'));
});
test('a new day refreshes an already open page',()=>{
 const {run,get}=app();
 run("lastRenderedDate='yesterday';refreshDate()");
 assert.ok(get('#calendar').innerHTML.length>0);
 assert.equal(run('lastRenderedDate'),run('dayKey(new Date())'));
});

test('Coming up shows five and links to a separate page with current filters',()=>{
 const {run,get}=app();
 run("state.filtered=Array.from({length:8},(_,i)=>({id:'event-'+i,title:'Event '+i,start:'2099-01-01',format:i%2?'Online':'In person',cost:'Free'}));state.query='AI & cloud';state.topic='Copilot';state.format='Online';renderSide()");
 assert.equal((get('#upcoming').innerHTML.match(/<article/g)||[]).length,5);
 assert.equal(get('#showAllUpcoming').textContent,'Show all (8)');
 assert.equal(get('#showAllUpcoming').href,'./coming-up.html?q=AI+%26+cloud&topic=Copilot&format=Online');
 run('state.filtered=[];renderSide()');assert.equal(get('#showAllUpcoming').hidden,true);
});
test('full Coming up page lists more than five, hides expired entries and restores URL filters',()=>{
 const {run,get}=app('/coming-up.html','?format=Online');
 assert.equal(run('state.format'),'Online');
 run("state.events=Array.from({length:8},(_,i)=>({id:'event-'+i,title:'Online event '+i,start:'2099-01-01',format:'Online',cost:'Free',topics:[]})).concat([{title:'Expired',start:'2000-01-01',format:'Online',cost:'Free',topics:[]},{title:'In person event',start:'2099-01-01',format:'In person',cost:'Free',topics:[]}]);applyFilters()");
 assert.equal((get('#comingUpList').innerHTML.match(/<article/g)||[]).length,8);
 assert.doesNotMatch(get('#comingUpList').innerHTML,/Expired|In person event/);
 assert.match(get('#activeFilters').textContent,/Online/);
});
test('Today includes all matching day events regardless of filters, including multi-day events',()=>{
 const {run,get}=app('/today.html');
 run("const today=new Date();const key=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');state.events=[{id:'today',title:'Today only',start:key(today),format:'Online'},{id:'multi',title:'Ongoing event',start:'2000-01-01',end:'2099-01-01',format:'In person'},{id:'past',title:'Past event',start:'2000-01-01',format:'Online'}];state.filtered=[];renderToday()");
 assert.match(get('#todayList').innerHTML,/Today only/);
 assert.match(get('#todayList').innerHTML,/Ongoing event/);
 assert.doesNotMatch(get('#todayList').innerHTML,/Past event/);
 assert.match(get('#todayCount').textContent,/Netherlands time/);
 run('state.events=[];renderToday()');
 assert.match(get('#todayList').innerHTML,/No events scheduled for today/);
});

test('Today uses Netherlands calendar day across UTC and daylight saving boundaries',()=>{
 const {run}=app();
 assert.equal(run("dayKey('2026-11-05T23:30:00Z')"),'2026-11-06');
 assert.equal(run("dayKey('2026-06-05T22:30:00Z')"),'2026-06-06');
 assert.equal(run("eventsOnDay([{start:'2026-11-05T23:30:00Z',end:'2026-11-06T00:30:00Z'},{start:'2026-11-06T23:30:00Z'}],new Date('2026-11-06T12:00:00Z')).length"),1);
});

test('reported Today examples are excluded on November 6; series require verified session dates',()=>{
 const {run}=app('/today.html');
 assert.equal(run("eventsOnDay(state.events.filter(e=>e.id==='digital-accelerator-agentic-hr-emea'),'2026-11-06').length"),0);
 assert.equal(run("eventsOnDay([{title:'Modeling Your Business with Ontologies in Fabric IQ',start:'2026-11-05T17:00:00Z',end:'2026-11-05T18:00:00Z'}],'2026-11-06').length"),0);
 assert.equal(run("eventsOnDay([{start:'2026-10-20',end:'2026-11-10',scheduleType:'series',sessionDates:['2026-11-06']}],'2026-11-06').length"),1);
 assert.equal(run("eventsOnDay([{start:'2026-10-20',end:'2026-11-10',scheduleType:'series',sessionDates:['2026-11-05']}],'2026-11-06').length"),0);
});

test('Coming up combines formats chronologically and respects active filters',()=>{
 const {run,get}=app();
 run("state.events=[{id:'later',title:'Later in NL',start:'2099-01-03',format:'In person',cost:'Free',topics:[]},{id:'earlier',title:'Earlier online',start:'2099-01-02',format:'Online',cost:'Free',topics:[]}];applyFilters()");
 const list=get('#upcoming').innerHTML;
 assert.ok(list.indexOf('Earlier online')<list.indexOf('Later in NL'));
 run("state.format='Online';applyFilters()");
 assert.match(get('#upcoming').innerHTML,/Earlier online/);
 assert.doesNotMatch(get('#upcoming').innerHTML,/Later in NL/);
 assert.ok(html.includes('<h2>Coming up</h2>'));
 assert.ok(!html.includes('id="upcomingNl"'));
});
