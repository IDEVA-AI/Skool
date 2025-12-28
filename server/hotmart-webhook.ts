import type { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

/**
 * Tipos para o webhook da Hotmart
 * A Hotmart pode enviar diferentes formatos de payload dependendo do evento
 */
interface HotmartWebhookPayload {
  event?: string;
  data?: {
    product?: {
      id?: string;
      name?: string;
    };
    buyer?: {
      email?: string;
      name?: string;
    };
    purchase?: {
      transaction?: string;
      status?: string;
      order_date?: string;
    };
    subscription?: {
      status?: string;
    };
  };
  // Formato alternativo (dados diretos no root)
  product?: {
    id?: string;
    name?: string;
  };
  buyer?: {
    email?: string;
    name?: string;
  };
  purchase?: {
    transaction?: string;
    status?: string;
    order_date?: string;
  };
  // Campos diretos também podem vir no root
  email?: string;
  product_id?: string;
  transaction?: string;
}

/**
 * Valida a assinatura do webhook da Hotmart
 */
function validateHotmartSignature(req: Request): boolean {
  const hottok = req.headers["x-hotmart-hottok"] as string;
  const expectedHottok = process.env.HOTMART_HOTTOK;

  if (!expectedHottok) {
    console.error("HOTMART_HOTTOK não configurado");
    return false;
  }

  return hottok === expectedHottok;
}

/**
 * Gera uma senha temporária aleatória
 */
function generateTemporaryPassword(): string {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  return Array.from(crypto.randomBytes(length))
    .map((byte) => charset[byte % charset.length])
    .join("");
}

/**
 * Cria um usuário no Supabase via Admin API
 */
async function createUserWithPassword(
  email: string,
  name: string,
  password: string
): Promise<{ userId: string; error: Error | null }> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return {
      userId: "",
      error: new Error("Configuração do Supabase não encontrada"),
    };
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Criar usuário no Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Confirmar email automaticamente
    user_metadata: {
      name,
      created_via: "hotmart_webhook",
    },
  });

  if (authError || !authData.user) {
    return {
      userId: "",
      error: authError || new Error("Erro ao criar usuário no Auth"),
    };
  }

  // Criar registro na tabela users
  const { error: userError } = await supabaseAdmin.from("users").insert({
    id: authData.user.id,
    email,
    name,
    role: "student",
  });

  if (userError) {
    console.error("Erro ao criar registro em users:", userError);
    // Não retornar erro aqui, pois o usuário já foi criado no Auth
  }

  return {
    userId: authData.user.id,
    error: null,
  };
}

/**
 * Envia email de boas-vindas com credenciais
 * Nota: Esta função precisa ser implementada com um serviço de email real
 * Por enquanto, apenas loga as informações
 */
async function sendWelcomeEmail(
  email: string,
  name: string,
  password: string,
  courseName: string
): Promise<void> {
  // TODO: Implementar envio de email real usando Supabase Edge Function ou serviço externo
  console.log("=== EMAIL DE BOAS-VINDAS ===");
  console.log(`Para: ${email}`);
  console.log(`Nome: ${name}`);
  console.log(`Senha temporária: ${password}`);
  console.log(`Curso: ${courseName}`);
  console.log("============================");

  // Exemplo de implementação futura:
  // const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  // const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  // await supabaseAdmin.functions.invoke('send-welcome-email', {
  //   body: { email, name, password, courseName }
  // });
}

/**
 * Processa webhook da Hotmart
 */
export async function handleHotmartWebhook(req: Request, res: Response): Promise<void> {
  try {
    // Validar assinatura
    if (!validateHotmartSignature(req)) {
      res.status(401).json({ error: "Assinatura inválida" });
      return;
    }

    const payload = req.body as HotmartWebhookPayload;
    
    // A Hotmart pode enviar dados em diferentes formatos
    // Tentar extrair de diferentes estruturas
    const event = payload.event || (payload.purchase?.status ? 'PURCHASE_APPROVED' : undefined);
    const data = payload.data || payload;
    
    // Extrair dados do webhook (tentar múltiplos formatos)
    const productId = 
      data.product?.id || 
      payload.product?.id || 
      payload.product_id ||
      data.product_id;
      
    const buyerEmail = 
      data.buyer?.email || 
      payload.buyer?.email || 
      payload.email ||
      data.email;
      
    const buyerName = 
      data.buyer?.name || 
      payload.buyer?.name || 
      "Usuário";
      
    const transactionId = 
      data.purchase?.transaction || 
      payload.purchase?.transaction || 
      payload.transaction ||
      data.transaction;

    if (!productId || !buyerEmail || !transactionId) {
      res.status(400).json({ error: "Dados incompletos no webhook" });
      return;
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      res.status(500).json({ error: "Configuração do Supabase não encontrada" });
      return;
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verificar se a transação já foi processada (idempotência)
    const { data: existingPurchase } = await supabaseAdmin
      .from("hotmart_purchases")
      .select("id, processed_at, user_id, course_id")
      .eq("hotmart_transaction_id", transactionId)
      .single();

    if (existingPurchase && existingPurchase.processed_at) {
      // Transação já processada
      res.status(200).json({ message: "Transação já processada", purchase_id: existingPurchase.id });
      return;
    }

    // Buscar curso vinculado ao produto Hotmart
    const { data: hotmartProduct, error: productError } = await supabaseAdmin
      .from("hotmart_products")
      .select("course_id, hotmart_product_name")
      .eq("hotmart_product_id", productId)
      .single();

    if (productError || !hotmartProduct) {
      // Registrar compra mesmo sem curso vinculado para análise posterior
      await supabaseAdmin.from("hotmart_purchases").insert({
        hotmart_transaction_id: transactionId,
        hotmart_product_id: productId,
        buyer_email: buyerEmail,
        buyer_name: buyerName,
        status: "pending",
        raw_payload: payload as unknown as Record<string, unknown>,
      });

      res.status(200).json({
        message: "Produto não vinculado a nenhum curso. Compra registrada para análise.",
      });
      return;
    }

    const courseId = hotmartProduct.course_id;
    const courseName = hotmartProduct.hotmart_product_name || "Curso";

    // Processar diferentes eventos
    if (event === "PURCHASE_APPROVED") {
      // Buscar ou criar usuário
      let userId: string | null = null;

      // Verificar se usuário já existe
      const { data: existingUser } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("email", buyerEmail)
        .single();

      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Criar novo usuário
        const tempPassword = generateTemporaryPassword();
        const { userId: newUserId, error: createError } = await createUserWithPassword(
          buyerEmail,
          buyerName,
          tempPassword
        );

        if (createError || !newUserId) {
          console.error("Erro ao criar usuário:", createError);
          res.status(500).json({ error: "Erro ao criar usuário" });
          return;
        }

        userId = newUserId;

        // Enviar email de boas-vindas
        await sendWelcomeEmail(buyerEmail, buyerName, tempPassword, courseName);
      }

      // Verificar se já está inscrito no curso
      const { data: existingEnrollment } = await supabaseAdmin
        .from("enrollments")
        .select("id")
        .eq("user_id", userId)
        .eq("course_id", courseId)
        .single();

      if (!existingEnrollment) {
        // Criar enrollment
        const { error: enrollError } = await supabaseAdmin.from("enrollments").insert({
          user_id: userId,
          course_id: courseId,
        });

        if (enrollError) {
          console.error("Erro ao criar enrollment:", enrollError);
        }
      }

      // Registrar compra
      const { data: purchase, error: purchaseError } = await supabaseAdmin
        .from("hotmart_purchases")
        .upsert(
          {
            hotmart_transaction_id: transactionId,
            hotmart_product_id: productId,
            buyer_email: buyerEmail,
            buyer_name: buyerName,
            user_id: userId,
            course_id: courseId,
            status: "approved",
            raw_payload: payload as unknown as Record<string, unknown>,
            processed_at: new Date().toISOString(),
          },
          {
            onConflict: "hotmart_transaction_id",
          }
        )
        .select()
        .single();

      if (purchaseError) {
        console.error("Erro ao registrar compra:", purchaseError);
      }

      res.status(200).json({
        message: "Compra processada com sucesso",
        purchase_id: purchase?.id,
        user_id: userId,
        course_id: courseId,
      });
    } else if (event === "PURCHASE_REFUNDED" || event === "PURCHASE_CANCELED") {
      // Atualizar status da compra
      await supabaseAdmin
        .from("hotmart_purchases")
        .update({
          status: event === "PURCHASE_REFUNDED" ? "refunded" : "cancelled",
          raw_payload: payload as unknown as Record<string, unknown>,
        })
        .eq("hotmart_transaction_id", transactionId);

      // Opcional: Remover enrollment (comentar se não quiser remover acesso)
      // const { data: purchase } = await supabaseAdmin
      //   .from("hotmart_purchases")
      //   .select("user_id, course_id")
      //   .eq("hotmart_transaction_id", transactionId)
      //   .single();
      //
      // if (purchase?.user_id && purchase?.course_id) {
      //   await supabaseAdmin
      //     .from("enrollments")
      //     .delete()
      //     .eq("user_id", purchase.user_id)
      //     .eq("course_id", purchase.course_id);
      // }

      res.status(200).json({ message: "Status da compra atualizado" });
    } else {
      // Evento não tratado, apenas registrar
      await supabaseAdmin.from("hotmart_purchases").insert({
        hotmart_transaction_id: transactionId,
        hotmart_product_id: productId,
        buyer_email: buyerEmail,
        buyer_name: buyerName,
        status: "pending",
        raw_payload: payload as unknown as Record<string, unknown>,
      });

      res.status(200).json({ message: "Evento recebido e registrado" });
    }
  } catch (error) {
    console.error("Erro ao processar webhook da Hotmart:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

