// js/threeScene.js
// Khởi tạo không gian 3D cho màn hình Scene

let scene3D = null;
let threeAudio = null;
let galleryGroup = null;
let galleryRotationSpeed = 0.012;

function initThreeScene(canvas) {
  // ===== 1. KHỞI TẠO SCENE =====
  const scene = new THREE.Scene();

  // ===== 2. KHỞI TẠO CAMERA =====
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 0.01);

  // ===== 3. KHỞI TẠO RENDERER =====
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // ===== 4. ÁNH SÁNG (LIGHT) =====
  scene.add(new THREE.AmbientLight(0xfff0d8, 0.9));
  const dirLight = new THREE.DirectionalLight(0xffe0b2, 0.6);
  dirLight.position.set(3, 5, 2);
  scene.add(dirLight);

  // ===== 5. KHÔNG GIAN PHÒNG (ROOM) =====
  const room = new THREE.Mesh(
    new THREE.CylinderGeometry(12, 12, 5, 64, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x1a1530,
      side: THREE.BackSide
    })
  );
  scene.add(room);
  room.position.y = 0.2;  // hạ xuống

  // ===== 6. HIỆU ỨNG NGÔI SAO (STARS) =====
  const stars = new THREE.BufferGeometry();
  const starCount = 800;
  const pos = new Float32Array(starCount * 3);
  
  for (let i = 0; i < starCount; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 40;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
  }
  
  stars.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(
    stars,
    new THREE.PointsMaterial({ 
      color: 0xffffff, 
      size: 0.06, 
      opacity: 0.6, 
      transparent: true 
    })
  ));

  // ===== 7. ÂM THANH (SCENE RIÊNG – KHÔNG CHỒNG LẤP) =====
  threeAudio = new Audio("assets/music/main.mp3");
  threeAudio.loop = true;
  threeAudio.volume = 0.75;
  threeAudio.pause();
  threeAudio.currentTime = 0;
  window.threeAudio = threeAudio;

  // Khởi tạo phản hồi theo nhạc (nếu có hàm musicReactive)
  initMusicReactive(threeAudio);

  // ===== 8. LƯU TRỮ BIẾN TOÀN CỤC =====
  scene3D = { scene, camera, renderer, room };
  window.scene3D = scene3D;
  scene3D.avatarSafeY = 1.6;
  scene3D.textMinY = 1.8;
  scene3D.textMaxY = 3.6;

  // ===== 9. VÒNG LẶP HOẠT ẢNH (ANIMATE) =====
  let last = performance.now();
  
  function animate() {
    const now = performance.now();
    const delta = (now - last) / 1000;
    last = now;

    // Xoay nhẹ không gian
    room.rotation.y += 0.0004;

    // Cập nhật các hiệu ứng khác (nếu có)
    if (typeof animateSoldierCard === "function") animateSoldierCard();
    if (typeof updateMusicText === "function") updateMusicText(delta);
    if (galleryGroup) {
      galleryGroup.rotation.y += galleryRotationSpeed;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
  
  // Render frame đầu ngay lập tức để tránh màn hình đen
  renderer.render(scene, camera); 

  // ===== 10. XỬ LÝ THAY ĐỔI KÍCH THƯỚC (RESIZE) =====
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return scene3D;
}

/**
 * 🔇 Tắt nhạc Scene khi rời khỏi màn hình
 */


function createGalleryCarousel(scene, images = []) {
  if (galleryGroup) {
    scene.remove(galleryGroup);
  }

  galleryGroup = new THREE.Group();
  galleryGroup.renderOrder = 0; // 👈 gallery ở layer thấp

  const radius = 4.8;          // 👈 đẩy xa camera hơn 1 chút
  const planeW = 2.2;
  const planeH = 1.4;

  const loader = new THREE.TextureLoader();
  const angleStep = (Math.PI * 2) / Math.max(images.length, 1);

  images.forEach((src, i) => {
    const tex = loader.load(src);

    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: false,
      opacity: 0.85,
      depthWrite: false,   // 👈 gallery ghi depth
      depthTest: false
    });

    const geo = new THREE.PlaneGeometry(planeW, planeH);
    const mesh = new THREE.Mesh(geo, mat);

    mesh.renderOrder = 0;

    const angle = i * angleStep;
    mesh.position.set(
      Math.cos(angle) * radius,
      0.15,                     // 👈 gallery thấp hơn chữ
      Math.sin(angle) * radius
    );

    mesh.lookAt(0, 0.2, 0);
    galleryGroup.add(mesh);
  });

  scene.add(galleryGroup);
}


function stopThreeAudio() {
  if (threeAudio) {
    threeAudio.pause();
    threeAudio.currentTime = 0;
  }
}

window.stopThreeAudio = stopThreeAudio;


