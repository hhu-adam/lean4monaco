# Development notes

You can use `npm outdated` to see which npm packages are outdated.

To update the Infoview & Lean4 extension you should

* update the npm packages `@leanprover/infoview`, `@leanprover/infoview-api`, `@leanprover/unicode-input` to their newest version
* go to the git submodule `./src/vscode-lean4` and update the branch. (currently the fork is on a branch `monaco` and this has to be rebased to the upstream's `master` branch. Once all open PRs are addressed, this setup could change to directly load `vscode-lean4` as an `npm` package.)

To test the setup you should use

```
npm install
npm run build
npm test
(cd demo/ && npm run build)
```

# Versioning

Use `npm version patch` to release a new version and `npm publish` to upload it to npmjs.com