ifneq ("$(wildcard .env.deploy)","")
	include .env.deploy
	export
endif

# ========== upload ==========
.PHONY: build

build-server: clean
	yarn build:server

build-web: clean
	yarn build:web

deploy-web: build-web
	$(call command, "mkdir -p ${DEPLOY_PATH}/web")
	$(call upload, build/*, ${DEPLOY_PATH}/web)

deploy-server: build-server
	sumake upload
upload:
	$(call command, "mkdir -p ${DEPLOY_PATH}/server")
	$(call upload, dist/*, ${DEPLOY_PATH}/server)
	$(call upload, .env, ${DEPLOY_PATH}/)
	$(call upload, api.yaml, ${DEPLOY_PATH}/)

deploy: clean deploy-web deploy-server
start-local-server:
	node dist/server.js

test:
	echo $(MAKECMDGOALS)
run:
	yarn serve

clean-all: clean
	rimraf dist build

clean:
	ts-clean-built --built


updateNotionButton:
	ts-node api/cli.ts updateNotionButton
