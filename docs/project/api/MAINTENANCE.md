# 📖 Guia de Manutenção da Documentação

## 🔧 Como Manter a Documentação Atualizada

Este guia ajuda a manter a documentação consistente e sincronizada com o código.

---

## 📋 Checklist ao Modificar Código

### Ao Adicionar Novo Endpoint

```markdown
[ ] Documentar em ENDPOINTS.md - Path e método HTTP - Headers necessários - Body de request - Status codes possíveis - Exemplos de curl - Permissões requeridas

[ ] Atualizar ARCHITECTURE.md se arquitetura mudar

[ ] Adicionar testes em TESTING.md

[ ] Sincronizar diagrama em AUTHENTICATION.md/AUTHORIZATION-RBAC.md se necessário
```

### Ao Mudar RBAC/Permissões

```markdown
[ ] Atualizar AUTHORIZATION-RBAC.md - Tabela de permissões - Fluxos de acesso - Cache strategy

[ ] Atualizar database-seed.md se seed mudar

[ ] Sincronizar exemplos em ENDPOINTS.md

[ ] Adicionar testes em TESTING.md
```

### Ao Modificar Entidades

```markdown
[ ] Atualizar MODELS.md - Campos - Relacionamentos - Constraints

[ ] Atualizar DATABASE.md - Schema - Índices - SQL queries

[ ] Sincronizar database-schema.md

[ ] Atualizar diagramas se necessário
```

### Ao Mudar Services

```markdown
[ ] Atualizar SERVICES.md - Interface - Implementação - Exemplos

[ ] Atualizar AUTHENTICATION.md se AuthService mudar

[ ] Sincronizar DEPLOYMENT.md se DI mudar

[ ] Documentar quebra de compatibilidade
```

### Ao Adicionar Testes

```markdown
[ ] Documentar em TESTING.md - Seção apropriada (Unit/E2E) - Padrão AAA - Exemplo de código

[ ] Atualizar cobertura em SUMMARY.md

[ ] Adicionar ao diagrama se relevante
```

### Ao Modificar Infraestrutura

```markdown
[ ] Atualizar DEPLOYMENT.md - Docker Compose - Variáveis de ambiente - Scripts

[ ] Sincronizar .env.example

[ ] Atualizar versões de serviços

[ ] Documentar breaking changes
```

---

## 🔍 Validação de Documentação

### Verificar Consistência

```bash
# 1. Todos os endpoints estão em ENDPOINTS.md?
# 2. Todos os endpoints têm testes?
# 3. DTOs em MODELS.md correspondem ao código?
# 4. Permissões em AUTHORIZATION-RBAC.md estão atualizadas?
# 5. Exemplos de curl funcionam?
```

### Verificar Links

```bash
# Todos os links internos são válidos?
# [ARQUIVO.md](ARQUIVO.md) existe?
# [Seção](#secao) existe no arquivo?
```

### Verificar Exemplos

```bash
# Exemplos de código estão corretos?
# Exemplos de curl funcionam?
# Status codes estão corretos?
```

---

## 📝 Template para Novo Endpoint

Ao documentar novo endpoint, use este template:

```markdown
### N. Nome do Endpoint

Descrição breve do que faz.

\`\`\`
MÉTODO /api/v1/recurso/acao
\`\`\`

**Headers**
\`\`\`
Content-Type: application/json
Cookie: AuthToken=...
\`\`\`

**Body**
\`\`\`json
{
"campo": "valor"
}
\`\`\`

**Sucesso (STATUS)**
\`\`\`json
{
"code": "200",
"message": "",
"data": {}
}
\`\`\`

**Erro (STATUS)**
\`\`\`json
{
"code": "400",
"message": "Descrição do erro",
"data": null
}
\`\`\`

**Permissões**: 🔒 \`recurso:acao\`

**cURL**
\`\`\`bash
curl -X MÉTODO http://localhost:5000/api/v1/recurso/acao \\
-H "Content-Type: application/json" \\
-b "cookies.txt" \\
-d '{...}'
\`\`\`
```

---

## 📝 Template para Nova Entidade

Ao documentar nova entidade, use este template:

```markdown
## Entidade: NomeEntidade

Descrição breve.

\`\`\`csharp
public class NomeEntidade
{
public int Id { get; set; }
public string Propriedade { get; set; }

    // Navegações
    public Relacionado Relacionado { get; set; }

}
\`\`\`

**Campos**:

- campo1: tipo, descrição
- campo2: tipo, descrição

**Relacionamentos**:

- 1:N com OutraEntidade
- N:N com Entidade

**Constraints**:

- Unique em campo X
- FK cascade delete
```

---

## 🔄 Ciclo de Atualização

### Semanal

```
[ ] Revisar logs de deploy
[ ] Verificar PRs com código novo
[ ] Destacar o que precisa documentação
```

### Bi-semanal

```
[ ] Atualizar documentação de PRs merged
[ ] Validar links e exemplos
[ ] Executar exemplos de curl
```

### Mensal

```
[ ] Revisar documentação inteira
[ ] Atualizar versões de dependências
[ ] Verificar breaking changes
[ ] Atualizar SUMMARY.md
```

### Trimestral

```
[ ] Revisão completa de estrutura
[ ] Atualizar roteiros de aprendizado
[ ] Feedback de developers
[ ] Planejar melhorias
```

---

## 🚨 Red Flags - Sinais que Documentação Desatualizada

- ❌ Exemplos de curl retornam erro
- ❌ DTOs em MODELS.md não correspondem ao código
- ❌ Endpoints listados em ENDPOINTS.md não existem
- ❌ Permissões em AUTHORIZATION-RBAC.md não funcionam
- ❌ Campos em MODELS.md não existem nas entidades
- ❌ Versões em DEPLOYMENT.md estão outdated
- ❌ Links em cross-references quebrados
- ❌ Tabelas com dados inconsistentes

---

## 🎯 Recomendações

### Do's ✅

```
✅ Documente enquanto implementa
✅ Use exemplos práticos e testáveis
✅ Mantenha padrão visual consistente
✅ Use ícones e formatação de forma consistente
✅ Cross-reference entre documentos
✅ Mantenha links atualizados
✅ Valide exemplos de código
✅ Documente breaking changes
✅ Inclua migrações necessárias
✅ Especifique versões de dependências
```

### Don'ts ❌

```
❌ Não documenter código que será removido
❌ Não deixar exemplos que não funcionam
❌ Não esquecer de atualizar relacionados
❌ Não usar convenções diferentes entre arquivos
❌ Não deixar quebrados os links
❌ Não documentar sem testar
❌ Não confundir termos entre arquivos
❌ Não copiar código sem validar
❌ Não esquecer de versionar breaking changes
❌ Não deixar histórico desatualizado
```

---

## 🔗 Matriz de Dependência (Atualizar Se)

| Se você mudar | Atualize também                             |
| ------------- | ------------------------------------------- |
| Endpoint      | ENDPOINTS.md, ARCHITECTURE.md, TESTING.md   |
| Entidade      | MODELS.md, DATABASE.md, database-schema.md  |
| Permissão     | AUTHORIZATION-RBAC.md, ENDPOINTS.md         |
| Serviço       | SERVICES.md, ARCHITECTURE.md, DEPLOYMENT.md |
| Autenticação  | AUTHENTICATION.md, ENDPOINTS.md             |
| Erro          | ERROR-HANDLING.md, ENDPOINTS.md             |
| Docker        | DEPLOYMENT.md, .env.example, README.md      |
| Seed          | database-seed.md, DATABASE.md, SUMMARY.md   |

---

## 📊 Exemplo: Adicionar Novo Endpoint

### Passo 1: Implementar Código

```csharp
[HttpGet("novo-recurso")]
[HasPermission("novo_recurso", "view")]
public async Task<IActionResult> GetNovoRecurso()
{
    // implementação
}
```

### Passo 2: Testar

```bash
curl -X GET http://localhost:5000/api/v1/novo-recurso \
  -b cookies.txt
```

### Passo 3: Documentar em ENDPOINTS.md

```markdown
### XX. Obter Novo Recurso

Retorna lista de novo recurso.

\`\`\`
GET /api/v1/novo-recurso
\`\`\`
...
```

### Passo 4: Atualizar Relacionados

- [ ] SUMMARY.md (adicionar na contagem)
- [ ] INDEX.md (referenciar se novo tópico)
- [ ] ARCHITECTURE.md (se mudou fluxo)

### Passo 5: Adicionar Teste

```csharp
[Fact]
public async Task GetNovoRecurso_ShouldReturn200()
{
    // teste
}
```

E documentar em TESTING.md.

---

## 🎓 Treinamento de Novo Dev

Checklist para um novo developer aprender a manutenção:

```
[ ] Leu README.md
[ ] Estudou ARCHITECTURE.md
[ ] Explorou ENDPOINTS.md
[ ] Entendeu AUTHENTICATION.md
[ ] Compreendeu AUTHORIZATION-RBAC.md
[ ] Aprendeu MODELS.md
[ ] Leu SERVICES.md
[ ] Estudou DATABASE.md
[ ] Executou exemplos de TESTING.md
[ ] Rodou DEPLOYMENT.md
[ ] Consultou ERROR-HANDLING.md
[ ] Navegou com INDEX.md
```

---

## 📞 Suporte

### Dúvidas Comuns

**P: Que arquivo modifico para adicionar endpoint?**
R: ENDPOINTS.md. Depois sincronize ARCHITECTURE.md, TESTING.md, etc.

**P: Como validar exemplos de curl?**
R: Execute contra API local (docker compose up) e valide status 200.

**P: Quando atualizar database-schema.md?**
R: Quando estrutura do banco mudar (novos campos, relacionamentos).

**P: Links quebrados, como corrigir?**
R: Use grep para encontrar e corrija nos arquivos referenciados.

---

## 🏆 Metas

- ✅ 100% dos endpoints documentados
- ✅ 80%+ de cobertura de testes
- ✅ Exemplos funcionais em 100% dos endpoints
- ✅ Zero links quebrados
- ✅ Sincronização com código < 1 dia sempre

---

**Última atualização**: Abril 2026

---

**👉 [Volta para README](README.md)**
