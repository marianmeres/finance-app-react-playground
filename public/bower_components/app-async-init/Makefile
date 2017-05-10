.PHONY: js
js: dist/app-async-init.min.js dist/app-callback-stack.min.js

dist/app-async-init.min.js: src/app-async-init.js
	@uglifyjs2 src/app-async-init.js -m -o dist/app-async-init.min.js

dist/app-callback-stack.min.js: src/app-callback-stack.js
	@uglifyjs2 src/app-callback-stack.js -m -o dist/app-callback-stack.min.js

