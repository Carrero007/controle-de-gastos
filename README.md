# 💰 Sistema de Controle de Gastos

Sistema completo de controle de gastos pessoais com interface em tema escuro e paletas pastéis. Desenvolvido com HTML, CSS, JavaScript puro no frontend e Node.js + Express no backend.

## 🚀 Características

- **Interface Moderna**: Tema escuro com três paletas de cores pastéis intercambiáveis
- **Gestão Completa**: Adicionar, editar e excluir lançamentos (gastos e receitas)
- **Relatórios Visuais**: Gráficos interativos de gastos por dia e distribuição por categoria
- **Filtros Avançados**: Visualização por dia, mês e ano
- **Exportação**: Geração de relatórios em CSV
- **Responsivo**: Design adaptável para desktop e mobile
- **Persistência Local**: Dados armazenados em arquivo `dados.txt` (apenas para uso local/educacional)

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- npm (geralmente incluído com Node.js)

## 🔧 Instalação e Uso

### 1. Instalar dependências

```bash
npm install
```

### 2. Iniciar o servidor

```bash
npm start
```

ou

```bash
node server.js
```

### 3. Acessar a aplicação

Abra seu navegador e acesse:

```
http://localhost:3000
```

O arquivo `dados.txt` será criado automaticamente no diretório raiz do projeto.

## 📁 Estrutura do Projeto

```
controle-gastos/
├── index.html          # Interface principal
├── styles.css          # Estilos e temas
├── script.js           # Lógica do frontend
├── server.js           # Backend Node.js + Express
├── package.json        # Dependências do projeto
├── dados.txt           # Armazenamento de dados (criado automaticamente)
└── README.md           # Este arquivo
```

## 🎨 Paletas de Cores

O sistema oferece três temas pastéis:

- **Tema 1 (Verde Água)**: Tons de verde água e rosa
- **Tema 2 (Rosa)**: Tons de rosa e lilás
- **Tema 3 (Amarelo)**: Tons de amarelo e verde água

As preferências de tema são salvas no localStorage do navegador.

## 🔌 API Endpoints

### GET `/api/dados`
Retorna todos os dados (saldo e lançamentos).

**Resposta:**
```json
{
  "saldo": 1500.00,
  "lancamentos": [...]
}
```

### POST `/api/saldo`
Atualiza o saldo inicial.

**Body:**
```json
{
  "saldo": 2000.00
}
```

### POST `/api/lancamentos`
Cria um novo lançamento.

**Body:**
```json
{
  "tipo": "gasto",
  "valor": 50.00,
  "categoria": "Alimentação",
  "descricao": "Almoço",
  "data": "2025-12-07"
}
```

### PUT `/api/lancamentos/:id`
Atualiza um lançamento existente.

**Body:** Mesmos campos do POST (todos opcionais)

### DELETE `/api/lancamentos/:id`
Deleta um lançamento pelo ID.

## 🧪 Testando com curl

### Adicionar saldo inicial:
```bash
curl -X POST http://localhost:3000/api/saldo \
  -H "Content-Type: application/json" \
  -d '{"saldo": 2000.00}'
```

### Adicionar um gasto:
```bash
curl -X POST http://localhost:3000/api/lancamentos \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "gasto",
    "valor": 45.50,
    "categoria": "Alimentação",
    "descricao": "Pizza",
    "data": "2025-12-07"
  }'
```

### Listar todos os dados:
```bash
curl http://localhost:3000/api/dados
```

## ⚠️ Observações Importantes

- **Este sistema utiliza armazenamento em arquivo texto (`dados.txt`) e é adequado APENAS para uso local/educacional.**
- **NÃO USE EM PRODUÇÃO** sem implementar um banco de dados real (PostgreSQL, MongoDB, etc.)
- Não há autenticação ou autorização implementada
- Os dados não são criptografados
- Não há proteção contra acesso concorrente

## 🎯 Funcionalidades Principais

### Gestão de Saldo
- Definir e atualizar saldo inicial
- Visualização em tempo real do saldo atual (considerando gastos e receitas)

### Lançamentos
- Adicionar gastos e receitas
- Categorias predefinidas: Alimentação, Transporte, Moradia, Lazer, Saúde, Educação, Outros
- Editar e excluir lançamentos existentes
- Descrição opcional para cada lançamento

### Visualizações
- Resumo de gastos: hoje, mês atual, ano atual
- Total de receitas
- Gráfico de barras: gastos por dia do mês
- Gráfico de pizza: distribuição por categoria

### Filtros e Exportação
- Filtrar por mês específico
- Filtrar por ano específico
- Exportar lançamentos filtrados em CSV

## 💡 Dicas de Uso

1. **Primeiro uso**: Defina seu saldo inicial antes de adicionar lançamentos
2. **Organização**: Use categorias consistentes para melhor análise dos gastos
3. **Backup**: Faça backup regular do arquivo `dados.txt`
4. **Relatórios**: Use os filtros para analisar períodos específicos antes de exportar

## 🛠️ Personalização

### Ajustar cores
Edite as variáveis CSS no início do arquivo `styles.css`:

```css
:root {
  --accent-1: #A3D2CA;  /* Cor principal */
  --accent-2: #F6C6EA;  /* Cor secundária */
  /* ... */
}
```

### Adicionar categorias
Edite o `<select id="categoria">` no arquivo `index.html`:

```html
<option value="NovaCategoria">Nova Categoria</option>
```

### Alterar porta do servidor
Edite a constante `PORT` no arquivo `server.js`:

```javascript
const PORT = 3000;  // Altere para a porta desejada
```

## 📝 Licença

Este projeto é de uso livre para fins educacionais e pessoais.

## 🤝 Contribuições

Sugestões e melhorias são bem-vindas! Este é um projeto educacional para demonstrar conceitos de desenvolvimento web fullstack básico.

---

