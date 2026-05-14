Com base no enunciado do Lab #04 e no que se espera de um mini e-commerce funcional a nível académico, aqui está a listagem completa organizada por área.

---

## 🔐 1. Autenticação e Contas

- Formulário de **registo** com validação (nome, email, senha, confirmação)
- Formulário de **login** com email e senha
- **Logout** com limpeza de sessão/token
- **Recuperação de senha** — o utilizador insere o email, recebe um link/token, define nova senha
- Protecção de rotas — páginas privadas inacessíveis sem login
- Distinção de acesso por **role** (cliente vs administrador)

---

## 🛍️ 2. Vitrine / Catálogo

- **Página inicial** com produtos em destaque ou categorias
- **Listagem de produtos** com imagem, nome e preço
- **Filtro por categoria**
- **Pesquisa por nome** de produto
- **Paginação** dos resultados
- **Página de detalhe** do produto (imagem, descrição, preço, stock disponível)
- Indicação de produto **fora de stock**

---

## 🛒 3. Carrinho de Compras

- **Adicionar** produto ao carrinho
- **Visualizar** o carrinho (lista de itens, quantidade, subtotal por item)
- **Alterar quantidade** de um item
- **Remover** item do carrinho
- Cálculo automático do **total**
- Carrinho **persistido** (não se perde ao fechar a página)
- Contador de itens visível na **navbar**

---

## 📦 4. Checkout e Encomendas

- Formulário de **endereço de entrega** no checkout
- **Resumo da encomenda** antes de confirmar (itens, quantidades, total)
- **Confirmação da encomenda** com redução automática do stock
- Página de **sucesso** após compra
- **Histórico de encomendas** do cliente (lista com data, total e status)
- **Detalhe de cada encomenda** (itens, quantidades, preços, status)
- **Exportação da encomenda em PDF** pelo cliente

---

## 👤 5. Perfil do Cliente

- Visualização e **edição de dados pessoais** (nome, email)
- **Alteração de senha**
- Preferência de **idioma**
- Preferência de **tema** (claro/escuro)

---

## ⚙️ 6. Painel do Administrador

### Produtos e Categorias
- **Criar, editar e remover** categorias
- **Criar produto** (nome, descrição, preço, stock, categoria, imagem)
- **Editar produto** existente
- **Remover produto** (ou desactivar)
- Controlo de **stock** com actualização manual

### Gestão de Encomendas
- Listagem de **todas as encomendas** de todos os clientes
- Filtro por **status** (pendente, confirmada, enviada, entregue, cancelada)
- Actualização do **status** de cada encomenda

### Gestão de Utilizadores
- Listagem de **todos os utilizadores**
- Visualização de dados e role de cada utilizador
- Possibilidade de **editar role** (promover a admin ou revogar)

### Relatórios e Exportação
- **Dashboard** com métricas básicas (total de encomendas, receita, produtos em stock baixo)
- Exportação de relatório de encomendas em **CSV**
- Exportação de relatório em **PDF**

---

## 🌐 7. Funcionalidades Transversais (Requisitos Obrigatórios)

| Funcionalidade | O que se espera ver |
|---|---|
| **Dark mode / Light mode** | Toggle visível na navbar, preferência guardada, aplicado a toda a interface |
| **Múltiplos idiomas (PT + EN)** | Seletor de idioma, toda a interface traduzida (menus, botões, mensagens de erro) |
| **API externa** | Taxa de câmbio aplicada ao preço dos produtos (ex: mostrar em AOA, USD, EUR) |
| **Exportação** | PDF para o cliente + CSV/PDF para o admin |
| **Interface responsiva** | Funcional em telemóvel, tablet e desktop |

---

## 💻 8. Qualidade Técnica (O que o professor avalia no código)

### Angular
- Componentes **reutilizáveis** (pelo menos um cartão de produto, um paginador, um spinner)
- **Módulos separados** por domínio (auth, catálogo, carrinho, admin)
- **Services** isolados da lógica dos componentes
- **Guards** a proteger rotas privadas e de admin
- **Interceptor** a injectar o JWT automaticamente nos pedidos HTTP

### PHP
- **Controllers** separados dos **Models**
- Models a fazer o acesso à base de dados via **PDO**
- **Helpers** reutilizáveis (resposta JSON, JWT, validação, exportação)
- **Middleware** de autenticação e de permissão de admin
- **Router** centralizado (não lógica espalhada por ficheiros soltos)

### Base de Dados
- Mínimo 3 tabelas (o professor espera mais num e-commerce real)
- **Chaves estrangeiras** com integridade referencial
- **Constraints** adequadas (UNIQUE, NOT NULL)
- Script SQL limpo e organizado para entrega

### GitHub
- **Commits progressivos** (não um único commit com tudo)
- Mensagens de commit descritivas
- Autoria **individual identificável**

---

## ⚠️ O que garante nota zero

- Não entregar o sistema completo sem justificação aceite pelo professor
- Sistema que não corre / não abre
- Ausência de histórico de commits (código entregue de uma vez)
- Não ter autenticação funcional
- Base de dados inexistente ou sem relações

---

Em resumo, o professor espera um sistema **utilizável de ponta a ponta** — um cliente consegue entrar, ver produtos, comprar e ver as suas encomendas; um administrador consegue gerir tudo e exportar relatórios — com o código organizado de forma que se veja claramente a separação de responsabilidades.