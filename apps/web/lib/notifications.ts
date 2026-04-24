import { toast } from 'sonner'

/**
 * Biblioteca centralizada de notificações (Toasts)
 * Centraliza todas as mensagens do sistema para facilitar manutenção e padronização.
 */
export const notify = {
  auth: {
    loginSuccess: () => toast.success('Login realizado com sucesso! Redirecionando...'),

    resetPasswordSuccess: () => toast.success('Senha redefinida com sucesso! Você já pode entrar.'),

    forgotPasswordSuccess: () => toast.success('Código enviado com sucesso! Verifique seu e-mail.'),

    otpVerified: () => toast.success('Código verificado com sucesso!'),

    otpResent: () => toast.success('Novo código enviado!'),

    logoutSuccess: () => toast.success('Sessão encerrada com sucesso.'),

    tokenExpired: () =>
      toast.error('O link de redefinição expirou. Por favor, solicite um novo e-mail.'),

    sessionExpired: () =>
      toast.warning('Sua sessão expirou. Por favor, entre novamente para continuar.'),

    genericError: (message?: string) =>
      toast.error(message || 'Ocorreu um erro na autenticação. Tente novamente.'),
  },

  system: {
    error: (message: string) => toast.error(message),
    success: (message: string) => toast.success(message),
    warning: (message: string) => toast.warning(message),
  },
  admin: {
    team: {
      deleteSuccess: () => toast.success('Equipe excluída com sucesso!'),
      saveSuccess: (isEdit: boolean) =>
        toast.success(isEdit ? 'Equipe atualizada com sucesso!' : 'Equipe criada com sucesso!'),
    },
    user: {
      deleteSuccess: () => toast.success('Usuário excluído com sucesso!'),
      saveSuccess: (isEdit: boolean) =>
        toast.success(isEdit ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!'),
      invitationResent: () => toast.success('Convite reenviado com sucesso!'),
    },
    project: {
      deleteSuccess: () => toast.success('Projeto excluído com sucesso!'),
      saveSuccess: (isEdit: boolean) =>
        toast.success(isEdit ? 'Projeto atualizado com sucesso!' : 'Projeto criado com sucesso!'),
      tokenRotated: () => toast.success('Token de integração rotacionado com sucesso!'),
      tokenCopied: () => toast.success('Token copiado para a área de transferência!'),
    },
    accessControl: {
      departmentDeleteSuccess: () => toast.success('Departamento excluído com sucesso!'),
      departmentSaveSuccess: (isEdit: boolean) =>
        toast.success(
          isEdit ? 'Departamento atualizado com sucesso!' : 'Departamento criado com sucesso!',
        ),
      positionDeleteSuccess: () => toast.success('Cargo excluído com sucesso!'),
      positionSaveSuccess: (isEdit: boolean) =>
        toast.success(isEdit ? 'Cargo atualizado com sucesso!' : 'Cargo criado com sucesso!'),
    },
  },
}
