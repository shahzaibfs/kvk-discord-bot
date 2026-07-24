.PHONY: dev redis up down logs clean

redis:
	docker compose up -d redis

redis-down:
	docker compose stop redis

dev:
	docker compose up -d redis
	npm run dev

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f redis

clean:
	docker compose down -v