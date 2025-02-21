# How to contribute models to the BioImage Model Zoo
This guide is intended for developers who want to contribute models to the BioImage Model Zoo. It provides detailed instructions on creating, validating, and uploading models to the platform. By following these steps, you can ensure that your models are compatible with BioImage.IO consumer software and accessible to the broader life-sciences community.

## Content
- [Models in the BioImage Model Zoo](#models-in-the-bioimage-model-zoo)
  - [Model contribution requirements](#model-contribution-requirements)
  - [Create a BioImage.IO model](#create-a-bioimageio-model)
  - [Validate a BioImage.IO model](#validate-a-bioimageio-model)
  - [Upload the model to the BioImage Model Zoo](#upload-the-model-to-the-bioimage-model-zoo)

- [Model Documentation](#model-documentation)
  - [Model naming](#model-naming)
  - [Model Tags](#model-tags)
  - [Model links](#model-links)
  - [Representative Covers](#representative-covers)

- [Considerations for the model description file](#considerations-for-the-model-description-file)

- [Model Resource Description File Specification](#model-resource-description-file-specification)
  - [User-Friendly Documentation](#linking-to-comprehensive-rdf-documentation)
  - [Developer-Focused Documentation](#developer-focused-documentation)
  - [JSON Schema](#json-schema)
  - [Interactive Rendered Documentation](#interactive-rendered-documentation)
  - [Validation and Examples](#validation-and-examples)

- [Other contributions](#other-contributions)
  - [Submit to BioImage.IO](#submit-to-bioimageio)



## Models in the BioImage Model Zoo
A BioImage.IO model is a zip file containing all the items, technical description and metadata of the model, together with the trained architecture of the model. Briefly, a BioImage.IO model has at least, the following items:
* Trained model in the correct format (check the Resource Description File Specifications for the [supported formats](https://github.com/bioimage-io/spec-bioimage-io/blob/gh-pages/user_docs/model_descr_latest.md))
* Example input image (numpy array)
* Example output (numpy array)
* Resource description file specifications (`rdf.yaml`)
* An example cover image for visual representation of the model in the zoo.

In some cases, the model may need additional files.

### Model contribution requirements

- Follow the [BioImage.IO Model Resource Description File Specification (RDF)](https://github.com/bioimage-io/spec-bioimage-io/blob/gh-pages/user_docs/model_descr_latest.md).
- The model is expected to be cross-compatible among the consumer software, and should always run on at least one.
- The model should be well documented (i.e., human readable name and rich description tailored for life-scientists, citations)
- The model should be public and can be used by anyone under the chosen licensing conditions.

### Create a BioImage.IO model
To upload a model to the BioImage Model Zoo, the model must be described in the BioImage.IO metadata format and pass reproducibility tests.
This ensures compatibility and standardization across the platform. You can find the [latest metadata specifications here](https://github.com/bioimage-io/spec-bioimage-io/blob/gh-pages/user_docs/model_descr_latest.md).
Below are the various ways to create a BioImage.IO compatible model description.

#### 1. Using the `bioimageio.core` Python Library
This is the most recommended and streamlined method. The library provides tools for programmatic creation and validation of model descriptions.
- **Programmatic Export:**
  Use the library to programmatically create a model description in Python, see https://github.com/bioimage-io/core-bioimage-io-python?tab=readme-ov-file#-use-in-python for documentation and examples.

- **Manual Generation:**
  If you prefer a manual approach, you can create the model resource description file (`rdf.yaml`) yourself. The [BioImage.IO Model Resource Description File Specifications](https://github.com/bioimage-io/spec-bioimage-io/blob/gh-pages/user_docs/model_descr_latest.md) outline the required and optional fields for the file. Examples of RDF files can be found on the BioImage Model Zoo website.

### Validate a BioImage.IO model

  After creating a model description, please check that it adheres to our metadata specification and that additional quality checks implemented in the bioimageio.core Python package pass. To this end we provide the bioimageio command line interface (CLI) that is part of the bioimageio.core Python package:

1. Install conda. (We recommend using [miniforge](https://github.com/conda-forge/miniforge?tab=readme-ov-file#miniforge))
1. Create a conda environment that includes the bioimageio.core Python package. (Replace `pytorch` with any dependencies of your model.)

    ```bash
    conda create --name bioimageio -c conda-forge bioimageio.core pytorch
    ```

1. Activate your new conda environment (we named it 'bioimageio' in the previous step)

    ```bash
    conda activate bioimageio
    ```

1. Use the `bioimageio` CLI to test your model

    ```bash
    bioimageio test rdf.yaml
    ```

1. (optional) checkout additional options to `bioimageio test`

    ```bash
    bioimageio test --help
    ```

1. (optional) checkout other available `bioimageio` commands

    ```bash
    bioimageio --help
    ```

#### 2. Through a Community Partner

Several community partners provide tools to create models in the BioImage.IO format. Examples include:

- **[ZeroCostDL4Mic Notebooks](https://github.com/HenriquesLab/ZeroCostDL4Mic):** These notebooks enable retraining or fine-tuning of existing models and export them in the correct format.
- **[BiaPy](https://biapy.readthedocs.io/en/latest/):** BiaPy also supports model creation in the BioImage.IO format.

In both cases, follow the steps outlined in the respective notebooks to generate your model. Once the process is complete, you can upload the model to the BioImage Model Zoo.

#### 3. Using a Graphical User Interface (GUI)
#TODO by Tomaz
Each method allows flexibility based on your expertise and tools at hand. Always validate your model before uploading to ensure compliance with BioImage.IO specifications.

### Upload the model to the BioImage Model Zoo
Once you have created a model in the BioImage.IO format, you can upload it to the BioImage Model Zoo. The process is straightforward and involves the following steps:
1. Visit the [bioimageio](https://bioimage.io) website and click the "Upload" button to access the model upload page.
2. Log in using your Google or GitHub account.
3. Upload a resource file, which can be a single zip archive containing all necessary files, or you can select/drag and drop individual files. The 'rdf.yaml' file needed for uploading can be created in the next step.
4. Automatically once added the yaml file, you will have to "Review and Edit Your Model", to do this, provide all necessary metadata to create the 'rdf.yaml' file if it was not done yet. Ensure to give a descriptive name and description, and add the maintainer responsible for the upload. See the Model Documentation below for details such as how to name your model.
    **Important**: For the model description and information, please check the [model documentation section](#model-documentation).
5. Once ready, click "Validate" and wait for your model to be reviewed.

All models and resources in the BioImage Model Zoo undergo testing and validation before being accepted for publication. Some modifications may be required to meet the publication specifications after uploading.


###  Model Documentation
#### Model naming

Models are expected to be used by life-scientists, thus, it is expected that the naming is human readable but also informative enough regarding the final application and the biological tissue being analysed. Example:

   **Name:** `Neuron Segmentation in EM (Membrane Prediction)`, `B. Sutilist bacteria segmentation - Widefield microscopy - 2D UNet`

   
#### Model Tags
The tags in the model RDF are used to search for each model in the BioImage Model Zoo. The more informative tags you write, the easier it will be for a potential user to find your model. Example:

   **My model description**: An encoder-decoder trained for denoising of point-scanning super-resolution microsocpy images of HeLa cells microtubules

   **Tags**: `denoising`, `PSSR`, `microtubules`, `encoder-decoder`, `deblurring`, `fluorescence`, `2D`, `HeLa cells`, `deepimagej`, `ilastik`, `image restoration`, `trained-model` etc.

#### Model links
The BioImage Model Zoo is a software webpage. Each model is displayed with an interactive card that can have datasets, notebooks, applications, consumer-software or test-run buttons linked. Example:

   **Links**: `imjoy/BioImageIO-Packager`, `ilastik/ilastik`, `deepimagej/deepimagej`, `zero/dataset_fnet_3d_zerocostdl4mic` etc.

#### Representative Covers

You can include different cover images that represent the analysed tissue, imaging modality, image processing task and the performance of the model. This image will be used in the model card to guide the users through the model search.


### Considerations for the model description file

When following the BioImage.IO model RDF specification provided at https://github.com/bioimage-io/spec-bioimage-io, it is important that you pay special attention to the following:
* Choose test input image(s) and generate the respective test output tensor(s). This enables our scripts to test your model for technical correctness and to test which [consumer software](https://bioimage.io/docs/#/guides/user-guide?id=using-bioimage-model-zoo-models-in-different-software) can process it.
* Pre-processing and post-processing should be always described. You can check which [preprocessing](https://github.com/bioimage-io/spec-bioimage-io/blob/gh-pages/user_docs/model_descr_v0-5.md#inputspreprocessing-sequence--) and [postprocessing](https://github.com/bioimage-io/spec-bioimage-io/blob/gh-pages/user_docs/model_descr_v0-5.md#outputspostprocessing-sequence--) functions are supported at the moment and open an [issue here](https://github.com/bioimage-io/spec-bioimage-io/issues) if you are missing a specific operation. 
* Do not forget to include any additional files needed for the correct execution of the model during the upload process.

### Model Resource Description File Specification

The Model Resource Description File (RDF) is a standardized YAML file used to describe AI models for the **BioImage Model Zoo**. It ensures compatibility between models and BioImage.IO consumer software, enabling seamless integration and reproducibility. These RDF files include metadata, such as model inputs, outputs, pre/post-processing, authorship, and more.

The RDF specification is essential for defining models with pretrained weights, allowing them to be consumed by various tools (e.g., ilastik, DeepImageJ). By adhering to the RDF standard, your model becomes more accessible to researchers and developers, fostering adoption and collaboration.

The key fields in the model RDF include:
- **Name**: Human-readable model name.
- **Description**: Brief explanation of the model.
- **Inputs/Outputs**: Definitions of input and output tensors.
- **Preprocessing/Postprocessing**: Functions to apply before or after running the model.
- **Weights**: Pretrained model weights in supported formats.
- **Validation Data**: Test inputs and expected outputs for evaluation.

#### Linking to Comprehensive RDF Documentation

To support users and developers, we provide a centralized set of resources for understanding and validating RDF files:

1. **User-Friendly Documentation**  
   [View the user-friendly documentation](https://bioimage-io.github.io/spec-bioimage-io/bioimageio_schema_latest/index.html) for an interactive schema overview. This resource simplifies the RDF structure, showing required and optional fields in a clear, navigable format.

    <img src="./guides/user-friendly-documentation.png" alt="User-friendly schema example" width="60%"/>

2. **Developer-Focused Documentation**  
   For technical details, visit the [developer-focused documentation](https://bioimage-io.github.io/spec-bioimage-io/bioimageio/spec/model/v0_5.html#ModelDescr). This documentation provides in-depth explanations of each RDF field, tailored for software developers.
    <img src="./guides/developer-focused-documentation.png" alt="Developer Focused Documentation" width="60%"/>

3. **JSON Schema**  
   Access the RDF specification in JSON Schema format:
   - [JSON Schema for the latest version](https://github.com/bioimage-io/spec-bioimage-io/blob/gh-pages/bioimageio_schema_latest.json)
   - [Rendered schema documentation](https://bioimage-io.github.io/spec-bioimage-io/bioimageio_schema_latest/index.html)

   These schemas are useful for automated validation and RDF generation.

4. **Interactive Rendered Documentation**  
   Explore the [interactive, flattened documentation](https://bioimage-io.github.io/spec-bioimage-io/interactive_docs_v0-5.html) for a consolidated view of RDF types and constraints. This tool is ideal for refining your RDF file.
    
    <img src="./guides/interactive-rendered-documentation.png" alt="Rendered documentation example" width="60%"/>

5. **Validation and Examples**  
   Use the `bioimageio.core` Python package to validate your RDF files:
   ```bash
   bioimageio validate path/to/your/rdf.yaml
   ```

Refer to the [examples](https://github.com/bioimage-io/spec-bioimage-io/blob/main/example_descriptions/examples.md) for RDF templates.

For further details, visit the [BioImage.IO RDF specification repository](https://github.com/bioimage-io/spec-bioimage-io).




