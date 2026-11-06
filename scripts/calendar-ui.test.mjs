import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
function app(){
  const nodes=new Map();
  const get=s=>{if(!nodes.has(s))nodes.set(s,{innerHTML:'',textContent:'',focus(){this.focused=true},scrollIntoView(){this.scrolled=true}});return nodes.get(s)};
  const context=vm.createContext({console,Intl,Date,setInterval(){},window:{addEventListener(){}},document:{querySelector:get,querySelectorAll:()=>[],addEventListener(){}}});
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
test('sidebar removes expired events in both lists while calendar data stays available',()=>{
 const {run,get}=app();
 run(`state.filtered=[{id:'old-nl',title:'Expired NL',start:'2000-01-01',format:'In person',cost:'Free'},{id:'old-online',title:'Expired online',start:'2000-01-01',format:'Online',cost:'Free'},{id:'future',title:'Future NL',start:'2099-01-01',format:'In person',cost:'Free'}];renderSide()`);
 assert.doesNotMatch(get('#upcomingNl').innerHTML,/Expired/);
 assert.match(get('#upcomingNl').innerHTML,/Future NL/);
 assert.doesNotMatch(get('#upcoming').innerHTML,/Expired/);
 assert.equal(run('state.filtered.length'),3);
});
test('Today returns from another month, renders today and focuses it',()=>{
 const {run,get}=app();
 run("state.month=new Date(2000,0,1);goToToday()");
 assert.equal(run('state.month.getMonth()'),new Date().getMonth());
 assert.equal(run('state.month.getFullYear()'),new Date().getFullYear());
 assert.equal(get('#calendar .today').focused,true);
 assert.equal(get('#calendar .today').scrolled,true);
 assert.match(get('#calendar').innerHTML,/day  today/);
});
test('a new day refreshes an already open page',()=>{
 const {run,get}=app();
 run("lastRenderedDate='yesterday';refreshDate()");
 assert.ok(get('#calendar').innerHTML.length>0);
 assert.equal(run('lastRenderedDate'),new Date().toDateString());
});
