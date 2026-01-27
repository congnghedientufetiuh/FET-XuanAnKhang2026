

let audioCtx, analyser, dataArray;
let textSprites = [];
let lastSpawn = 0;


const WISHES = [
  // Xuân – Bình an
  "Xuân an khang vạn sự như ý",
  "Xuân đến lòng người ấm lại",
  "Xuân về mang theo hy vọng",
  "Xuân mới nhiều niềm vui",
  "Mong xuân này thật dịu dàng",
  "Xuân sang gió cũng hiền hơn",
  "Xuân này lòng nhẹ tênh",
  "Mong bạn luôn được bình an",
  "Bình an là điều quý giá",
  "Bình an giữa đời nhiều sóng",
  "Chỉ mong hai chữ bình an",
  "Bình yên trong từng khoảnh khắc",
  "Hạnh phúc bắt đầu từ bình an",
  "Thanh xuân này thật đẹp",
  "Thanh xuân là để nhớ",
  "Thanh xuân không hối tiếc",
  "Thanh xuân đầy kỷ niệm",
  "Một thời tuổi trẻ rực rỡ",
  "Thanh xuân đi qua rất nhanh",
  "Tuổi trẻ là những ngày xanh",
  "Một năm mới một hành trình",
  "Một chặng đường mới bắt đầu",
  "Mỗi ngày là một bước",
  "Đi tiếp dù chậm",
  "Cứ đi rồi sẽ tới",
  "Hành trình nào cũng đáng nhớ",
  "Tương lai bắt đầu từ hôm nay",
  "Cảm ơn vì đã không bỏ cuộc",
  "Bạn đã làm rất tốt",
  "Bạn mạnh mẽ hơn bạn nghĩ",
  "Đừng quên tin chính mình",
  "Mọi nỗ lực đều có ý nghĩa",
  "Không sao nếu mệt",
  "Mệt thì nghỉ chút",
  "Mọi điều rồi sẽ ổn",
  "Ngày mai sẽ khác",
  "Hy vọng luôn ở phía trước",
  "Tin vào những điều tốt đẹp",
  "Luôn có ánh sáng phía trước",
  "Sau mưa trời sẽ sáng",
  "Cảm ơn vì đã là chiến sĩ",
  "Tự hào vì có bạn",
  "Thanh xuân đẹp khi cống hiến",
  "Một chiến sĩ một trái tim",
  "Cống hiến bằng cả nhiệt huyết",
  "Sống là để sẻ chia",
  "Cho đi là còn mãi",
  "Bình an nhé",
  "Cố lên nhé",
  "Mỉm cười nhé",
  "Thương mình hơn",
  "Giữ lửa nhé",
  "Vững vàng nhé",
  "Tin nhé",
  "Đi nhé"
];

/**
 * Khởi tạo bộ phân tích âm thanh
 * @param {HTMLAudioElement} audioElement - Phần tử nhạc nền
 */
function initMusicReactive(audioElement) {
  // Trình duyệt yêu cầu tương tác người dùng trước khi tạo AudioContext
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioCtx.createMediaElementSource(audioElement);
  analyser = audioCtx.createAnalyser();

  analyser.fftSize = 256;
  dataArray = new Uint8Array(analyser.frequencyBinCount);

  source.connect(analyser);
  analyser.connect(audioCtx.destination);
}

/**
 * Lấy năng lượng âm thanh (chủ yếu là âm bass) để bắt nhịp
 */
function getEnergy() {
  if (!analyser) return 0;
  analyser.getByteFrequencyData(dataArray);
  let sum = 0;
  // Lấy 20 dải tần đầu tiên (âm trầm)
  for (let i = 0; i < 20; i++) sum += dataArray[i];
  return sum / 20;
}

/**
 * Tạo một Sprite 3D chứa nội dung chữ từ Canvas
 */
function createTextSprite(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const color = COLORS[Math.floor(Math.random() * COLORS.length)];

  ctx.font = "bold 15px 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = color;
  ctx.shadowBlur = 40;

  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0,
    depthTest: false,   // 🔥 FIX
    depthWrite: false
  });

  const sprite = new THREE.Sprite(material);
  sprite.renderOrder = 10; // 🔥 FIX

  sprite.position.set(
    (Math.random() - 0.5) * 5,
    3.8,
    -3 - Math.random() * 2
  );

  sprite.scale.set(3.8, 1.8, 1);
  sprite.userData = { life: 0 };

  window.scene3D.scene.add(sprite);
  textSprites.push(sprite);
}

/**
 * Cập nhật trạng thái chữ (gọi trong loop animate)
 */
function updateMusicText(delta) {
  if (!analyser) return;

  const energy = getEnergy();
  const now = performance.now();

  // 🎵 Sinh chữ mới nếu nhạc đủ mạnh và cách lần cuối > 1.8s
  if (energy > 60 && now - lastSpawn > 500) {
    const text = WISHES[Math.floor(Math.random() * WISHES.length)];
    createTextSprite(text);
    lastSpawn = now;
  }

  // 🌸 Diễn hoạt các dòng chữ đang bay
  textSprites = textSprites.filter(sprite => {
    sprite.userData.life += delta;

    // Hiệu ứng Fade In (hiện dần trong 1s đầu)
    if (sprite.userData.life < 1) {
      sprite.material.opacity = sprite.userData.life;
    }

    // Hiệu ứng rơi chậm (Slow fall)
    sprite.position.y -= delta * 1;

    // Hiệu ứng Fade Out (mờ dần sau 6s)
    if (sprite.userData.life > 6) {
      sprite.material.opacity -= delta * 0.3;
    }

    // Xóa sprite khi đã hoàn toàn biến mất
    if (sprite.material.opacity <= 0) {
      window.scene3D.scene.remove(sprite);
      return false;
    }

    return true;
  });
}

// Trạng thái kết thúc hành trình
let endingTriggered = false;

/**
 * Kích hoạt màn kết (Tri ân)
 */
function triggerEnding(audio, onDone) {
  if (endingTriggered) return;
  endingTriggered = true;

  // 🎵 Giảm âm lượng nhạc từ từ (Fade out music)
  const fadeInterval = setInterval(() => {
    if (audio.volume > 0.16) {
      audio.volume -= 0.02;
    } else {
      clearInterval(fadeInterval);
    }
  }, 400);

  // 🌸 Hiện dòng chữ tri ân cuối cùng sau 3.5s
  setTimeout(() => {
    createFinalText("Cảm ơn bạn vì một mùa Xuân An Khang 💛");
  }, 3500);

  // 🌑 Chuyển màn hình sau 9s
  setTimeout(() => {
    onDone();
  }, 9000);
}

/**
 * Tạo dòng chữ lớn đặc biệt cho đoạn kết
 */
function createFinalText(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;

  const ctx = canvas.getContext("2d");
  ctx.font = "bold 48px 'Segoe UI', sans-serif";
  ctx.fillStyle = "#FFD966";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "#FFD966";
  ctx.shadowBlur = 24;

  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0,
    depthTest: false,   // 👈 QUAN TRỌNG
    depthWrite: false
  });


  const sprite = new THREE.Sprite(material);
  sprite.renderOrder = 10; // 👈 chữ luôn render SAU gallery

  sprite.position.set(0, 1.2, -4); // Đặt chính diện màn hình
  sprite.scale.set(6, 1.8, 1);

  sprite.userData = { life: 0, final: true };
  window.scene3D.scene.add(sprite);
  textSprites.push(sprite);

}


