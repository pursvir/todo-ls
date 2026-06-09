Todo LS is a language server for [todo.txt](http://todotxt.org/) files.

> [!WARNING]
>
> This project is WIP and is not ready for production usage yet!

Features / goals:
- [X] type annotations for all metadata defined by the standard
- [~] autocompletions for metadata
- [ ] date validation
- [ ] optional checks for tasks with `due:` date key-value tags
- [ ] optional task duplication checks
- [ ] optional tag duplication checks inside tasks
- [ ] custom rules
    - [ ] task format validation (e.g. contexts whitelists, key:value requirements for tasks containing certain metadata, etc..)
    - [ ] writing your own one via simple, but powerful API
- [ ] CLI for oneshot checks

# Installation

From the project root:

```sh
npm i -g
```

After installation, your IDE has to call `todo-ls --stdio` proccess internally.

# Development

Format:

```sh
npm run format
```

Lint:

```sh
npm run lint
```

# Configuration

For configuration, place `.todols.conf` file into your TODO_DIR. todo-ls will automatically recognize it and change behaviour.
Default one comes in this repository under `.todols.conf.template` name.

# Text editors support

Currently supported text editors/IDEs are:
- Zed

Others should work too, but implementing LSP client extensions for them is not the scope of this project.

# Performance

While being written in TypeScript, this program will not bring you the same level of speed as with compiled languages like Go or Rust, performance should be decent for typical scenarios.
This program is not guaranteed to run smoothly on huge todo.txt files with 10,000+ rows.

Also, currently, almost no optimization tweaks were implemented. For example, todo-ls currently lacks delta updates and multi-threaded project scanning with several workers.
Those will be implemented in the future, but current its development is focued on funtionality and features.
