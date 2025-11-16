todo-ls is a language server for [todo.txt](http://todotxt.org/) files.

> [!WARNING]
>
> todo-ls is in active development and is not ready for production use yet!
> Expect bugs.

Features:
- [X] type annotations for all metadata defined by the standard
- [X] autocompletions for metadata
- [ ] optional dates validation
- [ ] CLI for oneshot checks
- [ ] defining your own rules for your todo.txt files structure in config file
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

Install (development):

```sh
sed -i '1i #!/usr/bin/env node' dist/index.js
chmod +x dist/index.js
sudo ln -sf $(pwd)/dist/index.js /usr/local/bin/todo-ls # or any directory in PATH you prefer
```

After installation, your IDE has to call `todo-ls --stdio` proccess internally.
