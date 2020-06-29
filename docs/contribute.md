# Contribute to BioImage.IO

You are welcome to submit your **models**, **datasest**, **applicaitons** and Jupyter **notebooks** to BioImage.IO.

To add an resource item to BioImage.IO, you need to provide a set of basic information about the resouce, including name, description, authors etc. and we will generate a resource card to display in the website.

Practically, you will need to provide a `[Resource Description File](./resource-description-file.md)` stored on a public website such as Github/Gist/Gitlab, and submit the link to BioImage.IO via [Pull Requests](https://github.com/bioimage-io/bioimage-io-models/pulls).

## How to contribute new models?

BioImage.io is a static website, it reads a manifest file from this Github repo (`manifest.model.json`) and render the page in the browser. Therefore, contributing models to the repository is as easy as adding links of your models to the manifest file.

Please follow the following steps:

 1. Fork this repo
 1. Add your models to the `src/manifest.bioimage.io.yaml` file
 1. Run `python src/compile_model_manifest.py` to generate a new `manifest.model.json` with your models
 1. Commit your changes and push to your Github repo.
 1. You can preview it constructing an URL which makes BioImage.io render the page with the manifest file in your repo. The URL format is: `https://bioimage.io/#/?repo=YOUR_GITHUB_USER_NAME/YOUR_GITHUB_REPO`, for example: https://bioimage.io/#/?repo=oeway/models will point to the model manifest hosted on https://github.com/oeway/models. You can also add commit hash tag, branch name or tag after that, for example: https://bioimage.io/#/?repo=oeway/models/06a9ffac88.
 1. If you are satisfied with the result above, you can send us a [Pull Request](https://github.com/bioimage-io/bioimage-io-models/pulls), and we will review it before it get merged.

 Note: once your PR get merged to the repo, the CI script will automatically compile the `manifest.bioimage.io.yaml` file, again, so please don't edit the genearted `manifest.model.json` file manually.

## How to build BioEngine Apps?
 
Each model in the BioImage model zoo can associated with a list of applications which you can run directly by the end user. We use BioEngine, a tailored version of [ImJoy](https://imjoy.io) to run these applications. Therefore, you can basically run ImJoy plugins with the BioEngine specific api. By default it loads also a [Jupyter Engine](https://github.com/imjoy-team/jupyter-engine-manager) which uses free computational resources on MyBinder.org, so you can also run small models in Python. 

Since BioEngine is designed for running model specific ImJoy plugins, it needs to define either `runOneModel()` and/or `runManyModels()` function in the plugin api. Plus, you need also a `testModel` function which will be used to run tests in a CI environment. For example, the following python plugin would treat as a qualified BioEngine App:

```python
from imjoy import api

class ImJoyPlugin():
    def setup(self):
        pass

    def run(self, ctx):
        pass

    def runOneModel(self, model_info):
        # run the model
        pass

    def runManyModels(self, model_info_list):
        # filter the model list and run them
        pass
    
    def testModel(self):
        # run tests for the model
        pass

api.export(ImJoyPlugin())
```

Note, this means your plugin would contain 4~5 functions including `setup` and `run` which is required for ImJoy.

You don't need to return any value after execution. In case of error, you can just throw or raise the error.

You can do the debugging inside [ImJoy](https://imjoy.io), for more information, please consult https://imjoy.io/docs.

To test with the BioEngine, you can go to https://bioimage.io, on the menu located in the top-right corner, you can load a local ImJoy plugin file to run it with the BioEngine. One additional feature is that the BioEngine will keep track of the local file, if you made new changes with your code editor (e.g. vim, vscode) the engine will try to reload the plugin file. 

## How to submit BioEngine Apps to the website?

You can submit your BioEngine App by changing the same file named `src/manifest.bioimage.io.yaml` as for contributing models.

Here are the steps:
 1. Once the BioEngine App is ready, you can then push it to your Github repo and get a `raw` URL for the file.
 1. Define a key in the `applications` section in `src/manifest.bioimage.io.yaml`, and set the value as the `raw` URL to the BioEngine app file.
 1. For all the models which your app can digest, you can add your app key to the `applications` field of the model.
 1. The procedure later are the same as contributing models, you can basically: run `python src/compile_model_manifest.py` to generate a new `manifest.model.json`, commit and push to your Github repo, preview it on BioImage.io with `https://bioimage.io/#/?repo=YOUR_GITHUB_USER_NAME/YOUR_GITHUB_REPO` and optionally send us a Pull Request.
