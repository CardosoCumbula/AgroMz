import crypto from "crypto";

export interface MpesaConfig {
  // Vodacom Mozambique Credentials
  MPESA_API_KEY?: string;
  MPESA_PUBLIC_KEY?: string;
  MPESA_SERVICE_PROVIDER_CODE?: string;
  MPESA_ENVIRONMENT?: "sandbox" | "production";

  // Safaricom Daraja Kenya Credentials
  MPESA_CONSUMER_KEY?: string;
  MPESA_CONSUMER_SECRET?: string;
  MPESA_SHORTCODE?: string;
  MPESA_PASSKEY?: string;
  MPESA_CALLBACK_URL?: string;
}

export interface MpesaCheckoutResult {
  success: boolean;
  transactionReference: string;
  status: "pending" | "success" | "failed";
  message: string;
  rawResponse: any;
  provider: "vodacom_moz" | "safaricom_ke" | "simulated";
}

export interface MpesaQueryResult {
  success: boolean;
  status: "success" | "pending" | "failed";
  message: string;
  rawResponse: any;
}

export class MpesaClient {
  private config: MpesaConfig;
  private simulatedMode: boolean;

  constructor(config?: MpesaConfig) {
    this.config = config || {
      MPESA_API_KEY: process.env.MPESA_API_KEY,
      MPESA_PUBLIC_KEY: process.env.MPESA_PUBLIC_KEY,
      MPESA_SERVICE_PROVIDER_CODE: process.env.MPESA_SERVICE_PROVIDER_CODE,
      MPESA_ENVIRONMENT: (process.env.MPESA_ENVIRONMENT as any) || "sandbox",
      MPESA_CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY,
      MPESA_CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET,
      MPESA_SHORTCODE: process.env.MPESA_SHORTCODE,
      MPESA_PASSKEY: process.env.MPESA_PASSKEY,
      MPESA_CALLBACK_URL: process.env.MPESA_CALLBACK_URL || process.env.APP_URL ? `${process.env.APP_URL}/api/mpesa-callback` : "https://agromoz.mz/api/mpesa-callback"
    };

    // Detect if we have any valid API credentials
    const hasVodacomCreds = !!(this.config.MPESA_API_KEY && this.config.MPESA_API_KEY.length > 10);
    const hasSafaricomCreds = !!(this.config.MPESA_CONSUMER_KEY && this.config.MPESA_CONSUMER_KEY.length > 10);
    this.simulatedMode = !hasVodacomCreds && !hasSafaricomCreds;

    if (this.simulatedMode) {
      console.log("[MpesaClient] No valid M-Pesa credentials found - running in SIMULATED mode");
    }
  }

  /**
   * Helper: Get current provider based on environment variables setup
   */
  public getProvider(): "vodacom_moz" | "safaricom_ke" {
    if (this.config.MPESA_API_KEY && this.config.MPESA_API_KEY.length > 10) {
      return "vodacom_moz";
    }
    if (this.config.MPESA_CONSUMER_KEY && this.config.MPESA_CONSUMER_KEY.length > 10) {
      return "safaricom_ke";
    }
    // Fallback to vodacom by default in simulated mode
    return "vodacom_moz";
  }

  public isSimulated(): boolean {
    return this.simulatedMode;
  }

  // ==========================================
  // VODACOM MOZAMBIQUE (RSA PKCS#1 INTEGRATION)
  // ==========================================

  private encryptVodacomApiKey(): string {
    const apiKey = this.config.MPESA_API_KEY || "";
    const publicKeyPem = this.config.MPESA_PUBLIC_KEY;
    if (!publicKeyPem || !apiKey) {
      return apiKey;
    }
    try {
      let pem = publicKeyPem.trim();
      if (!pem.includes("-----BEGIN PUBLIC KEY-----")) {
        const cleaned = pem.replace(/-----(BEGIN|END) PUBLIC KEY-----/g, "").replace(/\s+/g, "");
        const formatted = cleaned.match(/.{1,64}/g)?.join("\n");
        pem = `-----BEGIN PUBLIC KEY-----\n${formatted}\n-----END PUBLIC KEY-----`;
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
      console.error("[MpesaClient - Vodacom Moz Encryption Error]", err?.message || err);
      return apiKey;
    }
  }

  private async payVodacom(phone: string, amount: string, orderId: string, reference: string): Promise<MpesaCheckoutResult> {
    // If in simulated mode, return mock success
    if (this.simulatedMode) {
      console.log(`[MpesaClient] SIMULATED: Vodacom payment of ${amount} MZN to ${phone} (Ref: ${reference})`);
      return {
        success: true,
        transactionReference: reference,
        status: "success",
        message: "Simulação: Pagamento M-Pesa Vodacom Moçambique efectuado com sucesso (Modo Demonstração).",
        rawResponse: { simulated: true, output_TransactionID: reference, output_ResponseCode: "0", output_ResponseDesc: "Success (Simulated)" },
        provider: "simulated"
      };
    }

    const isProd = this.config.MPESA_ENVIRONMENT === "production";
    const mpesaUrl = isProd
      ? "https://api.vm.co.mz:18443/ipg/v1x/c2bPayment/singleStage/"
      : "https://api.sandbox.vm.co.mz/ipg/v1x/c2bPayment/singleStage/";

    const bearerToken = this.encryptVodacomApiKey();
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const formattedMsisdn = cleanPhone.startsWith("258") ? cleanPhone : "258" + cleanPhone;

    const payload = {
      input_TransactionReference: reference,
      input_CustomerMSISDN: formattedMsisdn,
      input_Amount: parseFloat(amount).toFixed(2),
      input_ThirdPartyReference: orderId,
      input_ServiceProviderCode: this.config.MPESA_SERVICE_PROVIDER_CODE || "171717"
    };

    try {
      const response = await fetch(mpesaUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${bearerToken}`,
          "Origin": process.env.APP_URL || "http://localhost:3000"
        },
        body: JSON.stringify(payload)
      });

      const responseBody = await response.json();
      if (response.ok && (responseBody.output_ResponseCode === "INS-0" || responseBody.output_ResponseCode === "0")) {
        return {
          success: true,
          transactionReference: responseBody.output_TransactionID || reference,
          status: "success",
          message: responseBody.output_ResponseDesc || "Pagamento M-Pesa de Vodacom Moçambique efectuado com sucesso.",
          rawResponse: responseBody,
          provider: "vodacom_moz"
        };
      } else {
        return {
          success: false,
          transactionReference: reference,
          status: "failed",
          message: responseBody.output_ResponseDesc || `Erro C2B: Código de resposta ${responseBody.output_ResponseCode || "desconhecido"}.`,
          rawResponse: responseBody,
          provider: "vodacom_moz"
        };
      }
    } catch (error: any) {
      return {
        success: false,
        transactionReference: reference,
        status: "failed",
        message: `Vodacom API Connection Exception: ${error?.message || error}`,
        rawResponse: { error: error?.message || error },
        provider: "vodacom_moz"
      };
    }
  }

  public async queryVodacomTransaction(orderId: string, reference: string): Promise<MpesaQueryResult> {
    if (this.simulatedMode) {
      return {
        success: true,
        status: "success",
        message: "Simulação: Transacção Vodacom confirmada com sucesso.",
        rawResponse: { simulated: true }
      };
    }

    const isProd = this.config.MPESA_ENVIRONMENT === "production";
    const statusUrl = isProd
      ? "https://api.vm.co.mz:18443/ipg/v1x/queryTransactionStatus/"
      : "https://api.sandbox.vm.co.mz/ipg/v1x/queryTransactionStatus/";

    const bearerToken = this.encryptVodacomApiKey();
    const payload = {
      input_ThirdPartyReference: orderId,
      input_QueryReference: reference,
      input_ServiceProviderCode: this.config.MPESA_SERVICE_PROVIDER_CODE || "171717"
    };

    try {
      const response = await fetch(statusUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${bearerToken}`,
          "Origin": process.env.APP_URL || "http://localhost:3000"
        },
        body: JSON.stringify(payload)
      });

      const responseBody = await response.json();
      if (response.ok && (responseBody.output_ResponseCode === "INS-0" || responseBody.output_ResponseCode === "0")) {
        const state = responseBody.output_ResponseDesc?.toLowerCase().includes("success") ? "success" : "pending";
        return {
          success: true,
          status: state as any,
          message: responseBody.output_ResponseDesc || "Estado de transacção processado.",
          rawResponse: responseBody
        };
      }
      return {
        success: false,
        status: "failed",
        message: responseBody.output_ResponseDesc || `Falha ao obter estado da Vodacom: ${responseBody.output_ResponseCode}`,
        rawResponse: responseBody
      };
    } catch (error: any) {
      return {
        success: false,
        status: "pending",
        message: `Excepção ao ligar a Vodacom Query API: ${error?.message || error}`,
        rawResponse: { error: error?.message || error }
      };
    }
  }


  // ==========================================
  // SAFARICOM DARAJA (OAuth 2.0 & STK PUSH)
  // ==========================================

  private async generateSafaricomToken(): Promise<string> {
    const isProd = this.config.MPESA_ENVIRONMENT === "production";
    const oauthUrl = isProd
      ? "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
      : "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

    const auth = Buffer.from(`${this.config.MPESA_CONSUMER_KEY}:${this.config.MPESA_CONSUMER_SECRET}`).toString("base64");
    try {
      const response = await fetch(oauthUrl, {
        method: "GET",
        headers: {
          "Authorization": `Basic ${auth}`
        }
      });
      const data = await response.json();
      if (response.ok && data.access_token) {
        return data.access_token;
      }
      throw new Error(data.errorMessage || "Falha ao obter Token OAuth de Daraja M-Pesa.");
    } catch (err: any) {
      console.error("[MpesaClient - OAuth Token Error]", err?.message || err);
      throw err;
    }
  }

  private async paySafaricom(phone: string, amount: string, orderId: string, reference: string): Promise<MpesaCheckoutResult> {
    // If in simulated mode, return mock success
    if (this.simulatedMode) {
      console.log(`[MpesaClient] SIMULATED: Safaricom payment of ${amount} KES to ${phone} (Ref: ${reference})`);
      return {
        success: true,
        transactionReference: reference,
        status: "success",
        message: "Simulação: Pagamento M-Pesa Safaricom efectuado com sucesso (Modo Demonstração).",
        rawResponse: { simulated: true, ResponseCode: "0", CustomerMessage: "Success (Simulated)" },
        provider: "simulated"
      };
    }

    try {
      const isProd = this.config.MPESA_ENVIRONMENT === "production";
      const token = await this.generateSafaricomToken();
      const stkUrl = isProd
        ? "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
        : "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

      // Formatar data: YYYYMMDDHHmmss
      const date = new Date();
      const formatNum = (n: number) => n.toString().padStart(2, "0");
      const timestamp = date.getFullYear() +
        formatNum(date.getMonth() + 1) +
        formatNum(date.getDate()) +
        formatNum(date.getHours()) +
        formatNum(date.getMinutes()) +
        formatNum(date.getSeconds());

      const shortCode = this.config.MPESA_SHORTCODE || "174379";
      const passKey = this.config.MPESA_PASSKEY || "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
      const password = Buffer.from(shortCode + passKey + timestamp).toString("base64");

      // Format clean Kenya number (must be 2547XXXXXXXX or 2541XXXXXXXX)
      let cleanPhone = phone.replace(/[^0-9]/g, "");
      if (cleanPhone.startsWith("0")) {
        cleanPhone = "254" + cleanPhone.slice(1);
      } else if (!cleanPhone.startsWith("254") && cleanPhone.length === 9) {
        cleanPhone = "254" + cleanPhone;
      }

      const payload = {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.ceil(parseFloat(amount)), // Safaricom standard transactions require integer for KES in billing simulations
        PartyA: cleanPhone,
        PartyB: shortCode,
        PhoneNumber: cleanPhone,
        CallBackURL: this.config.MPESA_CALLBACK_URL,
        AccountReference: orderId,
        TransactionDesc: `Pagamento de Encomenda AgroMoz ${orderId}`
      };

      const response = await fetch(stkUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok && data.ResponseCode === "0") {
        return {
          success: true,
          transactionReference: data.CheckoutRequestID || reference,
          status: "pending", // Pending PIN inputs from prompt
          message: data.CustomerMessage || "Pedido STK Push enviado com sucesso para o telemóvel.",
          rawResponse: data,
          provider: "safaricom_ke"
        };
      } else {
        return {
          success: false,
          transactionReference: reference,
          status: "failed",
          message: data.ResponseDescription || `Safaricom STK Push recusado. Código: ${data.ResponseCode}`,
          rawResponse: data,
          provider: "safaricom_ke"
        };
      }
    } catch (err: any) {
      return {
        success: false,
        transactionReference: reference,
        status: "failed",
        message: `Daraja API exception: ${err?.message || err}`,
        rawResponse: { error: err?.message || err },
        provider: "safaricom_ke"
      };
    }
  }

  public async querySafaricomTransaction(checkoutRequestId: string): Promise<MpesaQueryResult> {
    if (this.simulatedMode) {
      return {
        success: true,
        status: "success",
        message: "Simulação: Transacção Safaricom confirmada com sucesso.",
        rawResponse: { simulated: true }
      };
    }

    try {
      const isProd = this.config.MPESA_ENVIRONMENT === "production";
      const token = await this.generateSafaricomToken();
      const queryUrl = isProd
        ? "https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query"
        : "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query";

      const date = new Date();
      const formatNum = (n: number) => n.toString().padStart(2, "0");
      const timestamp = date.getFullYear() +
        formatNum(date.getMonth() + 1) +
        formatNum(date.getDate()) +
        formatNum(date.getHours()) +
        formatNum(date.getMinutes()) +
        formatNum(date.getSeconds());

      const shortCode = this.config.MPESA_SHORTCODE || "174379";
      const passKey = this.config.MPESA_PASSKEY || "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
      const password = Buffer.from(shortCode + passKey + timestamp).toString("base64");

      const payload = {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId
      };

      const response = await fetch(queryUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        if (data.ResultCode === "0") {
          return { success: true, status: "success", message: "Pagamento confirmado com sucesso.", rawResponse: data };
        } else if (data.ResultCode === "1032") {
          return { success: true, status: "failed", message: "Pagamento cancelado pelo utilizador.", rawResponse: data };
        } else {
          return { success: true, status: "failed", message: data.ResultDesc || "Falha na transacção.", rawResponse: data };
        }
      }

      return {
        success: false,
        status: "pending",
        message: data.errorMessage || "Status pendente de processamento.",
        rawResponse: data
      };
    } catch (err: any) {
      return {
        success: false,
        status: "pending",
        message: `Erro na consulta da transacção M-Pesa: ${err?.message || err}`,
        rawResponse: { error: err?.message || err }
      };
    }
  }


  // ==========================================
  // GENERAL INTERFACES & ROUTE EXECUTORS
  // ==========================================

  public async initiatePayment(phone: string, amount: string, orderId: string): Promise<MpesaCheckoutResult> {
    const reference = "MPZ" + Math.floor(100000 + Math.random() * 900000);
    
    // In simulated mode, return immediate success
    if (this.simulatedMode) {
      console.log(`[MpesaClient] SIMULATED: Payment of ${amount} MZN for order ${orderId} - auto-approved`);
      return {
        success: true,
        transactionReference: reference,
        status: "success",
        message: "✅ Pagamento simulado com sucesso! (Modo Demonstração - sem cobrança real)",
        rawResponse: { simulated: true, transactionReference: reference },
        provider: "simulated"
      };
    }

    const provider = this.getProvider();

    if (provider === "vodacom_moz") {
      return this.payVodacom(phone, amount, orderId, reference);
    } else if (provider === "safaricom_ke") {
      return this.paySafaricom(phone, amount, orderId, reference);
    }
    throw new Error("Provedor M-Pesa Inválido.");
  }
}