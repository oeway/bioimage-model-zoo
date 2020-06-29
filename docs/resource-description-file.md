# Resource Description File

In BioImage.IO, we use a simple [YAML](https://en.wikipedia.org/wiki/YAML) based file to store resources such as models, datasets, applications and notebooks.

## Format version: 0.2.0
## Basic fields

The common fields for all the resource description files are:

| Field | Required | Definition  |
|---|---|---|
| id | required | unique identifier for the resource |
| type | required | type of the resource |
| name  | required | name of the resource  |
| description | required | short description for the resource |
| source | required | url to the source of the resource |
| cite | optional | how to cite the resource |
| authors | optional | the full list of author names  |
| icon | optional | an icon for the resource  |
| license | optional | the license name for the resource  |
| version | optional | the version number for the resource  |
| format_version | optional | the format version |
| covers | optional | a list of url to the cover images (aspect ratio width/height=2/1)  |
| doc | optional | url to the documentation in markdown format  |
| tags | optional | a list of tags  |
| git_repo | optional | url to the git repo  |
| badges | optional | a list of badges|
| links | optional | a list of linked resources|
| attachments | optional | a group of attachments  |

