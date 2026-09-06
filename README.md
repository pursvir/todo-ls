# todo-ls

Todo LS is a language server for [todo.txt](http://todotxt.org/) files.

> [!WARNING]
>
> This project is WIP and is not ready for production usage yet!

# Features

Implemented LSP features is listed below:

| Feature                                                   | Status           |
| :-----:                                                   | :-----:          |
| Hover (tag type annotations)                              | ✅               |          
| Completions                                               | ✅               |
| Diagnostics (read more in [here](...))                    | ✅               |
| Configuration (read more in [configuration](...) section) | ✅               |
| Code actions                                              | ✅               |
| Formatting                                                | in the future    |
| "Linting"                                                 | in the future    |
| Document highlighting                                     | not planned yet  |
| Semantic tokens                                           | not planned yet  |
| Go to definitions                                         | not planned yet  |

Besides, it _will ship_ with a highly-configurable [plugin system].

## Diagnostics

Todo-ls includes those analysis scenarios:
- checking if the task dates are possible ones (not, for example, 31st February) 
- checking if the task's creation date is not in the future (relative to the day the server is running)
- checking if the task's completion date is present
- checking if the task's completion date is not older than its creation one
- checking if the task has duplicate tags (projects, contexts, key-values with the same key) 
- checking if the task has at least one description word (non-metadata token)

All of those are configurable. You can turn them on or off and change their diagnostic severity. 

## Code actions

Todo-ls ships with following codeActions:
- sort tasks under selected text

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

Here is the list of supported text editors:

| LSP client | Status     |
| :--------: | :--------: |
| Zed        | ✅         |
| Neovim     | Not tested |
| VSCode     | Not tested |

Others should work too, but implementing LSP client extensions for them is not the scope of this project.

# Performance

While being written in TypeScript, this program will not bring you the same level of speed as with compiled languages like Go or Rust, but performance should be decent for most scenarios.
This program is not guaranteed to run smoothly on huge todo.txt files with 10,000+ rows.

Also, currently, almost no optimization tweaks were implemented. For example, todo-ls currently lacks delta updates and multi-threaded project scanning with several workers.
Those will be implemented in the future, but current its development is focued on funtionality and features.

Speaking of memory consumption, todo-ls usually eats ~90-100 Mb of RAM when it serves a project with several todo files, each having ~500 tasks.
