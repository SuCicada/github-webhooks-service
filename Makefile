ifneq ("$(wildcard .env.deploy)","")
	include .env.deploy
	export
endif

# ========== upload ==========
.PHONY: build run

run: dev
dev:
	yarn dev

build: clean-all
	yarn build
build-test: build
	rimraf /tmp/dist/*
	cp -r dist/ /tmp/dist/
	#cp -r node_modules/prisma /tmp/dist/
	cd /tmp/dist/ && node github-webhooks-service.js
start:
	node dist/index.js

clean-all: clean
	rimraf dist

clean:
	ts-clean-built --built

init:
	yarn install
	#npx prisma db pull
	npx prisma generate
