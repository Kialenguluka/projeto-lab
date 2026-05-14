# MiniStore AO - E-commerce Platform

Modernização da plataforma MiniStore AO para a cadeira de Engenharia de Software II (ISPTEC).

## 🚀 Funcionalidades

### Cliente
- **Catálogo Moderno:** Visualização de produtos com filtragem por categoria.
- **Checkout "Estilo ATM":** Fluxo de confirmação de pagamento seguro com resumo de operação.
- **Pagamentos Diversos:** Suporte para Cartão (Multicaixa), Transferência/TPA e Numerário.
- **Gestão de Perfil:** Atualização de dados pessoais e **foto de perfil (avatar)**.
- **Histórico de Encomendas:** Acompanhamento em tempo real do estado do pedido.

### Administrador
- **Dashboard de Estatísticas:** Visão geral de vendas e desempenho.
- **Gestão de Produtos:** CRUD completo de produtos e categorias.
- **Gestão de Pedidos:** Controle total do ciclo de vida das encomendas (Pendente, Paga, Enviada, Entregue, Cancelada).
- **Relatórios:** Exportação de dados e relatórios de vendas.

## 🛠️ Tecnologias

- **Frontend:** Angular 17+, Tailwind CSS (Rich UI), Lucide Icons.
- **Backend:** Pure PHP 8.x (REST API), JWT Authentication, PDO MySQL.

## 📦 Como rodar o projeto

### Backend
1. Configure o MySQL com o schema em `backend/database/schema.sql`.
2. Configure o arquivo `backend/config/constants.php`.
3. Inicie o servidor PHP:
   ```bash
   php -S localhost:8000 -t backend backend/index.php
   ```

### Frontend
1. Navegue até a pasta `frontend`.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie a aplicação:
   ```bash
   npm start
   ```

---
Desenvolvido como parte do projeto prático de Engenharia de Software II.
