
# Tutorial for contributing models

1. Create a model resource description file (RDF) according to the [BioImage.IO Model Resource Description File Specification](https://github.com/bioimage-io/spec-bioimage-io/blob/gh-pages/model_spec_latest.md).
   - Each field on the file is either mandatory or optional. You can use [our template](https://github.com/bioimage-io/bioimage-io-models/pull/55/files#diff-f6c64be5b9d764d0964654908b2ed4495fccc7624e58e9360bfdc6cef169edbe) to fill in the required information. 
   - [Here is an example](https://github.com/bioimage-io/pytorch-bioimage-io/blob/master/specs/models/unet2d_nuclei_broad/UNet2DNucleiBroad.model.yaml) of a valid model RDF. In the Bioimage Model Zoo web page you will also find different examples. 
   - You can validate your model RDF with the `bioimageio validate` command as described [here](https://github.com/bioimage-io/spec-bioimage-io#validate).

2. On bioimage.io, click on `+Upload` and follow the steps:

   1) Log in to Zenodo and give access to the BioEngine application. You will see an automatic message once you are logged in. If not, refresh the page.
   This step needs to be done only for the first time you upload a model. 
   2) Upload your model RDF.
   
   <img src="contribute_models/upload_1.png" align="center" width="1000"/>
   
   3) Complete the missing fields. Check out how to get most of your model documentation
    
   <img src="contribute_models/upload_2.png" align="center" width="1000"/>
   
   <img src="contribute_models/upload_3.png" align="center" width="1000"/>
   


## How to get most of your model documentation
### Model Tags

The tags in the model RDF are used to search for each model in the BioImage Model Zoo. The more informative tags you write, the easier it will be for a potential user to find your model. Example:

**My model description**: An encoder-decoder trained for denoising of point-scanning super-resolution microsocpy images of HeLa cells microtubules

**Tags**: `denoising`, `PSSR`, `microtubules`, `encoder-decoder`, `deblurring`, `fluorescence`, `2D`, `HeLa cells`, `deepimagej`, `ilastik`, `image restoration`, `trained-model` etc.

### Model links

## Considerations for the model description file (format_version>=0.3.0)
When following the BioImage.IO model RDF specification provided at https://github.com/bioimage-io/spec-bioimage-io, it is important that you pay special attention to the following:
* Choose test input image(s) and generate the respective test output tensor(s). This enables our scripts to test your model for technical correctness and to test which [consumer software](https://bioimage.io/docs/#/consumer_software/model_runner) can process it.
* Choose a representative cover image of the task performed by your model. This image will be used in the model card to guide the users through the model search.
* Pre-processing and post-processing should be always described. You can check which [preprocessing](https://github.com/bioimage-io/spec-bioimage-io/blob/gh-pages/preprocessing_spec_latest.md) and [postprocessing](https://github.com/bioimage-io/spec-bioimage-io/blob/gh-pages/postprocessing_spec_latest.md) functions are supported at the moment and open an [issue here](https://github.com/bioimage-io/spec-bioimage-io/issues) if you are missing a specific operation. 
* Do not forget to include any additional files needed for the correct execution of the model during the upload process.
