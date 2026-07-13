const fuelModes = {
  match:{label:'DAILY TARGET',note:'Plans against the daily targets saved on Home.',calories:1,protein:1,carbs:1,fat:1},
  lose:{label:'FAT-LOSS TARGET',note:'Uses a moderate 15% calorie reduction while protecting protein.',calories:.85,protein:1,carbs:.82,fat:.9},
  gain:{label:'WEIGHT-GAIN TARGET',note:'Uses a measured 12% calorie increase with additional protein and carbohydrates.',calories:1.12,protein:1.08,carbs:1.15,fat:1.08}
};

// Curated per-serving estimates. Ingredient weights make the assumptions visible;
// production should eventually replace these with a licensed nutrition database.
const mealLibrary = [
  [
    {name:'Greek yogurt power bowl',image:'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=300&q=80',ingredients:'250g Greek yogurt · 50g oats · 100g berries · 15g almonds',calories:430,protein:32,carbs:48,fat:12},
    {name:'Eggs, avocado & sourdough',image:'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=300&q=80',ingredients:'3 eggs · 80g sourdough · 70g avocado · tomato',calories:510,protein:26,carbs:42,fat:27},
    {name:'Protein oats with berries',image:'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=300&q=80',ingredients:'70g oats · 30g whey · 120g berries · 200ml milk',calories:450,protein:30,carbs:62,fat:10}
  ],
  [
    {name:'Herb chicken & grains',image:'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=300&q=80',ingredients:'160g chicken · 180g brown rice · greens · 10g olive oil',calories:610,protein:48,carbs:66,fat:18},
    {name:'Turkey quinoa power plate',image:'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80',ingredients:'160g turkey · 170g quinoa · vegetables · 8g olive oil',calories:570,protein:45,carbs:58,fat:17},
    {name:'Tofu sesame rice bowl',image:'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&q=80',ingredients:'180g tofu · 180g rice · vegetables · 12g sesame dressing',calories:540,protein:29,carbs:72,fat:18}
  ],
  [
    {name:'Cottage cheese fruit cup',image:'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=300&q=80',ingredients:'220g cottage cheese · 150g fruit · 8g honey',calories:260,protein:24,carbs:28,fat:6},
    {name:'Banana protein smoothie',image:'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=300&q=80',ingredients:'30g whey · 1 banana · 250ml milk · ice',calories:320,protein:30,carbs:45,fat:5},
    {name:'Hummus crunch plate',image:'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=300&q=80',ingredients:'100g hummus · 60g pita · 180g raw vegetables',calories:300,protein:12,carbs:34,fat:14}
  ],
  [
    {name:'Miso salmon plate',image:'https://images.unsplash.com/photo-1539136788836-5699e78bfc75?auto=format&fit=crop&w=300&q=80',ingredients:'170g salmon · 180g rice · vegetables · 15g miso glaze',calories:590,protein:44,carbs:52,fat:24},
    {name:'Lean beef harvest bowl',image:'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80',ingredients:'170g lean beef · 220g potatoes · vegetables · 8g olive oil',calories:650,protein:50,carbs:58,fat:25},
    {name:'Lemon chicken vegetables',image:'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=300&q=80',ingredients:'170g chicken · 200g potatoes · 200g vegetables · 8g olive oil',calories:520,protein:46,carbs:46,fat:16}
  ]
];
const mealMeta=[['08:00','BREAKFAST'],['12:30','LUNCH'],['16:00','SNACK'],['19:00','DINNER']];
const portions=[.75,1,1.25,1.5];
let fuelMode=readLocal('form-fuel-mode','match');
let currentPlan=[];

function activeFuelTargets(){const base=readLocal('form-daily-goals',defaultGoals),mode=fuelModes[fuelMode];return Object.fromEntries(['calories','protein','carbs','fat'].map(key=>[key,Math.round(base[key]*mode[key])]))}
function scaledMeal(meal,portion){return {...meal,portion,...Object.fromEntries(['calories','protein','carbs','fat'].map(key=>[key,Math.round(meal[key]*portion)]))}}
function planTotals(plan){return ['calories','protein','carbs','fat'].reduce((out,key)=>(out[key]=plan.reduce((sum,meal)=>sum+meal[key],0),out),{})}
function planScore(plan,targets){const total=planTotals(plan),weights={calories:2,protein:1.5,carbs:1,fat:1};return Object.keys(weights).reduce((score,key)=>score+weights[key]*Math.abs(total[key]-targets[key])/Math.max(1,targets[key]),0)}
function buildClosestPlan(targets){
  let best=null,bestScore=Infinity;
  for(const b of mealLibrary[0])for(const bp of portions)for(const l of mealLibrary[1])for(const lp of portions)for(const s of mealLibrary[2])for(const sp of portions)for(const d of mealLibrary[3])for(const dp of portions){
    const plan=[scaledMeal(b,bp),scaledMeal(l,lp),scaledMeal(s,sp),scaledMeal(d,dp)],score=planScore(plan,targets);
    if(score<bestScore){best=plan;bestScore=score}
  }
  return best;
}
function honestMatch(total,targets){const errors=['calories','protein','carbs','fat'].map(key=>Math.abs(total[key]-targets[key])/Math.max(1,targets[key]));return Math.max(0,Math.round(100-(errors.reduce((a,b)=>a+b,0)/errors.length*100)))}
function renderPlan(){
  const targets=activeFuelTargets(),total=planTotals(currentPlan),list=document.getElementById('fuel-meal-list');list.innerHTML='';
  currentPlan.forEach((meal,index)=>{const button=document.createElement('button');button.className='meal';button.dataset.mealIndex=index;button.dataset.plannedId=`${fuelMode}-${index}-${meal.name}-${meal.portion}`;button.dataset.name=meal.name;['calories','protein','carbs','fat'].forEach(key=>button.dataset[key]=meal[key]);button.innerHTML=`<img src="${meal.image}" alt="${meal.name}"><div><small>${mealMeta[index][0]} · ${homeT(mealMeta[index][1])} · ${meal.portion}× ${homeT('SERVING')}</small><h3>${meal.name}</h3><p class="meal-ingredients">${meal.ingredients}</p><p>${meal.calories} kcal · P ${meal.protein} · C ${meal.carbs} · F ${meal.fat}</p></div><b class="meal-number">+</b>`;button.addEventListener('click',()=>window.addPlannedMeal?.(button));list.appendChild(button)});
  document.getElementById('plan-total').textContent=`${total.calories.toLocaleString()} / ${targets.calories.toLocaleString()} kcal`;
  const match=honestMatch(total,targets);document.getElementById('plan-match').textContent=`${match}%`;document.getElementById('plan-match').classList.toggle('imperfect',match<95);
  window.dispatchEvent(new CustomEvent('fuelRendered'));
}
function regeneratePlan(){currentPlan=buildClosestPlan(activeFuelTargets());renderPlan()}
function renderFuel(){
  const targets=activeFuelTargets(),mode=fuelModes[fuelMode];document.querySelectorAll('[data-fuel-mode]').forEach(button=>button.classList.toggle('selected',button.dataset.fuelMode===fuelMode));document.getElementById('fuel-mode-note').textContent=homeT(mode.note);document.getElementById('nutrition-target-label').textContent=homeT(mode.label);document.getElementById('nutrition-calories').textContent=targets.calories.toLocaleString();['protein','carbs','fat'].forEach(key=>{document.getElementById(`nutrition-${key}`).textContent=`${targets[key]}g ${homeT('goal')} · 0g ${homeT('eaten')}`;document.getElementById(`nutrition-${key}-bar`).style.width='0%'});regeneratePlan();
}
document.querySelectorAll('[data-fuel-mode]').forEach(button=>button.addEventListener('click',()=>{fuelMode=button.dataset.fuelMode;writeLocal('form-fuel-mode',fuelMode);renderFuel();homeToast(`${fuelModes[fuelMode].label.toLowerCase()} applied.`)}));
document.getElementById('swap-meal').addEventListener('click',()=>{const choices=document.getElementById('swap-choice-list');choices.innerHTML='';currentPlan.forEach((meal,index)=>{const button=document.createElement('button');button.className='swap-choice';button.innerHTML=`<span>${String(index+1).padStart(2,'0')}</span><div><small>${mealMeta[index][0]} · ${mealMeta[index][1]}</small><strong>${meal.name}</strong></div><b>→</b>`;button.addEventListener('click',()=>{const library=mealLibrary[index],nextBase=library[(library.findIndex(item=>item.name===meal.name)+1)%library.length];currentPlan[index]=scaledMeal(nextBase,meal.portion);renderPlan();document.getElementById('meal-swap').classList.remove('open');homeToast(`${mealMeta[index][1].toLowerCase()} swapped — totals recalculated.`)});choices.appendChild(button)})});
window.addEventListener('goalsUpdated',renderFuel);
window.addEventListener('languageChanged',renderFuel);
renderFuel();
