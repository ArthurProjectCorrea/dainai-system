# Changelog - API - 2026-04-17

## 🛠️ Refinamentos Técnicos e Estabilidade

### Infraestrutura de Arquivos

- **Lançamento do IFileService**: Centralização da lógica de salvamento e exclusão de arquivos físicos para evitar duplicação em serviços administrativos.
- **Autolimpagem de Assets**: Implementado mecanismo no `AdminService` que remove automaticamente logotipos antigos quando são substituídos ou quando o registro é removido, evitando o "leaking" de armazenamento.

### Qualidade de Código (Build Zero Warning)

- **Null Safety**: Corrigidos múltiplos casos de `CS8604` e `CS8602` em serviços de administração e autenticação, garantindo que o compilador valide a segurança de referências nulas.
- **Estabilização de Build**: A solução agora compila com 0 erros no modo release, pronta para deployment estável.

### Observabilidade e Auditoria

- **Correlation Tracking**: O `AppDbContext` agora captura e persiste metadados de correlação em operações complexas, permitindo rastrear o ciclo de vida de transações de negócio que afetam múltiplas tabelas.

---

> [!IMPORTANT]
> Estas mudanças focam na sustentabilidade a longo prazo do backend, garantindo que o crescimento do banco de dados e do sistema de arquivos ocorra de forma ordenada e auditável.
