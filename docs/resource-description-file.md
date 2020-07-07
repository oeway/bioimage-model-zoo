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
| attachments | optional | a group of attachments, list of resources grouped by keys  |
| authors | optional | the full list of author names  |
| badges | optional | a list of badges|
| cite | optional | how to cite the resource |
| covers | optional | a list of url to the cover images (aspect ratio width/height=2/1)  |
| documentation | optional | url to the documentation in markdown format  |
| download_url | optional | url to the zipped file if applicable |
| git_repo | optional | url to the git repo  |
| icon | optional | an icon for the resource  |
| license | optional | the license name for the resource, e.g.: `MIT`  |
| links | optional | a list of linked resources, an id to other resources|
| tags | optional | a list of tags  |
| version | optional | the version number for the resource, starting from `0.1.0`  |

## Describing AI models
You need to first set the `type` filed to `model`.

A basic integration would be simply provide a `download_url` to a zip file (for example, with the model weights, source code or executable binary file) hosted on Github releases, Dropbox, Google Drive etc. For example: 
```yaml
download_url: https://zenodo.org/record/3446812/files/unet2d_weights.torch?download=1
```

If a model has multiple versions or associated with different weights, please use the `attachments` field, for example:
```yaml
attachments:
  models:
    - https://zenodo.org/record/xxxxxxx/model_version_1
    - https://zenodo.org/record/xxxxxxx/model_version_2
```

```yaml
attachments:
  weights:
    - https://zenodo.org/record/xxxxxxx/weight_version_1
    - https://zenodo.org/record/xxxxxxx/weight_version_2
```

If you would like to also support interoperability and reproducibility, we have been working on an extended version of RDF for models, please see [here](https://github.com/bioimage-io/configuration/).

## Describing applications
You need to first set the `type` filed to `application`.

For regular software package with a downloadable file, you can set `download_url` to the downloadable file, for example, you can upload the executable files as Github release, deposit it on Zenodo, or even generate a sharable url from Dropbox/Google Drive.

For web application, set `source` to the url of the web application. Users can then click and redirect to your web application. However, simple integration will not support features such as opening dataset or models with your application.

It is recommended to build BioEngine Apps such that users can directly try and use them in BioImage.IO. See [here](https://github.com/bioimage-io/bioimage.io/blob/master/docs/build-bioengine-apps.md) for more details.

## Describing datasets, notebooks and other types
Similarily, for datasets (type=`dataset`), notebooks (type=`notebook`) and other potential resources, you can use set `source` and/or `download_url` to point to the resource, or use `attachments` to specify a list of associated files.

## Link between resource items

You can use `links` which is a list of `id` to other resource items, for example, if you want to associate an applicaiton with a model, you can set the links field of the models like the following:
```yaml
application:
  - id: HPA-Classification
    source: https://raw.githubusercontent.com/bioimage-io/tfjs-bioimage-io/master/apps/HPA-Classification.imjoy.html

model:
  - id: HPAShuffleNetV2
    source: https://raw.githubusercontent.com/bioimage-io/tfjs-bioimage-io/master/models/HPAShuffleNetV2/HPAShuffleNetV2.model.yaml
    links:
      - HPA-Classification
```

## Add custom badges
You can add custom badges to each item to support, e.g.: "Launch Binder", "Open in Colab", "Launch ImJoy" etc.

Here is an example:
```yaml
    badges:
      - label: Open in Colab
        icon: https://colab.research.google.com/assets/colab-badge.svg
        url: https://colab.research.google.com/github/HenriquesLab/ZeroCostDL4Mic/blob/master/Colab_notebooks/U-net_2D_ZeroCostDL4Mic.ipynb
```

## Hosting the file
It is recommended to host the resource description file on one of the public git repository website, including Github, Gitlab, Bitbucket, or Gist. A link can be submitted to BioImage.IO so we can keep track of the changes later.
