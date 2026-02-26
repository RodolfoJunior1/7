require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" })); // aumenta limite para assinatura base64

// Criar pasta assinaturas se não existir
const pastaAssinaturas = path.join(__dirname, "assinaturas");
if (!fs.existsSync(pastaAssinaturas)) {
  fs.mkdirSync(pastaAssinaturas);
}

// Rota principal
app.post("/enviar", async (req, res) => {
  try {
    const { nome, cpf, processo, email, motivo, assinatura } = req.body;

    if (!nome || !cpf || !processo || !email || !motivo || !assinatura) {
      return res.status(400).json({ error: "Campos obrigatórios faltando" });
    }

    const protocolo = Math.floor(Math.random() * 900000 + 100000);

    // Salvar assinatura
    const base64Data = assinatura.replace(/^data:image\/png;base64,/, "");
    const nomeArquivo = `assinatura_${protocolo}.png`;
    const caminhoImagem = path.join(pastaAssinaturas, nomeArquivo);
    fs.writeFileSync(caminhoImagem, base64Data, "base64");

    // ⚡ RESPONDE IMEDIATAMENTE
    res.json({ success: true, protocolo });

    // ===== ENVIA EMAIL DEPOIS =====
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    transporter.sendMail({
      from: `"Sistema de Protocolo" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `Nova solicitação - Protocolo ${protocolo}`,
      html: `
        <h2>Nova Solicitação</h2>
        <p><strong>Protocolo:</strong> ${protocolo}</p>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>CPF:</strong> ${cpf}</p>
        <p><strong>Número do Processo:</strong> ${processo}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Motivo:</strong> ${motivo}</p>
        <img src="cid:assinatura"/>
      `,
      attachments: [
        {
          filename: nomeArquivo,
          path: caminhoImagem,
          cid: "assinatura",
        },
      ],
    }).catch(err => {
      console.error("Erro ao enviar email:", err);
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});
// Iniciar servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});