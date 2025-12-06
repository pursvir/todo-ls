todo-ls is a language server for [todo.txt](http://todotxt.org/) files.

> [!WARNING]
>
> todo-ls is WIP and is not ready for production use yet.

Features / goals:
- [X] type annotations for all metadata defined by the standard
- [~] autocompletions for metadata
- [ ] plugin system
    - [ ] date validation
    - [ ] task format validation (e.g. contexts whitelists, key:value requirements for tasks containing certain metadata, etc..)
    - [ ] checks for tasks with due: dates kvs
    - [ ] writing your own one via simple, but powerful API
- [ ] CLI for oneshot checks
- [ ] cross-platform
    - [~] desktop OSes
    - [ ] web-browser
- [ ] i18n (probably)

# Building

Install build dependencies:

```sh
npm i -g typescript
npm i
```

Build:

```sh
npm run build
```

Run unit tests:

```sh
npm run test
```

Install (development):

```sh
sed -i '1i #!/usr/bin/env node' dist/index.js
chmod +x dist/index.js
sudo ln -sf $(pwd)/dist/index.js /usr/local/bin/todo-ls # or any directory in PATH you prefer
```

After installation, your IDE has to call `todo-ls --stdio` proccess internally.
