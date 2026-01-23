// js/soldierCards.js
// Quản lý việc tạo và diễn hoạt thẻ chiến sĩ trong không gian 3D

let soldierMesh = null;
let soldierFloatTime = 0;
let raycaster, mouse;
soldierMesh.renderOrder = 10;

/**
 * Tạo thẻ chiến sĩ 3D
 * @param {THREE.Scene} scene - Cảnh 3D hiện tại
 * @param {Object} soldier - Dữ liệu chiến sĩ (bao gồm avatar)
 * @param {Function} onClick - Callback khi người dùng nhấn vào thẻ
 */
function createSoldierCard(scene, soldier, onClick) {
  if (!soldier || !soldier.avatar) return;

  // 🖼 1. Tải hình ảnh (Avatar) làm Texture
  const texture = new THREE.TextureLoader().load(soldier.avatar);

  // 📐 2. Khung hình học (Card geometry) - Tỉ lệ xấp xỉ 3:4
  const geometry = new THREE.PlaneGeometry(3.2, 4.2);

  // ✨ 3. Chất liệu với hiệu ứng ánh vàng xuân (Emissive)
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    emissive: new THREE.Color(0xffd37a),
    emissiveIntensity: 0.25,
    roughness: 0.6,
    metalness: 0.1,
    side: THREE.DoubleSide // Cho phép nhìn thấy cả mặt sau nếu xoay
  });

  const card = new THREE.Mesh(geometry, material);

  // 📍 4. Thiết lập vị trí ban đầu
  // Đặt thẻ ở phía trước camera (z = -6) và hơi cao lên một chút
  card.position.set(0, 0.4, -6);
  card.rotation.y = Math.PI; // Quay mặt chính diện vào phía trong phòng

  // Loại bỏ thẻ cũ nếu đã tồn tại trước đó để tránh chồng chéo
  if (soldierMesh) {
    scene.remove(soldierMesh);
  }
  
  scene.add(card);
  soldierMesh = card;

  // 🎯 5. Thiết lập Raycaster để xử lý sự kiện Click vào vật thể 3D
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  function handleClick(e) {
    const canvas = document.getElementById("threeCanvas");
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    
    // Tính toán tọa độ chuột chuẩn hóa (-1 đến +1)
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Kiểm tra va chạm giữa tia (ray) từ camera và thẻ card
    raycaster.setFromCamera(mouse, window.scene3D.camera);
    const intersects = raycaster.intersectObject(card);

    if (intersects.length > 0) {
      if (typeof onClick === "function") onClick();
    }
  }

  // Đăng ký sự kiện click toàn cục
  window.addEventListener("click", handleClick);

  return card;
}

/**
 * Hàm diễn hoạt thẻ chiến sĩ (được gọi liên tục trong vòng lặp animate)
 */
function animateSoldierCard() {
  if (!soldierMesh) return;

  // Tăng biến thời gian để tạo nhịp điệu
  soldierFloatTime += 0.013;

  // 🌊 Hiệu ứng bay bổng (Floating) bằng hàm Sin
  soldierMesh.position.y = 0.4 + Math.sin(soldierFloatTime) * 0.18;

  // 🔄 Hiệu ứng xoay cực chậm để tăng tính sinh động
  soldierMesh.rotation.y += 0.0016;

}

