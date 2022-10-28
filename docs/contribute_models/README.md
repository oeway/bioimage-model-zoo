# BioImage.IO Models

A BioImage.IO model is a zip file containing all the items, technical description and metadata of the model, together with the trained architecture of the model. Briefly, a BioImage.IO model is a zip file with at least, the following items:
* Trained model in the correct format (check the Resource Description File Specifications to know which packages and formats are supported)
* Example input image (numpy array)
* Example output item (numpy array)
* Resource description file specifications (`rdf.yaml`)
* An example cover image for visual representation of the model in the zoo.

The zip file may sometimes need additional files.
## Model contribution requirements:

- All the models in the BioImage Model Zoo have to follow the [BioImage.IO Model Resource Description File Specification (RDF)](https://bioimage.io/docs/#/bioimageio_model_spec) with `format_version>= 0.4.5`. 
- Contributed models are expected to be cross-compatible among the [consumer software](https://github.com/bioimage-io/spec-bioimage-io/blob/master/supported_formats_and_operations.md#consumers), and should always run on at least one.
- The model is well documented (i.e., human readable name and rich description tailored for life-scientists, citations)
- The model is public and can be used by anyone under the chosen licensing conditions.

## Model contribution guidelines


1. Create a BioImage.IO model (two options):
   1. Choose one way to export your model:
      - Automatic export of the model using the [bioimageio.core python library](https://github.com/bioimage-io/core-bioimage-io-python) (recomended).
        Example code [here](https://github.com/bioimage-io/core-bioimage-io-python/blob/main/example/model_creation.ipynb).
          - Run `bioimageio.core.build_model`.
      - Manual generation of the model:
         - Generate a resource description file (RDF) according to the [BioImage.IO Model Resource Description File Specification](https://bioimage.io/docs/#/bioimageio_model_spec).
         - Each field on the file is either mandatory or optional. In the Bioimage Model Zoo web page you will also find different examples. 
   2. Check that the model is exported correctly:
      - Static validation of the model format (e.g., `python bioimageio validate /../rdf.yaml`).
      - Dynamic validation of the model deployment (e.g., `python test_model --weights tensorflow_saved_model_bundle --device cpu /.../rdf.yaml`). It tests that the model generates the expected output.
      
2. Upload the model to the BioImage Model Zoo.
   The following steps may take some minutes. 
   In [BioImage.IO](https://bioimage.io/), click on `+Upload` and follow the steps:

   1. Log in to Zenodo and give access to the BioEngine application. You will see an automatic message once you are logged in. If not, refresh the page.
   This step needs to be done only for the first time you upload a model. 
   2. Upload your model RDF.
     
      <img src="contribute_models/upload_1.png" align="center" width="1000"/>
 
   3. Complete the missing fields. Check out how to get most of your model documentation
     
      <img src="contribute_models/upload_2.png" align="center" width="1000"/>
     
      <img src="contribute_models/upload_3.png" align="center" width="1000"/>
   
   4. The model is tested by a Continuous Integration (CI) workflow to check for its technical correctness. Additionally, a maintainer from the BioImage.IO team will review the model in a [generated pull request (PR)](https://github.com/bioimage-io/collection-bioimage-io/pulls/bioimageiobot). 
   5. Once the model passes all checks and has the approval of a maintainer, it will be added to the BioImage.IO collection and displayed in the webpage. 
   
   <img src="contribute_models/contribute_model.png" align="center" width="1000"/>


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
