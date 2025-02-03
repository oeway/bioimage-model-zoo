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


### Ilastik
*Compatible frameworks: PyTorch (via TikTorch)*

1. **Install the software and necessary plugins/extensions**:
   - Install ilastik from the [official website](https://www.ilastik.org/).
   - For remote execution, install the TikTorch backend following the instructions in the [TikTorch GitHub repository](https://github.com/ilastik/tiktorch#installation).

2. **Download and set up a model from the BioImage Model Zoo**:
   - Visit the [ilastik Model Zoo on BioImage.IO](https://bioimage.io/#/?partner=ilastik) to find compatible pre-trained models.
   - To load a model into ilastik:
     - Copy the model's DOI or nickname from the BioImage Model Zoo and paste it into the text field in ilastik’s Neural Network Classification workflow. Click the arrow button to download and initialize the model.
     - Alternatively, download the model as a `.zip` archive, then drag and drop it into the text field or use the file dialog to load it.

3. **Run the model**:
   - **Local Workflow**:
     - Start ilastik, create a new project with the "Neural Network Classification (local)" workflow, and load your data in the Data Selection applet.
     - Initialize the model and press the "Live Predict" button to generate predictions.
   - **Remote Workflow**:
     - Set up TikTorch on the remote machine and note the IP/hostname and port.
     - In ilastik, create a new project with the "Neural Network Classification (remote)" workflow, configure the server, and select the device (e.g., CPU or CUDA).
     - Load the data and proceed through the workflow as in the local variant.

4. **Export the results**:
   - Use the [Data Export applet](https://www.ilastik.org/documentation/basics/export) to save your predictions.
   - To try another model, unload the current model using the red cross below the text field, then clear the selected model and repeat the process.

5. **Learn more**:
   - [Ilastik Documentation](https://www.ilastik.org/documentation)
   - [TikTorch Repository](https://github.com/ilastik/tiktorch)
   - [BioImage Model Zoo](https://bioimage.io/#/?partner=ilastik)

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
3. Run BMZ Models in  ImJoy
      - BioImage.IO Plugin: Use the [BioImage.IO plugin](https://bioimage-io.github.io/bioengine-web-client/) for easy integration and execution of BMZ models directly in ImJoy.
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
      - **[BioImage.IO Plugin](https://bioimage-io.github.io/bioengine-web-client/)**: Plugin from ImJoy to the BioImage Model Zoo.
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

### CAREamics
*CAREamics is a producer of BioImage Model Zoo models.*

1. **Create and export models in the BioImage Model Zoo format**:
   - CAREamics allows you to train models and export them in the BioImage Model Zoo format for sharing and reuse.
   - Refer to the [Noise2Void SEM Example](https://careamics.github.io/0.1/applications/Noise2Void/SEM/#export-the-model) for detailed steps on exporting a model in the BMZ format.

2. **Learn more**:
   - Full documentation is available at [CAREamics Documentation](https://careamics.github.io/0.1/).


## Best Practices for Model Usage
To ensure reliable and accurate results when using models from the BioImage Model Zoo, it is crucial to select a model suited to your specific dataset and application. Carefully review the model's documentation, particularly the "Validation" section, which provides steps for testing the model with your data. Quantitatively evaluate the model’s performance to confirm it meets your requirements and identifies potential limitations. 

For additional guidance on using deep learning models in microscopy and related fields, refer to the paper [Best practices for scientifically rigorous deep learning in microscopy](https://www.nature.com/articles/s41592-021-01284-3). Adhering to these practices ensures robust and reproducible analyses.

## Use Cases
- [Use-case 1: Stardist H&E nucleus segmentation](https://github.com/bioimage-io/use-cases/tree/main/case1-stardist)
- [Use-case 2: 3D U-Net for cell-segmentation in light microscopy](https://github.com/bioimage-io/use-cases/tree/main/case2-finetuning)
- [Use-case 3: Classification, imjoy & python library usage](https://github.com/bioimage-io/use-cases/tree/main/case3-devtools)
- [Use-case 4: Domain adaptation for mitochondria segmentation in EM](https://github.com/bioimage-io/use-cases/tree/main/case4-research)
