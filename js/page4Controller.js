// js/page4Controller.js

let thanksInitialized = false;
let arrowClicked = false;

const thanksSection = document.getElementById("thanks");
const arrow = document.getElementById("thanksArrow");
const bgm = document.getElementById("bgm");
const btnReplay = document.getElementById("btnReplay");
const btnBackToScene = document.getElementById("btnBackToScene");

btnReplay.style.display = "none";
btnBackToScene.style.display = "none";

/* ===============================
   TYPEWRITER EFFECT
================================ */
function typeWriter(el, text, speed = 35) {
  el.innerHTML = "";
  let i = 0;

  return new Promise(resolve => {
    const timer = setInterval(() => {
      el.innerHTML += text.charAt(i);
      i++;
      if (i >= text.length) {
        clearInterval(timer);
        resolve();
      }
    }, speed);
  });
}

/* ===============================
   INIT THANKS PAGE
================================ */
async function initThanksPage(soldierData) {
  if (thanksInitialized) return;
  thanksInitialized = true;

  const title = thanksSection.querySelector("h2");
  const muted = thanksSection.querySelector(".muted");
  const quote = thanksSection.querySelector(".quote");

  const giftText = soldierData?.gift
    ? ` ${soldierData.gift}`
    : "";

  title.style.opacity = 1;
  muted.style.opacity = 1;
  quote.style.opacity = 1;

  await typeWriter(muted,
    `💌 Ban Tổ chức chân thành cảm ơn bạn — người đã góp phần tạo nên một mùa Xuân An Khang 2026 đầy ấm áp và ý nghĩa. BTC chúng mình có đôi lời dành riêng cho bạn ❤️`
  );
  await typeWriter(quote,
    `👉${giftText}   👈`
  );

  arrow.classList.add("show");
}

/* ===============================
   VIDEO OVERLAY
================================ */
function playThanksVideo() {
   if (window.scene3D) {
     threeRunning = false;
     window.scene3D.renderer.setAnimationLoop(null);
   }

  if (arrowClicked) return;
  arrowClicked = true;
  arrow.classList.remove("show");
  if (typeof stopThreeAudio === "function") {
      stopThreeAudio();
    }

  const video = document.createElement("video");
  video.src = "assets/images/giao-dien/qua.mp4";
  video.autoplay = true;
  video.controls = false;
  video.playsInline = true;

  video.className = "thanks-video";
  document.body.appendChild(video);

  // Tắt nhạc nền
  bgm.pause();
  video.onended = () => {
    video.classList.add("fade-out");

    setTimeout(() => {
      video.remove();

      // Bật lại nhạc nền
      bgm.play().catch(() => {});

      // Hiện nút
      btnReplay.style.display = "inline-flex";
      btnBackToScene.style.display = "inline-flex";
    }, 1200);
  };
}

/* ===============================
   EVENTS
================================ */
arrow.addEventListener("click", playThanksVideo);

/* ===============================
   EXPORT (để app.js gọi)
================================ */
window.initThanksPage = initThanksPage;


