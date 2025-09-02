### Como rodar a aplicação

1. Pré-requisitos

- Docker e Docker Compose instalados
- Portas livres: 5438 (DB), 3000 (API), 5173 (Web)

1. Suba a aplicação com o docker compose

```bash
docker compose up --build -d
```

ou

```bash
docker compose -f "docker-compose.yaml" up -d --build
```

3. Acessos

- API: [http://localhost:3000](http://localhost:3000/)
- Web: [http://localhost:5173](http://localhost:5173/)
- Postgres: localhost:5438 (db: lawgic / user: lawgic / pass: lawgic)

4. Parar/limpar

```bash
docker compose down
docker compose down -v
```

#### Migrations e Seed

O compose já executa as migrations e popula o banco com os usuários do tipo reviewer e notifier.

## 🚨 Importante 🚨

01 - Ao rodar o compose ele executa a seed que cria os usuário de acesso:

#### Acesse o sistema com as credênciais de cada um

Notifier:
email: notifier@lawgic.com
senha: 12345678

Reviewer:
email: reviewer@lawgic.com
senha: 12345678

02 - A API tem um interceptos que adiciona um delay aleatório a cada requisição. Fiz isso para exibir melhor os estados de loading.Você pode remover comentando a linha : app.useGlobalInterceptors(new RandomDelayInterceptor()) na main.ts da api.

# Fluxo da aplicação

- A aplicação possui duas entidades principais:
  - Notifier: usuário autorizado a criar e editar notificações.
  - Reviewer: usuário autorizado a validar (aprovar ou devolver para edição) notificações.
- O formulário de criação é multietapas (multi-step) e é construído dinamicamente a partir de um JSON Schema fornecido pelo backend.
- O estado do formulário e da notificação é armazenado em cache (Zustand), permitindo sair e retomar o fluxo sem perda de progresso.

![Fluxo da aplicação](https://i.imgur.com/CklxWcB.jpeg)

---

### Papéis e Permissões

- Notifier
  - Pode criar uma notificação.
  - Pode editar enquanto a notificação estiver em in_progress.
  - Pode enviar para validação quando houver uma pessoa notificada atribuída.
- Reviewer
  - Pode validar notificações em validation.
  - Pode aprovar ou devolver para edição (retornar o status para in_progress).
- Admin
  - Existe esse user role porém não foi implementado 100%

---

### Criação e Edição (Notifier)

1. Abertura do modal de criação

- Ao clicar em “Criar notificação”, é aberto um popup/modal.
- Na montagem do modal, o front faz uma requisição para obter o schema do formulário:
  - Endpoint: `/api/forms/CREATE_NOTIFICATION`
  - Retorno: JSON Schema com a definição dinâmica dos campos da primeira etapa.

2. Renderização dinâmica do formulário

- Com base no schema retornado, o componente `DynamicMultiStepForm` (src/components/dynamic-form) monta o formulário multistep.
- Primeira etapa: preenchimento dos metadados principais da notificação:
  - Title
  - Description
  - hearingDate

3. Persistência inicial e controle de estado

- Ao enviar a primeira etapa, o front chama:
  - Endpoint: `/api/notifications/`
  - Retorno: `notificationId`
- O front armazena:

  - Todo o estado do formulário.
  - O `notificationId` retornado (será usado na segunda etapa).

- Nesse momento, a notificação é criada com status in_progress.
- Como o estado está em cache (Zustand), é possível fechar o popup e retomar a criação/edição depois, sem perder informações.

4. Atribuição da pessoa notificada (segunda etapa)

- O front cham endpoint:Endpoint: `/api/forms/CREATE_NOTIFIED_PERSON`

  - Monta a segunda parte do formulário com base no schema retornado

- Ainda em in_progress, o Notifier deve atribuir a pessoa notificada (NotifiedPerson) à notificação.
- Somente após essa atribuição a notificação pode seguir para validação.

5. Envio para validação

- Após atribuir a NotifiedPerson, a notificação muda para o status validation.
- Em validation, a edição pelo Notifier fica desabilitada.
- A partir daí, o Reviewer pode atuar.

---

### Validação (Reviewer)

- Ao acessar os detalhes de uma notificação com status validation, o Reviewer vê duas ações:
  - Aprovar
    - A notificação é aprovada (status final).
  - Voltar para edição
    - A notificação retorna para o Notifier com status in_progress, permitindo ajustes e um novo envio para validação.

---

### Estados da Notificação

- in_progress
  - Notificação em criação/edição pelo Notifier.
  - Edição habilitada.
  - Ainda não pode ser validada se não houver NotifiedPerson atribuída.
- validation
  - Notificação aguardando ação do Reviewer.
  - Edição desabilitada no front para o Notifier.
- completed (após ação de “Aprovar”)
  - Fluxo concluído.

---

### Endpoints Envolvidos

- `/api/forms/CREATE_NOTIFICATION`
  - Retorna o JSON Schema usado para montar a primeira etapa do formulário dinâmico.
- `/api/forms/CREATE_NOTIFIED_PERSON`
  - Retorna o JSON Schema usado para montar a segunda etapa do formulário dinâmico.
- `/api/notifications/`
  - Cria a notificação inicial (retorna `notificationId`) e recebe atualizações conforme as etapas avançam.
- `/api/notifications/person`
  - Cria a pessoal a ser notificada

---

### Componentes de Front-end

- `DynamicMultiStepForm` (src/components/dynamic-form)
  - Constrói e exibe o formulário multistep dinamicamente a partir do JSON Schema recebido do backend.
- Store de estado (Zustand)
  - Mantém em cache o estado do formulário e da notificação.
  - Permite retomar o fluxo ao reabrir o modal, sem perda de dados.

---

### Regras de Negócio e Controles de Acesso

- Regras de habilitação de botões e ações baseadas no papel (Notifier vs Reviewer) e no estado da notificação.
- Restrições de edição:
  - Editável em in_progress.
  - Não editável em validation (aguardando o Reviewer).
- Essas regras são aplicadas tanto no front-end quanto no backend.

---

# Escolha técnica:

## API

Escolhi utilizar NestJs pois na entrevista foi informado que seria a escolha de framework para o ERP. Utilizei boa parte das features que o nest proporciona: Pipes, Guards,Exceptions, Decoratos, Interceptors...

## Web

O Front foi feito como pedido pelo desafio: React + Scss

## Arquitetura

Tanto o front quanto o back foi organizado com separação clara de requisitos. A api divide a organização em domínios (que eu chamo de modules) onde cada dominio tem sua service,repository,dtos. O front tem o máximo de componentização possível, dentro do tempo do desafio foi o que deu para componentizar.

---
