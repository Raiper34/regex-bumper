[![npm version](https://badge.fury.io/js/regex-bumper.svg)](https://badge.fury.io/js/regex-bumper)
![npm bundle size](https://img.shields.io/bundlephobia/min/regex-bumper)
![NPM](https://img.shields.io/npm/l/regex-bumper)
[![GitHub Workflow Status](https://github.com/raiper34/regex-bumper/actions/workflows/test.yml/badge.svg)](https://github.com/Raiper34/regex-bumper)
[![npm](https://img.shields.io/npm/dt/regex-bumper)](https://badge.fury.io/js/regex-bumper)
[![npm](https://img.shields.io/npm/dm/regex-bumper)](https://badge.fury.io/js/regex-bumper)
[![npm](https://img.shields.io/npm/dw/regex-bumper)](https://badge.fury.io/js/regex-bumper)
[![GitHub Repo stars](https://img.shields.io/github/stars/raiper34/regex-bumper)](https://github.com/Raiper34/regex-bumper)

# Regex bumper

Cli tool to bump numbers in files based on regexes. 

### Content
- [🚀 Installation](#-installation)
- [💻 Usage](#-usage)
  - [Path variables](#path-variables)
- [⚖️ License](#-license)

# 🚀 Installation
Install **Regex bumper** with `npm`
```sh
npm install -g regex-bumper
```

# 💻 Usage
First `.rbumprc.json` need to be created where `regex-bumper` will be executing or a path to this file should be specified by `--config` parameter.
`.rbumprc.json` contains paths to files in which the number will be increased and regexes according to which the numbers will be found and subsequently increased.
It is possibly also using flags for regex in `flags` property of file configuration (for example global flag).
Files property can contain multiple file definitions.
The number captured in a capture group of regex will be increased using this CLI.
```json
{
  "files": [
    {
      "path": "./file.json",
      "regex": "\"num\": \"(\\d+)\"",
      "flags": "g"
    }
  ]
}
```
The tool can be executed by running when numbers should be bumped by 1 like:
```sh
regex-bumper
```
or when numbers should be bumped to a specific number like:
```sh
regex-bumper --value 100
```
It is also possible to define a path to `.rbumprc.json` like:
```sh
regex-bumper --config ./path/.rbumprc.json
```

## Path variables
Path variables are variable path fragments that can be unique for specific environments.
For example, one developer can have some files stored in a specific directory, while the second developer has files stored in another directory.
In this situation path variables come handy. 
```json
{
  "files": [
    {
      "path": "{HOME}/package.json",
      "regex": "\"version\"=\"(\\d+)\""
    }
  ]
}
```
In this example, the developer is first prompted to create `{HOME}` path variable when executing `regex-bumper` for first time.
These variables are stored for future use by default in `.varpath` in location where `regex-bumper` is executed.
It is also possible to define a custom `.varpath` file location or name in `.rbumprc.json` config.
The path is relative to where `regex-bumper` is executed. 
```json
{
  "varPathFile": "./.varpath.txt",
  "files": [
    {
      "path": "{HOME}/package.json",
      "regex": "\"version\"=\"(\\d+)\""
    }
  ]
}
```


# ⚖️ License
[MIT](https://choosealicense.com/licenses/mit/)

