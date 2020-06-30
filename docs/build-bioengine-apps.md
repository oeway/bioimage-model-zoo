# Building BioEngine Apps

We use BioEngine, a tailored version of [ImJoy](https://imjoy.io) to run these applications. Therefore, you can basically run ImJoy plugins with the BioEngine specific api. By default it loads also a [Jupyter Engine](https://github.com/imjoy-team/jupyter-engine-manager) which uses free computational resources on MyBinder.org, so you can also run small models in Python. 

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

You can submit your BioEngine Apps posting the url [here](https://github.com/bioimage-io/bioimage-io-models/issues/26).
