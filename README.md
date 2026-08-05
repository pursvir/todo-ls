# todo-ls

Todo LS is a language server for [todo.txt](http://todotxt.org/) files.

> [!WARNING]
>
> This project is WIP and is not ready for production usage yet!

# Features

Features / goals:

| Feature                                                   | Status         |
| :-----:                                                   | :-----:        |
| Hover (tag type annotations)                              | ✅             |          
| Completions                                               | ✅             |
| Diagnostics (read more in [here](...))                    | ✅             |
| Configuration (read more in [configuration](...) section) | ✅             |
| Formatting                                                | in the future  |
| Code actions                                              | in the future  |
| "Linting"                                                 | in the future  |
| Plugin system                                             | in the future  | 
| Semantic tokens                                           | ?              |
| Go to definitions                                         | 🚫             |

## Diagnostics

Todo-ls includes those analysis scenarios:
- 

## Plugin system

In development...

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

Test:

```sh
npm run test
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
