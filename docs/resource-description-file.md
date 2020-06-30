# Resource Description File

In BioImage.IO, we use a simple [YAML](https://en.wikipedia.org/wiki/YAML) based file to store resources such as models, datasets, applications and notebooks.

## Format version: 0.2.0

## Basic fields

The common fields for all the resource description files are:

| Field | Required | Definition  |
|---|---|---|
| id | required | unique identifier for the resource |
| type | required | type of the resource, e.g. `model`, `dataset`, `application` or `notebook` |
| name  | required | name of the resource, a human-friendly name  |
| description | required | short description for the resource |
| source | required | url to the source of the resource |
| version | required | the version number for the resource, starting from `0.1.0`  |
| cite | optional | how to cite the resource |
| authors | optional | the full list of author names  |
| icon | optional | an icon for the resource  |
| license | optional | the license name for the resource, e.g.: `MIT`  |
| covers | optional | a list of url to the cover images (aspect ratio width/height=2/1)  |
| doc | optional | url to the documentation in markdown format  |
| tags | optional | a list of tags  |
| git_repo | optional | url to the git repo  |
| badges | optional | a list of badges|
| links | optional | a list of linked resources, an id to other resources|
| attachments | optional | a group of attachments, list of resources grouped by keys  |

## Hosting the file
It is recommended to host the resource description file on one of the public git repository website, including Github, Gitlab, Bitbucket, or Gist. A link can be submitted to BioImage.IO so we can keep track of the changes later.