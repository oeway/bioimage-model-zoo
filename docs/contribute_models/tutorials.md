# Model contribution requirements:

- The model specification configuration [YAML version needs to be 0.3.0.](https://github.com/bioimage-io/configuration/blob/master/README.md) 
- Any contributed model should run on at least one [consumer software](https://github.com/bioimage-io/configuration/blob/master/supported_formats_and_operations.md#consumers).
- **Special case**: Notebook contribution + example model. This case will not be covered in this tutorial. 

## Summary

Model contribution means that you will upload a fully-documented trained model to a public repository so anyone has access to it. 
Therefore, the trained weights together with the architecture need to be uploaded to a public repository such as Zenodo or GitHub releases. 
Additionally, you will need to provide example images and configuration specification file that describes technically your model in a way that 
consumer software can load and run the model. All this information is embedded in a specific file called `Resource Description File` (RDF). 
The RDF is then published in the [Central GitHub repository](https://github.com/bioimage-io/bioimage-io-models) through a pull request (PR). 
Once the PR is accepted, a resource card to display the model in the website will be generated.


# Steps to contribute a model:
1. Check the programming language and libraries used to train your model. For the moment only TensorFlow and PyTorch are supported.
2. Check that the version of these libraries are compatible with the consumer software.
3. Export your trained model (architecture and weights) in a [supported format](https://github.com/bioimage-io/configuration/blob/master/supported_formats_and_operations.md#weight-formats).
4. Create a folder with a unique name that addresses the model name and has some reference to the data used to train it. For example `mymodel-dataXYZ`. This is the only way your model can coexist with others.

5. Create a [Bioimage Model Zoo configuration specification](https://github.com/bioimage-io/configuration/blob/master/README.md) YAML file.
   Each field on the file can be either mandatory or optional. You can use [our template](https://github.com/bioimage-io/bioimage-io-models/pull/55/files#diff-f6c64be5b9d764d0964654908b2ed4495fccc7624e58e9360bfdc6cef169edbe) to fill in the required information. 
   Here is an example of a filled configuration YAML file. In the Bioimage Model Zoo web page you will also find different examples. 
   
6. Call the configuration specification model YAML as `model.yaml`. 
7. Place the `model.yaml` inside your folder. 
9. Fork the [Central GitHub repository](https://github.com/bioimage-io/bioimage-io-models) to your GitHub user account.
10. In the forked repository, go to `Actions` (top bar) and enable them, so the continuous integration (CI) checker can also run in your repository and check that the files you uploaded are correct:
   
    <img src="contribute_models/enable_actions.png" align="center" width="1000"/>
    
11. Place the folder `mymodel-dataXYZ` with the `model.yaml` inside the folder called `models` in the central repository:
    
    <img src="contribute_models/dummy_model_folder.png" align="center" width="700"/>
    
12. Open the file `manifest.bioimage.io.yaml` and edit it. You need to add a unique `id` and a relative url to your model yaml as follows:
    ```yaml
    model:
     - id: mymodel-dataXYZ-2021
       source: models/mymodel-dataXYZ/model.yaml       
    ```
13. Make a pull request!!

## Considerations for Bioimage Model Zoo version 0.3.0
The following information is also provided at the [Bioimage Model Zoo configuration specifications](https://github.com/bioimage-io/configuration/blob/master/README.md) but as it is quite important, we make you to pay special attention to it.
* Choose an input and output test images so we can check that your model runs correctly in the chose consumer software. LINK TO MODEL RUNNERS.
* Choose a nice cover image that will be used in the model card
* Pre-processing and post-processing should be described. For that, you can check which [processing routines are supported](https://github.com/bioimage-io/configuration/blob/master/supported_formats_and_operations.md#pre--and-postprocessing) at the moment.

