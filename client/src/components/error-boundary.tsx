import React, { Component, ErrorInfo, ReactNode, useState } from 'react';
import { reportError } from '@/lib/error-reporter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Copy, Check } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Componente funcional para botão de copiar erro
function CopyErrorButton({ error }: { error: Error }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const errorText = `${error.toString()}${error.stack ? `\n\n${error.stack}` : ''}`;
    
    try {
      await navigator.clipboard.writeText(errorText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = errorText;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        console.error('Falha ao copiar:', e);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="w-full"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Copiado!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-2" />
          Copiar Erro
        </>
      )}
    </Button>
  );
}

/**
 * ErrorBoundary - Captura erros de renderização do React
 * 
 * Este componente captura erros que ocorrem durante a renderização,
 * em métodos do ciclo de vida, e em construtores de toda a árvore abaixo.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Reportar erro
    reportError({
      type: 'boundary',
      message: error.message || 'React Error Boundary caught an error',
      stack: error.stack,
      context: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      },
    });

    // Log em desenvolvimento
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Se há um fallback customizado, usar ele
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback padrão
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-md w-full border-destructive/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-destructive">Algo deu errado</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Ocorreu um erro inesperado. O erro foi registrado e nossa equipe será notificada.
              </p>
              
              {this.state.error && import.meta.env.DEV && (
                <div className="space-y-2">
                  <details className="text-xs bg-muted p-3 rounded-md">
                    <summary className="cursor-pointer font-medium mb-2">
                      Detalhes do erro (apenas em desenvolvimento)
                    </summary>
                    <pre className="whitespace-pre-wrap break-words select-text">
                      {this.state.error.toString()}
                      {this.state.error.stack && `\n\n${this.state.error.stack}`}
                    </pre>
                  </details>
                  <CopyErrorButton error={this.state.error} />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Recarregar Página
                </Button>
                <Button
                  onClick={this.handleReset}
                  className="flex-1"
                >
                  Tentar Novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

