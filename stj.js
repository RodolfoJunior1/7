/* ================================
   STJ – Protocolo Digital
   Assinatura + Envio + Redirect
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

form.addEventListener("submit", async function (ev) {
  ev.preventDefault();

  try {
    /* Verificar assinatura */
    const hasSignature = ctx
      .getImageData(0, 0, canvas.width, canvas.height)
      .data.some((channel) => channel !== 0);

    if (!hasSignature) {
      alert("Por favor, assine no quadro.");
      return;
    }

    /* Coletar dados */
    const nome = document.querySelector('[name="nome"]').value.trim();
    const cpf = document.querySelector('[name="cpf"]').value.trim();
    const processo = document.querySelector('[name="proc"]').value.trim();
    const email = document.querySelector('[name="email"]').value.trim();
    const motivo = document.querySelector('[name="motivo"]').value.trim();
    const assinatura = canvas.toDataURL("image/png");

    /* Enviar para backend */
    const resposta = await fetch("https://formsstj-2scy.onrender.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome,
        cpf,
        processo,
        email,
        motivo,
        assinatura,
      }),
    });

    const data = await resposta.json();

    if (!resposta.ok) {
      throw new Error(data.error || "Erro no envio");
    }

    console.log("Protocolo recebido:", data.protocolo);

    /* REDIRECIONAR */
    window.location.href = "protocolo.html?p=" + data.protocolo;

  } catch (err) {
    console.error("Erro:", err);
    alert("Erro ao enviar solicitação.");
  }
});