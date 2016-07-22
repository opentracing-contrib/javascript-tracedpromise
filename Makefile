# http://stackoverflow.com/questions/3774568/makefile-issue-smart-way-to-scan-directory-tree-for-c-files
recursive_wildcard = $(wildcard $1$2) $(foreach d,$(wildcard $1*),$(call recursive_wildcard,$d/,$2))

CMD_BABEL = node node_modules/babel-cli/bin/babel.js
CMD_ESLINT = node node_modules/eslint/bin/eslint.js
SOURCES_JS = $(call recursive_wildcard,src/,*.js)
COMPILED_JS = $(SOURCES_JS:src/%.js=lib/%.js)

.PHONY: demo
demo: build
	node lib/examples/demo.js

#
# build the ES6 JavaScript files and generate source maps
#
.PHONY: build
build: node_modules $(COMPILED_JS)
lib/%.js: src/%.js
	mkdir -p $(@D)
	$(CMD_BABEL) --presets es2015 $< -o $@ --source-maps

node_modules:
	npm install

.PHONY: clean
clean:
	rm -rf node_modules/
	rm -rf lib/
	mkdir lib

.PHONY: lint
lint:
	$(CMD_ESLINT) --color --fix -c .eslintrc src

.PHONY: publish
publish: build lint
	@if [ $(shell git symbolic-ref --short -q HEAD) = "master" ]; then exit 0; else \
	echo "Current git branch does not appear to be 'master'. Refusing to publish."; exit 1; \
	fi
	npm version patch
	make build # rebuild with the new version number
	git push
	git push --tags
	npm whoami
	npm publish --access=public
