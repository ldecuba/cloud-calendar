import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
function app(){
  const nodes=new Map();
  const get=s=>{if(!nodes.has(s))nodes.set(s,{innerHTML:'',textContent:'',setAttribute(name,value){this[name]=value},focus(){this.focused=true},scrollIntoView(){this.scrolled=true}});return nodes.get(s)};
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
 assert.equal(get('#todayEvents').focused,true);
 assert.equal(get('#todayEvents').scrolled,true);
 assert.match(get('#calendar').innerHTML,/day  today/);
});
test('a new day refreshes an already open page',()=>{
 const {run,get}=app();
 run("lastRenderedDate='yesterday';refreshDate()");
 assert.ok(get('#calendar').innerHTML.length>0);
 assert.equal(run('lastRenderedDate'),new Date().toDateString());
});

test('Netherlands list shows five, expands all, and collapses again',()=>{
 const {run,get}=app();
 run("state.filtered=Array.from({length:8},(_,i)=>({id:'nl-'+i,title:'Event '+i,start:'2099-01-01',format:'In person',cost:'Free'}));renderSide()");
 const count=()=> (get('#upcomingNl').innerHTML.match(/<article/g)||[]).length;
 assert.equal(count(),5);
 assert.equal(get('#showAllNl').textContent,'Show all (8)');
 run("$('#showAllNl').onclick()");
 assert.equal(count(),8);
 assert.equal(get('#showAllNl')['aria-expanded'],'true');
 run("$('#showAllNl').onclick()");
 assert.equal(count(),5);
 run('state.filtered=[];renderSide()');
 assert.equal(get('#showAllNl').hidden,true);
});
test('Today includes all matching day events regardless of filters, including multi-day events',()=>{
 const {run,get}=app();
 run("const today=new Date();const key=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');state.events=[{id:'today',title:'Today only',start:key(today),format:'Online'},{id:'multi',title:'Ongoing event',start:'2000-01-01',end:'2099-01-01',format:'In person'},{id:'past',title:'Past event',start:'2000-01-01',format:'Online'}];state.filtered=[];goToToday()");
 assert.match(get('#todayList').innerHTML,/Today only/);
 assert.match(get('#todayList').innerHTML,/Ongoing event/);
 assert.doesNotMatch(get('#todayList').innerHTML,/Past event/);
 assert.equal(get('#todayEvents').hidden,false);
 run('state.events=[];goToToday()');
 assert.match(get('#todayList').innerHTML,/No events scheduled for today/);
});
