# Tools and Resources
In this part of the documentation different tools and resources related to the BioImage Model can be found with their documentation.

## Developer Resources
### Python BioImage.IO Core Package
`bioimageio.core` is a python package that implements prediction with bioimageio models including standardized pre- and postprocessing operations. These models are described by---and can be loaded with---the bioimageio.spec package.
In addition bioimageio.core provides functionality to convert model weight formats.

You can find the documentation about the bioimageio.core [here](https://bioimage-io.github.io/core-bioimage-io-python/bioimageio/core.html).
And the GitHub repository [here](https://github.com/bioimage-io/core-bioimage-io-python/).

### Java Deep Learning Library
The Java Deep Learning Library (JDLL) provides a Java library for running Deep Learning (DL) models agnostically, enabling communication between Java software and various DL frameworks (engines). It also allows the use of multiple DL frameworks in the same session, manages the different DL frameworks and brings the models from the Bioimage.io repository to Java.

Documentation can be foun [here](https://github.com/bioimage-io/JDLL).

### BioEngine
A resource that interacts with the BioImage Model Zoo intended for infraestructure developers. 
#### Building BioEngine Apps
We use BioEngine, a tailored version of [ImJoy](https://imjoy.io) to run models applications. Therefore, you can basically run ImJoy plugins with the BioEngine specific api. 

Depending on different types of application, for web application, please refer to [here](https://github.com/imjoy-team/imjoy-core#use-your-web-application-inside-imjoy) for integrating the `imjoy-rpc` with your web app. Once done you can simply set `source` in the [`Resource Description File`](/bioimageio_rdf_spec) to your web app url.


For Jupyter notebooks and other types, you will need to build a new ImJoy plugin.

By default it loads also a [Jupyter Engine](https://github.com/imjoy-team/jupyter-engine-manager) which uses free computational resources on MyBinder.org, so you can also run small models in Python. 

For example, this is a basic ImJoy plugin in Python, that works with the BioEngine:

```python
from imjoy import api

class ImJoyPlugin():
    def setup(self):
        pass

    def run(self, ctx):
        # when the app is triggered from a model/dataset/notebook etc.
        # you will receive the current item via `ctx.data`
        if ctx.config.mode == 'one':
            model = ctx.data
            assert model.type == 'model'
            api.alert("Running app from model: " + model['name'])

        # when the app is triggered from the app card it self
        # you will receive all the resource items via `ctx.data`
        elif ctx.config.mode == 'all':
            all_items = ctx.data
            # filter the models based on type
            models = filter(lambda it: it['type'] == 'model', all_items)
            api.alert("Number of models: " + str(len(models)))

api.export(ImJoyPlugin())
```

For other types of plugins (e.g. in Javascript), the same `ctx` object will be passed into the plugin.

You can do the debugging inside [ImJoy](https://imjoy.io), for more information, please consult https://imjoy.io/docs.

To test with the BioEngine, you can go to https://bioimage.io, on the menu located in the top-right corner, you can load a local ImJoy plugin file to run it with the BioEngine. One additional feature is that the BioEngine will keep track of the local file, if you made new changes with your code editor (e.g. vim, vscode) the engine will try to reload the plugin file. 

TIP: if your imjoy plugin is designed for not only work with bioimage.io but also other purposes, you can use an `if` statement to check `ctx.config.type == 'bioengine'`.

#### Make a standalone web app compatible with ImJoy/BioEngine

Making an ImJoy plugin is not the only way to support the BioEngine, if you have already a web application or website, you can easily load a `imjoy-rpc` js file to your website and expose api for ImJoy/BioEngine.

See [here](https://github.com/imjoy-team/ImJoy-core#use-your-web-application-inside-imjoy) for more details.

For example, [Kaibu](https://kaibu.org) is a standlone web app that compatible with the BioEngine. Because it [loads the imjoy-rpc library](https://github.com/imjoy-team/kaibu/blob/efd355eff95da9aa0f7eb97103585b753063c05d/public/index.html#L45) and [exposed api functions for ImJoy](https://github.com/imjoy-team/kaibu/blob/master/src/imjoyAPI.js).

#### How to submit BioEngine Apps to the website?
If you are one of our [community partners](https://github.com/bioimage-io/bioimage.io/blob/master/docs/join-partners.md), you can add the app url to your model repository. Otherwise, please submit your BioEngine Apps to BioImage.IO by posting the url [here](https://github.com/bioimage-io/bioimage-io-models/issues/26).

## User Resources

### DL4MicEverywhere
DL4MicEverywhere is a platform that lets users train and implement their models in different computational environments. These environments include Google Colab, personal computational resources such as a desktop or laptop, and HPC systems. This platform provides environments compatible with some BioImage Model Zoo models to be used in different scenarios. It extends ZeroCostDL4Mic capabilities by allowing the execution of notebooks either locally on personal devices like laptops or remotely on diverse computing platofmrs. 

The documentation can be found in [the GitHub Repository](https://github.com/HenriquesLab/DL4MicEverywhere).

### BioImage.IO Chatbot
The BioImage.IO Chatbot can be accessed [here](https://bioimage.io/chat/). The BioImage.IO Chatbot is a versatile conversational agent designed to assist users in accessing information related to computational bioimaging. It leverages the power of Large Language Models (LLMs) and integrates user-specific data to provide contextually accurate and personalized responses. Whether you're a researcher, developer, or scientist, the chatbot is here to make your bioimaging journey smoother and more informative.

The documentation can be found [here](https://github.com/bioimage-io/bioimageio-chatbot).

### BioImage.IO Colab
[BioImageIO Colab](https://github.com/bioimage-io/bioimageio-colab) is a working-in-progress project that supports collaborative data annotation in the browser using the BioEngine and [Kaibu](https://kaibu.org). It allows the safe dissemination of images embedded in an image annotation tool (Kaibu) and stores the corresponding annotations in a source directory. This functionality is enabled by the connection to the BioEngine server. Users can test demos for crowd-sourced annotation and model fine-tuning using pre-configured Jupyter notebooks in Google Colab. BioImageIO Colab is based on two main components: Kaibu, a web-browser annotation tool, and the BioEngine server, facilitating a seamless and interactive collaborative annotation experience.

