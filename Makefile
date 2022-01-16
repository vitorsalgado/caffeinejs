# Help
# ---
.DEFAULT_GOAL := help
.PHONY: help
help:
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: test
test:
	@yarn test

fmt: # Format code
	@yarn format

lint: # Run static analysis
	@yarn lint

check: # Run all checks for this project
	@yarn format:check
	@yarn lint
	@yarn test
	@yarn build
