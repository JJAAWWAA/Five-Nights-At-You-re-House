import { useState, useEffect, useRef, useCallback } from "react";

// ─── MAP LAYOUTS based on room count ───────────────────────────────────────
const MAP_LAYOUTS = {
  small: {
    nodes: [
      { id:"cam1",  label:"CAM 1",  x:35,  y:5,   w:20, h:14 },
      { id:"cam2",  label:"CAM 2",  x:5,   y:35,  w:20, h:14 },
      { id:"cam3",  label:"CAM 3",  x:68,  y:35,  w:20, h:14 },
      { id:"cam2b", label:"CAM 2B", x:22,  y:66,  w:20, h:14 },
      { id:"cam4",  label:"CAM 4",  x:55,  y:66,  w:20, h:14 },
      { id:"office",label:"YOU",    x:42,  y:76,  w:12, h:10, isOffice:true },
    ],
    connections:[["cam1","cam2"],["cam1","cam3"],["cam2","cam2b"],["cam3","cam4"],["cam2b","office"],["cam4","office"]],
    leftDoor:"cam2b", rightDoor:"cam4",
  },
  medium: {
    nodes: [
      { id:"cam1a", label:"CAM 1A", x:35,  y:3,   w:20, h:13 },
      { id:"cam1b", label:"CAM 1B", x:27,  y:17,  w:20, h:13 },
      { id:"cam1c", label:"CAM 1C", x:17,  y:31,  w:20, h:13 },
      { id:"cam5",  label:"CAM 5",  x:1,   y:25,  w:16, h:13 },
      { id:"cam3",  label:"CAM 3",  x:4,   y:57,  w:17, h:13 },
      { id:"cam2a", label:"CAM 2A", x:25,  y:59,  w:20, h:13 },
      { id:"cam2b", label:"CAM 2B", x:25,  y:73,  w:20, h:13 },
      { id:"cam4a", label:"CAM 4A", x:52,  y:59,  w:20, h:13 },
      { id:"cam4b", label:"CAM 4B", x:52,  y:73,  w:20, h:13 },
      { id:"cam6",  label:"CAM 6",  x:74,  y:55,  w:17, h:13 },
      { id:"cam7",  label:"CAM 7",  x:81,  y:23,  w:16, h:13 },
      { id:"office",label:"YOU",    x:45,  y:77,  w:11, h:9,  isOffice:true },
    ],
    connections:[
      ["cam1a","cam1b"],["cam1b","cam1c"],["cam1c","cam5"],["cam5","cam3"],
      ["cam3","cam2a"],["cam2a","cam2b"],["cam2b","office"],
      ["cam4a","cam4b"],["cam4b","office"],["cam4a","cam6"],["cam6","cam7"],
      ["cam1a","cam7"],["cam1b","cam4a"],
    ],
    leftDoor:"cam2b", rightDoor:"cam4b",
  },
  large: {
    nodes: [
      { id:"cam1a", label:"CAM 1A", x:34,  y:2,   w:20, h:12 },
      { id:"cam1b", label:"CAM 1B", x:26,  y:15,  w:20, h:12 },
      { id:"cam1c", label:"CAM 1C", x:16,  y:28,  w:20, h:12 },
      { id:"cam5",  label:"CAM 5",  x:1,   y:23,  w:15, h:12 },
      { id:"cam3",  label:"CAM 3",  x:3,   y:55,  w:16, h:12 },
      { id:"cam2a", label:"CAM 2A", x:24,  y:58,  w:20, h:12 },
      { id:"cam2b", label:"CAM 2B", x:24,  y:71,  w:20, h:12 },
      { id:"cam4a", label:"CAM 4A", x:52,  y:58,  w:20, h:12 },
      { id:"cam4b", label:"CAM 4B", x:52,  y:71,  w:20, h:12 },
      { id:"cam6",  label:"CAM 6",  x:73,  y:53,  w:16, h:12 },
      { id:"cam7",  label:"CAM 7",  x:81,  y:22,  w:16, h:12 },
      { id:"cam8",  label:"CAM 8",  x:62,  y:13,  w:16, h:12 },
      { id:"office",label:"YOU",    x:44,  y:75,  w:11, h:9,  isOffice:true },
    ],
    connections:[
      ["cam1a","cam1b"],["cam1b","cam1c"],["cam1c","cam5"],["cam5","cam3"],
      ["cam3","cam2a"],["cam2a","cam2b"],["cam2b","office"],
      ["cam4a","cam4b"],["cam4b","office"],["cam4a","cam6"],["cam6","cam7"],
      ["cam1a","cam8"],["cam8","cam7"],["cam1b","cam4a"],["cam1b","cam2a"],
    ],
    leftDoor:"cam2b", rightDoor:"cam4b",
  },
};

function getLayout(roomCount) {
  if (roomCount <= 3) return MAP_LAYOUTS.small;
  if (roomCount <= 5) return MAP_LAYOUTS.medium;
  return MAP_LAYOUTS.large;
}

const FALLBACK_NAMES = ["The Mirror One","The Watcher","The Crawler","Shadow Self","The Twin","The Hollow"];

// ─── MAP SVG ──────────────────────────────────────────────────────────────
function HouseMap({ layout, activeCam, onSelectCam, animatronics }) {
  const animMap = {};
  animatronics.forEach(a => {
    if (a.active) { if (!animMap[a.currentRoom]) animMap[a.currentRoom]=[]; animMap[a.currentRoom].push(a); }
  });

  return (
    <svg viewBox="0 0 100 92" style={{width:"100%",height:"100%",display:"block",background:"#050505"}}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* connections */}
      {layout.connections.map(([a,b],i)=>{
        const na=layout.nodes.find(n=>n.id===a), nb=layout.nodes.find(n=>n.id===b);
        if(!na||!nb) return null;
        return <line key={i} x1={na.x+na.w/2} y1={na.y+na.h/2} x2={nb.x+nb.w/2} y2={nb.y+nb.h/2} stroke="#1e1e1e" strokeWidth="0.6"/>;
      })}

      {/* nodes */}
      {layout.nodes.map(node=>{
        const isActive=activeCam===node.id;
        const hasAnim=!!animMap[node.id]?.length;
        const isOffice=node.isOffice;
        return (
          <g key={node.id} onClick={()=>!isOffice&&onSelectCam(node.id)} style={{cursor:isOffice?"default":"pointer"}}>
            {/* outer glow when anim present */}
            {hasAnim && <rect x={node.x-1} y={node.y-1} width={node.w+2} height={node.h+2} fill="none" stroke="#ff0000" strokeWidth="0.6" rx="0.5" opacity="0.7" style={{animation:"pulse 0.5s infinite"}}/>}
            <rect x={node.x} y={node.y} width={node.w} height={node.h}
              fill={isOffice?"#100800":isActive?"#071207":"#0a0a0a"}
              stroke={isOffice?"#6a5010":hasAnim?"#dd1100":isActive?"#00bb44":"#282828"}
              strokeWidth={isActive||hasAnim?"0.9":"0.4"} rx="0.5"
              filter={isActive||hasAnim?"url(#glow)":"none"}
            />
            {/* label */}
            {node.label.split(" ").map((word,wi)=>(
              <text key={wi}
                x={node.x+node.w/2} y={node.y+(isOffice?5:3.5)+(wi*3.5)}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={isOffice?3:2.8}
                fill={isOffice?"#c8a96e":hasAnim?"#ff6644":isActive?"#00ee55":"#555"}
                fontFamily="'Share Tech Mono',monospace" fontWeight="bold"
                style={{userSelect:"none"}}
              >{word}</text>
            ))}
            {hasAnim && <text x={node.x+node.w/2} y={node.y+node.h-1.5} textAnchor="middle" fontSize="2.5" fill="#ff3300" fontFamily="monospace">!</text>}
          </g>
        );
      })}
    </svg>
  );
}

// ─── CAMERA FEED ─────────────────────────────────────────────────────────
function CamFeed({ camId, layout, roomImages, animatronics, selfieImages }) {
  const node = layout.nodes.find(n=>n.id===camId);
  const camIndex = layout.nodes.filter(n=>!n.isOffice).findIndex(n=>n.id===camId);
  const img = roomImages[camIndex % roomImages.length] || null;
  const animHere = animatronics.filter(a=>a.currentRoom===camId&&a.active);

  return (
    <div style={{width:"100%",height:"100%",position:"relative",background:"#000",overflow:"hidden"}}>
      {img && <img src={img} alt="cam" style={{width:"100%",height:"100%",objectFit:"cover",filter:"brightness(0.3) sepia(0.7) hue-rotate(85deg) saturate(1.8)"}}/>}
      {/* scanlines */}
      <div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(0deg,rgba(0,60,0,0.08) 0px,transparent 2px,transparent 4px)",pointerEvents:"none"}}/>
      {/* vignette */}
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.8) 100%)",pointerEvents:"none"}}/>

      {/* animatronic — show selfie */}
      {animHere.map((a,i)=>{
        const selfie = selfieImages[i % Math.max(1,selfieImages.length)];
        return (
          <div key={i} style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.3)"}}>
            {selfie && (
              <img src={selfie} alt="!" style={{
                width:"55%",maxHeight:"65%",objectFit:"cover",
                filter:"brightness(0.45) sepia(1) hue-rotate(290deg) saturate(4) contrast(1.8)",
                borderRadius:"3px",animation:"pulse 0.8s infinite",
              }}/>
            )}
            <div style={{color:"#ff1100",fontFamily:"'Creepster',cursive",fontSize:"1.1rem",marginTop:"0.3rem",textShadow:"0 0 12px #ff0000",animation:"pulse 0.4s infinite"}}>
              ⚠ {a.name}
            </div>
          </div>
        );
      })}

      {/* HUD */}
      <div style={{position:"absolute",top:6,left:8,color:"#00ff0066",fontFamily:"'Share Tech Mono',monospace",fontSize:"0.6rem",letterSpacing:"0.05em"}}>
        {node?.label||camId} ● REC
      </div>
      <div style={{position:"absolute",top:8,right:8,width:"6px",height:"6px",borderRadius:"50%",background:"#ff0000",animation:"pulse 1s infinite"}}/>
    </div>
  );
}

// ─── MAIN ──────────────────────────────────────────────────────────────────
const PHASES = {INTRO:"intro",NAME:"name",GUIDE:"guide",UPLOAD_ROOMS:"upload_rooms",UPLOAD_SELFIES:"upload_selfies",ANALYZING:"analyzing",GAME:"game",DEAD:"dead",WIN:"win"};

export default function App() {
  const [phase, setPhase] = useState(PHASES.INTRO);
  const [playerName, setPlayerName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [roomImages, setRoomImages] = useState([]);
  const [selfieImages, setSelfieImages] = useState([]);
  const [layout, setLayout] = useState(null);
  const [houseData, setHouseData] = useState(null);
  const [activeCam, setActiveCam] = useState(null);
  const [camsOpen, setCamsOpen] = useState(false);
  const [animatronics, setAnimatronics] = useState([]);
  const [doorsClosed, setDoorsClosed] = useState({left:false,right:false});
  const [lightsOn, setLightsOn] = useState({left:false,right:false});
  const [power, setPower] = useState(100);
  const [hour, setHour] = useState(12);
  const [hourPct, setHourPct] = useState(0);
  const [jumpscare, setJumpscare] = useState(null);
  const [jumpscareImg, setJumpscareImg] = useState(null);
  const [ambientMsg, setAmbientMsg] = useState("");
  const [analysisLog, setAnalysisLog] = useState([]);
  const HOUR_MS = 42000;

  const toURL = f => URL.createObjectURL(f);

  const handleRoomUpload = e => {
    const files = Array.from(e.target.files);
    setRoomImages(p=>[...p,...files.map(toURL)]);
    e.target.value="";
  };

  const handleSelfieUpload = e => {
    const files = Array.from(e.target.files);
    setSelfieImages(p=>[...p,...files.map(toURL)]);
    e.target.value="";
  };

  // Detect iOS/Safari for Apple Photos hint
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);

  const runAnalysis = async () => {
    setPhase(PHASES.ANALYZING);
    const logs=["🔍 Scanning room layouts...","🚪 Mapping entry points...","👤 Analyzing occupant data...","👻 Creating animatronic profiles...","🗺️ Building house map...","⚠️ Threat calibration complete."];
    for(const l of logs){ await new Promise(r=>setTimeout(r,550)); setAnalysisLog(p=>[...p,l]); }

    const lay = getLayout(roomImages.length);
    setLayout(lay);

    try {
      const b64s = await Promise.all(roomImages.slice(0,3).map(url=>
        fetch(url).then(r=>r.blob()).then(b=>new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result.split(",")[1]);fr.readAsDataURL(b);}))
      ));
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",max_tokens:800,
          messages:[{role:"user",content:[
            ...b64s.map(b=>({type:"image",source:{type:"base64",media_type:"image/jpeg",data:b}})),
            {type:"text",text:`Analyze these room photos for a Five Nights at Freddy's horror game. Return ONLY raw JSON (no backticks, no markdown): {"roomDescriptions":["eerie 1-sentence desc for room 1","room 2","room 3"],"animatronicNames":["creepy name based on visible objects","2nd name","3rd name"],"ambientFlavor":"one eerie sentence about this house"}`}
          ]}]
        })
      });
      const data=await res.json();
      const txt=data.content.map(c=>c.text||"").join("").replace(/```json|```/g,"").trim();
      setHouseData(JSON.parse(txt));
      setAnalysisLog(p=>[...p,"✅ AI analysis complete."]);
    } catch(e) {
      setHouseData({roomDescriptions:roomImages.map((_,i)=>`Room ${i+1}: The shadows here are wrong.`),animatronicNames:FALLBACK_NAMES.slice(0,3),ambientFlavor:"The silence here has teeth."});
      setAnalysisLog(p=>[...p,"✅ House mapped."]);
    }
    await new Promise(r=>setTimeout(r,700));
    setPhase(PHASES.GAME);
  };

  // refs for timer closures
  const doorsRef=useRef(doorsClosed), lightsRef=useRef(lightsOn), camsRef=useRef(camsOpen), layoutRef=useRef(layout), selfiesRef=useRef(selfieImages);
  useEffect(()=>{doorsRef.current=doorsClosed;},[doorsClosed]);
  useEffect(()=>{lightsRef.current=lightsOn;},[lightsOn]);
  useEffect(()=>{camsRef.current=camsOpen;},[camsOpen]);
  useEffect(()=>{layoutRef.current=layout;},[layout]);
  useEffect(()=>{selfiesRef.current=selfieImages;},[selfieImages]);

  const triggerDeath = useCallback((animName)=>{
    const imgs=selfiesRef.current;
    setJumpscareImg(imgs.length?imgs[Math.floor(Math.random()*imgs.length)]:null);
    setJumpscare(animName);
    setTimeout(()=>setPhase(PHASES.DEAD),1300);
  },[]);

  // Game init
  useEffect(()=>{
    if(phase!==PHASES.GAME||!layout||!houseData) return;
    const nonOffice=layout.nodes.filter(n=>!n.isOffice);
    setActiveCam(nonOffice[0]?.id||null);
    const names=houseData.animatronicNames||FALLBACK_NAMES;
    const count=Math.min(3,Math.max(1,Math.ceil(roomImages.length/2)));
    setAnimatronics(Array.from({length:count},(_,i)=>({
      id:i,name:names[i]||FALLBACK_NAMES[i],
      currentRoom:nonOffice[Math.floor(Math.random()*nonOffice.length)].id,
      active:false,aggression:0.07+i*0.04,
    })));
    setPower(100); setHour(12); setHourPct(0);
    const hourStart={t:Date.now()};

    const hTimer=setInterval(()=>{ setHour(h=>{const n=h+1; if(n>=18){clearInterval(hTimer);setPhase(PHASES.WIN);} return n;}); hourStart.t=Date.now(); },HOUR_MS);
    const pTimer=setInterval(()=>setHourPct(((Date.now()-hourStart.t)/HOUR_MS)*100),300);
    const pwrTimer=setInterval(()=>{
      setPower(p=>{
        const d=0.35+(camsRef.current?0.3:0)+(doorsRef.current.left?0.3:0)+(doorsRef.current.right?0.3:0)+(lightsRef.current.left?0.2:0)+(lightsRef.current.right?0.2:0);
        const n=p-d; if(n<=0){triggerDeath("POWER");return 0;} return n;
      });
    },1000);

    const aTimer=setInterval(()=>{
      const lay=layoutRef.current; if(!lay) return;
      const graph={};
      lay.connections.forEach(([x,y])=>{
        if(!graph[x])graph[x]=[]; if(!graph[y])graph[y]=[];
        graph[x].push(y); graph[y].push(x);
      });
      setAnimatronics(prev=>prev.map(a=>{
        if(!a.active&&Math.random()<0.06) return{...a,active:true};
        if(!a.active||Math.random()>a.aggression) return a;
        const neighbors=graph[a.currentRoom]||[];
        if(!neighbors.length) return a;
        const next=neighbors[Math.floor(Math.random()*neighbors.length)];
        // check if arriving at door rooms
        if(next===lay.leftDoor&&!doorsRef.current.left){ triggerDeath(a.name); return a; }
        if(next===lay.rightDoor&&!doorsRef.current.right){ triggerDeath(a.name); return a; }
        // arriving at office directly
        const officeId=lay.nodes.find(n=>n.isOffice)?.id;
        if(next===officeId){ triggerDeath(a.name); return a; }
        return{...a,currentRoom:next};
      }));
    },3200);

    const ambs=["Check your doors.","Something moved.","Is that breathing?","Power is dropping.","They know where you are.","Don't look away.","Almost morning..."];
    const aAmt=setInterval(()=>{ setAmbientMsg(ambs[Math.floor(Math.random()*ambs.length)]); setTimeout(()=>setAmbientMsg(""),3000); },10000);

    return()=>{ clearInterval(hTimer);clearInterval(pTimer);clearInterval(pwrTimer);clearInterval(aTimer);clearInterval(aAmt); };
  },[phase,layout,houseData]);

  const animAtDoor=side=>animatronics.filter(a=>a.currentRoom===(side==="left"?layout?.leftDoor:layout?.rightDoor)&&a.active);

  // ─── CSS ───────────────────────────────────────────────────────────────
  const CSS=`
    @import url('https://fonts.googleapis.com/css2?family=Creepster&family=Share+Tech+Mono&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    html,body{height:100%;overflow:hidden;background:#000;}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.45}}
    @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes jumpscare{0%{transform:scale(0.2) rotate(-8deg);opacity:0}25%{transform:scale(1.2) rotate(3deg);opacity:1}100%{transform:scale(1) rotate(0deg);opacity:1}}
    @keyframes glitch1{0%,100%{clip-path:inset(20% 0 50% 0);transform:translateX(0)}40%{clip-path:inset(5% 0 70% 0);transform:translateX(-5px)}}
    @keyframes glitch2{0%,100%{clip-path:inset(60% 0 10% 0);transform:translateX(0)}60%{clip-path:inset(45% 0 25% 0);transform:translateX(5px)}}
    @keyframes blink{50%{opacity:0}}
    .btn{display:block;width:100%;background:#060000;border:1px solid #251000;color:#8a7050;font-family:'Share Tech Mono',monospace;font-size:0.7rem;padding:0.42rem 0.6rem;cursor:pointer;transition:all 0.15s;text-transform:uppercase;letter-spacing:0.05em;text-align:center;}
    .btn:hover{border-color:#7a1000;background:#100000;color:#c8a96e;}
    .btn.on{background:#1c0000;border-color:#ff3300;color:#ff9944;}
    ::-webkit-scrollbar{width:3px;background:#000}
    ::-webkit-scrollbar-thumb{background:#1a0000}
  `;

  // Shared container style
  const S={minHeight:"100vh",background:"#000",color:"#c8a96e",fontFamily:"'Share Tech Mono',monospace"};
  const center={display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"2rem"};

  // ─── INTRO ────────────────────────────────────────────────────────────
  if(phase===PHASES.INTRO) return (
    <div style={{...S,...center}}>
      <style>{CSS}</style>
      <div style={{animation:"fadeIn 1s ease"}}>
        <div style={{position:"relative",display:"inline-block"}}>
          <div style={{fontFamily:"'Creepster',cursive",fontSize:"clamp(2.5rem,9vw,5.5rem)",color:"#8B0000",textShadow:"0 0 40px #ff000044",lineHeight:1}}>FIVE NIGHTS</div>
          <div style={{position:"absolute",inset:0,fontFamily:"'Creepster',cursive",fontSize:"clamp(2.5rem,9vw,5.5rem)",color:"#ff003c",opacity:0.5,clipPath:"inset(20% 0 50% 0)",animation:"glitch1 3s infinite",pointerEvents:"none"}}>FIVE NIGHTS</div>
          <div style={{position:"absolute",inset:0,fontFamily:"'Creepster',cursive",fontSize:"clamp(2.5rem,9vw,5.5rem)",color:"#00ffee",opacity:0.35,clipPath:"inset(60% 0 10% 0)",animation:"glitch2 3s infinite",pointerEvents:"none"}}>FIVE NIGHTS</div>
        </div>
        <div style={{fontFamily:"'Creepster',cursive",fontSize:"clamp(1rem,3vw,1.4rem)",color:"#444",letterSpacing:"0.3em",margin:"0.2rem 0"}}>A T</div>
        <div style={{fontFamily:"'Creepster',cursive",fontSize:"clamp(2rem,7vw,4.5rem)",color:"#cc3300",textShadow:"0 0 25px #cc330033",marginBottom:"2.5rem"}}>YOUR HOUSE</div>
        <p style={{color:"#383838",maxWidth:"420px",margin:"0 auto 0.8rem",lineHeight:1.9,fontSize:"0.82rem"}}>
          Upload <span style={{color:"#a08040"}}>room photos</span> to build your map.<br/>
          Upload <span style={{color:"#cc2200"}}>selfies</span> — you become the jumpscare.<br/>
          Survive until <span style={{color:"#8B0000"}}>6 AM</span>.
        </p>
        <button className="btn" style={{width:"auto",padding:"0.85rem 3rem",fontSize:"1rem",fontFamily:"'Creepster',cursive",border:"2px solid #8B0000",color:"#c8a96e",letterSpacing:"0.15em",marginTop:"1.5rem"}} onClick={()=>setPhase(PHASES.NAME)}>
          START ▶
        </button>
      </div>
    </div>
  );

  // ─── NAME ─────────────────────────────────────────────────────────────
  if(phase===PHASES.NAME) return (
    <div style={{...S,...center}}>
      <style>{CSS}</style>
      <div style={{animation:"fadeIn 0.7s ease"}}>
        <div style={{fontFamily:"'Creepster',cursive",fontSize:"1.6rem",color:"#8B0000",marginBottom:"1.5rem"}}>BEFORE WE BEGIN...</div>
        <p style={{color:"#666",marginBottom:"0.4rem"}}>What is your name, night guard?</p>
        <p style={{color:"#252525",fontSize:"0.72rem",marginBottom:"1.5rem"}}>They'll be hunting specifically for you.</p>
        <input type="text" value={nameInput} onChange={e=>setNameInput(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter"&&nameInput.trim()){setPlayerName(nameInput.trim());setPhase(PHASES.GUIDE);}}}
          placeholder="Enter your name..." maxLength={20}
          style={{background:"#070000",border:"1px solid #8B0000",color:"#c8a96e",fontFamily:"'Share Tech Mono',monospace",fontSize:"1rem",padding:"0.65rem 1.5rem",outline:"none",width:"260px",textAlign:"center",letterSpacing:"0.08em",display:"block",margin:"0 auto"}}
        />
        <br/>
        <button className="btn" style={{width:"auto",padding:"0.65rem 2rem",fontFamily:"'Creepster',cursive",fontSize:"1rem",display:"inline-block"}}
          onClick={()=>{if(nameInput.trim()){setPlayerName(nameInput.trim());setPhase(PHASES.GUIDE);}}}>
          THAT'S ME →
        </button>
      </div>
    </div>
  );

  // ─── GUIDE ────────────────────────────────────────────────────────────
  if(phase===PHASES.GUIDE) return (
    <div style={{...S,...center,overflowY:"auto"}}>
      <style>{CSS}</style>
      <div style={{animation:"fadeIn 0.7s ease",maxWidth:"520px"}}>
        <div style={{fontFamily:"'Creepster',cursive",fontSize:"1.7rem",color:"#8B0000",marginBottom:"0.4rem"}}>HELLO, {playerName.toUpperCase()}</div>
        <p style={{color:"#333",marginBottom:"2rem",fontSize:"0.78rem"}}>Follow these instructions.</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",marginBottom:"2rem",textAlign:"left"}}>
          <div style={{border:"1px solid #180a00",padding:"1rem",background:"#040000"}}>
            <div style={{color:"#cc4400",marginBottom:"0.6rem",fontSize:"0.82rem"}}>📷 ROOM PHOTOS</div>
            <div style={{color:"#444",fontSize:"0.72rem",lineHeight:1.8}}>
              Upload 2–8 photos of rooms.<br/>
              <span style={{color:"#8B0000"}}>Apple Photos supported.</span><br/><br/>
              <span style={{color:"#252525"}}>2–3 → small map</span><br/>
              <span style={{color:"#252525"}}>4–5 → medium map</span><br/>
              <span style={{color:"#252525"}}>6+ → full map</span>
            </div>
          </div>
          <div style={{border:"1px solid #180a00",padding:"1rem",background:"#040000"}}>
            <div style={{color:"#cc4400",marginBottom:"0.6rem",fontSize:"0.82rem"}}>🤳 SELFIE JUMPSCARES</div>
            <div style={{color:"#444",fontSize:"0.72rem",lineHeight:1.8}}>
              Take 1–5 selfies of yourself.<br/>
              Pick from <span style={{color:"#8B0000"}}>Apple Photos</span> or use your camera.<br/><br/>
              <span style={{color:"#8B0000"}}>Make your scariest face.</span><br/>
              We'll filter them to look horrifying.
            </div>
          </div>
        </div>
        <button className="btn" style={{width:"auto",padding:"0.75rem 2.5rem",fontFamily:"'Creepster',cursive",fontSize:"1.1rem",border:"2px solid #8B0000",color:"#c8a96e",display:"inline-block"}}
          onClick={()=>setPhase(PHASES.UPLOAD_ROOMS)}>
          I'M READY →
        </button>
      </div>
    </div>
  );

  // ─── UPLOAD ROOMS ─────────────────────────────────────────────────────
  if(phase===PHASES.UPLOAD_ROOMS) return (
    <div style={{...S,...center,overflowY:"auto"}}>
      <style>{CSS}</style>
      <div style={{animation:"fadeIn 0.6s ease",maxWidth:"480px",width:"100%"}}>
        <div style={{color:"#8B0000",fontFamily:"'Creepster',cursive",fontSize:"1.5rem",marginBottom:"0.4rem"}}>STEP 1: ROOM PHOTOS</div>
        <p style={{color:"#333",fontSize:"0.75rem",marginBottom:"1.2rem"}}>Upload 2–8 room photos. More photos = bigger map & more cameras.</p>
        {roomImages.length>0&&(
          <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem",marginBottom:"1rem",justifyContent:"center"}}>
            {roomImages.map((url,i)=>(
              <div key={i} style={{position:"relative"}}>
                <img src={url} alt="" style={{width:"65px",height:"50px",objectFit:"cover",border:"1px solid #2a0000",filter:"brightness(0.55) sepia(0.5)"}}/>
                <div style={{position:"absolute",bottom:0,left:0,right:0,background:"#000c",fontSize:"0.5rem",color:"#00ff88",textAlign:"center"}}>✓ R{i+1}</div>
              </div>
            ))}
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.6rem",marginBottom:"0.8rem"}}>
          <label style={{display:"block",padding:"1.4rem 0.8rem",border:"2px dashed #251000",cursor:"pointer",background:"#060000",textAlign:"center"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor="#8B0000"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="#251000"}>
            <input type="file" accept="image/*,image/heic,image/heif" multiple onChange={handleRoomUpload} style={{display:"none"}}/>
            <div style={{fontSize:"1.5rem",marginBottom:"0.2rem"}}>📱</div>
            <div style={{color:"#c8a96e",fontSize:"0.75rem"}}>Photo Library</div>
            <div style={{color:"#333",fontSize:"0.6rem",marginTop:"0.15rem"}}>{isIOS?"Apple Photos":"Device photos"}</div>
          </label>
          <label style={{display:"block",padding:"1.4rem 0.8rem",border:"2px dashed #251000",cursor:"pointer",background:"#060000",textAlign:"center"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor="#8B0000"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="#251000"}>
            <input type="file" accept="image/*" capture="environment" onChange={handleRoomUpload} style={{display:"none"}}/>
            <div style={{fontSize:"1.5rem",marginBottom:"0.2rem"}}>📷</div>
            <div style={{color:"#c8a96e",fontSize:"0.75rem"}}>Take Photo</div>
            <div style={{color:"#333",fontSize:"0.6rem",marginTop:"0.15rem"}}>Use camera now</div>
          </label>
        </div>
        <div style={{color:"#333",fontSize:"0.72rem",marginBottom:"0.8rem"}}>
          {roomImages.length} photo{roomImages.length!==1?"s":""} uploaded
          {roomImages.length<2?<span style={{color:"#333"}}> — need at least 2</span>:<span style={{color:"#00ff88"}}> ✓ ready</span>}
        </div>
        <button className="btn" style={{width:"auto",padding:"0.65rem 2rem",fontFamily:"'Creepster',cursive",fontSize:"1rem",display:"inline-block",opacity:roomImages.length<2?0.25:1}}
          onClick={()=>roomImages.length>=2&&setPhase(PHASES.UPLOAD_SELFIES)}>
          NEXT: SELFIES →
        </button>
      </div>
    </div>
  );

  // ─── UPLOAD SELFIES ───────────────────────────────────────────────────
  if(phase===PHASES.UPLOAD_SELFIES) return (
    <div style={{...S,...center,overflowY:"auto"}}>
      <style>{CSS}</style>
      <div style={{animation:"fadeIn 0.6s ease",maxWidth:"480px",width:"100%"}}>
        <div style={{color:"#8B0000",fontFamily:"'Creepster',cursive",fontSize:"1.5rem",marginBottom:"0.4rem"}}>STEP 2: YOUR FACE</div>
        <p style={{color:"#333",fontSize:"0.75rem",marginBottom:"1.2rem"}}>Upload 1–5 photos of <span style={{color:"#cc3300"}}>yourself</span>. They become the animatronic jumpscares — filtered to look terrifying.</p>
        {selfieImages.length>0&&(
          <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem",marginBottom:"1rem",justifyContent:"center"}}>
            {selfieImages.map((url,i)=>(
              <div key={i} style={{position:"relative"}}>
                <img src={url} alt="" style={{width:"65px",height:"65px",objectFit:"cover",border:"1px solid #2a0000",filter:"brightness(0.4) sepia(1) hue-rotate(290deg) saturate(3) contrast(1.6)"}}/>
                <div style={{position:"absolute",bottom:0,left:0,right:0,background:"#000c",fontSize:"0.5rem",color:"#ff4400",textAlign:"center"}}>😈 S{i+1}</div>
              </div>
            ))}
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.6rem",marginBottom:"0.8rem"}}>
          <label style={{display:"block",padding:"1.4rem 0.8rem",border:"2px dashed #251000",cursor:"pointer",background:"#060000",textAlign:"center"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor="#8B0000"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="#251000"}>
            <input type="file" accept="image/*,image/heic,image/heif" multiple onChange={handleSelfieUpload} style={{display:"none"}}/>
            <div style={{fontSize:"1.5rem",marginBottom:"0.2rem"}}>📱</div>
            <div style={{color:"#c8a96e",fontSize:"0.75rem"}}>Photo Library</div>
            <div style={{color:"#333",fontSize:"0.6rem",marginTop:"0.15rem"}}>{isIOS?"Apple Photos":"Device photos"}</div>
          </label>
          <label style={{display:"block",padding:"1.4rem 0.8rem",border:"2px dashed #251000",cursor:"pointer",background:"#060000",textAlign:"center"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor="#8B0000"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="#251000"}>
            <input type="file" accept="image/*" capture="user" onChange={handleSelfieUpload} style={{display:"none"}}/>
            <div style={{fontSize:"1.5rem",marginBottom:"0.2rem"}}>🤳</div>
            <div style={{color:"#c8a96e",fontSize:"0.75rem"}}>Take Selfie</div>
            <div style={{color:"#333",fontSize:"0.6rem",marginTop:"0.15rem"}}>Front camera</div>
          </label>
        </div>
        <div style={{color:"#333",fontSize:"0.72rem",marginBottom:"0.8rem"}}>
          {selfieImages.length} selfie{selfieImages.length!==1?"s":""} uploaded
          {selfieImages.length<1?<span style={{color:"#333"}}> — need at least 1</span>:<span style={{color:"#00ff88"}}> ✓ ready</span>}
        </div>
        <button className="btn" style={{width:"auto",padding:"0.65rem 2rem",fontFamily:"'Creepster',cursive",fontSize:"1rem",display:"inline-block",opacity:selfieImages.length<1?0.25:1}}
          onClick={()=>selfieImages.length>=1&&runAnalysis()}>
          BUILD MY NIGHTMARE →
        </button>
      </div>
    </div>
  );

  // ─── ANALYZING ────────────────────────────────────────────────────────
  if(phase===PHASES.ANALYZING) return (
    <div style={{...S,...center}}>
      <style>{CSS}</style>
      <div style={{color:"#8B0000",fontFamily:"'Creepster',cursive",fontSize:"1.4rem",marginBottom:"2rem",animation:"pulse 1s infinite"}}>ANALYZING YOUR HOME...</div>
      <div style={{textAlign:"left",fontSize:"0.82rem",minWidth:"280px"}}>
        {analysisLog.map((l,i)=>(
          <div key={i} style={{color:i===analysisLog.length-1?"#c8a96e":"#2a2a2a",marginBottom:"0.5rem",animation:"fadeIn 0.4s ease"}}>{l}</div>
        ))}
        <span style={{animation:"blink 1s infinite",color:"#8B0000"}}>▌</span>
      </div>
    </div>
  );

  // ─── WIN ──────────────────────────────────────────────────────────────
  if(phase===PHASES.WIN) return (
    <div style={{...S,...center}}>
      <style>{CSS}</style>
      <div style={{animation:"fadeIn 1s ease"}}>
        <div style={{fontFamily:"'Creepster',cursive",fontSize:"clamp(3rem,10vw,5.5rem)",color:"#d4a800",textShadow:"0 0 40px #d4a80055",marginBottom:"0.5rem"}}>6 AM</div>
        <div style={{color:"#c8a96e",fontSize:"1.2rem",marginBottom:"0.8rem"}}>YOU SURVIVED, {playerName.toUpperCase()}</div>
        <p style={{color:"#333",marginBottom:"3rem",fontSize:"0.78rem"}}>The animatronics retreat.<br/><span style={{color:"#8B0000"}}>They'll remember your face.</span></p>
        <button className="btn" style={{width:"auto",padding:"0.75rem 2rem",fontFamily:"'Creepster',cursive",fontSize:"1rem",border:"2px solid #d4a800",color:"#d4a800",display:"inline-block"}} onClick={()=>window.location.reload()}>PLAY AGAIN</button>
      </div>
    </div>
  );

  // ─── DEAD ─────────────────────────────────────────────────────────────
  if(phase===PHASES.DEAD) return (
    <div style={{...S,...center,overflow:"hidden",position:"relative"}}>
      <style>{CSS}</style>
      {jumpscareImg&&<img src={jumpscareImg} alt="!" style={{position:"fixed",inset:0,width:"100%",height:"100%",objectFit:"cover",filter:"brightness(0.55) sepia(1) hue-rotate(275deg) saturate(5) contrast(2)",animation:"jumpscare 0.5s ease forwards",zIndex:0}}/>}
      <div style={{position:"relative",zIndex:1,animation:"jumpscare 0.6s ease forwards"}}>
        <div style={{fontFamily:"'Creepster',cursive",fontSize:"clamp(3rem,10vw,6rem)",color:"#8B0000",textShadow:"0 0 60px #ff0000bb",marginBottom:"0.2rem"}}>GAME OVER</div>
        <div style={{color:"#cc4422",marginBottom:"0.3rem",fontSize:"0.9rem"}}>{jumpscare==="POWER"?"The power ran out.":`${jumpscare} got into your room.`}</div>
        <div style={{color:"#222",marginBottom:"3rem",fontSize:"0.75rem"}}>{playerName} did not survive the night.</div>
        <button className="btn" style={{width:"auto",padding:"0.75rem 2rem",fontFamily:"'Creepster',cursive",fontSize:"1rem",display:"inline-block"}} onClick={()=>window.location.reload()}>TRY AGAIN</button>
      </div>
    </div>
  );

  // ─── GAME ─────────────────────────────────────────────────────────────
  if(phase===PHASES.GAME&&layout) {
    const pwrColor=power>50?"#00ee77":power>25?"#ffaa00":"#ff2200";
    const leftA=animAtDoor("left"), rightA=animAtDoor("right");

    return (
      <div style={{height:"100vh",background:"#000",color:"#c8a96e",fontFamily:"'Share Tech Mono',monospace",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <style>{CSS}</style>

        {/* TOP BAR */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.35rem 0.8rem",borderBottom:"1px solid #100000",background:"#020000",flexShrink:0,gap:"0.5rem"}}>
          <div style={{fontFamily:"'Creepster',cursive",color:"#8B0000",fontSize:"0.95rem",letterSpacing:"0.06em",whiteSpace:"nowrap"}}>5N@YH — {playerName.toUpperCase()}</div>
          <div style={{display:"flex",gap:"1.2rem",alignItems:"center"}}>
            <div style={{textAlign:"center"}}>
              <div style={{color:"#222",fontSize:"0.55rem"}}>TIME</div>
              <div style={{fontFamily:"'Creepster',cursive",fontSize:"1rem",color:"#c8a96e"}}>{hour>12?hour-12:hour} AM</div>
              <div style={{width:"50px",height:"2px",background:"#0a0a0a"}}><div style={{height:"2px",background:"#c8a96e44",width:`${hourPct}%`,transition:"width 0.3s"}}/></div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{color:"#222",fontSize:"0.55rem"}}>POWER</div>
              <div style={{fontFamily:"'Creepster',cursive",fontSize:"1rem",color:pwrColor,animation:power<20?"pulse 0.5s infinite":"none"}}>{Math.round(power)}%</div>
              <div style={{width:"50px",height:"2px",background:"#0a0a0a"}}><div style={{height:"2px",background:pwrColor,width:`${power}%`,transition:"width 1s"}}/></div>
            </div>
          </div>
          <div style={{display:"flex",gap:"0.3rem"}}>
            {animatronics.map((a,i)=>(
              <div key={i} style={{fontSize:"0.55rem",textAlign:"center",maxWidth:"52px"}}>
                <div style={{color:a.active?"#ff3300":"#181818",transition:"color 1.5s"}}>●</div>
                <div style={{color:"#1a1a1a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN */}
        <div style={{flex:1,display:"flex",overflow:"hidden",minHeight:0}}>

          {/* CAM / OFFICE */}
          <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
            {camsOpen ? (
              <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0}}>
                {/* Feed */}
                <div style={{flex:1,minHeight:0}}>
                  {activeCam&&<CamFeed camId={activeCam} layout={layout} roomImages={roomImages} animatronics={animatronics} selfieImages={selfieImages}/>}
                </div>
                {/* Map */}
                <div style={{height:"190px",background:"#030303",borderTop:"1px solid #0c0000",padding:"0.4rem",flexShrink:0,position:"relative"}}>
                  <HouseMap layout={layout} activeCam={activeCam} onSelectCam={setActiveCam} animatronics={animatronics}/>
                  <div style={{position:"absolute",bottom:4,left:6,fontSize:"0.5rem",color:"#1a1a1a",pointerEvents:"none"}}>CLICK ROOM TO SWITCH CAM</div>
                </div>
              </div>
            ) : (
              // OFFICE
              <div style={{flex:1,background:"radial-gradient(ellipse at center,#0c0400 0%,#000 100%)",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1rem 1.5rem",position:"relative"}}>
                {/* LEFT */}
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.4rem"}}>
                  <div style={{width:"65px",height:"100px",border:`1.5px solid ${doorsClosed.left?"#ff3300":"#150000"}`,background:doorsClosed.left?"#110000":"#040000",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.5rem",color:doorsClosed.left?"#ff5533":"#0d0000",transition:"all 0.2s"}}>
                    {doorsClosed.left?"CLOSED":"OPEN"}
                  </div>
                  {lightsOn.left&&(
                    <div style={{fontSize:"0.6rem",color:leftA.length?"#ff3300":"#c8a96e",animation:leftA.length?"pulse 0.4s infinite":"none",textAlign:"center",minHeight:"0.8rem"}}>
                      {leftA.length?leftA.map(a=>a.name).join(", "):"clear"}
                    </div>
                  )}
                </div>

                {/* Center */}
                <div style={{textAlign:"center",flex:1,padding:"0.5rem"}}>
                  <div style={{fontFamily:"'Creepster',cursive",color:"#2a1200",fontSize:"1.1rem",marginBottom:"0.4rem"}}>YOUR OFFICE</div>
                  {houseData?.roomDescriptions?.[0]&&<div style={{color:"#150800",fontSize:"0.68rem",maxWidth:"160px",margin:"0 auto",lineHeight:1.6}}>{houseData.roomDescriptions[0]}</div>}
                  {ambientMsg&&<div style={{color:"#8B0000",fontSize:"0.72rem",marginTop:"0.8rem",animation:"fadeIn 0.4s ease",fontStyle:"italic"}}>{ambientMsg}</div>}
                </div>

                {/* RIGHT */}
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.4rem"}}>
                  <div style={{width:"65px",height:"100px",border:`1.5px solid ${doorsClosed.right?"#ff3300":"#150000"}`,background:doorsClosed.right?"#110000":"#040000",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.5rem",color:doorsClosed.right?"#ff5533":"#0d0000",transition:"all 0.2s"}}>
                    {doorsClosed.right?"CLOSED":"OPEN"}
                  </div>
                  {lightsOn.right&&(
                    <div style={{fontSize:"0.6rem",color:rightA.length?"#ff3300":"#c8a96e",animation:rightA.length?"pulse 0.4s infinite":"none",textAlign:"center",minHeight:"0.8rem"}}>
                      {rightA.length?rightA.map(a=>a.name).join(", "):"clear"}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANEL */}
          <div style={{width:"130px",borderLeft:"1px solid #0c0000",background:"#010000",display:"flex",flexDirection:"column",padding:"0.5rem",gap:"0.35rem",flexShrink:0,overflowY:"auto"}}>
            <div style={{color:"#181818",fontSize:"0.58rem",letterSpacing:"0.1em",borderBottom:"1px solid #0c0000",paddingBottom:"0.3rem",marginBottom:"0.15rem"}}>CONTROLS</div>

            <button className={`btn ${camsOpen?"on":""}`} onClick={()=>setCamsOpen(c=>!c)}>
              {camsOpen?"📹 CLOSE":"📹 CAMERAS"}
            </button>

            <div style={{color:"#181818",fontSize:"0.56rem",marginTop:"0.4rem"}}>LEFT DOOR</div>
            <button className={`btn ${doorsClosed.left?"on":""}`} onClick={()=>setDoorsClosed(d=>({...d,left:!d.left}))}>🚪 {doorsClosed.left?"OPEN":"CLOSE"}</button>
            <button className={`btn ${lightsOn.left?"on":""}`} onClick={()=>setLightsOn(l=>({...l,left:!l.left}))}>💡 {lightsOn.left?"OFF":"LIGHT"}</button>

            <div style={{color:"#181818",fontSize:"0.56rem",marginTop:"0.4rem"}}>RIGHT DOOR</div>
            <button className={`btn ${doorsClosed.right?"on":""}`} onClick={()=>setDoorsClosed(d=>({...d,right:!d.right}))}>🚪 {doorsClosed.right?"OPEN":"CLOSE"}</button>
            <button className={`btn ${lightsOn.right?"on":""}`} onClick={()=>setLightsOn(l=>({...l,right:!l.right}))}>💡 {lightsOn.right?"OFF":"LIGHT"}</button>

            <div style={{flex:1}}/>

            <div style={{borderTop:"1px solid #0c0000",paddingTop:"0.4rem"}}>
              <div style={{color:"#181818",fontSize:"0.56rem",marginBottom:"0.35rem"}}>THREATS</div>
              {animatronics.map((a,i)=>(
                <div key={i} style={{marginBottom:"0.25rem"}}>
                  <div style={{color:a.active?"#ee3300":"#141414",fontSize:"0.6rem",transition:"color 1.5s"}}>
                    {a.active?"▶":"○"} {a.name}
                  </div>
                  {a.active&&layout&&(
                    <div style={{color:"#141414",fontSize:"0.52rem",paddingLeft:"0.6rem"}}>
                      {layout.nodes.find(n=>n.id===a.currentRoom)?.label||"???"}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{color:"#0f0f0f",fontSize:"0.5rem",lineHeight:1.6,borderTop:"1px solid #0c0000",paddingTop:"0.35rem"}}>
              Watch cams. Close doors when threats are near. Manage power.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
