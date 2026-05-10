.PHONY: help dev up down logs restart clean shell-dashboard shell-jenkins token

help:
	@echo "Commands:"
	@echo "  make dev              - Start dev environment"
	@echo "  make down             - Stop services"
	@echo "  make logs             - Tail all logs"
	@echo "  make logs-jenkins     - Tail jenkins logs (find API token)"
	@echo "  make restart          - Restart services"
	@echo "  make clean            - Stop + remove volumes (full reset)"
	@echo "  make token            - Print API token from jenkins logs"

dev:
	docker compose -f docker-compose.dev.yml up --build

up:
	docker compose -f docker-compose.dev.yml up -d --build

down:
	docker compose -f docker-compose.dev.yml down

logs:
	docker compose -f docker-compose.dev.yml logs -f

logs-jenkins:
	docker compose -f docker-compose.dev.yml logs jenkins | grep -A1 "DASHBOARD API TOKEN"

logs-dashboard:
	docker compose -f docker-compose.dev.yml logs -f dashboard

restart:
	docker compose -f docker-compose.dev.yml restart

clean:
	docker compose -f docker-compose.dev.yml down -v

token:
	@docker compose -f docker-compose.dev.yml logs jenkins 2>/dev/null | grep -A1 "DASHBOARD API TOKEN" || echo "Token not generated yet, wait for Jenkins to start"

shell-dashboard:
	docker compose -f docker-compose.dev.yml exec dashboard sh

shell-jenkins:
	docker compose -f docker-compose.dev.yml exec jenkins bash
