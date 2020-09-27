# Publish Gh Pages
To publish github pages, get to the version you want to publish.

Run
```bash
nvm use 14
make clean prod
git symbolic-ref HEAD refs/heads/gh-pages
git reset
rm .gitignore
git pull
git add build
```

Commit from here


To get back to master:

```bash
git symbolic-ref HEAD refs/heads/master
git reset
git checkout .gitignore
```



# Issues with git pull
If git pull is not working reset hard, pull, and go back to master and build and start over again
