build:
	cactus build

GIT_WORKTREE := git --git-dir=.git/worktrees/.build --work-tree .build

.build/: .git/worktrees/.build

.git/worktrees/.build:
	git worktree add --no-checkout .build gh-pages

status: .git/worktrees/.build
	$(GIT_WORKTREE) add .
	$(GIT_WORKTREE) status

deploy: .git/worktrees/.build build
	$(GIT_WORKTREE) add .
	$(GIT_WORKTREE) commit . -m "Deploy $(shell git describe --tags --dirty --always)" -e -v
	$(GIT_WORKTREE) push origin gh-pages
