/* ================================
   STJ – Protocolo Digital
   Versão 100% Frontend
================================ */

const canvas = document.getElementById("sign");
const ctx = canvas.getContext("2d");
const form = document.getElementById("protoForm");

let drawing = false;

ctx.lineWidth = 2;
ctx.strokeStyle = "#000";

/* ===== ASSINATURA ===== */

function start(e) {
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

function move(e) {
  if (!drawing) return;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
}

function stop() {
  drawing = false;
}

canvas.addEventListener("mousedown", start);
canvas.addEventListener("mousemove", move);
canvas.addEventListener("mouseup", stop);
canvas.addEventListener("mouseleave", stop);

canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  start({
    offsetX: touch.clientX - rect.left,
    offsetY: touch.clientY - rect.top,
  });
});

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  move({
    offsetX: touch.clientX - rect.left,
    offsetY: touch.clientY - rect.top,
  });
});

canvas.addEventListener("touchend", stop);

/* ===== SUBMIT ===== */

form.addEventListener("submit", function (ev) {
  ev.preventDefault();

  /* Verificar assinatura */
  const hasSignature = ctx
    .getImageData(0, 0, canvas.width, canvas.height)
    .data.some((channel) => channel !== 0);

  if (!hasSignature) {
    alert("Por favor, assine no quadro.");
    return;
  }

  /* Gerar protocolo */
  const protocolo = Math.floor(Math.random() * 900000 + 100000);

  /* Salvar no navegador */
  localStorage.setItem("protocoloSTJ", protocolo);

  /* Redirecionar */
  window.location.href = "protocolo.html";
});