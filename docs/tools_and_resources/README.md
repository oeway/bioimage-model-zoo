# Tools and Resources
In this part of the documentation different tools and resources and its documentation can be found.

* **[DL4MicEverywhere](tools_and_resources/dl4miceverywhere.md)**: DL4MicEverywhere is a platform that offers researchers an easy-to-use gateway to cutting-edge deep learning techniques for bioimage analysis. It features interactive Jupyter notebooks with user-friendly graphical interfaces that require no coding skills. The platform utilizes Docker containers to ensure portability and reproducibility, guaranteeing smooth operation across various computing environments.
* **[BioImage.IO Chatbot](tools_and_resources/bioimageiochatbot.md)**: The BioImage.IO Chatbot is a versatile conversational agent designed to assist users in accessing information related to bioimage analysis. It leverages the power of Large Language Models (LLMs) and integrates user-specific data to provide contextually accurate and personalized responses. Whether you're a researcher, developer, or scientist, the chatbot is here to make your bioimage analysis journey smoother and more informative.
* **[Python BioImage.IO Core Package](tools_and_resources/bioimageio-core-package.md)**: Learn how to leverage the Python BioImage.IO Core Package, an essential toolkit for integrating and using bioimaging models and datasets in Python environments.
* **[Java Deep Learning Library](tools_and_resources/jdll.md)**: Explore the capabilities of the Java Deep Learning Library (JDLL), a comprehensive Java-based library designed for building and deploying deep learning models in bioimaging.
* **[BioEngine](tools_and_resources/bioengine.md)**: Initially designed to support the BioImage Model Zoo (https://bioimage.io) for effortless model testing, BioEngine empowers both experts and newcomers in the field of bioimage analysis. This cloud-based infrastructure brings AI to the next level by offering a user-friendly, plug-and-play cloud solution that not only simplifies model testing but also pioneers next-generation bioimage analysis capabilities.

## DL4MicEverywhere
TBD

## BioImage.IO Chatbot
TBD

## Python BioImage.IO Core Package
TBD

## Java Deep Learning Library
TBD

## BioEngine
### Building BioEngine Apps
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

### Make a standalone web app compatible with ImJoy/BioEngine

Making an ImJoy plugin is not the only way to support the BioEngine, if you have already a web application or website, you can easily load a `imjoy-rpc` js file to your website and expose api for ImJoy/BioEngine.

See [here](https://github.com/imjoy-team/ImJoy-core#use-your-web-application-inside-imjoy) for more details.

For example, [Kaibu](https://kaibu.org) is a standlone web app that compatible with the BioEngine. Because it [loads the imjoy-rpc library](https://github.com/imjoy-team/kaibu/blob/efd355eff95da9aa0f7eb97103585b753063c05d/public/index.html#L45) and [exposed api functions for ImJoy](https://github.com/imjoy-team/kaibu/blob/master/src/imjoyAPI.js).

### How to submit BioEngine Apps to the website?
If you are one of our [community partners](https://github.com/bioimage-io/bioimage.io/blob/master/docs/join-partners.md), you can add the app url to your model repository. Otherwise, please submit your BioEngine Apps to BioImage.IO by posting the url [here](https://github.com/bioimage-io/bioimage-io-models/issues/26).


## BioImage.IO Colab
[BioImageIO Colab](https://github.com/bioimage-io/bioimageio-colab) is a working-in-progress project that supports collaborative data annotation in the browser using the BioEngine and [Kaibu](https://kaibu.org). It allows the safe dissemination of images embedded in an image annotation tool (Kaibu) and stores the corresponding annotations in a source directory. This functionality is enabled by the connection to the BioEngine server. Users can test demos for crowd-sourced annotation and model fine-tuning using pre-configured Jupyter notebooks in Google Colab. BioImageIO Colab is based on two main components: Kaibu, a web-browser annotation tool, and the BioEngine server, facilitating a seamless and interactive collaborative annotation experience.

