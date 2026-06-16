import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { MpesaClient } from "./mpesa-client";

// Load environment variables
dotenv.config();

function encryptMpesaApiKey(apiKey: string, publicKeyPem: string | undefined): string {
  if (!publicKeyPem || !apiKey) {
    return apiKey || "";
  }
  try {
    let pem = publicKeyPem.trim();
    if (!pem.includes("-----BEGIN PUBLIC KEY-----")) {
      const cleaned = pem.replace(/-----(BEGIN|END) PUBLIC KEY-----/g, "").replace(/\s+/g, "");
      pem = `-----BEGIN PUBLIC KEY-----\n${cleaned.match(/.{1,64}/g)?.join("\n")}\n-----END PUBLIC KEY-----`;
    }
    
    const buffer = Buffer.from(apiKey.trim());
    const encrypted = crypto.publicEncrypt(
      {
        key: pem,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      buffer
    );
    return encrypted.toString("base64");
  } catch (err: any) {
    console.error("[M-Pesa Encryption Error]", err?.message || err);
    return apiKey;
  }
}

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Supabase client STRIKELY
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

const isValidSupabaseUrl = (url: string) => {
  return typeof url === "string" && (url.startsWith("http://") || url.startsWith("https://"));
};

let supabase: any = null;

if (!supabaseUrl || !supabaseAnonKey || !isValidSupabaseUrl(supabaseUrl)) {
  console.error("CRITICAL ERROR: Supabase credentials missing or invalid. Application cannot run in production without a valid database connection.");
  process.exit(1);
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("Supabase client initialized successfully.");
  } catch (err: any) {
    console.error("CRITICAL ERROR: Failed to initialize Supabase client:", err?.message || err);
    process.exit(1);
  }
}

// ----------------- API ROUTES -----------------

app.get("/api/sys/status", (req, res) => {
  res.json({
    status: "online",
    supabaseConnected: true,
    env: {
      hasMpesaKey: !!process.env.MPESA_API_KEY,
      hasResendKey: !!process.env.RESEND_API_KEY,
      mpesaEnvironment: process.env.MPESA_ENVIRONMENT || "sandbox"
    }
  });
});

// 1. VISITORS TRACKING
app.post("/api/visitor", async (req, res) => {
  const { device, location, browser, sessionTime, deviceSpec } = req.body;

  const visitorData = {
    id: "vis-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
    device: device || "Desconhecido",
    location: location || "Moçambique (IP baseado)",
    browser: browser || "Navegador Geral",
    session_time: parseFloat(sessionTime) || 0,
    device_spec: JSON.stringify(deviceSpec || {}),
    timestamp: new Date().toISOString()
  };

  try {
    const { error } = await supabase.from("visitors").insert([visitorData]);
    if (error) throw error;
    return res.json({ success: true, logged: visitorData });
  } catch (err: any) {
    console.error("Supabase Insert Visitor Error", err);
    return res.status(500).json({ error: "Erro ao registar visitante." });
  }
});

// 2. CONTACT FORM - STRICT RESEND INTEGRATION
app.post("/api/contact", async (req, res) => {
  const { email, name, message } = req.body;
  
  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: "Gateway de email não configurado para envio." });
  }

  const contactData = {
    id: "cnt-" + Date.now(),
    name,
    email,
    message,
    timestamp: new Date().toISOString()
  };

  try {
    await supabase.from("contacts").insert([contactData]);
    
    // Deliver confirmation email that message was received
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: "AgroMoz Suporte <onboarding@resend.dev>",
        to: email,
        subject: "AgroMoz: Recebemos a sua mensagem",
        html: `<div style="font-family:sans-serif;padding:24px;border-radius:12px;background:#f4f5f0;color:#1c1917">
          <h3 style="color:#15803d;">🌾 Olá ${name}!</h3>
          <p>Recebemos a sua mensagem de contacto. A nossa equipa irá responder dentro das próximas 24 horas.</p>
          <blockquote style="padding:10px 16px;border-left:4px solid #15803d;background:#fff;margin:16px 0;font-style:italic;">"${message}"</blockquote>
          <p style="font-size:12px;color:#78716c;">AgroMoz Moçambique — Ligando o campo à cidade.</p>
        </div>`
      })
    });

    return res.json({ success: true, message: "Mensagem enviada com sucesso!" });
  } catch (err) {
    console.error("Contact Form Error:", err);
    return res.status(500).json({ error: "Ocorreu um erro no servidor ao submeter." });
  }
});

// Initialize production-grade M-Pesa Multi-region Client
const mpesaClient = new MpesaClient();

// 3. M-PESA PAYMENTS (Production Ready Gateway Driver)
app.post("/api/mpesa/pay", async (req, res) => {
  const { phone, amount, orderId } = req.body;

  if (!phone || !amount) {
    return res.status(400).json({ error: "Estão em falta parâmetros cruciais para o pagamento por M-Pesa." });
  }

  console.log(`Iniciando cobrança M-Pesa no valor de ${amount} para o número ${phone} (Ref: ${orderId || "Geral"})`);

  const result = await mpesaClient.initiatePayment(phone, amount, orderId || "ORD-000");

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.message
    });
  }

  return res.json({
    success: true,
    transactionReference: result.transactionReference,
    provider: result.provider,
    message: result.message
  });
});

app.post("/api/mpesa-callback", (req, res) => {
  const callbackData = req.body;
  console.log("Notificação de Callback Recebida", callbackData);
  return res.status(200).json({
    ResultCode: 0,
    ResultDesc: "Callback recebido e processado no AgroMoz Engine com sucesso."
  });
});

app.get("/api/mpesa/query", async (req, res) => {
  const { checkoutRequestId, orderId, reference } = req.query;

  try {
    if (mpesaClient.getProvider() === "safaricom_ke") {
      const query = await mpesaClient.querySafaricomTransaction(checkoutRequestId as string);
      return res.json(query);
    } else if (mpesaClient.getProvider() === "vodacom_moz") {
      const query = await mpesaClient.queryVodacomTransaction(orderId as string, reference as string);
      return res.json(query);
    } else {
      return res.status(400).json({ success: false, message: "Provedor inválido." });
    }
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      status: "failed",
      message: err?.message || "Erro desconhecido ao consultar status"
    });
  }
});

// 4. CHECKOUT ENGINE
app.post("/api/checkout", async (req, res) => {
  const { name, email, phone, cartItems, total, paymentMethod, userId } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: "O carrinho está vazio." });
  }

  const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);

  const itemsListHtml = cartItems.map((i: any) => 
    `<tr>
      <td style="padding:8px;border-bottom:1px solid #e7e5e4;">${i.emoji} ${i.name}</td>
      <td style="padding:8px;border-bottom:1px solid #e7e5e4;text-align:center;">${i.qty} kg</td>
      <td style="padding:8px;border-bottom:1px solid #e7e5e4;text-align:right;">${(i.price * i.qty).toLocaleString("pt-MZ")} MZN</td>
     </tr>`
  ).join("");

  const emailHtml = `<div style="font-family:sans-serif;padding:24px;border-radius:12px;background:#f4f5f0;color:#1c1917;max-width:600px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:20px;">
      <span style="font-size:48px;">🌾</span>
      <h2 style="color:#15803d;margin-top:8px;">Obrigado pela sua compra!</h2>
      <p style="color:#57534e;">A sua encomenda da plataforma AgroMoz está confirmada.</p>
    </div>
    <div style="background:#fff;padding:20px;border-radius:8px;border:1px solid #d6d3d1;margin-bottom:20px;">
      <h3 style="border-bottom:2px solid #16a34a;padding-bottom:8px;margin-top:0;">Encomenda #${orderId}</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin:15px 0;">
        <thead>
          <tr style="background:#f4f5f0;">
            <th style="padding:8px;text-align:left;">Produto</th>
            <th style="padding:8px;text-align:center;">Qtd</th>
            <th style="padding:8px;text-align:right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsListHtml}
        </tbody>
      </table>
      <div style="font-size:18px;font-weight:bold;text-align:right;color:#15803d;margin-top:10px;">
        Total: ${total.toLocaleString("pt-MZ")} MZN
      </div>
    </div>
    <div style="font-size:13px;color:#57534e;line-height:1.6;">
      <p>📍 <strong>Método de Pagamento:</strong> ${paymentMethod}</p>
      <p>🚜 A equipa dos agricultores iniciará o empacotamento. Receberá atualizações do estado de entrega por SMS.</p>
    </div>
    <hr style="border:none;border-top:1px solid #e7e5e4;margin:24px 0;" />
    <p style="font-size:11px;color:#a8a29e;text-align:center;">AgroMoz — Fortalecendo o agricultor moçambicano.</p>
  </div>`;

  const newOrder = {
    id: orderId,
    client: name || "Visitante",
    email: email || "comprador@agromoz.mz",
    phone: phone || "Sem Telefone",
    items: cartItems,
    total,
    payment_method: paymentMethod,
    status: paymentMethod === "M-Pesa" ? "pago" : "pendente",
    email_html: emailHtml,
    user_id: userId || null
  };

  try {
    const { error } = await supabase.from("orders").insert([newOrder]);
    if (error) throw error;

    if (process.env.RESEND_API_KEY && email) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: "AgroMoz Encomendas <onboarding@resend.dev>",
          to: email,
          subject: `Confirmação de Encomenda AgroMoz #${orderId}`,
          html: emailHtml
        })
      });
    }

    return res.json({
      success: true,
      orderId,
      message: "Encomenda processada com sucesso. Notificação remetida."
    });
  } catch (err: any) {
    console.error("Erro ao registrar checkout:", err);
    return res.status(500).json({ error: "Falha ao gravar pedido." });
  }
});

// ----------------- VITE & STATIC HANDLING -----------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AgroMoz Backend] Production Server active and listening on http://localhost:${PORT}`);
  });
}

export default app;
export { app };

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  startServer();
}
