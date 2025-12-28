import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { createClient } from "@supabase/supabase-js";
import { handleHotmartWebhook } from "./hotmart-webhook";

/**
 * Middleware para validar autenticação via Supabase
 * Extrai o token JWT do header Authorization e valida com Supabase
 */
async function authenticateRequest(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token de autenticação não fornecido' });
    return;
  }

  const token = authHeader.substring(7);
  
  // Criar cliente Supabase anon para validar token
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    res.status(500).json({ error: 'Configuração do Supabase não encontrada' });
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
    return;
  }

  // Adicionar usuário ao request para uso nas rotas
  (req as Request & { user: { id: string } }).user = { id: user.id };
  next();
}

/**
 * Middleware para verificar se o usuário é admin
 */
async function requireAdmin(req: Request & { user: { id: string } }, res: Response, next: () => void) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    res.status(500).json({ error: 'Configuração do Supabase não encontrada' });
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: userData, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', req.user.id)
    .single();

  if (error || userData?.role !== 'admin') {
    res.status(403).json({ error: 'Acesso negado. Apenas administradores podem realizar esta ação.' });
    return;
  }

  next();
}

/**
 * Rotas de API para regras de negócio
 * 
 * NOTA: Estas rotas demonstram como mover regras de negócio do frontend para o backend.
 * Atualmente, a aplicação usa Supabase RLS para segurança, mas estas rotas podem ser
 * usadas para validações adicionais, auditoria, ou integrações externas.
 */
export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Prefixo para todas as rotas de API
  const API_PREFIX = "/api";

  /**
   * POST /api/posts
   * Cria um novo post com validação server-side
   * 
   * Regras de negócio que devem estar aqui:
   * - Validação de conteúdo (tamanho, palavras proibidas, etc.)
   * - Rate limiting (limitar posts por hora)
   * - Auditoria de ações
   * - Notificações para outros usuários
   */
  app.post(`${API_PREFIX}/posts`, authenticateRequest, async (req: Request & { user: { id: string } }, res: Response) => {
    try {
      const { courseId, title, content } = req.body;

      // Validação básica
      if (!courseId || !title || !content) {
        res.status(400).json({ error: 'Dados incompletos. courseId, title e content são obrigatórios.' });
        return;
      }

      // Validação de tamanho do conteúdo
      if (content.length > 10000) {
        res.status(400).json({ error: 'Conteúdo muito longo. Máximo de 10000 caracteres.' });
        return;
      }

      // Validação de título
      if (title.length > 200) {
        res.status(400).json({ error: 'Título muito longo. Máximo de 200 caracteres.' });
        return;
      }

      // Criar cliente Supabase
      const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
      const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        res.status(500).json({ error: 'Configuração do Supabase não encontrada' });
        return;
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: req.headers.authorization || '',
          },
        },
      });

      // Verificar se o usuário está inscrito no curso
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', req.user.id)
        .eq('course_id', courseId)
        .single();

      if (!enrollment) {
        res.status(403).json({ error: 'Você precisa estar inscrito no curso para criar posts.' });
        return;
      }

      // Criar o post
      const { data: post, error } = await supabase
        .from('posts')
        .insert({
          course_id: courseId,
          user_id: req.user.id,
          title,
          content,
        })
        .select()
        .single();

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }

      // TODO: Aqui você pode adicionar:
      // - Envio de notificações para outros usuários do curso
      // - Auditoria/logging
      // - Integração com serviços externos

      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar post' });
    }
  });

  /**
   * POST /api/courses
   * Cria um novo curso (apenas admin)
   * 
   * Regras de negócio que devem estar aqui:
   * - Validação de permissões (apenas admin)
   * - Validação de dados
   * - Criação automática de módulos iniciais
   */
  app.post(`${API_PREFIX}/courses`, authenticateRequest, requireAdmin, async (req: Request & { user: { id: string } }, res: Response) => {
    try {
      const { title, description, community_id, cover_image_url, image_text, is_locked } = req.body;

      if (!title) {
        res.status(400).json({ error: 'Título é obrigatório' });
        return;
      }

      const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
      const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        res.status(500).json({ error: 'Configuração do Supabase não encontrada' });
        return;
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: req.headers.authorization || '',
          },
        },
      });

      const { data: course, error } = await supabase
        .from('courses')
        .insert({
          title,
          description,
          community_id,
          cover_image_url,
          image_text,
          is_locked: is_locked ?? false,
          created_by: req.user.id,
        })
        .select()
        .single();

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }

      // TODO: Aqui você pode adicionar:
      // - Criação automática de módulo inicial
      // - Notificações para usuários da comunidade
      // - Auditoria

      res.status(201).json(course);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar curso' });
    }
  });

  /**
   * POST /api/courses/:courseId/enroll
   * Inscreve usuário em um curso com validação server-side
   * 
   * Regras de negócio que devem estar aqui:
   * - Verificar se o curso está bloqueado
   * - Verificar se o usuário já está inscrito
   * - Validar convites (se aplicável)
   * - Processar pagamento (se curso premium)
   */
  app.post(`${API_PREFIX}/courses/:courseId/enroll`, authenticateRequest, async (req: Request & { user: { id: string } }, res: Response) => {
    try {
      const courseId = parseInt(req.params.courseId, 10);

      if (isNaN(courseId)) {
        res.status(400).json({ error: 'ID do curso inválido' });
        return;
      }

      const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
      const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        res.status(500).json({ error: 'Configuração do Supabase não encontrada' });
        return;
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: req.headers.authorization || '',
          },
        },
      });

      // Verificar se o curso existe e está bloqueado
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('is_locked')
        .eq('id', courseId)
        .single();

      if (courseError || !course) {
        res.status(404).json({ error: 'Curso não encontrado' });
        return;
      }

      if (course.is_locked) {
        res.status(403).json({ 
          error: 'Este curso está bloqueado. É necessário comprar ou receber um convite para acessar.' 
        });
        return;
      }

      // Verificar se já está inscrito
      const { data: existingEnrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', req.user.id)
        .eq('course_id', courseId)
        .single();

      if (existingEnrollment) {
        res.status(409).json({ error: 'Você já está inscrito neste curso' });
        return;
      }

      // Inscrever usuário
      const { data: enrollment, error: enrollError } = await supabase
        .from('enrollments')
        .insert({
          user_id: req.user.id,
          course_id: courseId,
        })
        .select()
        .single();

      if (enrollError) {
        res.status(500).json({ error: enrollError.message });
        return;
      }

      // TODO: Aqui você pode adicionar:
      // - Validação de convites
      // - Processamento de pagamento
      // - Notificações

      res.status(201).json(enrollment);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao inscrever no curso' });
    }
  });

  /**
   * POST /api/webhooks/hotmart
   * Endpoint para receber webhooks da Hotmart
   * 
   * Processa eventos de compra, reembolso e cancelamento
   * e libera/revoga acesso aos cursos automaticamente
   */
  app.post(`${API_PREFIX}/webhooks/hotmart`, async (req: Request, res: Response) => {
    await handleHotmartWebhook(req, res);
  });

  /**
   * Health check endpoint
   */
  app.get(`${API_PREFIX}/health`, (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return httpServer;
}
