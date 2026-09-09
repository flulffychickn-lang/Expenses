const KEY="simple_expenses_tracker_v2";let data=load();const $=id=>document.getElementById(id);
function today(){let d=new Date(),x=new Date(d-d.getTimezoneOffset()*60000);return x.toISOString().slice(0,10)}
function money(n){return "₱"+Number(n||0).toLocaleString("en-PH",{minimumFractionDigits:2,maximumFractionDigits:2})}
function load(){try{let x=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(x)?x:[]}catch{return[]}}
function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function fmt(s){return new Date(s+"T00:00:00").toLocaleDateString("en-PH",{year:"numeric",month:"short",day:"numeric"})}
function monthName(m){if(!m)return"—";return new Date(m+"-01T00:00:00").toLocaleDateString("en-PH",{year:"numeric",month:"long"})}
function show(t){$("msg").textContent=t;clearTimeout(window.tm);window.tm=setTimeout(()=>$("msg").textContent="",2200)}
let selectedMonth=today().slice(0,7);
let selectedDailyMonth=selectedMonth;

function monthOptions(){
 const months=new Set(),now=new Date();
 for(let y=now.getFullYear()-5;y<=now.getFullYear()+5;y++)
   for(let m=1;m<=12;m++) months.add(`${y}-${String(m).padStart(2,"0")}`);
 data.forEach(x=>{if(x.date)months.add(x.date.slice(0,7))});
 return [...months].sort().reverse();
}
function setMonthButton(buttonId,m){
 const b=$(buttonId);
 if(!b)return;
 const text=b.querySelector(".month-button-text");
 if(text)text.textContent=monthName(m);
}
function buildMonthMenu(menuId,buttonId,opts,current,onSelect){
 const menu=$(menuId),button=$(buttonId);
 if(!menu||!button)return;
 menu.innerHTML="";
 opts.forEach(m=>{
   const b=document.createElement("button");
   b.type="button";
   b.className="month-option"+(m===current?" selected":"");
   b.textContent=monthName(m);
   b.setAttribute("role","option");
   b.addEventListener("click",e=>{
     e.preventDefault();
     e.stopPropagation();
     onSelect(m);
     menu.classList.remove("open");
     button.setAttribute("aria-expanded","false");
     menu.querySelectorAll(".month-option").forEach(x=>x.classList.remove("selected"));
     b.classList.add("selected");
   });
   menu.appendChild(b);
 });
 button.onclick=e=>{
   e.preventDefault();
   e.stopPropagation();
   document.querySelectorAll(".month-menu.open").forEach(x=>{if(x!==menu)x.classList.remove("open")});
   const open=!menu.classList.contains("open");
   menu.classList.toggle("open",open);
   button.setAttribute("aria-expanded",String(open));
 };
 setMonthButton(buttonId,current);
}
function populateMonths(){
 const opts=monthOptions();
 buildMonthMenu("monthMenu","monthButton",opts,selectedMonth,m=>{
   selectedMonth=m;
   selectedDailyMonth=m;
   setMonthButton("monthButton",m);
   setMonthButton("dailyMonthButton",m);
   render();
   renderDailyTotals();
 });
 buildMonthMenu("dailyMonthMenu","dailyMonthButton",opts,selectedDailyMonth,m=>{
   selectedDailyMonth=m;
   setMonthButton("dailyMonthButton",m);
   renderDailyTotals();
 });
}
function setupTabs(){
 document.querySelectorAll(".tab").forEach(btn=>{
   btn.addEventListener("click",e=>{
     e.preventDefault();
     e.stopPropagation();
     const target=btn.dataset.tab;
     document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
     document.querySelectorAll(".panel").forEach(x=>x.classList.remove("active"));
     btn.classList.add("active");
     const panel=document.getElementById(target);
     if(panel)panel.classList.add("active");
     window.scrollTo(0,0);
   });
 });
}
document.addEventListener("click",e=>{
 if(!e.target.closest(".month-control")){
   document.querySelectorAll(".month-menu.open").forEach(x=>x.classList.remove("open"));
 }
});

function render(){
 const day=$("date").value, mon=selectedMonth;
 const rows=data.filter(x=>x.date.startsWith(mon)).sort((a,b)=>b.date.localeCompare(a.date)||b.created-a.created);
 const grand=rows.reduce((a,x)=>a+Number(x.amount),0);
 const dailyToday=data.filter(x=>x.date===day).reduce((a,x)=>a+Number(x.amount),0);
 $("daily").textContent=money(dailyToday);
 $("monthly").textContent=money(grand);
 $("reportMonth").textContent=monthName(mon);
 $("count").textContent=rows.length;
 $("grand").textContent=money(grand);
 $("tableBody").innerHTML="";
 $("empty").style.display=rows.length?"none":"block";

 rows.forEach(x=>{
   const tr=document.createElement("tr");
   tr.innerHTML='<td></td><td><div class="expense-name"></div><div class="expense-actions"><button class="action edit" type="button">✎ Update</button><button class="action delete" type="button">Delete</button></div></td><td class="amount"></td>';
   tr.children[0].textContent=fmt(x.date);
   tr.querySelector(".expense-name").textContent=x.desc;
   tr.children[2].textContent=money(x.amount);
   tr.querySelector(".edit").onclick=()=>openEdit(x.id);
   tr.querySelector(".delete").onclick=()=>del(x.id);
   $("tableBody").appendChild(tr);
 });
 renderDailyTotals();
}
function renderDailyTotals(){
 const mon=selectedDailyMonth;
 const rows=data.filter(x=>x.date.startsWith(mon));
 const daily={};
 rows.forEach(x=>daily[x.date]=(daily[x.date]||0)+Number(x.amount));
 const dates=Object.keys(daily).sort().reverse();
 const grand=dates.reduce((a,d)=>a+daily[d],0);
 $("dailyReportMonth").textContent=monthName(mon);
 $("dailyCount").textContent=dates.length;
 $("dailyGrand").textContent=money(grand);
 $("dailyBody").innerHTML="";
 $("dailyEmpty").style.display=dates.length?"none":"block";
 dates.forEach(d=>{
   const tr=document.createElement("tr");
   tr.innerHTML="<td></td><td class='amount'></td>";
   tr.children[0].textContent=fmt(d);
   tr.children[1].textContent=money(daily[d]);
   $("dailyBody").appendChild(tr);
 });
}
function add(){
 const date=$("date").value,desc=$("desc").value.trim(),amount=Number($("amount").value);
 if(!date)return show("Please choose a date.");if(!desc)return show("Please enter the expense.");if(!(amount>0))return show("Please enter an amount.");
 data.push({id:String(Date.now()+Math.random()),date,desc,amount:Math.round(amount*100)/100,created:Date.now()});save();
 selectedMonth=date.slice(0,7);
 selectedDailyMonth=date.slice(0,7);
 populateMonths();
 $("desc").value="";$("amount").value="";show("Expense added.");render();$("desc").focus();
}
let editingId=null;
function openEdit(id){
 const x=data.find(a=>a.id===id);if(!x)return;
 editingId=id;
 $("editDate").value=x.date;
 $("editDesc").value=x.desc;
 $("editAmount").value=x.amount;
 $("editModal").classList.add("open");
 $("editModal").setAttribute("aria-hidden","false");
 setTimeout(()=>$("editDesc").focus(),50);
}
function closeEdit(){
 editingId=null;
 $("editModal").classList.remove("open");
 $("editModal").setAttribute("aria-hidden","true");
}
function updateExpense(){
 if(!editingId)return;
 const x=data.find(a=>a.id===editingId);if(!x)return;
 const date=$("editDate").value;
 const desc=$("editDesc").value.trim();
 const amount=Number($("editAmount").value);
 if(!date)return alert("Please choose a date.");
 if(!desc)return alert("Please enter the expense.");
 if(!(amount>0))return alert("Please enter an amount greater than 0.");
 x.date=date;x.desc=desc;x.amount=Math.round(amount*100)/100;
 save();selectedMonth=date.slice(0,7);
 selectedDailyMonth=date.slice(0,7);
 populateMonths();
 closeEdit();render();show("Expense updated.");
}
function del(id){const x=data.find(a=>a.id===id);if(x&&confirm("Delete "+x.desc+" ("+money(x.amount)+")?")){data=data.filter(a=>a.id!==id);save();render()}}

$("add").onclick=add;
$("date").onchange=render;


$("updateExpense").onclick=updateExpense;
$("closeEdit").onclick=closeEdit;
$("cancelEdit").onclick=closeEdit;
$("editModal").onclick=e=>{if(e.target===$("editModal"))closeEdit();};
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&editingId)closeEdit();});
$("desc").onkeydown=e=>{if(e.key==="Enter")$("amount").focus()};$("amount").onkeydown=e=>{if(e.key==="Enter")add()};

$("backup").onclick=()=>{
 const blob=new Blob([JSON.stringify({app:"Expenses Tracker",version:2,exportedAt:new Date().toISOString(),expenses:data},null,2)],{type:"application/json"});
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="expenses-backup-"+today()+".json";a.click();URL.revokeObjectURL(a.href);
};
$("import").onclick=()=>$("file").click();
$("file").onchange=async e=>{
 const f=e.target.files[0];if(!f)return;
 try{const j=JSON.parse(await f.text()),a=Array.isArray(j)?j:j.expenses;if(!Array.isArray(a))throw 0;
 const valid=a.filter(x=>x&&x.date&&x.desc&&Number(x.amount)>0);
 if(confirm("Import "+valid.length+" expense record(s) and replace current data?")){data=valid.map(x=>({id:x.id||String(Date.now()+Math.random()),date:String(x.date),desc:String(x.desc).trim(),amount:Number(x.amount),created:x.created||Date.now()}));save();populateMonths();render();renderDailyTotals();show("Import completed.")}}
 catch{alert("Invalid Expenses Tracker backup.")}finally{e.target.value=""}
};
$("clear").onclick=()=>{
 if(!data.length)return alert("There is no expense data to clear.");
 if(confirm("Clear ALL expense records?")&&confirm("This cannot be undone without a backup. Continue?")){data=[];save();render()}
};

/* Small self-contained XLSX writer. It creates an Excel-compatible .xlsx file
   without relying on an online library, so GitHub Pages can export offline. */
function esc(s){return String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function col(n){let s="";n++;while(n){let r=(n-1)%26;s=String.fromCharCode(65+r)+s;n=Math.floor((n-1)/26)}return s}
function sheetXml(rows){
 let out='<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>';
 rows.forEach((r,ri)=>{out+='<row r="'+(ri+1)+'">';r.forEach((v,ci)=>{
   const ref=col(ci)+(ri+1), val=esc(v);
   if(typeof v==="number" && Number.isFinite(v)) out+='<c r="'+ref+'"><v>'+v+'</v></c>';
   else out+='<c r="'+ref+'" t="inlineStr"><is><t xml:space="preserve">'+val+'</t></is></c>';
 });out+='</row>'});return out+"</sheetData></worksheet>"
}
function crc32(bytes){let table=crc32.table;if(!table){table=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1);table[n]=c>>>0}crc32.table=table}
 let c=0xffffffff;for(const b of bytes)c=table[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;
}
function u16(n){return [n&255,(n>>>8)&255]}function u32(n){return [n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255]}
function zipStore(entries){
 const enc=new TextEncoder(),parts=[],central=[];let offset=0;
 entries.forEach(([name,text])=>{const nb=enc.encode(name),d=enc.encode(text),crc=crc32(d),local=new Uint8Array([...u32(0x04034b50),...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(d.length),...u32(d.length),...u16(nb.length),...u16(0),...nb,...d]);parts.push(local);
 const c=new Uint8Array([...u32(0x02014b50),...u16(20),...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(d.length),...u32(d.length),...u16(nb.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(offset),...nb]);central.push(c);offset+=local.length});
 let cenLen=central.reduce((a,x)=>a+x.length,0),cenOff=offset;const end=new Uint8Array([...u32(0x06054b50),...u16(0),...u16(0),...u16(entries.length),...u16(entries.length),...u32(cenLen),...u32(cenOff),...u16(0)]);
 const total=offset+cenLen+end.length,out=new Uint8Array(total);let p=0;parts.forEach(x=>{out.set(x,p);p+=x.length});central.forEach(x=>{out.set(x,p);p+=x.length});out.set(end,p);return out;
}
function xlsx(month,rows){
 const daily={};
 rows.forEach(x=>daily[x.date]=(daily[x.date]||0)+Number(x.amount));
 const grand=rows.reduce((a,x)=>a+Number(x.amount),0);
 const summary=[
  ["EXPENSES REPORT"],
  ["Selected Month",monthName(month)],
  ["Number of Expenses",rows.length],
  ["Grand Total",grand],
  [],
  ["DAILY TOTALS"],
  ["Date","Total for the Day"],
  ...Object.keys(daily).sort().map(d=>[fmt(d),daily[d]]),
  [],
  ["EXPENSE DETAILS"],
  ["Date","Expense","Amount"],
  ...rows.slice().sort((a,b)=>a.date.localeCompare(b.date)||a.created-b.created).map(x=>[fmt(x.date),x.desc,Number(x.amount)]),
  [],
  ["MONTHLY GRAND TOTAL",grand]
 ];
 const xmlTypes='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>';
 const rels='<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>';
 const wb='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Expense Report" sheetId="1" r:id="rId1"/></sheets></workbook>';
 const wbrel='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>';
 const styles='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="1"><font><sz val="11"/><name val="Arial"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellXfs count="1"><xf/></cellXfs></styleSheet>';
 return zipStore([["[Content_Types].xml",xmlTypes],["_rels/.rels",rels],["xl/workbook.xml",wb],["xl/_rels/workbook.xml.rels",wbrel],["xl/styles.xml",styles],["xl/worksheets/sheet1.xml",sheetXml(summary)]]);
}
$("excel").onclick=()=>{
 const mon=selectedMonth,rows=data.filter(x=>x.date.startsWith(mon));
 if(!mon)return alert("Please select a month.");if(!rows.length)return alert("There are no expenses for the selected month.");
 const bytes=xlsx(mon,rows),blob=new Blob([bytes],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="expenses-report-"+mon+".xlsx";a.click();URL.revokeObjectURL(a.href);
 show("Excel report created.");
};
setupTabs();
$("date").value=today();
populateMonths();
render();
renderDailyTotals();
// Section tabs: keep the screen short and show only the selected section.


// Keep the two month views synchronized after an update/import.
