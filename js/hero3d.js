document.addEventListener("DOMContentLoaded", () => {

  const container = document.getElementById("hero-3d");
  if (!container) return;

  // =========================
  // ESCENA
  // =========================
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1.5, 7);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // =========================
  // LUCES
  // =========================
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambient);

  const light = new THREE.PointLight(0xffffff, 1.2);
  light.position.set(4, 4, 5);
  scene.add(light);

  // =========================
  // VÓRTICE DE PARTÍCULAS
  // =========================

  const vortexGroup = new THREE.Group();
  scene.add(vortexGroup);

  const particleCount = 2500;
  const positions = [];
  const colors = [];

  const palette = [
    new THREE.Color("#ff4ecb"),
    new THREE.Color("#00d4ff"),
    new THREE.Color("#ffffff"),
    new THREE.Color("#ffd86b"),
    new THREE.Color("#7a6bff")
  ];

  for (let i = 0; i < particleCount; i++) {

    const radius = Math.random() * 3.5;
    const angle = radius * 3.2 + Math.random() * 0.5;

    const x = Math.cos(angle) * radius;
    const y = (Math.random() - 0.5) * 0.6;
    const z = Math.sin(angle) * radius;

    positions.push(x, y, z);

    const color = palette[Math.floor(Math.random() * palette.length)];
    colors.push(color.r, color.g, color.b);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const vortex = new THREE.Points(geometry, material);
  vortexGroup.add(vortex);

  vortexGroup.rotation.x = -0.4;

  // =========================
  // NÚCLEO SUAVE
  // =========================
  const coreGeometry = new THREE.SphereGeometry(0.6, 32, 32);
  const coreMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.08
  });

  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  vortexGroup.add(core);

  // =========================
  // AGUJA REFINADA
  // =========================

  const needleGroup = new THREE.Group();

  const bodyGeometry = new THREE.CylinderGeometry(0.02, 0.02, 5, 32);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xe5e5e5,
    metalness: 1,
    roughness: 0.15
  });

  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  needleGroup.add(body);

  const tipGeometry = new THREE.ConeGeometry(0.025, 0.6, 32);
  const tip = new THREE.Mesh(tipGeometry, bodyMaterial);
  tip.position.y = -2.8;
  needleGroup.add(tip);

  const eyeOuter = new THREE.TorusGeometry(0.07, 0.008, 16, 100);
  const eyeMesh = new THREE.Mesh(eyeOuter, bodyMaterial);
  eyeMesh.position.y = 2.6;
  eyeMesh.rotation.x = Math.PI / 2;
  needleGroup.add(eyeMesh);

  needleGroup.rotation.z = Math.PI / 6;
  scene.add(needleGroup);

  // =========================
  // ANIMACIÓN
  // =========================

  let speed = 0.0006;

  function animate() {
    requestAnimationFrame(animate);

    vortexGroup.rotation.y += speed;

    renderer.render(scene, camera);
  }

  animate();

  // =========================
  // RESPONSIVE
  // =========================

  window.addEventListener("resize", () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

});

// =============================
// GENERADOR DE ESTRELLAS TITILANTES
// =============================

document.addEventListener("DOMContentLoaded", () => {

  const container = document.querySelector(".gold-sparks");
  if (!container) return;

  const starCount = 50;  // Puedes ajustar esto si quieres más o menos

  for (let i = 0; i < starCount; i++) {
    const star = document.createElement("span");

    // Aleatorio tamaño
    const sizeType = ["small", "medium", "large"][Math.floor(Math.random() * 3)];
    star.classList.add(sizeType);

    // Distribuir en todo el contenedor
    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 100 + "%";

    // Animación de titilado con duración aleatoria
    star.style.animationDuration = (1 + Math.random() * 3) + "s";
    star.style.animationDelay = (Math.random() * 3) + "s";

    container.appendChild(star);
  }

});