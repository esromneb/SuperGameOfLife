.PHONY: all build watch dev start test pretest lint jestc

build:
	npm run build

dev:
	npm run dev

test: jestc
	npm run test


pretest:
	npm run pretest

# jest clear cache
jestc:
	npm run jestc

# jest watch tests
jestw:
	npm run jestw

clean:
	rm -rf build

prod:
	npm run prod