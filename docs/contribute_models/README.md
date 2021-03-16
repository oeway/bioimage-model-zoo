# Contribute Models

## Model contribution requirements:

- Follow the [BioImage.IO model description file format](https://github.com/bioimage-io/spec-bioimage-io/blob/master/README.md) with `format_version>= 0.3.0`
- Any contributed model should run on at least one [consumer software](https://github.com/bioimage-io/spec-bioimage-io/blob/master/supported_formats_and_operations.md#consumers).
- **Special case**: Notebook contribution together with an example model. This case is not covered yet in the tutorial. 

## Tutorial

 <img src="contribute_models/contribute_model.png" align="center" width="1000"/>

Model contribution means that you will upload a fully-documented trained model to a public repository so anyone has access to it. Uploading your model to the Bioimage Model Zoo ensures that the model is well documented and that it can be used by biologists through user-friendly tools.

The bioimage-model needs to be uploaded to a public repository such as Zenodo or GitHub releases as a .zip file. This file contains the trained weights together with the architecture, example inputs and outputs, and the configuration specification file that describes your model technically in such a way that 
at least one of the consumer software can load and run the model. All this information is embedded in a specific file called `Resource Description File` (RDF) at the [Central GitHub repository](https://github.com/bioimage-io/bioimage-io-models). 

We use GitHub to manage the contribution of your model, so you will need to make a pull requests (PR) to the [Central GitHub repository](https://github.com/bioimage-io/bioimage-io-models) with the specific information. The PR is checked with a continuous integration (CI) workflow. Once your model has successfully pass the CI, we will verify that your model works and if so, the PR will be merged with the Bioimage Model Zoo. 
At the end of the process, a resource card to display your model in the website will be generated.

Ready to follow the [Tutorial](/contribute_models/tutorials.md)?

## Contributing other resource types

To contribute a notebook, application or dataset, please use the [Resource Description File Foormat](/contribute_models/resource-description-file).