.ONESHELL:
.DEFAULT_GOAL := help

.PHONY: help test

# allow user specific optional overrides
-include Makefile.overrides

export

help: ## show help
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: test
test: ## run tests
	@npm test

fmt: ## Format code
	@npm run format

lint: ## Run static analysis
	@npm run lint

check: ## Run all checks for this project
	@npm run format:check
	@npm run lint
	@npm test
	@npm run build
