# User Guide
This guide is intended for users wanting to consume or use models from the BioImage Model Zoo. There are plenty of models in the BioImage Model Zoo that you can use in your own software, in the software of our community partners or you can even download them and use them in a notebook or code of your own.

## Downloading and using Models from the BioImage Model Zoo

See a [video](https://oc.embl.de/index.php/s/eJOIdzDVJpToETd) about using a model from the BioImage Model Zoo in different software.

<img src="./guides/download_model_packager.jpg" alt="bioimage.io download" width="60%"/>


## Using BioImage Model Zoo models in different software

### BiaPy
**Note: BiaPy empowers users to train custom models or fine-tune existing ones for bioimaging tasks and upload them to the BioImage Model Zoo. BiaPy supports models exported with PyTorch.**

BiaPy adapts to users of all expertise levels, offering multiple ways to run and interact with models:
- Graphical User Interface (GUI): Ideal for beginners.
- No-Coding Jupyter Notebooks: Simplified workflows for those without programming knowledge.
- Docker Containers: Ensure reproducibility and isolation.
- Command Line Interface (CLI): Perfect for advanced users.

How you interact with BioImage Model Zoo models also depends on your chosen method. Get started with the resources below:
- [BiaPy Landing Page](https://biapyx.github.io/): Your gateway to all things BiaPy.
- [BiaPy Documentation](https://biapy.readthedocs.io/en/latest/index.html): In-depth guides and tutorials.
- [BioImage Model Zoo in BiaPy](https://biapy.readthedocs.io/en/latest/get_started/bmz.html): Learn how to work with models from the BioImage Model Zoo.

### DeepImageJ

**Note: deepImageJ supports PyTorch and Tensorflow 1 models**

1. Install the [deepImageJ plugin](https://deepimagej.github.io/download.html) in ImageJ.
This will give you all the necessary Plugins to run bioimage.io models at the moment.

2. Install a model from the [BioImage Model Zoo](https://bioimage.io/):
      1) Download a deepImageJ model from the BioImage Model Zoo repository.
      2) Use `DeepImageJ Install Model` in ImageJ to install the `.zip` file that you just downloaded: choose the `Private model` option and `From ZIP file`.
      3) In the `zip` file you just downloaded, there is an `exampleImage.tif`that you can open in ImageJ and process with the model you just downloaded.
      4) See a detailed tutorial [here](https://deepimagej.github.io/tutorials.html).      

For more detailed information about the connection between the BioImage Model Zoo and deepImageJ, see deepImageJ wiki [here](https://github.com/deepimagej/deepimagej-plugin/wiki/BioImage-Model-Zoo-Connection).

### Fiji
**Note: Fiji only supports Tensorflow 1 models at the moment!**

1. Install the [CSBDeep-Plugin](https://github.com/CSBDeep/CSBDeep_website/wiki/CSBDeep-in-Fiji-%E2%80%93-Installation) in Fiji.
This will give you all the necessary Plugins to run bioimage.io models at the moment.
2. Open the image you want to run the model on
3. a) If your model is a [CSBDeep](https://imagej.net/CSBDeep) one, go to Plugins > CSBDeep and choose either "N2V", "DenoiSeg" or "Run your network"(default)
   
   b) For any other bioimage.io model, go to Plugins > bioimage.io > bioimage.io prediction. 
4.  Continuing from 3b) you will arrive at this window:

<img src="./guides/fiji_bioimage_predict.jpg" alt="Fiji bioimage.io prediction" width="60%"/>

The configuration fields should be self-explanatory.

5. Click "OK" to run the model prediction.


### Ilastik
TBD

###  ImJoy
[ImJoy](https://imjoy.io) is a flexible platform for running computational workflows in the browser or using Python. While it doesn’t directly reference the BioImage Model Zoo (BMZ), it supports seamless integration of BMZ models via plugins and Python.

1. Install ImJoy and the Plugin Engine
      - Use the [ImJoy Web App](https://imjoy.io) for browser-based workflows.
      - For advanced Python-based workflows, install the **Plugin Engine**:  
            ```bash
            pip install imjoy
            imjoy --start
            ```
2. Download and Set Up a BMZ Model
      - Visit the [BioImage Model Zoo](https://bioimage.io/) and download a model with its rdf.yaml file.
      - Optionally, use `bioimageio.core` to interact with BMZ models:
            ```bash
            pip install bioimageio.core
            ```
3. Run the Model in ImJoy
      - **Browser-based Plugins**: Install and run plugins compatible with your model. Learn more in the [Quick Start Guide](https://imjoy.io/docs/#/quick-start).
      - **Python-based Execution**: Connect ImJoy to the Plugin Engine and run BMZ models in Python. Example:
      ```python
      import bioimageio.core
      rdf = bioimageio.core.resource_io.load_resource_description("/path/to/rdf.yaml")
      model = bioimageio.core.create_model(rdf)
      result = model.predict(input_data)
      print(result)
      ```
4. Learn More
      - **[ImJoy Documentation](https://imjoy.io/docs/)**: Explore the full capabilities of ImJoy.
      - **[BioImage Model Zoo Documentation](https://bioimage.io/docs/)**: Discover more about BMZ models.
      - **[bioimageio.core Library](https://github.com/bioimage-io/core-bioimage-io-python)**: Dive into the Python library for BMZ models.


### ZeroCostDL4Mic
**Note: [ZeroCostDL4Mic](https://github.com/HenriquesLab/ZeroCostDL4Mic/wiki) allows you trainig models and upload them to the BioImage Model Zoo or fine-tune existing ones!**

1. Download a ZeroCostDL4Mic model from the [BioImage Model Zoo](https://bioimage.io/) repository. 
2. Unzip the model `.zip` file so you can use it later in the notebook.
3. Open the ZeroCostDL4Mic notebook that corresponds to the model you downloaded. 
4. When required, specify the path to the unziped folder containing the model.

### DL4MicEverywhere
[DL4MicEverywhere](https://github.com/HenriquesLab/DL4MicEverywhere) is a user-friendly platform that offers long-term reproducible and cross-compatible deep learning workflows using Docker containers and user-friendly interactive notebooks. It supports easy containerization and integration of reproducible deep learning techniques following the Zoo's standards, and validation of functional containerization across operating systems.

1. **[Installation instructions](https://github.com/HenriquesLab/DL4MicEverywhere/blob/main/docs/USER_GUIDE.md)**

2. **[Quick start for containerised notebooks](https://github.com/HenriquesLab/DL4MicEverywhere/tree/main?tab=readme-ov-file#quickstart-macoslinuxwindows)**

3. **[Containerizing your workflow and integrating it within the Zoo's collection](https://github.com/HenriquesLab/DL4MicEverywhere/blob/main/CONTRIBUTING.md)**

4. **[Full DL4MicEverywhere documentation](https://github.com/HenriquesLab/DL4MicEverywhere)**

## Best Practices for Model Usage
TBD

## Use Cases
- [Use-case 1: Stardist H&E nucleus segmentation](https://github.com/bioimage-io/use-cases/tree/main/case1-stardist)
- [Use-case 2: 3D U-Net for cell-segmentation in light microscopy](https://github.com/bioimage-io/use-cases/tree/main/case2-finetuning)
- [Use-case 3: Classification, imjoy & python library usage](https://github.com/bioimage-io/use-cases/tree/main/case3-devtools)
- [Use-case 4: Domain adaptation for mitochondria segmentation in EM](https://github.com/bioimage-io/use-cases/tree/main/case4-research)
