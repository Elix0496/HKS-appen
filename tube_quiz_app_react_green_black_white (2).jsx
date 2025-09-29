import React, { useEffect, useState } from 'react';

// Tube-Quiz App (single-file React) — Green / Black / White theme
// Tailwind CSS assumed. Save as App.jsx or similar. LocalStorage used for persistence.
// Features implemented:
// - Quiz (uses Age, Time/Week, Muscle Groups)
// - Feed where users can post images/videos (file input) and captions
// - Posting rewards SXP (Sport eXperience Points). Daily streaks tracked — extra SXP on consecutive days.
// - Profile shows SXP, streak, posts. Local leaderboard (localStorage).
// - Simple responsive layout, primary colors: green (#16A34A tailwind 'green-600'), black, white.

const THEME = {
  bg: 'bg-black',
  card: 'bg-white',
  accent: 'text-green-500',
  btn: 'bg-green-600 text-white',
};

// util: load/save localStorage
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
}

// initial user
const DEFAULT_USER = { id: 'user_local', name: 'Du', sxp: 0, streak: 0, lastPostDate: null };

export default function TubeQuizApp() {
  const [user, setUser] = useState(() => load('tq_user', DEFAULT_USER));
  const [posts, setPosts] = useState(() => load('tq_posts', []));
  const [view, setView] = useState('quiz'); // 'quiz' | 'feed' | 'profile' | 'leaderboard'

  useEffect(() => save('tq_user', user), [user]);
  useEffect(() => save('tq_posts', posts), [posts]);

  return (
    <div className={`min-h-screen ${THEME.bg} text-white p-6`}> 
      <div className="max-w-5xl mx-auto">
        <Header view={view} setView={setView} user={user} />

        <main className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2">
            {view === 'quiz' && <Quiz onComplete={(plan)=>{ setView('feed'); /* optionally use plan */ }} />}
            {view === 'feed' && <Feed posts={posts} setPosts={setPosts} user={user} setUser={setUser} />}
            {view === 'profile' && <Profile user={user} posts={posts} setUser={setUser} />}
            {view === 'leaderboard' && <Leaderboard posts={posts} setView={setView} user={user} setUser={setUser} />}
          </section>

          <aside className="lg:col-span-1">
            <div className={`p-4 rounded-2xl ${THEME.card} text-black`}> 
              <h3 className="font-bold text-lg">Dein Fortschritt</h3>
              <div className="mt-3">
                <div className="text-sm text-gray-600">SXP</div>
                <div className="text-2xl font-semibold">{user.sxp} <span className="text-sm font-normal">SXP</span></div>

                <div className="mt-3 text-sm text-gray-600">Aktueller Streak</div>
                <div className="text-lg">{user.streak} Tage</div>

                <div className="mt-4">
                  <button className={`px-3 py-2 rounded ${THEME.btn} w-full`} onClick={()=>setView('profile')}>Zur Profilansicht</button>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-white text-black">
              <h4 className="font-semibold">Kurztipps</h4>
              <ul className="mt-2 text-sm list-disc list-inside">
                <li>Poste täglich für Streak-Boni.</li>
                <li>10 SXP für jeden Post, +5 SXP pro aufeinanderfolgenden Tag (streak bonus)</li>
                <li>Beachte: lokale Speicherung — uppgrade für Backend möglich.</li>
              </ul>
            </div>

          </aside>
        </main>

        <footer className="mt-8 text-center text-sm text-gray-400">Tube-Quiz App — Demo. Für Produktion: Backend, Auth & Moderation hinzufügen.</footer>
      </div>
    </div>
  );
}

function Header({ view, setView, user }) {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black font-bold">TQ</div>
        <div>
          <h1 className="text-xl font-bold">Tube-Quiz</h1>
          <div className="text-sm text-green-300">Train smarter — earn SXP</div>
        </div>
      </div>

      <nav className="flex gap-2">
        <NavButton active={view==='quiz'} onClick={()=>setView('quiz')}>Quiz</NavButton>
        <NavButton active={view==='feed'} onClick={()=>setView('feed')}>Feed</NavButton>
        <NavButton active={view==='profile'} onClick={()=>setView('profile')}>Profil</NavButton>
        <NavButton active={view==='leaderboard'} onClick={()=>setView('leaderboard')}>Leaderboard</NavButton>
      </nav>
    </header>
  );
}
function NavButton({ children, onClick, active }){
  return (
    <button onClick={onClick} className={`px-3 py-2 rounded ${active ? 'bg-green-700' : 'bg-white/10'}`}>{children}</button>
  );
}

// -------------------- Quiz Component (compact, reuses previous logic) --------------------
function Quiz({ onComplete }){
  const [age, setAge] = useState(30);
  const [timePerWeek, setTimePerWeek] = useState('2-4');
  const [muscles, setMuscles] = useState(['full']);
  const muscleOptions = [ {id:'upper', label:'Oberkörper'}, {id:'lower', label:'Unterkörper'}, {id:'core', label:'Core / Rumpf'}, {id:'full', label:'Ganzkörper'} ];
  const [generated, setGenerated] = useState(null);

  function toggle(id){ setMuscles(prev => prev.includes(id) ? prev.filter(p=>p!==id) : [...prev.filter(p=>'full'!==p), id]); }

  function generate(){
    // simplified plan
    const parsedAge = Number(age) || 30;
    let intensity = parsedAge > 50 ? 'gelenkschonend' : (parsedAge < 30 ? 'hoch' : 'moderat');
    let sessions = timePerWeek === '<2' ? 2 : timePerWeek === '2-4' ? 3 : timePerWeek === '5-7' ? 4 : 5;
    const plan = { summary:`${sessions} Einheiten/Woche — Intensität: ${intensity}`, sessions: [] };
    const sel = muscles.length ? muscles : ['full'];
    for(let i=0;i<sessions;i++){
      plan.sessions.push({ title:`Einheit ${i+1}`, focus: sel[i%sel.length], duration: timePerWeek === '<2' ? 30 : 45 });
    }
    setGenerated(plan);
    onComplete && onComplete(plan);
  }

  return (
    <div className="p-6 rounded-2xl bg-white text-black">
      <h2 className="text-xl font-bold">Quiz — Erstelle dein Training</h2>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-sm">Alter</label>
          <input type="number" min={13} max={100} value={age} onChange={e=>setAge(e.target.value)} className="w-full p-2 border rounded mt-1" />
        </div>
        <div>
          <label className="text-sm">Zeit pro Woche</label>
          <select value={timePerWeek} onChange={e=>setTimePerWeek(e.target.value)} className="w-full p-2 border rounded mt-1">
            <option value="<2">Weniger als 2 Std</option>
            <option value="2-4">2–4 Std</option>
            <option value="5-7">5–7 Std</option>
            <option value=">7">Mehr als 7 Std</option>
          </select>
        </div>
        <div>
          <label className="text-sm">Muskelgruppen</label>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {muscleOptions.map(m=> (
              <button key={m.id} onClick={()=>toggle(m.id)} className={`p-2 border rounded text-sm ${muscles.includes(m.id)?'bg-green-50':''}`}>{m.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button className="px-4 py-2 rounded bg-green-600 text-white" onClick={generate}>Plan erstellen</button>
      </div>

      {generated && (
        <div className="mt-4 p-3 border rounded bg-gray-50 text-black">
          <div className="font-semibold">{generated.summary}</div>
          <ul className="mt-2 list-disc list-inside">
            {generated.sessions.map((s,i)=> <li key={i}>{s.title} — Fokus: {s.focus} — {s.duration} min</li>)}
          </ul>
        </div>
      )}

    </div>
  );
}

// -------------------- Feed Component --------------------
function Feed({ posts, setPosts, user, setUser }){
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');

  useEffect(()=>{ if(file){ const url = URL.createObjectURL(file); setPreview(url); return ()=>URL.revokeObjectURL(url); } else setPreview(null); },[file]);

  function handleFile(e){ const f = e.target.files?.[0]; if(f) setFile(f); }

  function post(){
    if(!file && !caption) return alert('Bitte Bild/Video oder Text hinzufügen.');
    const now = new Date();
    const post = { id: 'p_'+Date.now(), userId: user.id, userName: user.name, caption, createdAt: now.toISOString(), mediaType: file?.type?.startsWith('video') ? 'video' : (file ? 'image': null), media: preview, sxpAward: 10 };
    const newPosts = [post, ...posts];
    setPosts(newPosts);

    // award SXP and manage streak
    awardSxpForPost(user, setUser);

    // reset
    setFile(null); setCaption(''); setPreview(null);
  }

  return (
    <div className="p-6 rounded-2xl bg-white text-black">
      <h2 className="text-xl font-bold">Feed</h2>
      <div className="mt-3 border p-3 rounded">
        <label className="text-sm">Bild / Video hochladen</label>
        <input type="file" accept="image/*,video/*" onChange={handleFile} className="block mt-2" />
        {preview && (
          <div className="mt-2">
            {file?.type?.startsWith('video') ? (
              <video src={preview} controls className="max-h-60 w-full rounded" />
            ) : (
              <img src={preview} alt="preview" className="max-h-60 w-full object-contain rounded" />
            )}
          </div>
        )}
        <textarea value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Beschreibe deinen Beitrag..." className="w-full p-2 border rounded mt-2" />
        <div className="flex gap-2 mt-2">
          <button className="px-4 py-2 rounded bg-green-600 text-white" onClick={post}>Posten & +SXP</button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {posts.length===0 && <div className="text-sm text-gray-600">Noch keine Beiträge. Sei der Erste!</div>}
        {posts.map(p=> (
          <article key={p.id} className="border rounded p-3 bg-gray-50 text-black">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{p.userName}</div>
                <div className="text-xs text-gray-600">{new Date(p.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-sm text-green-600">+{p.sxpAward} SXP</div>
            </div>
            <p className="mt-2">{p.caption}</p>
            {p.media && (
              <div className="mt-2">
                {p.mediaType === 'video' ? <video src={p.media} controls className="w-full max-h-72 rounded"/> : <img src={p.media} alt="media" className="w-full rounded" />}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

function awardSxpForPost(user, setUser){
  const today = new Date();
  const last = user.lastPostDate ? new Date(user.lastPostDate) : null;
  const sameDay = last && last.toDateString() === today.toDateString();
  const yesterday = last && (new Date(today.getFullYear(), today.getMonth(), today.getDate()-1).toDateString() === last.toDateString());

  let newStreak = user.streak;
  if(sameDay){
    // already posted today — still count but don't increase streak or award again (app prevents double award ideally)
  } else if(yesterday){
    newStreak = (user.streak || 0) + 1;
  } else {
    newStreak = 1;
  }

  // base SXP
  let sxpGain = 10;
  // streak bonus: +5 per streak day (capped)
  const streakBonus = Math.min(newStreak-1, 10) * 5;
  sxpGain += Math.max(0, streakBonus);

  const updated = { ...user, sxp: (user.sxp || 0) + sxpGain, streak: newStreak, lastPostDate: today.toISOString() };
  setUser(updated);
  // save handled by effect in parent
  alert(`Du hast ${sxpGain} SXP erhalten! (Streak: ${newStreak} Tage)`);
}

// -------------------- Profile --------------------
function Profile({ user, posts, setUser }){
  const myPosts = posts.filter(p=>p.userId === user.id);
  function reset(){ if(confirm('Reset SXP und Streak?')){ setUser({...user, sxp:0, streak:0, lastPostDate:null}); } }
  return (
    <div className="p-6 rounded-2xl bg-white text-black">
      <h2 className="text-xl font-bold">Profil</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="p-3 border rounded">
          <div className="text-sm text-gray-600">Name</div>
          <div className="font-semibold">{user.name}</div>
        </div>
        <div className="p-3 border rounded">
          <div className="text-sm text-gray-600">SXP</div>
          <div className="font-semibold text-green-600">{user.sxp}</div>
        </div>
        <div className="p-3 border rounded">
          <div className="text-sm text-gray-600">Streak</div>
          <div className="font-semibold">{user.streak} Tage</div>
        </div>
        <div className="p-3 border rounded">
          <div className="text-sm text-gray-600">Letzter Post</div>
          <div className="font-semibold">{user.lastPostDate ? new Date(user.lastPostDate).toLocaleString() : '—'}</div>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-semibold">Meine Beiträge ({myPosts.length})</h3>
        <div className="mt-2 space-y-3">
          {myPosts.map(p=> (
            <div key={p.id} className="border p-2 rounded">
              <div className="text-xs text-gray-600">{new Date(p.createdAt).toLocaleString()}</div>
              <div>{p.caption}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button className="px-3 py-2 rounded bg-red-500 text-white" onClick={reset}>Reset</button>
      </div>
    </div>
  );
}

// -------------------- Leaderboard (local) --------------------
function Leaderboard({ posts, setView, user, setUser }){
  // Build leaderboard by user from posts and local user only
  const allUsers = [ load('tq_user', DEFAULT_USER) ]; // in this demo we only have local user
  const sorted = allUsers.sort((a,b)=> (b.sxp||0)-(a.sxp||0));
  return (
    <div className="p-6 rounded-2xl bg-white text-black">
      <h2 className="text-xl font-bold">Leaderboard</h2>
      <div className="mt-3">
        {sorted.map((u,i)=> (
          <div key={u.id} className="flex items-center justify-between p-2 border-b">
            <div>{i+1}. {u.name}</div>
            <div className="text-green-600 font-semibold">{u.sxp} SXP</div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-gray-600">Hinweis: In dieser Demo ist das Leaderboard lokal. Für mehrere Nutzer brauchst du ein Backend.</div>
    </div>
  );
}
