# Generation Module - Arquitetura e Design Patterns

## Visão Geral

Este módulo implementa a funcionalidade de geração de energia solar seguindo princípios de **Domain-Driven Design (DDD)** e diversos **Design Patterns** para garantir código limpo, testável e manutenível.

## Arquitetura DDD

### 1. **Domain Layer (Domínio)**
- **Models**: `InverterModel`, `GenerationUnitModel`
  - Contêm a lógica de negócio central
  - Representam as entidades do domínio
  - São independentes de infraestrutura

### 2. **Application Layer (Aplicação)**
- **Services**: `GenerationService`
  - Orquestram operações de negócio
  - Coordenam entre diferentes repositórios
  - Implementam casos de uso complexos

### 3. **Infrastructure Layer (Infraestrutura)**
- **Repositories**: Implementações concretas (`PrismaInverterRepository`, `InMemoryInverterRepository`)
- **Dependency Injection**: Container de DI para gerenciar dependências
- **Database**: Integração com Prisma ORM

### 4. **Interface Layer (Interface)**
- **API Routes**: Endpoints Next.js que expõem a funcionalidade
- **DTOs**: Transformação de dados para a API

## Design Patterns Implementados

### 1. **Repository Pattern**
```typescript
interface InverterRepository {
    create(inverter: InverterModel): Promise<void>;
    find(): Promise<InverterModel[]>;
    findById(id: string): Promise<InverterModel>;
    update(inverter: InverterModel): Promise<void>;
}
```

**Benefícios:**
- Abstração da camada de dados
- Facilita testes unitários
- Permite trocar implementações (Prisma ↔ In-Memory)

### 2. **Factory Pattern**
```typescript
export class RepositoryFactoryProvider {
    static initialize(type: RepositoryType, prisma?: PrismaClient): void
    static getInstance(): RepositoryFactory
}
```

**Benefícios:**
- Centraliza criação de objetos
- Permite configuração dinâmica
- Facilita mudança de implementações

### 3. **Dependency Injection (DI) Container**
```typescript
export class GenerationDIContainer implements DIContainer {
    getInverterRepository(): InverterRepository;
    getGenerationUnitRepository(): GenerationUnitRepository;
}
```

**Benefícios:**
- Baixo acoplamento
- Facilita testes
- Configuração centralizada de dependências

### 4. **Service Layer Pattern**
```typescript
export class GenerationServiceImpl implements GenerationService {
    constructor(
        private inverterRepository: InverterRepository,
        private generationUnitRepository: GenerationUnitRepository
    ) {}
}
```

**Benefícios:**
- Encapsula lógica de negócio
- Reutilização entre diferentes interfaces
- Transações e validações centralizadas

### 5. **Strategy Pattern** (Implícito)
- Diferentes implementações de repositórios (Prisma, In-Memory)
- Diferentes provedores de inversores (Solis, SolPlanet, Mock)

## Estrutura de Diretórios

```
src/backend/generation/
├── models/                          # Domain Models
│   ├── inverter.model.ts
│   └── generation-unit.model.ts
├── repositories/                    # Repository Interfaces
│   ├── inverter.repository.ts
│   ├── generation-unit.repository.ts
│   ├── repository.factory.ts
│   └── implementations/             # Repository Implementations
│       ├── prisma.inverter.repository.ts
│       ├── prisma.generation-unit.repository.ts
│       ├── in-memory.inverter.repository.ts
│       └── in-memory.generation-unit.repository.ts
├── services/                        # Application Services
│   └── generation.service.ts
├── infrastructure/                  # Infrastructure Layer
│   └── dependency-injection.container.ts
├── use-cases/                       # Specific Use Cases
│   └── sync-inverter-generation-data.use-case.ts
└── __tests__/                       # Tests
```

## Integração com Next.js

### API Routes Implementadas

1. **`/api/generation/inverters`**
   - `GET`: Lista todos os inversores
   - `POST`: Cria novo inversor

2. **`/api/generation/inverters/[id]`**
   - `GET`: Busca inversor por ID
   - `PUT`: Atualiza inversor

3. **`/api/generation/generation-units`**
   - `GET`: Lista unidades de geração (com filtros)
   - `POST`: Cria nova unidade de geração

4. **`/api/generation/analytics`**
   - `GET`: Estatísticas e análises de geração

### Exemplo de Uso da API

```typescript
// Criar um inversor
const response = await fetch('/api/generation/inverters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: 'Inversor Solar 1',
        provider: 'solis',
        providerId: 'SOL123',
        providerApiKey: 'key123'
    })
});

// Buscar dados de geração
const generationData = await fetch(
    '/api/generation/generation-units?inverterId=inv_123&type=day'
);
```

## Configuração e Inicialização

### 1. Inicialização do Container DI

```typescript
// Em cada API route
const prisma = new PrismaClient();
const container = initializeDIContainer('prisma', prisma);
const generationService = new GenerationServiceImpl(
    container.getInverterRepository(),
    container.getGenerationUnitRepository()
);
```

### 2. Configuração para Testes

```typescript
// Para testes unitários
const container = initializeDIContainer('in-memory');
const service = new GenerationServiceImpl(
    container.getInverterRepository(),
    container.getGenerationUnitRepository()
);
```

## Vantagens da Arquitetura

### 1. **Testabilidade**
- Fácil mock de dependências
- Testes isolados por camada
- Repositórios in-memory para testes rápidos

### 2. **Manutenibilidade**
- Separação clara de responsabilidades
- Baixo acoplamento entre camadas
- Fácil adição de novas funcionalidades

### 3. **Flexibilidade**
- Troca fácil de implementações
- Suporte a múltiplos provedores
- Configuração dinâmica

### 4. **Escalabilidade**
- Arquitetura preparada para crescimento
- Fácil adição de novos casos de uso
- Suporte a diferentes fontes de dados

## Próximos Passos

1. **Implementar Middleware de Autenticação**
2. **Adicionar Validação de Dados (Zod)**
3. **Implementar Cache (Redis)**
4. **Adicionar Logging Estruturado**
5. **Implementar Rate Limiting**
6. **Adicionar Monitoramento e Métricas**

## Exemplos de Extensão

### Adicionando Novo Provedor de Inversor

1. Implementar `NewProviderInverterApiRepository`
2. Registrar no factory pattern
3. Configurar no DI container
4. Nenhuma mudança necessária nas APIs

### Adicionando Nova Fonte de Dados

1. Implementar `MongoInverterRepository`
2. Atualizar o `RepositoryFactory`
3. Configurar no DI container
4. APIs continuam funcionando sem mudanças

Esta arquitetura garante que o código seja robusto, testável e preparado para evolução contínua.
