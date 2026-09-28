import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import * as THREE from "three";
import { ExternalLink, Gamepad2, Map, Menu, Pause, Radio, RotateCcw, Sparkles, X } from "lucide-react";

type Project = { name: string; type: string; color: number; blurb: string; position: [number, number] };

const PROFILE = {
  name: "TU NOMBRE",
  role: "creative developer",
  location: "Buenos Aires / anywhere",
};

const PROJECTS: Project[] = [
  { name: "NOVA HOUSE", type: "web experience", color: 0xd7ff57, blurb: "Una casa digital para ideas que todavía no tienen nombre.", position: [-13, -9] },
  { name: "SIGNAL / NOISE", type: "creative direction", color: 0xff806b, blurb: "Datos, ritmo y una identidad que aprendió a moverse.", position: [12, -2] },
  { name: "AFTER HOURS", type: "web experiment", color: 0xa594ff, blurb: "Un experimento nocturno sobre luz, pausa y curiosidad.", position: [1, 13] },
];

function makeTextTexture(text: string, color: string, small = false) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024; canvas.height = small ? 190 : 260;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#15171b"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.strokeRect(14, 14, canvas.width - 28, canvas.height - 28);
  ctx.fillStyle = color; ctx.font = `${small ? 34 : 58}px Arial`; ctx.letterSpacing = "4px"; ctx.fillText(text, 52, small ? 118 : 158);
  return new THREE.CanvasTexture(canvas);
}

function createWorld(scene: THREE.Scene) {
  const group = new THREE.Group();
  const lime = new THREE.MeshStandardMaterial({ color: 0xd7ff57, roughness: 0.72, metalness: 0.04 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x273039, roughness: 0.9 });
  const coral = new THREE.MeshStandardMaterial({ color: 0xff806b, roughness: 0.72 });
  const violet = new THREE.MeshStandardMaterial({ color: 0xa594ff, roughness: 0.72 });
  const water = new THREE.MeshStandardMaterial({ color: 0x101d29, roughness: 0.3, metalness: 0.65 });

  const waterMesh = new THREE.Mesh(new THREE.CircleGeometry(38, 64), water);
  waterMesh.rotation.x = -Math.PI / 2; waterMesh.position.y = -1.3; group.add(waterMesh);
  const island = new THREE.Mesh(new THREE.CylinderGeometry(25, 28, 1.5, 12), new THREE.MeshStandardMaterial({ color: 0x1c2829, roughness: 1 }));
  island.position.y = -0.6; group.add(island);

  const roadMat = new THREE.MeshStandardMaterial({ color: 0x0d1115, roughness: 0.92 });
  const road = new THREE.Mesh(new THREE.BoxGeometry(4, 0.08, 49), roadMat); road.position.y = 0.2; group.add(road);
  const roadCross = new THREE.Mesh(new THREE.BoxGeometry(49, 0.09, 4), roadMat); roadCross.position.y = 0.21; group.add(roadCross);
  const roadLine = new THREE.MeshStandardMaterial({ color: 0x9bb53f, emissive: 0x33450d, emissiveIntensity: 0.5 });
  for (let i = -20; i < 21; i += 4) {
    const dash = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 1.5), roadLine); dash.position.set(0, 0.29, i); group.add(dash);
    const dash2 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.04, 0.12), roadLine); dash2.position.set(i, 0.3, 0); group.add(dash2);
  }

  const makeTree = (x: number, z: number, scale = 1) => {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.3, 1.6, 6), new THREE.MeshStandardMaterial({ color: 0x6e493e })); trunk.position.y = 1.1;
    const crown = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.9, 7), new THREE.MeshStandardMaterial({ color: 0x344c3e, roughness: 1 })); crown.position.y = 3.0;
    tree.add(trunk, crown); tree.position.set(x, 0, z); tree.scale.setScalar(scale); group.add(tree);
  };
  [[-9,-13,1],[-15,8,1.15],[10,-13,.8],[16,8,1.1],[-18,-2,.72],[17,14,.7],[-8,17,.72]].forEach(([x,z,s]) => makeTree(x,z,s));

  const makeProject = (project: Project) => {
    const [x,z] = project.position;
    const mat = new THREE.MeshStandardMaterial({ color: project.color, emissive: project.color, emissiveIntensity: 0.12, roughness: .65 });
    const pad = new THREE.Mesh(new THREE.BoxGeometry(5.4, .35, 3.1), dark); pad.position.set(x, .45, z); group.add(pad);
    const sign = new THREE.Mesh(new THREE.BoxGeometry(4.6, 2, .16), mat); sign.position.set(x, 2.2, z - 1.4); sign.rotation.x = -.16; group.add(sign);
    const texture = makeTextTexture(project.name, `#${project.color.toString(16).padStart(6,"0")}`); const label = new THREE.Mesh(new THREE.PlaneGeometry(4.15, 1.05), new THREE.MeshBasicMaterial({ map: texture, transparent: true })); label.position.set(x, 2.2, z - 1.29); label.rotation.x = -.16; group.add(label);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(.24, 16, 16), new THREE.MeshBasicMaterial({ color: project.color })); orb.position.set(x, 3.8, z); group.add(orb);
    const light = new THREE.PointLight(project.color, 2.4, 9); light.position.set(x, 3.2, z); group.add(light);
  };
  PROJECTS.forEach(makeProject);

  for (let i = 0; i < 14; i++) {
    const x = (i % 2 ? 1 : -1) * (6 + (i * 3) % 12); const z = -20 + (i * 7) % 39;
    const block = new THREE.Mesh(new THREE.BoxGeometry(1.4 + (i % 3), .8 + (i % 2), 1.4), i % 3 === 0 ? coral : dark);
    block.position.set(x, .55, z); block.rotation.y = i * .4; group.add(block);
  }
  scene.add(group);
  return group;
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(false);
  const nearbyRef = useRef<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [nearby, setNearby] = useState<Project | null>(null);
  const [selected, setSelected] = useState<Project | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x151218); scene.fog = new THREE.Fog(0x151218, 16, 60);
    const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, .1, 100); camera.position.set(12, 11, 15);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" }); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7)); renderer.setSize(innerWidth, innerHeight); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
    scene.add(new THREE.HemisphereLight(0xa3b7cb, 0x101114, 1.8)); const sun = new THREE.DirectionalLight(0xffc09c, 3.6); sun.position.set(-10, 23, 9); sun.castShadow = true; scene.add(sun);
    const world = createWorld(scene);
    const car = new THREE.Group(); const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, .42, 2.35), new THREE.MeshStandardMaterial({ color: 0xd7ff57, roughness: .45, metalness: .15 })); body.position.y = .65; body.castShadow = true; car.add(body);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(.9, .38, 1.0), new THREE.MeshStandardMaterial({ color: 0x172027, roughness: .2, metalness: .35 })); cabin.position.set(0, 1.02, -.1); car.add(cabin);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x080a0d, roughness: .8 }); [-.72,.72].forEach(x => [-.72,.72].forEach(z => { const w = new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.16,16), wheelMat); w.rotation.z = Math.PI/2; w.position.set(x,.43,z); car.add(w); }));
    const head = new THREE.PointLight(0xd7ff57, 2.8, 7); head.position.set(0,.75,1.25); car.add(head); car.position.set(0,0,7); scene.add(car);
    const starsGeo = new THREE.BufferGeometry(); const starPositions = new Float32Array(240 * 3); for(let i=0;i<240;i++){ starPositions[i*3]=(Math.random()-.5)*75; starPositions[i*3+1]=8+Math.random()*25; starPositions[i*3+2]=(Math.random()-.5)*75; } starsGeo.setAttribute("position", new THREE.BufferAttribute(starPositions,3)); scene.add(new THREE.Points(starsGeo, new THREE.PointsMaterial({ color: 0xffd4ac, size: .05, transparent: true, opacity: .75 })));
    const keys: Record<string, boolean> = {}; const onKey = (e: KeyboardEvent) => { keys[e.key.toLowerCase()] = e.type === "keydown"; if(e.key.toLowerCase()==="m" && e.type === "keydown") setMapOpen(v=>!v); if(e.key === "Escape" && e.type === "keydown") { setMenuOpen(false); setSelected(null); } if((e.key === "Enter" || e.key === " ") && e.type === "keydown") setStarted(true); }; window.addEventListener("keydown", onKey); window.addEventListener("keyup", onKey);
    const onResize = () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); }; window.addEventListener("resize", onResize);
    const clock = new THREE.Clock(); let animation = 0;
    const tick = () => { animation = requestAnimationFrame(tick); const dt = Math.min(clock.getDelta(), .04); if(!pausedRef.current){ const speed = (keys.shift ? 10 : 5) * dt; const turn = (keys.a || keys.arrowleft ? 1 : 0) - (keys.d || keys.arrowright ? 1 : 0); const drive = (keys.w || keys.arrowup ? 1 : 0) - (keys.s || keys.arrowdown ? 1 : 0); car.rotation.y += turn * dt * 1.7; car.translateZ(-drive * speed); car.position.x = THREE.MathUtils.clamp(car.position.x,-21,21); car.position.z = THREE.MathUtils.clamp(car.position.z,-21,21); car.position.y = Math.sin(clock.elapsedTime*5)*.025; }
      const desired = new THREE.Vector3(car.position.x + 10*Math.sin(car.rotation.y), 8.4, car.position.z + 10*Math.cos(car.rotation.y)); camera.position.lerp(desired, .06); camera.lookAt(car.position.x, .7, car.position.z); world.rotation.y = Math.sin(clock.elapsedTime*.08)*.006; renderer.render(scene,camera); const nearest = PROJECTS.map(p=>({p,d:Math.hypot(car.position.x-p.position[0],car.position.z-p.position[1])})).sort((a,b)=>a.d-b.d)[0]; const nextNearby = nearest.d<6 ? nearest.p : null; const nextKey = nextNearby?.name ?? null; if (nextKey !== nearbyRef.current) { nearbyRef.current = nextKey; setNearby(nextNearby); } };
    tick();
    return () => { cancelAnimationFrame(animation); window.removeEventListener("keydown", onKey); window.removeEventListener("keyup", onKey); window.removeEventListener("resize", onResize); renderer.dispose(); scene.clear(); };
  }, []);

  return <main className="experience-shell">
    <canvas ref={canvasRef} className="experience-canvas" />
    <div className="vignette" />
    <header className="game-header"><button className="game-brand" onClick={()=>setMenuOpen(v=>!v)}><span className="brand-orb"><Sparkles size={15}/></span><span>{PROFILE.name}<b>/</b>WORLD</span></button><div className="world-status"><i /> WORLD 01 <em>•</em> {PROFILE.location}</div><div className="header-actions"><button onClick={()=>setMapOpen(v=>!v)} aria-label="Mapa"><Map size={17}/></button><button onClick={()=>setPaused(v=>!v)} aria-label="Pausa">{paused?<Radio size={17}/>:<Pause size={17}/>}</button><button onClick={()=>setMenuOpen(v=>!v)} aria-label="Menú"><Menu size={18}/></button></div></header>
    <div className="game-title"><span>portfolio / 2026</span><h1>{PROFILE.role}<br /><em>with a point of view.</em></h1></div>
    <div className="game-help"><span className="help-kicker">DRIVE AROUND TO EXPLORE</span><div><kbd>W A S D</kbd> move <kbd>SHIFT</kbd> boost <kbd>M</kbd> map</div></div>
    <div className="game-crosshair"><span /><span /></div>
    <div className="telemetry"><span>POS {Math.round(Math.random()*9)} : {Math.round(Math.random()*9)}</span><span>RENDERER WEBGL</span><span><i /> ONLINE</span></div>
    {nearby && <button className="nearby-prompt" onClick={()=>setSelected(nearby)}><span className="prompt-key">ENTER</span><span><b>{nearby.name}</b><small>{nearby.type}</small></span><ExternalLink size={14}/></button>}
    {mapOpen && <div className="game-map"><div className="map-top"><span><Map size={13}/> MAP / WORLD 01</span><button onClick={()=>setMapOpen(false)}><X size={15}/></button></div><div className="map-island"><div className="map-road map-road-v"/><div className="map-road map-road-h"/><div className="map-car"/><i className="map-pin pin-one"/><i className="map-pin pin-two"/><i className="map-pin pin-three"/></div><p>WASD para moverte por el mundo</p></div>}
    {menuOpen && <div className="game-menu"><div className="menu-top"><span>MENU / 001</span><button onClick={()=>setMenuOpen(false)}><X size={18}/></button></div><div className="menu-hero"><span className="menu-badge">HELLO THERE</span><h2>Bienvenido a<br /><em>mi mundo.</em></h2><p>Soy {PROFILE.name.toLowerCase()}, {PROFILE.role}. Uso diseño, código y una cantidad saludable de obsesión para construir experiencias digitales.</p></div><div className="menu-links"><button onClick={()=>{setMenuOpen(false);setMapOpen(true)}}><Map size={15}/> explorar el mapa <b>01</b></button><button onClick={()=>{setMenuOpen(false);setSelected(PROJECTS[0])}}><Sparkles size={15}/> proyectos seleccionados <b>03</b></button><a href="mailto:hola@tunombre.com"><Radio size={15}/> iniciar conversación <b>↗</b></a></div><div className="menu-footer"><span>ESC cerrar</span><span>v.01 / built to move</span></div></div>}
    {selected && <div className="project-modal-3d" onClick={()=>setSelected(null)}><article style={{"--project-color":`#${selected.color.toString(16)}`} as CSSProperties} onClick={e=>e.stopPropagation()}><button className="modal-x" onClick={()=>setSelected(null)}><X size={18}/></button><span className="modal-index">COORDINATE / {selected.position[0]} : {selected.position[1]}</span><h2>{selected.name}</h2><span className="modal-type">{selected.type}</span><p>{selected.blurb}</p><div className="modal-meta"><span>role <b>design + development</b></span><span>year <b>2026</b></span></div><a href="mailto:hola@tunombre.com">ver caso de estudio <ExternalLink size={14}/></a></article></div>}
    {!started && <div className="start-screen"><span className="start-label">A PERSONAL PLAYGROUND</span><h2>Press <em>enter</em><br />to start.</h2><p>Una experiencia interactiva para conocer mi trabajo.</p><button onClick={()=>setStarted(true)}><Gamepad2 size={16}/> comenzar</button></div>}
  </main>;
}
