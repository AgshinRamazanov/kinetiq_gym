const config=window.SUPABASE_CONFIG||{};
const loginForm=document.getElementById('login-form');
const loginButton=loginForm.querySelector('button[type="submit"]');
const createButton=loginForm.querySelector('[data-action="create-account"]');
const status=document.createElement('p');status.className='cloud-status';loginForm.appendChild(status);
let accountMode=window.getAccountMode?.()||'login',supabase=null,currentUser=null,syncTimer=null,hydrating=false;
function setCloudAccountMode(mode='login'){
  accountMode=mode==='signup'?'signup':'login';
  loginButton.textContent=accountMode==='signup'?'Create account':'Log in';
  createButton.textContent=accountMode==='signup'?'Already have an account? Log in':'Create an account';
  setStatus(accountMode==='signup'?'Create a secure account to synchronize your data.':'Welcome back.');
  if(window.setAccountMode)window.setAccountMode(accountMode);
}
async function signOutEverywhere(){
  if(supabase&&currentUser)await supabase.auth.signOut();
  currentUser=null;sessionStorage.removeItem('form-cloud-hydrated');localStorage.removeItem('form-profile');
  if(typeof renderProfile==='function')renderProfile(null);
  if(typeof renderTrainProfile==='function')renderTrainProfile();
}
window.formCloudSignOut=signOutEverywhere;

function setStatus(message,tone=''){status.textContent=message;status.className=`cloud-status ${tone}`.trim()}
function configured(){return /^https:\/\/.+\.supabase\.co$/.test(config.url||'')&&Boolean(config.anonKey)}
function localRows(userId){const rows=[];for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(!key?.startsWith('form-'))continue;try{rows.push({user_id:userId,key,value:JSON.parse(localStorage.getItem(key)),updated_at:new Date().toISOString()})}catch{}}return rows}
async function uploadLocalData(){if(!supabase||!currentUser||hydrating)return;const rows=localRows(currentUser.id);if(!rows.length)return;const{error}=await supabase.from('user_data').upsert(rows,{onConflict:'user_id,key'});if(error)throw error}
async function hydrateOrMigrate(){const{data,error}=await supabase.from('user_data').select('key,value');if(error)throw error;if(data?.length){hydrating=true;data.forEach(row=>localStorage.setItem(row.key,JSON.stringify(row.value)));hydrating=false;sessionStorage.setItem('form-cloud-hydrated','1');location.reload();return}await uploadLocalData();setStatus('Cloud sync is active.','online')}
async function syncOne(key,value){if(!supabase||!currentUser||hydrating||!key?.startsWith('form-'))return;const{error}=await supabase.from('user_data').upsert({user_id:currentUser.id,key,value,updated_at:new Date().toISOString()},{onConflict:'user_id,key'});if(error)setStatus('Saved locally · cloud retry needed','error');else setStatus('Synced securely','online')}

if(!configured()){
  setStatus('Cloud setup is ready · add your Supabase project details.');
}else{
  try{
    const{createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    supabase=createClient(config.url,config.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    window.formSupabase=supabase;
    const{data:{session}}=await supabase.auth.getSession();currentUser=session?.user||null;
    if(currentUser){setStatus('Cloud sync is active.','online');if(!sessionStorage.getItem('form-cloud-hydrated'))await hydrateOrMigrate()}
    supabase.auth.onAuthStateChange((_event,sessionNow)=>{currentUser=sessionNow?.user||null});
    window.addEventListener('localDataChanged',event=>{clearTimeout(syncTimer);syncTimer=setTimeout(()=>syncOne(event.detail.key,event.detail.value),350)});
  }catch(error){setStatus('Cloud connection could not start.','error')}
}

createButton.addEventListener('click',event=>{
  if(!configured())return;
  event.stopImmediatePropagation();setCloudAccountMode(accountMode==='login'?'signup':'login');
},true);

loginForm.addEventListener('submit',async event=>{
  if(!configured())return;
  event.preventDefault();event.stopImmediatePropagation();
  const name=document.getElementById('login-name').value.trim(),email=document.getElementById('login-email').value.trim(),password=document.getElementById('login-password').value;
  loginButton.disabled=true;loginButton.textContent=accountMode==='signup'?'Creating account…':'Logging in…';
  try{
    const response=accountMode==='signup'?await supabase.auth.signUp({email,password,options:{data:{name}}}):await supabase.auth.signInWithPassword({email,password});
    if(response.error)throw response.error;
    currentUser=response.data.user;
    if(!response.data.session){setStatus('Check your email to confirm the account.','online');return}
    const profile={name:name||response.data.user.user_metadata?.name||email.split('@')[0],email};localStorage.setItem('form-profile',JSON.stringify(profile));
    await hydrateOrMigrate();renderProfile(profile);if(typeof renderHomeAccount==='function')renderHomeAccount(profile);
  }catch(error){setStatus(error.message||'Authentication failed.','error')}
  finally{loginButton.disabled=false;loginButton.textContent=accountMode==='signup'?'Create account':'Log in'}
},true);

document.getElementById('logout-button').addEventListener('click',async event=>{
  if(!supabase||!currentUser)return;
  event.preventDefault();event.stopImmediatePropagation();await signOutEverywhere();document.getElementById('train-profile').classList.remove('open');homeToast('Logged out from cloud account.');
},true);
