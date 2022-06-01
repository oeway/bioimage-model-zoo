# Contribute Models

## Model contribution requirements:

- Follow the [BioImage.IO Model Resource Description File Specification (RDF)](https://bioimage.io/docs/#/bioimageio_model_spec) with `format_version>= 0.4.5`. Here is an [example](https://github.com/bioimage-io/spec-bioimage-io/blob/main/example_specs/models/unet2d_keras_tf/rdf.yaml) of a model RDF file.
- Any contributed model should run on at least one [consumer software](https://github.com/bioimage-io/spec-bioimage-io/blob/master/supported_formats_and_operations.md#consumers).
- **Special case**: [Notebook and datasets contribution](https://bioimage.io/docs/#/contribute_models/README?id=contributing-other-resource-types) together with an example model.

## Short description of model contribution

 <img src="contribute_models/contribute_model.png" align="center" width="1000"/>

Model contribution means that you will upload a fully-documented trained model to a public repository using the Upload [BioEngine App](/bioengine/README.md). Uploading your model to the Bioimage Model Zoo ensures that:
- The model is well documented.
- It can be used by biologists through user-friendly tools. 
- It is assigned a unique DOI identifier and a License.
- The model is public and can be used by anyone under the chiosen licensing conditions.

The model package contains the trained weights together with the architecture, example inputs and outputs, and the configuration specification file that describes your model technically in such a way that at least one of the consumer software can load and run the model. All this information is embedded in a specific file called [`Model Resource Description File` (RDF)](https://bioimage.io/docs/#/bioimageio_spec?id=model-resource-description-file-specification).

Once the model is uploaded to Zenodo, it will be assessed by a Continuos Integration (CI) workflow to check for its usability in at least one of the consumer software. Once it passes, it will be displayed in the BioImage Model Zoo. 

Ready to follow the [Tutorial](/contribute_models/tutorials.md)?

## Contributing other resource types

To contribute a notebook, application or dataset, please use the generic [Resource Description File Format](https://bioimage.io/docs/#/bioimageio_spec?id=resource-description-file-specification).
