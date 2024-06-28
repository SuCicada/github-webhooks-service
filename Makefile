ifneq ("$(wildcard .env.deploy)","")
	include .env.deploy
	export
endif

# ========== upload ==========
.PHONY: build

build: clean-all
	yarn build

start:
	node dist/index.js

run:
dev:
	yarn dev

clean-all: clean
	rimraf dist

clean:
	ts-clean-built --built
