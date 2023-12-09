DOCKERHUB_REPO ?= codecov
IMAGE_NAME ?= codecov-javascript-bundler-plugins-test-api
DOCKER_PATH ?= integration-tests/test-api/Dockerfile
sha := $(shell git rev-parse --short=7 HEAD)
dockerhub_image := ${DOCKERHUB_REPO}/${IMAGE_NAME}
export DOCKER_BUILDKIT := 1

build.${IMAGE_NAME}:
	docker build -f ${DOCKER_PATH} . -t ${dockerhub_image}:latest \
	-t ${dockerhub_image}:${sha} \
	--label "org.label-schema.build-date"="$(build_date)" \
	--label "org.label-schema.name"="${IMAGE_NAME}" \
	--label "org.label-schema.vendor"="Codecov" \
	--label "org.label-schema.version"="${sha}"

tag.${IMAGE_NAME}:
	docker tag ${dockerhub_image}:${sha} ${dockerhub_image}:latest

push.${IMAGE_NAME}:
	docker push ${dockerhub_image}:latest

save.${IMAGE_NAME}:
	docker save -o ${IMAGE_NAME}.tar ${dockerhub_image}:${sha}