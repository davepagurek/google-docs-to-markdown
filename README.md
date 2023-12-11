# Google Docs to Markdown

View live: https://davepagurek.github.io/google-docs-to-markdown/

## About this fork

This is a form of <a href="https://github.com/Mr0grog/google-docs-to-markdown">Mr0grog/google-docs-to-markdown</a>, but adjusted to fit the needs of p5.js documentation generation. Specifically:

- It makes sure lists do not have newlines between them so that they form "tight lists"
- It uses HTML syntax for tables so that it supports code and images within table cells
- It always uses three-backtick code fences for consistency


## About the original project

This is a very minimal webapp for converting a Google Doc to Markdown. It uses [Remark](https://github.com/remarkjs/remark) and [Rehype](https://github.com/rehypejs/rehype) (both part of [Unified](https://unifiedjs.github.io)) to do the conversion.

## Install & Build

First make sure you have Node.js installed. Then:

1. In the directory where you have cloned this repository, run `npm install`:

    ```sh
    > cd /path/to/cloned/repo
    > npm install
    ```

2. For a one-time build, run:

    ```sh
    > npm run build
    ```
    
    …and the built output will be in the `dist` folder.
    
    To start a server with live rebuilding, run:
    
    ```sh
    > npm start
    ```
    
    Then point your browser to `http://localhost:9000` to see the site. It will automatically rebuild whenever you change any files.


## Contributors

This project is open source, and gets better with the hard work and collaboration of multiple people. Thanks to the following for their contributions:

<!-- ALL-CONTRIBUTORS-LIST:START -->
| Contributions | Name |
| ----: | :---- |
| [💻](# "Code")  | [Michael Bianco](https://github.com/iloveitaly) |
| [🚧](# "Maintenance") [💻](# "Code") [🚇](# "Infrastructure") [⚠️](# "Tests") [📖](# "Documentation") [👀](# "Reviewer") | [Rob Brackett](https://github.com/Mr0grog) |
| [💻](# "Code") | [Tamás Halasi](https://github.com/trustedtomato) |
| [💻](# "Code") [⚠️](# "Tests") | [Jack Kingsman](https://github.com/jkingsman) |
| [💻](# "Code") | [Peter Law](https://github.com/PeterJCLaw) |
| [📖](# "Documentation") [🚇](# "Infrastructure") | [Marcin Rataj](https://github.com/lidel) |
| [💻](# "Code") | [Ben Sheldon](https://github.com/bensheldon) |
<!-- ALL-CONTRIBUTORS-LIST:END -->

(For a key to the contribution emoji or more info on this format, check out [“All Contributors.”](https://allcontributors.org/docs/en/emoji-key))


## License

GDoc2MD is open source software. It is (c) 2018-2022 Rob Brackett and licensed under the BSD license. The full license text is in the LICENSE file.
