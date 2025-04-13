ifneq (,$(wildcard ./.env))
	include .env
	export
endif

.PHONY: all

COMMIT_SHA := $(shell git rev-parse HEAD)
BACKEND_DOCKER_IMAGE := veetik/tasks-backend

backdepl:
	@docker build ./backend -t $(BACKEND_DOCKER_IMAGE):$(COMMIT_SHA) && \
		docker push $(BACKEND_DOCKER_IMAGE):$(COMMIT_SHA) && \
		COMMIT_SHA=$(COMMIT_SHA) docker --context=SERVU stack deploy -c stack.yml tasks

depl:
	@make backdepl
