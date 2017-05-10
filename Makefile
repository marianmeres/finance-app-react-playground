RED    = \033[0;31m
YELLOW = \033[0;33m
RESET  = \033[0m

.PHONY: build
build:
	npm run build
	@echo ""
	@echo ""
	@echo "    $(YELLOW)--> Read package.json for more $(RED)npm run $(YELLOW)scripts...$(RESET)"
	@echo ""
