
# Tutorial for contributing models

1. Check the programming language and libraries used to train your model. For the moment, we only support TensorFlow and PyTorch.
2. Check that the version of these libraries are compatible with the consumer software.
3. Export your trained model (architecture and weights) to a [supported format](https://github.com/bioimage-io/configuration/blob/master/supported_formats_and_operations.md#weight-formats).


4. Create a [Bioimage Model Zoo configuration specification](https://github.com/bioimage-io/configuration/blob/master/README.md) YAML file.
   Each field on the file can be either mandatory or optional. You can use [our template](https://github.com/bioimage-io/bioimage-io-models/pull/55/files#diff-f6c64be5b9d764d0964654908b2ed4495fccc7624e58e9360bfdc6cef169edbe) to fill in the required information. 
   [Here is an example](https://github.com/bioimage-io/pytorch-bioimage-io/blob/master/specs/models/unet2d_nuclei_broad/UNet2DNucleiBroad.model.yaml) of a filled configuration YAML file. In the Bioimage Model Zoo web page you will also find different examples. 
   
5. Call the configuration specification model YAML as `model.yaml`. 
6. Create a folder that contains the exported model (step 3), the `model.yaml`, the example inputs and outputs, and any other file that is required by your `model.yaml`, or your model to run in a consumer software. Zip the content of this folder and publish it in a public repository (Zenodo, GitHub releases). This bioimage model is the one that the user will download.

7. Fork the [Central GitHub repository](https://github.com/bioimage-io/bioimage-io-models) to your GitHub user account.

8. In the forked repository, go to `Actions` (top bar) and enable them, so the continuous integration (CI) checker can also run in your repository and check that the files you uploaded are correct:
   
    <img src="contribute_models/enable_actions.png" align="center" width="1000"/>

9. Create a folder inside `models` with a unique name. For example `mymodel-dataXYZ`(try to choose a name that refers to the model name and makes some reference to the data used to train it). Place the `model.yaml` inside your folder `mymodel-dataXYZ`. You can also place the covers for your model card inside this folder. Note that you will need to refer to them inside the yaml with a relative path, i.e. `covers: [./my_cover.jpg]`.
	<img src="contribute_models/dummy_model_folder.png" align="center" width="700"/>
    
10. Open the file `manifest.bioimage.io.yaml` and edit it. You need to add a unique `id`, a relative URL to your model yaml and the link to download the bioimage model (.zip) as follows:
    ```yaml
    model:
     - id: mymodel-dataXYZ-2021
       source: models/mymodel-dataXYZ/model.yaml      
       download_url: https://zenodo.org/record/4155785/files/mymodel-dataXYZ-2021v1.zip
    ```
11. Make a pull request!!

## Considerations for Bioimage Model Zoo version 0.3.0
The following information is also provided at the [Bioimage Model Zoo configuration specifications](https://github.com/bioimage-io/configuration/blob/master/README.md) but it is important that you pay special attention to it.
* Choose an input and output test images so we can check that your model runs correctly in the chosen [consumer software](https://bioimage.io/docs/#/consumer_software/model_runner)
* Choose a representative cover image of the task performed by your model. This image will be used in the model card to guide the users through the model search.
* Pre-processing and post-processing should be always described. For that, you can check which [processing routines are supported](https://github.com/bioimage-io/configuration/blob/master/supported_formats_and_operations.md#pre--and-postprocessing) at the moment. 
* Do not forget to include in your bioimage model (.zip) any additional file needed for the correct execution of the model.

