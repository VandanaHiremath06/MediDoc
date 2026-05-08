const u=["Paracetamol","Ibuprofen","Amoxicillin","Azithromycin","Ciprofloxacin","Metformin","Omeprazole","Amlodipine","Atorvastatin","Levothyroxine","Lisinopril","Metoprolol","Albuterol","Gabapentin","Hydrochlorothiazide","Aspirin","Clopidogrel","Warfarin","Insulin","Dolo","Crocin","Calpol","Augmentin","Combiflam","Allegra","Cetirizine","Montelukast","Pantoprazole","Ranitidine","Domperidone","Ondansetron","Diclofenac","Tramadol","Codeine"];async function C(t){console.log("AI Cleanup - Input OCR text:",t);const e=localStorage.getItem("OPENAI_API_KEY")||"";if(e)try{return await y(t,e)}catch(n){console.warn("GPT cleanup failed, falling back to pattern matching:",n)}return N(t)}async function y(t,e){var i,c;const n=`You are a medical prescription OCR cleanup assistant. Extract structured data from this messy OCR text.

OCR Text:
${t}

Extract and return ONLY valid JSON in this exact format:
{
  "hospitalName": "string or empty",
  "doctorName": "string or empty",
  "patientName": "string or empty",
  "age": "number or empty",
  "ageUnit": "years or months",
  "medicines": [
    {
      "name": "medicine name",
      "dosage": "e.g., 500mg, 1 tablet",
      "frequencyPerDay": number,
      "days": number,
      "timings": ["09:00", "21:00"]
    }
  ]
}

Rules:
- If a field is not found, use empty string ""
- Age must be a number or empty, max 120
- Correct common medicine name spelling (e.g., "Paracetmol" → "Paracetamol")
- Extract dosage with units (mg, tablets, ml, etc.)
- Frequency is times per day (1-4)
- Default timings: [09:00] for 1x, [09:00, 21:00] for 2x, [09:00, 14:00, 21:00] for 3x
- Return ONLY the JSON, no explanations`,o=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${e}`},body:JSON.stringify({model:"gpt-3.5-turbo",messages:[{role:"user",content:n}],temperature:.3,max_tokens:1e3})});if(!o.ok)throw new Error(`GPT API error: ${o.statusText}`);const r=(((c=(i=(await o.json()).choices[0])==null?void 0:i.message)==null?void 0:c.content)||"{}").match(/\{[\s\S]*\}/);if(!r)throw new Error("No JSON found in GPT response");const l=JSON.parse(r[0]);return console.log("GPT cleaned data:",l),x(l)}function N(t){var l;const e=t.split(`
`).map(i=>i.trim()).filter(i=>i),n={hospitalName:"",doctorName:"",patientName:"",age:"",ageUnit:"years",medicines:[]},o=[/hospital[:\s]*(.+)/i,/clinic[:\s]*(.+)/i,/medical\s+center[:\s]*(.+)/i];for(const i of o){for(const c of e){const s=c.match(i);if(s){n.hospitalName=s[1].trim();break}}if(n.hospitalName)break}const a=[/dr\.?\s+([a-z\s]+)/i,/doctor[:\s]*([a-z\s]+)/i,/physician[:\s]*([a-z\s]+)/i];for(const i of a){for(const c of e){const s=c.match(i);if(s){n.doctorName="Dr. "+s[1].trim();break}}if(n.doctorName)break}const m=[/patient[:\s]*([a-z\s]+)/i,/name[:\s]*([a-z\s]+)/i];for(const i of m){for(const c of e){const s=c.match(i);if(s&&s[1].length>2&&s[1].length<50){n.patientName=s[1].trim();break}}if(n.patientName)break}const r=[/age[:\s]*(\d+)\s*(years?|months?|yrs?|mos?)?/i,/(\d+)\s*(years?|months?|yrs?|mos?)\s+old/i,/(\d+)\/([MF])/i];for(const i of r){for(const c of e){const s=c.match(i);if(s){const f=parseInt(s[1]);if(f>0&&f<=120){n.age=f.toString();const p=((l=s[2])==null?void 0:l.toLowerCase())||"";p.includes("month")||p.includes("mo")?n.ageUnit="months":n.ageUnit="years";break}}}if(n.age)break}return n.medicines=P(t),console.log("Pattern-based cleaned data:",n),Promise.resolve(n)}function P(t){const e=[],n=t.split(`
`).map(a=>a.trim()).filter(a=>a),o=[/([A-Za-z]+(?:cillin|zole|prazole|mycin|xacin|olol|pine|statin|formin))\s+(\d+\s*(?:mg|tablet|ml|g))/i,/Tab\.?\s+([A-Za-z]+)\s+(\d+\s*(?:mg|tablet))/i,/Cap\.?\s+([A-Za-z]+)\s+(\d+\s*(?:mg|capsule))/i,/Syp\.?\s+([A-Za-z]+)\s+(\d+\s*(?:ml|mg))/i];for(const a of n)for(const m of o){const r=a.match(m);if(r){const l=r[1],i=r[2],c=A(l),s=a.match(/(\d+)\s*(?:times?|x)\s*(?:per|a)?\s*day/i),f=s?Math.min(4,parseInt(s[1])):2,p=a.match(/(?:for\s+)?(\d+)\s*days?/i),h=p?parseInt(p[1]):7,d=g(f);e.push({name:c,dosage:i.trim(),frequencyPerDay:f,days:h,timings:d})}}return e.length===0&&e.push({name:"",dosage:"",frequencyPerDay:2,days:7,timings:["09:00","21:00"]}),e}function A(t){const e=t.toLowerCase();let n=t,o=1/0;for(const a of u){const m=b(e,a.toLowerCase()),r=Math.max(2,a.length*.3);m<r&&m<o&&(o=m,n=a)}return n}function b(t,e){const n=Array.from({length:t.length+1},(o,a)=>Array.from({length:e.length+1},(m,r)=>a===0?r:r===0?a:0));for(let o=1;o<=t.length;o++)for(let a=1;a<=e.length;a++){const m=t[o-1]===e[a-1]?0:1;n[o][a]=Math.min(n[o-1][a]+1,n[o][a-1]+1,n[o-1][a-1]+m)}return n[t.length][e.length]}function g(t){const e={1:["09:00"],2:["09:00","21:00"],3:["09:00","14:00","21:00"],4:["09:00","13:00","17:00","21:00"]};return e[Math.min(4,t)]||e[2]}function x(t){if(t.age){const e=parseInt(t.age);(isNaN(e)||e<0||e>120)&&(t.age="")}return t.ageUnit!=="years"&&t.ageUnit!=="months"&&(t.ageUnit="years"),Array.isArray(t.medicines)||(t.medicines=[]),t.medicines=t.medicines.map(e=>({name:e.name||"",dosage:e.dosage||"",frequencyPerDay:Math.min(4,Math.max(1,parseInt(e.frequencyPerDay)||2)),days:Math.max(1,parseInt(e.days)||7),timings:Array.isArray(e.timings)&&e.timings.length>0?e.timings:g(e.frequencyPerDay||2)})),t}export{C as cleanOCRWithAI};
