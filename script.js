// script.js
// Full 3D hero + 3D projects slider using Three.js + GSAP + Video Popup

(() => {
  // -------------------------
  // Configuration / assets
  // -------------------------
  const imagePaths = [
    'assets/project1.jpg',
    'assets/project2.jpg',
    'assets/project3.jpg',
    'assets/project4.jpg'
  ];

  const videoLinks = [
    "https://drive.google.com/file/d/1fyv008-Jgsq7ATRymkMNTCnMaPPYdgzf/preview", // Zeenat hospital
    "https://drive.google.com/file/d/1zbemVo3jhlMIhJfvg4d4f9baHB2FLPkR/preview", // Umrah travels
    "https://drive.google.com/file/d/1gjPHp-kM8mclDZskYAJKZdgGxxD1DH20/preview", // Ayesha college
    "https://drive.google.com/file/d/1gjPHp-kM8mclDZskYAJKZdgGxxD1DH20/preview", // Beauty & Bliss
    "https://drive.google.com/file/d/1hTPD-QNJ2G7wt1boa8a3eBoo6O7SV7XL/preview", // Rental Car
    "https://drive.google.com/file/d/1eyG07P6QWKztoGEY6pAIWtZ08BmSZjKg/preview"  // Aims Company
  ];

  const fallback = 'https://via.placeholder.com/1200x800?text=Project';
  const resolvedImages = imagePaths.map(p => p || fallback);

  // -------------------------
  // HERO Scene
  // -------------------------
  const heroContainer = document.getElementById('hero-canvas');
  let heroRenderer, heroScene, heroCamera, heroClock, heroGroup, heroReq;

  function initHero() {
    const width = heroContainer.clientWidth;
    const height = heroContainer.clientHeight;
    heroRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    heroRenderer.setSize(width, height);
    heroContainer.appendChild(heroRenderer.domElement);

    heroScene = new THREE.Scene();
    heroCamera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    heroCamera.position.set(0, 0, 6);

    heroScene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const p = new THREE.PointLight(0x00f0df, 1.2, 30);
    p.position.set(4, 4, 6);
    heroScene.add(p);

    heroGroup = new THREE.Group();
    heroScene.add(heroGroup);

    const geom1 = new THREE.TorusKnotGeometry(0.8, 0.25, 128, 32);
    const geom2 = new THREE.IcosahedronGeometry(0.9, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.4,
      roughness: 0.2,
      emissive: 0x00242a,
      emissiveIntensity: 0.1
    });

    const m1 = new THREE.Mesh(geom1, mat.clone());
    const m2 = new THREE.Mesh(geom2, mat.clone());
    m1.position.set(-1.2, 0.3, 0);
    m2.position.set(1.2, -0.1, 0);

    m1.scale.setScalar(0.9);
    m2.scale.setScalar(0.85);

    heroGroup.add(m1, m2);

    // particles
    const particleGeom = new THREE.BufferGeometry();
    const count = 70;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({ size: 0.03, color: 0x00f0df, transparent: true, opacity: 0.85 });
    const particles = new THREE.Points(particleGeom, particleMat);
    heroScene.add(particles);

    heroClock = new THREE.Clock();

    gsap.from(heroGroup.rotation, { y: -0.6, duration: 1.4, ease: "power3.out" });

    animateHero();
    window.addEventListener('resize', resizeHero);
  }

  function animateHero() {
    const t = heroClock.getElapsedTime();
    heroGroup.children.forEach((m, i) => {
      m.rotation.x = Math.sin(t * (0.4 + i * 0.2)) * 0.25;
      m.rotation.y = Math.cos(t * (0.3 + i * 0.15)) * 0.25;
      m.position.y = Math.sin(t * (0.5 + i * 0.1)) * 0.12;
    });
    heroRenderer.render(heroScene, heroCamera);
    heroReq = requestAnimationFrame(animateHero);
  }

  function resizeHero() {
    if (!heroRenderer) return;
    const w = heroContainer.clientWidth;
    const h = heroContainer.clientHeight;
    heroCamera.aspect = w / h;
    heroCamera.updateProjectionMatrix();
    heroRenderer.setSize(w, h);
  }

  // -------------------------
  // Projects 3D Slider
  // -------------------------
  const projectsContainer = document.getElementById('projects-3d');
  let pRenderer, pScene, pCamera, pClock, planes = [], currentIndex = 0;
  const spacing = 2.6;

  // popup
  const popup = document.createElement("div");
  popup.id = "video-popup";
  popup.innerHTML = `
    <div class="popup-content">
      <span id="popup-close">&times;</span>
      <iframe id="popup-video" src="" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>
    </div>
  `;
  document.body.appendChild(popup);

  const popupVideo = document.getElementById("popup-video");
  const popupClose = document.getElementById("popup-close");

  popupClose.addEventListener("click", () => {
    popup.style.display = "none";
    popupVideo.src = "";
  });

  function initProjects() {
    const width = projectsContainer.clientWidth || 1000;
    const height = projectsContainer.clientHeight || 420;
    pRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    pRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    pRenderer.setSize(width, height);
    projectsContainer.appendChild(pRenderer.domElement);

    pScene = new THREE.Scene();
    pCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    pCamera.position.set(0, 0, 6);

    pScene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const key = new THREE.DirectionalLight(0x00f0df, 0.8);
    key.position.set(5, 5, 10);
    pScene.add(key);

    pClock = new THREE.Clock();

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    const promises = resolvedImages.map(src => {
      return new Promise(resolve => {
        loader.load(src, tex => resolve(tex), undefined, () => resolve(null));
      });
    });

    Promise.all(promises).then(texs => {
      texs.forEach((tex, i) => {
        const t = tex || loader.load(fallback);
        t.minFilter = THREE.LinearFilter;
        const geometry = new THREE.PlaneGeometry(3.2, 2.0, 32, 32);
        const material = new THREE.MeshStandardMaterial({
          map: t,
          metalness: 0.05,
          roughness: 0.6,
          envMapIntensity: 0.3
        });
        const plane = new THREE.Mesh(geometry, material);
        plane.position.set((i - Math.floor(texs.length / 2)) * spacing, 0, -Math.abs(i - currentIndex) * 0.2);
        plane.userData.index = i;

        pScene.add(plane);
        planes.push(plane);
      });

      projectsContainer.addEventListener('pointerdown', onPointerDown);

      document.getElementById('prev').addEventListener('click', prevProject);
      document.getElementById('next').addEventListener('click', nextProject);

      animateProjects();
      updateIndicator();
      window.addEventListener('resize', resizeProjects);
    });
  }

  function onPointerDown(e) {
    const rect = projectsContainer.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const clickedIndex = Math.round(x * (planes.length - 1));
    if (clickedIndex >= 0 && clickedIndex < planes.length) {
      goToIndex(clickedIndex);

      // open popup
      popup.style.display = "flex";
      popupVideo.src = videoLinks[clickedIndex] || "";
    }
  }

  function updateIndicator() {
    const el = document.getElementById('indicator');
    if (el) el.textContent = `${currentIndex + 1} / ${planes.length}`;
  }

  function goToIndex(i) {
    currentIndex = Math.max(0, Math.min(i, planes.length - 1));
    planes.forEach((pl, idx) => {
      const z = -Math.abs(idx - currentIndex) * 0.2;
      const scale = idx === currentIndex ? 1.06 : 0.94;
      gsap.to(pl.position, { z, duration: 0.9, ease: "power3.out" });
      gsap.to(pl.scale, { x: scale, y: scale, z: scale, duration: 0.9, ease: "power3.out" });
    });
    updateIndicator();
  }

  function prevProject() { goToIndex(currentIndex - 1); }
  function nextProject() { goToIndex(currentIndex + 1); }

  function animateProjects() {
    pRenderer.render(pScene, pCamera);
    requestAnimationFrame(animateProjects);
  }

  function resizeProjects() {
    if (!pRenderer) return;
    const w = projectsContainer.clientWidth || window.innerWidth;
    const h = projectsContainer.clientHeight || 420;
    pCamera.aspect = w / h;
    pCamera.updateProjectionMatrix();
    pRenderer.setSize(w, h);
  }

  // -------------------------
  // Init
  // -------------------------
  function safeInit() {
    if (heroContainer) initHero();
    if (projectsContainer) initProjects();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInit);
  } else {
    safeInit();
  }

})();
// Select elements
const modal = document.getElementById("videoModal");
const videoFrame = document.getElementById("videoFrame");
const closeBtn = document.querySelector(".close-btn");

// Sabhi project cards ko pakdo
document.querySelectorAll(".project-card").forEach(card => {
  card.addEventListener("click", () => {
    const videoUrl = card.getAttribute("data-video");
    videoFrame.src = videoUrl + "?autoplay=1"; // autoplay ke liye
    modal.classList.add("active");
  });
});

// Modal close
closeBtn.addEventListener("click", () => {
  modal.classList.remove("active");
  videoFrame.src = ""; // Stop video jab close ho
});

// Escape key se close
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    modal.classList.remove("active");
    videoFrame.src = "";
  }
});
