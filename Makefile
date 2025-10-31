.PHONY: help dev up down build rebuild logs clean migrate prisma-generate prisma-studio

help: ## Mostra esta mensagem de ajuda
	@echo "Comandos disponíveis:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev: ## Inicia todos os serviços em modo desenvolvimento
	docker-compose up -d

up: dev ## Alias para 'dev'

down: ## Para todos os serviços
	docker-compose down

stop: down ## Alias para 'down'

build: ## Builda as imagens Docker
	docker-compose build

rebuild: ## Rebuilda as imagens do zero (sem cache)
	docker-compose build --no-cache

restart: ## Reinicia todos os serviços
	docker-compose restart

logs: ## Mostra os logs de todos os serviços
	docker-compose logs -f

logs-app: ## Mostra apenas os logs da aplicação
	docker-compose logs -f app

clean: ## Remove containers, volumes e imagens
	docker-compose down -v --rmi all

clean-volumes: ## Remove apenas os volumes
	docker-compose down -v

ps: ## Lista todos os containers
	docker-compose ps

shell: ## Abre um shell no container da aplicação
	docker-compose exec app sh

shell-db: ## Abre um shell no container do postgres
	docker-compose exec postgres psql -U postgres -d solo-energia

migrate: ## Roda as migrations do Prisma
	docker-compose exec app npx prisma migrate dev

migrate-deploy: ## Roda as migrations em produção
	docker-compose exec app npx prisma migrate deploy

prisma-generate: ## Gera o Prisma Client
	docker-compose exec app npx prisma generate

prisma-studio: ## Abre o Prisma Studio
	docker-compose exec app npx prisma studio

seed: ## Roda o seed do banco de dados
	docker-compose exec app pnpm db:seed

seed-local: ## Roda o seed localmente (sem Docker)
	pnpm db:seed

reset-db: ## Reseta o banco de dados
	docker-compose exec app npx prisma migrate reset

db-push: ## Push do schema sem migrations
	docker-compose exec app npx prisma db push

# Produção
prod-build: ## Builda para produção
	docker-compose -f docker-compose.prod.yml build

prod-up: ## Inicia em modo produção
	docker-compose -f docker-compose.prod.yml up -d

prod-down: ## Para os serviços de produção
	docker-compose -f docker-compose.prod.yml down

prod-logs: ## Mostra logs de produção
	docker-compose -f docker-compose.prod.yml logs -f
