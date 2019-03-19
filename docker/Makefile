HTTPD_REPOSITORY ?= quay.io/democracyworks/rla-httpd
HTTPD_TAG ?= latest

POSTGRESQL_REPOSITORY ?= quay.io/democracyworks/rla-postgres
POSTGRESQL_TAG ?= latest

SERVER_REPOSITORY ?= quay.io/democracyworks/rla-server
SERVER_TAG ?= latest

SERVER_YOURKIT_REPOSITORY ?= quay.io/democracyworks/rla-server
SERVER_YOURKIT_TAG ?= latest-yourkit

### Apache httpd

.PHONY: httpd-build httpd-deploy

httpd-build:
	docker build --pull \
		-f httpd/Dockerfile \
		-t $(HTTPD_REPOSITORY):$(HTTPD_TAG) \
		../

httpd-deploy:
	docker push $(HTTPD_REPOSITORY):$(HTTPD_TAG)

### PostgreSQL

.PHONY: postgresql-build postgresql-deploy

postgresql-build:
	docker build --pull \
		-f postgresql/Dockerfile \
		-t $(POSTGRESQL_REPOSITORY):$(POSTGRESQL_TAG) \
		../

postgresql-deploy:
	docker push $(POSTGRESQL_REPOSITORY):$(POSTGRESQL_TAG)

### RLA server

.PHONY: server-build server-deploy

server-build:
	docker build --pull \
		-f server/Dockerfile \
		-t $(SERVER_REPOSITORY):$(SERVER_TAG) \
		../

server-deploy:
	docker push $(SERVER_REPOSITORY):$(SERVER_TAG)

### RLA server with YourKit

.PHONY: server-yourkit-build server-yourkit-deploy

server-yourkit-build:
	docker build --pull \
		-f server-yourkit/Dockerfile \
		-t $(SERVER_YOURKIT_REPOSITORY):$(SERVER_YOURKIT_TAG) \
		../

server-yourkit-deploy:
	docker push $(SERVER_YOURKIT_REPOSITORY):$(SERVER_YOURKIT_TAG)
