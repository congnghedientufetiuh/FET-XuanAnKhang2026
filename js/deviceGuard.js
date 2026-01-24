(function () {
  const isMobile =
    /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent) ||
    window.innerWidth < 768;

  const deviceWarning = document.getElementById("deviceWarning");
  const fullscreenHint = document.getElementById("fullscreenHint");

  // 📱 Nếu là MOBILE
  if (isMobile) {
    deviceWarning.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    return;
  }

  // 💻 Nếu là DESKTOP
  const shown = localStorage.getItem("fullscreenHintShown");
  if (!shown) {
    fullscreenHint.classList.remove("hidden");
    localStorage.setItem("fullscreenHintShown", "true");

    // Tự ẩn sau 6s
    setTimeout(() => {
      fullscreenHint.classList.add("hidden");
    }, 6000);
  }
})();
