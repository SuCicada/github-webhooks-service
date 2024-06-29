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

start:
	node dist/index.js

clean-all: clean
	rimraf dist

clean:
	ts-clean-built --built

init:
	#npx prisma db pull
	npx prisma generate
