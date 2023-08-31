ifneq ("$(wildcard .env.deploy)","")
	include .env.deploy
	export
endif

# ========== upload ==========
.PHONY: build

build-server:
	yarn build:server

build-web:
	yarn build:web
deploy: build-web build-server
	$(call command, "mkdir -p ${DEPLOY_PATH}/web")
	$(call command, "mkdir -p ${DEPLOY_PATH}/server")
	$(call upload, build/*, ${DEPLOY_PATH}/web)
	$(call upload, dist/*, ${DEPLOY_PATH}/server)
	$(call upload, .env, ${DEPLOY_PATH}/)


run:
	yarn serve

clean:
	rimraf dist build
	ts-clean-built --built


define git_update
	if [ ! -z "$$(git status --porcelain)" ]; then \
		git add . ; \
		git commit -m "update" ; \
		git push ; \
	fi
endef


push:
	cd config && $(call git_update)
	$(call git_update)

UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S),Linux)
	architecture = "linux/amd64"
else ifeq ($(UNAME_S),Darwin)
	architecture = "linux/arm64"
endif
act-debug:
	act \
	--container-architecture $(architecture) \
    -s GITHUB_TOKEN=$(API_TOKEN_GITHUB) \
    -s ACCESS_TOKEN=$(API_TOKEN_GITHUB) \
    -s github.repository=SuCicada/homer \
    --env-file .env \
    --env-file $(env_secret)
