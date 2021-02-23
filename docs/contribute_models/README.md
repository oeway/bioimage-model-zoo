# Contribute Models

## Model contribution requirements:

- The model specification configuration [YAML version needs to be 0.3.0.](https://github.com/bioimage-io/configuration/blob/master/README.md) 
- Any contributed model should run on at least one [consumer software](https://github.com/bioimage-io/configuration/blob/master/supported_formats_and_operations.md#consumers).
- **Special case**: Notebook contribution together with an example model. This case is not covered yet in the tutorial. 

## Summary

Model contribution means that you will upload a fully-documented trained model to a public repository so anyone has access to it.
The trained weights together with the architecture need to be uploaded to a public repository such as Zenodo or GitHub releases. 
Additionally, you will need to provide example images and configuration specification file that describes technically your model in a way that 
at least one of the consumer software can load and run the model. All this information is embedded in a specific file called `Resource Description File` (RDF) at the [Central GitHub repository](https://github.com/bioimage-io/bioimage-io-models) through a pull request (PR). 
The uploading channel is through GitHub pull requests (PR) as they can be checked with a continuous integration (CI) workflow. Once your model has successfully pass the CI, we will verify that your model works and if so, the PR will be merged with the Bioimage Model Zoo. 
Finally, a resource card to display the model in the website will be generated.