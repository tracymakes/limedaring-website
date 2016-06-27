build:
	cactus build

deploy: .build
	rsync -avzh --delete .build/ hellowebapp@198.199.98.61:sites/limedaring.com/

clean:
	rm -rf .build/

.build: build
