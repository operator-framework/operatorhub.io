# OperatorHub.IO

## Welcome to OperatorHub

Operators deliver the automation advantages of cloud services like provisioning, scaling, and backup/restore while being
able to run anywhere that Kubernetes can run.

### Build
In order to build and run the web application in the same way as it does in production follow the next steps.

##### Build Frontend

```
$pushd frontend
npm install
npm run build
popd
```

##### Build Backend
```
$pushd backend
npm install
npm run build
```

### Running local server
In server directory
```
$npm run server
```

Other way to do this is to use Docker image in the repo root folder
```
$docker build -t operatorhub .
`docker run operatorhub
```


### Contributing

##### Running in Development Mode
This is prefered way when working on front end code. You do not have to care about backend data and front end web server is running in watch mode - it updates when any of the source files is modified and saved.


###### Running the local UI in dev mode

```
$cd frontend
npm install
npm start
http://0.0.0.0:9060/
```


##### Contributing Code

Adhering to the following process is the best way to get your work included in the project:

1.  [Fork](https://help.github.com/fork-a-repo/) the project, clone your fork, and configure the remotes:

```bash
# Clone your fork of the repo into the current directory
git clone https://github.com/<your-username>/operatorhub.io.git
# Navigate to the newly cloned directory
cd operatorhub.io
# Assign the original repo to a remote called "upstream"
git remote add upstream https://github.com/operator-framework/operatorhub.io.git
```

2.  Create a branch:

```text
$ git checkout -b my-branch -t upstream/master
```

3. Make your changes and commit to your local branch

Verify there are no lint errors
```text
$ yarn lint
```

Add and Commit your files
```text
$ git add <files to be committed>
$ git commit
```

4.  Rebase

Use `git rebase` (not `git merge`) to sync your work from time to time. Ensure all commits related to a single
issue have been [squashed](https://github.com/ginatrapani/todo.txt-android/wiki/Squash-All-Commits-Related-to-a-Single-Issue-into-a-Single-Commit).

```text
$ git fetch upstream
$ git rebase upstream/master
```

5.  Push

```text
$ git push origin my-branch
```

6.  Create a Pull Request

[Open a pull request](https://help.github.com/articles/using-pull-requests/) with a clear title and description against
the `dev` branch.

The `dev` branch is used to validate in pre-production mode before moving to the final production servers. Once the
changes are validated on the pre-production servers, the maintainers will merge your changes to `master` and onto the
production servers.

### License

Licensed under the [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0.html).
