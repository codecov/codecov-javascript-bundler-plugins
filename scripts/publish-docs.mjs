import { execSync } from "child_process";

function buildDocs() {
  execSync("rm -rf ./typedoc/docs");
  execSync("pnpm run build");
  execSync("pnpm run generate:typedoc");
}

function publishDocs() {
  execSync(`rm -rf /tmp/js-docs | true
	mkdir /tmp/js-docs
	cp -r ./typedoc/docs /tmp/js-docs/docs
	cd /tmp/js-docs && \
	git clone --single-branch --branch gh-pages https://github.com/codecov/codecov-javascript-bundler-plugins.git && \
	cp -r /tmp/js-docs/docs/* /tmp/js-docs/codecov-javascript-bundler-plugins/ && \
	cd /tmp/js-docs/codecov-javascript-bundler-plugins && \
	git config commit.gpgsign true && \
	git config user.signingkey BA2D4C0DFE53C876 && \
	git config user.name "codecov-releaser" && \
	git config user.email "devops+releaser@codecov.io" && \
	git add --all && \
	git commit -m "meta: Update docs" && \
	git push origin gh-pages`);
}

function run() {
  buildDocs();
  publishDocs();
}

run();
