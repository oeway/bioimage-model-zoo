
# Tutorial for contributing models
**Note: only PyTorch and TensorFlow models are supported at the moment. We are working on alternative model formats such as ONNX.**

1. Check that the (1) that your model is supported by the BioImage Model Zoo and (2) it is compatible with at least one of the consumer software. Check it [here](https://github.com/bioimage-io/spec-bioimage-io/blob/master/supported_formats_and_operations.md).

2. Create a model specification file according to the [BioImage.IO Model Resource Description File Specification](https://github.com/bioimage-io/spec-bioimage-io/blob/gh-pages/model_spec_latest.md).
   - Each field on the file can be either mandatory or optional. You can use [our template](https://github.com/bioimage-io/bioimage-io-models/pull/55/files#diff-f6c64be5b9d764d0964654908b2ed4495fccc7624e58e9360bfdc6cef169edbe) to fill in the required information. 
   - [Here is an example](https://github.com/bioimage-io/pytorch-bioimage-io/blob/master/specs/models/unet2d_nuclei_broad/UNet2DNucleiBroad.model.yaml) of a filled configuration YAML file. In the Bioimage Model Zoo web page you will also find different examples. 

3. In the BioImage Model Zoo web plage, click on `+Upload` and follow the steps:

   1) Log in to Zenodo and give access to the BioEngine Application. You will see an automatic message once you are logged in. If not, refresh the page.
   This step needs to be done just for the first time you upload a model. 
   2) Upload the model RDF specification file.
   <img src="contribute_models/upload_1.png" align="center" width="1000"/>
   3) Complete the missing fields. Check out how to get most of your model documentation
   <img src="contribute_models/upload_2.png" align="center" width="1000"/>
   <img src="contribute_models/upload_3.png" align="center" width="1000"/>
   4)


## How to get most of your model documentation
### Model Tags

The tags in the model RDF are used to search for each model in the BioImage Model Zoo. The more informative tags you write, the easier it will be for a potential user to find your model. Example:

**My model description**: An encoder-decoder trained for denoising of point-scanning super-resolution microsocpy images of HeLa cells microtubules

**Tags**: `denoising`, `PSSR`, `microtubules`, `encoder-decoder`, `deblurring`, `fluorescence`, `2D`, `HeLa cells`, `deepimagej`, `ilastik`, `image restoration`, `trained-model` etc.

### Model links

## Considerations for the model description file (format_version>=0.3.0)
When following the BioImage.IO Model Resource Description File Specification provided at https://github.com/bioimage-io/spec-bioimage-io, it is important that you pay special attention to the following:
* Choose an input and output test images so we can check that your model runs correctly in the chosen [consumer software](https://bioimage.io/docs/#/consumer_software/model_runner)
* Choose a representative cover image of the task performed by your model. This image will be used in the model card to guide the users through the model search.
* Pre-processing and post-processing should be always described. For that, you can check which [processing routines are supported](https://github.com/bioimage-io/spec-bioimage-io/blob/master/supported_formats_and_operations.md#pre--and-postprocessing) at the moment. 
* Do not forget to include in your bioimage model (.zip) any additional file needed for the correct execution of the model.

