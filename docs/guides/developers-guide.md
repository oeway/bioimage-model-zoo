# Developers Guide

## Models in the BioImage Model Zoo
A BioImage.IO model is a zip file containing all the items, technical description and metadata of the model, together with the trained architecture of the model. Briefly, a BioImage.IO model has at least, the following items:
* Trained model in the correct format (check the Resource Description File Specifications for the [supported formats](https://github.com/bioimage-io/spec-bioimage-io/blob/gh-pages/user_docs/model_descr_latest.md))
* Example input image (numpy array)
* Example output (numpy array)
* Resource description file specifications (`rdf.yaml`)
* An example cover image for visual representation of the model in the zoo.

In some cases, the model may need additional files.

### Model contribution requirements

- Follow the [BioImage.IO Model Resource Description File Specification (RDF)](https://github.com/bioimage-io/spec-bioimage-io/blob/gh-pages/user_docs/model_descr_latest.md) with `format_version>= 0.4.5`. 
- The model is expected to be cross-compatible among the consumer software, and should always run on at least one.
- The model should be well documented (i.e., human readable name and rich description tailored for life-scientists, citations)
- The model should be public and can be used by anyone under the chosen licensing conditions.

### Upload a model to the BioImage Model Zoo

**1. Create a BioImage.IO model** 
Two options:
   1. Choose one way to create your model:
      - Automatic export of the model using the [bioimageio.core python library](https://github.com/bioimage-io/core-bioimage-io-python) (recomended).
        Example code [here](https://github.com/bioimage-io/core-bioimage-io-python/blob/main/example/model_creation.ipynb).
          - The main function to build the model is `bioimageio.core.build_model`. Check its input variables to know what has to be provided.
      - Manual generation of the model:
         - Create the [BioImage.IO Model Resource Description File Specifications](https://github.com/bioimage-io/spec-bioimage-io/blob/gh-pages/user_docs/model_descr_latest.md) (`rdf.yaml` file).
         - Each field on the file is either mandatory or optional. In the Bioimage Model Zoo web page you can find different examples. 
   2. Check that the model is correctly created:
      - Static validation of the model format using the [bioimageio.core python library](https://github.com/bioimage-io/core-bioimage-io-python) library (*e.g.*, in the terminal, `bioimageio validate /../rdf.yaml`).
      - Dynamic validation of the model's deployment (*e.g.*, in the terminal, `bioimageio test-model --weights tensorflow_saved_model_bundle --device cpu /.../rdf.yaml`). It tests that the model generates the expected output.
      
**2. Upload the model to the BioImage Model Zoo**

To upload a model to the BioImage Model Zoo, you have a tutorial video of the process step by step available [here](https://oc.embl.de/index.php/s/JBWwJGgsXh0vYM6).
         
<img src="./guides/contribute_model.png" align="center" width="1000"/>

For a detailed explanation, follow these steps:
1. In [BioImage.IO](https://bioimage.io/), click on `+Upload` and follow the steps:
        
2. Log in to Zenodo and give access to the BioEngine application. You will see an automatic message once you are logged in. If not, refresh the page. This step needs to be done only for the first time you upload a model. 

3. Upload your model RDF. 
<img src="./guides/upload_1.png" align="center" width="500"/>

4. Complete the missing fields.
<img src="./guides/upload_2.png" align="center" width="500"/>
        
<img src="./guides/upload_3.png" align="center" width="500"/>
    
5. A [Pull Request (PR)](https://github.com/bioimage-io/collection-bioimage-io/pulls/bioimageiobot) is generated (this process may take some minutes). In the PR, the model is tested by a Continuous Integration (CI) workflow for its technical correctness. and reviewed by a maintainer from the BioImage.IO team. This PR is aimed for further discussions between model contributors and the BioImage.IO team.

6. Once the model passes all checks and has the approval of a maintainer, it will be added to the BioImage.IO collection and displayed in the webpage (this process may take some minutes). 

### Upload a model through Zenodo
**Note:** This tutorial provides a temporary solution for uploading models to the BioImage Model Zoo via Zenodo while the upload feature on the BioImage.IO website is being fixed.

This tutorial will guide you through the process of uploading a model to the BioImage Model Zoo community on Zenodo. The BioImage Model Zoo project aims to collect and share bioimage analysis models, and your contribution is valuable. Follow the steps below to upload your model.

1. Open your web browser and navigate to the Zenodo website at [https://zenodo.org/](https://zenodo.org). You need to create a Zenodo account if you do not have one. 
   <!-- ![Zenodo initial page](contribute_models/zenodo_upload_01.png) -->
   <img src="./guides/zenodo_upload_01.png" alt="Zenodo initial page" align="center" width="1000"/>
   
2. On the right, close to your username, click the "New upload" button to begin the model upload process. Make sure that the repository is set as public. 
The files in the BioImage.IO zip have to be uploaded one-by-one (See the example in the image below). Note that you can drag & drop all together at once.
   <!-- ![New upload](contribute_models/zenodo_upload_04.png) -->
   <img src="./guides/zenodo_upload_04.png" alt="New upload" align="center" width="1000"/>

3. Add `bioimage.io` on Keywords and subjects. This is crucial for us to identify your submission.
   <!-- ![Find BioImage.IO community](contribute_models/zenodo_upload_03.png) -->
   <img src="./guides/zenodo_upload_03.png" alt="Find BioImage.IO community" align="center" width="1000"/>
   
4. Follow the on-screen instructions to provide the required information about your model. Make sure to include a clear description, relevant tags, and any necessary documentation.

5. Once finished, click on Submit.
   
6. Your model will be proposed as a new contribution to the BioImage Model Zoo automatically. If the model passes all the tests, it will be automatically displayed in the Zoo. If the model does not pass the test, the GitHub users indicated in `maintainers` in the `rdf.yaml` file will be noitified through GitHub. This process can take 12-24h.

You've successfully uploaded your model to the BioImage Model Zoo community on Zenodo. Thank you for your contribution to the BioImage Model Zoo project. Remember that this is a temporary solution while the upload feature on the BioImage.IO website is being fixed. We appreciate your patience and support!


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
* Choose test input image(s) and generate the respective test output tensor(s). This enables our scripts to test your model for technical correctness and to test which [consumer software](https://bioimage.io/docs/#/consumer_software/model_runner) can process it.
* Pre-processing and post-processing should be always described. You can check which [preprocessing](https://github.com/bioimage-io/spec-bioimage-io/blob/gh-pages/preprocessing_spec_latest.md) and [postprocessing](https://github.com/bioimage-io/spec-bioimage-io/blob/gh-pages/postprocessing_spec_latest.md) functions are supported at the moment and open an [issue here](https://github.com/bioimage-io/spec-bioimage-io/issues) if you are missing a specific operation. 
* Do not forget to include any additional files needed for the correct execution of the model during the upload process.

### Model Resource Description File Specification (0.4.9)
This specification defines the fields used in a BioImage.IO-compliant resource description file (`RDF`) for describing AI models with pretrained weights.
These fields are typically stored in YAML files which we call Model Resource Description Files or `model RDF`.
The model RDFs can be downloaded or uploaded to the bioimage.io website, produced or consumed by BioImage.IO-compatible consumers(e.g. image analysis software or other website).

The model RDF YAML file contains mandatory and optional fields. In the following description, optional fields are indicated by _optional_.
_optional*_ with an asterisk indicates the field is optional depending on the value in another field.

* <a id="format_version"></a>`format_version` _(required String)_ Version of the BioImage.IO Model Resource Description File Specification used.
    This is mandatory, and important for the consumer software to verify before parsing the fields.
    The recommended behavior for the implementation is to keep backward compatibility and throw an error if the model yaml
    is in an unsupported format version. The current format version described here is
    0.4.9
* <a id="authors"></a>`authors` _(required List\[Author\])_ A list of authors. The authors are the creators of the specifications and the primary points of contact.
    1.  _(Author)_   is a Dict with the following keys:
        * <a id="authors:name"></a>`name` _(Name→String)_ Full name.
        * <a id="authors:affiliation"></a>`affiliation` _(String)_ Affiliation.
        * <a id="authors:email"></a>`email` _(Email)_ E-Mail
        * <a id="authors:github_user"></a>`github_user` _(String)_ GitHub user name.
        * <a id="authors:orcid"></a>`orcid` _(String)_ [orcid](https://support.orcid.org/hc/en-us/sections/360001495313-What-is-ORCID) id in hyphenated groups of 4 digits, e.g. '0000-0001-2345-6789' (and [valid](https://support.orcid.org/hc/en-us/articles/360006897674-Structure-of-the-ORCID-Identifier) as per ISO 7064 11,2.)
* <a id="description"></a>`description` _(required String)_ A string containing a brief description.
* <a id="documentation"></a>`documentation` _(required Union\[URL→URI | Path→String\])_ Relative path or URL to file with additional documentation in markdown. The file must be in markdown format with `.md` file name extension. It is recommended to use `README.md` as the documentation name. The documentation should include a (sub)section '[#[#]]# Validation' with details on how to quantitatively validate the model on unseen data.
* <a id="inputs"></a>`inputs` _(required List\[InputTensor\])_ Describes the input tensors expected by this model.
    1.  _(InputTensor)_   is a Dict with the following keys:
        * <a id="inputs:axes"></a>`axes` _(Axes→String)_ Axes identifying characters from: bitczyx. Same length and order as the axes in `shape`.
            
            | character | description |
            | --- | --- |
            |  b  |  batch (groups multiple samples) |
            |  i  |  instance/index/element |
            |  t  |  time |
            |  c  |  channel |
            |  z  |  spatial dimension z |
            |  y  |  spatial dimension y |
            |  x  |  spatial dimension x |
        * <a id="inputs:data_type"></a>`data_type` _(String)_ The data type of this tensor. For inputs, only `float32` is allowed and the consumer software needs to ensure that the correct data type is passed here. For outputs can be any of `float32, float64, (u)int8, (u)int16, (u)int32, (u)int64`. The data flow in bioimage.io models is explained [in this diagram.](https://docs.google.com/drawings/d/1FTw8-Rn6a6nXdkZ_SkMumtcjvur9mtIhRqLwnKqZNHM/edit).
        * <a id="inputs:name"></a>`name` _(String)_ Tensor name. No duplicates are allowed.
        * <a id="inputs:shape"></a>`shape` _(Union\[ExplicitShape→List\[Integer\] | ParametrizedInputShape\])_ Specification of input tensor shape.
            1.  _(ExplicitShape→List\[Integer\])_ Exact shape with same length as `axes`, e.g. `shape: [1, 512, 512, 1]`
            1.  _(ParametrizedInputShape)_ A sequence of valid shapes given by `shape = min + k * step for k in {0, 1, ...}`. ParametrizedInputShape is a Dict with the following keys:
                * <a id="inputs:shape:min"></a>`min` _(List\[Integer\])_ The minimum input shape with same length as `axes`
                * <a id="inputs:shape:step"></a>`step` _(List\[Integer\])_ The minimum shape change with same length as `axes`
        * <a id="inputs:data_range"></a>`data_range` _(Tuple)_ Tuple `(minimum, maximum)` specifying the allowed range of the data in this tensor. If not specified, the full data range that can be expressed in `data_type` is allowed.
        * <a id="inputs:preprocessing"></a>`preprocessing` _(List\[Preprocessing\])_ Description of how this input should be preprocessed.
            1.  _(Preprocessing)_   is a Dict with the following keys:
                * <a id="inputs:preprocessing:name"></a>`name` _(String)_ Name of preprocessing. One of: binarize, clip, scale_linear, sigmoid, zero_mean_unit_variance, scale_range.
                * <a id="inputs:preprocessing:kwargs"></a>`kwargs` _(Kwargs→Dict\[String, Any\])_ Key word arguments as described in [preprocessing spec](https://github.com/bioimage-io/spec-bioimage-io/blob/gh-pages/preprocessing_spec_0_4.md).
* <a id="license"></a>`license` _(required String)_ A [SPDX license identifier](https://spdx.org/licenses/)(e.g. `CC-BY-4.0`, `MIT`, `BSD-2-Clause`). We don't support custom license beyond the SPDX license list, if you need that please send an Github issue to discuss your intentions with the community.
* <a id="name"></a>`name` _(required Name→String)_ Name of this model. It should be human-readable and only contain letters, numbers, underscore '_', minus '-' or spaces and not be longer than 64 characters.
* <a id="test_inputs"></a>`test_inputs` _(required List\[Union\[URI→String | Path→String\]\])_ List of URIs or local relative paths to test inputs as described in inputs for **a single test case**. This means if your model has more than one input, you should provide one URI for each input.Each test input should be a file with a ndarray in [numpy.lib file format](https://numpy.org/doc/stable/reference/generated/numpy.lib.format.html#module-numpy.lib.format).The extension must be '.npy'.
* <a id="test_outputs"></a>`test_outputs` _(required List\[Union\[URI→String | Path→String\]\])_ Analog to test_inputs.
* <a id="timestamp"></a>`timestamp` _(required DateTime)_ Timestamp of the initial creation of this model in [ISO 8601](#https://en.wikipedia.org/wiki/ISO_8601) format.
* <a id="weights"></a>`weights` _(required Dict\[String, Union\[KerasHdf5WeightsEntry | OnnxWeightsEntry | PytorchStateDictWeightsEntry | TensorflowJsWeightsEntry | TensorflowSavedModelBundleWeightsEntry | TorchscriptWeightsEntry\]\])_ 
    1.  _(String)_ Format of this set of weights. One of: pytorch_state_dict, torchscript, keras_hdf5, tensorflow_js, tensorflow_saved_model_bundle, onnx
    1.  _(Union\[KerasHdf5WeightsEntry | OnnxWeightsEntry | PytorchStateDictWeightsEntry | TensorflowJsWeightsEntry | TensorflowSavedModelBundleWeightsEntry | TorchscriptWeightsEntry\])_ The weights for this model. Weights can be given for different formats, but should otherwise be equivalent. See [weight_formats_spec_0_4.md](https://github.com/bioimage-io/spec-bioimage-io/blob/gh-pages/weight_formats_spec_0_4.md) for the required and optional fields per weight format. The available weight formats determine which consumers can use this model.
* <a id="attachments"></a>`attachments` _(optional Attachments)_ Additional unknown keys are allowed. Attachments is a Dict with the following keys:
    * <a id="attachments:files"></a>`files` _(optional List\[Union\[URI→String | Path→String\]\])_ File attachments; included when packaging the resource.
* <a id="badges"></a>`badges` _(optional List\[Badge\])_ a list of badges
    1.  _(Badge)_ Custom badge. Badge is a Dict with the following keys:
        * <a id="badges:label"></a>`label` _(String)_ e.g. 'Open in Colab'
        * <a id="badges:icon"></a>`icon` _(String)_ e.g. 'https://colab.research.google.com/assets/colab-badge.svg'
        * <a id="badges:url"></a>`url` _(Union\[URL→URI | Path→String\])_ e.g. 'https://colab.research.google.com/github/HenriquesLab/ZeroCostDL4Mic/blob/master/Colab_notebooks/U-net_2D_ZeroCostDL4Mic.ipynb'
* <a id="cite"></a>`cite` _(optional List\[CiteEntry\])_ A list of citation entries.
    Each entry contains a mandatory `text` field and either one or both of `doi` and `url`.
    E.g. the citation for the model architecture and/or the training data used.
    1.  _(CiteEntry)_   is a Dict with the following keys:
        * <a id="cite:text"></a>`text` _(String)_ free text description
        * <a id="cite:doi"></a>`doi` _(DOI→String)_ digital object identifier, see https://www.doi.org/ (alternatively specify `url`)
        * <a id="cite:url"></a>`url` _(String)_ url to cite (alternatively specify `doi`)
* <a id="config"></a>`config` _(optional YamlDict→Dict\[Any, Any\])_ A custom configuration field that can contain any keys not present in the RDF spec. This means you should not store, for example, github repo URL in `config` since we already have the `git_repo` key defined in the spec.
    Keys in `config` may be very specific to a tool or consumer software. To avoid conflicted definitions, it is recommended to wrap configuration into a sub-field named with the specific domain or tool name, for example:
    
    ```yaml
       config:
          bioimage_io:  # here is the domain name
            my_custom_key: 3837283
            another_key:
               nested: value
          imagej:
            macro_dir: /path/to/macro/file
    ```
    If possible, please use [`snake_case`](https://en.wikipedia.org/wiki/Snake_case) for keys in `config`.
    For example:
    ```yaml
    config:
      # custom config for DeepImageJ, see https://github.com/bioimage-io/configuration/issues/23
      deepimagej:
        model_keys:
          # In principle the tag "SERVING" is used in almost every tf model
          model_tag: tf.saved_model.tag_constants.SERVING
          # Signature definition to call the model. Again "SERVING" is the most general
          signature_definition: tf.saved_model.signature_constants.DEFAULT_SERVING_SIGNATURE_DEF_KEY
        test_information:
          input_size: [2048x2048] # Size of the input images
          output_size: [1264x1264 ]# Size of all the outputs
          device: cpu # Device used. In principle either cpu or GPU
          memory_peak: 257.7 Mb # Maximum memory consumed by the model in the device
          runtime: 78.8s # Time it took to run the model
          pixel_size: [9.658E-4µmx9.658E-4µm] # Size of the pixels of the input
    ```
* <a id="covers"></a>`covers` _(optional List\[Union\[URL→URI | Path→String\]\])_ A list of cover images provided by either a relative path to the model folder, or a hyperlink starting with 'http[s]'. Please use an image smaller than 500KB and an aspect ratio width to height of 2:1. The supported image formats are: 'jpg', 'png', 'gif'.
* <a id="download_url"></a>`download_url` _(optional Union\[URL→URI | Path→String\])_ optional url to download the resource from
* <a id="git_repo"></a>`git_repo` _(optional URL→URI)_ A url to the git repository, e.g. to Github or Gitlab.If the model is contained in a subfolder of a git repository, then a url to the exact folder(which contains the configuration yaml file) should be used.
* <a id="icon"></a>`icon` _(optional String)_ an icon for the resource
* <a id="id"></a>`id` _(optional String)_ Unique id within a collection of resources.
* <a id="links"></a>`links` _(optional List\[String\])_ links to other bioimage.io resources
* <a id="maintainers"></a>`maintainers` _(optional List\[Maintainer\])_ Maintainers of this resource.
    1.  _(Maintainer)_   is a Dict with the following keys:
        * <a id="maintainers:github_user"></a>`github_user` _(String)_ GitHub user name.
        * <a id="maintainers:affiliation"></a>`affiliation` _(String)_ Affiliation.
        * <a id="maintainers:email"></a>`email` _(Email)_ E-Mail
        * <a id="maintainers:name"></a>`name` _(Name→String)_ Full name.
        * <a id="maintainers:orcid"></a>`orcid` _(String)_ [orcid](https://support.orcid.org/hc/en-us/sections/360001495313-What-is-ORCID) id in hyphenated groups of 4 digits, e.g. '0000-0001-2345-6789' (and [valid](https://support.orcid.org/hc/en-us/articles/360006897674-Structure-of-the-ORCID-Identifier) as per ISO 7064 11,2.)
* <a id="outputs"></a>`outputs` _(optional List\[OutputTensor\])_ Describes the output tensors from this model.
    1.  _(OutputTensor)_   is a Dict with the following keys:
        * <a id="outputs:axes"></a>`axes` _(Axes→String)_ Axes identifying characters from: bitczyx. Same length and order as the axes in `shape`.
            
            | character | description |
            | --- | --- |
            |  b  |  batch (groups multiple samples) |
            |  i  |  instance/index/element |
            |  t  |  time |
            |  c  |  channel |
            |  z  |  spatial dimension z |
            |  y  |  spatial dimension y |
            |  x  |  spatial dimension x |
        * <a id="outputs:data_type"></a>`data_type` _(String)_ The data type of this tensor. For inputs, only `float32` is allowed and the consumer software needs to ensure that the correct data type is passed here. For outputs can be any of `float32, float64, (u)int8, (u)int16, (u)int32, (u)int64`. The data flow in bioimage.io models is explained [in this diagram.](https://docs.google.com/drawings/d/1FTw8-Rn6a6nXdkZ_SkMumtcjvur9mtIhRqLwnKqZNHM/edit).
        * <a id="outputs:name"></a>`name` _(String)_ Tensor name. No duplicates are allowed.
        * <a id="outputs:shape"></a>`shape` _(Union\[ExplicitShape→List\[Integer\] | ImplicitOutputShape\])_ Specification of output tensor shape.
            1.  _(ImplicitOutputShape)_ In reference to the shape of an input tensor, the shape of the output tensor is `shape = shape(input_tensor) * scale + 2 * offset`. ImplicitOutputShape is a Dict with the following keys:
                * <a id="outputs:shape:offset"></a>`offset` _(List\[Float\])_ Position of origin wrt to input. Multiple of 0.5.
                * <a id="outputs:shape:reference_tensor"></a>`reference_tensor` _(String)_ Name of the reference tensor.
                * <a id="outputs:shape:scale"></a>`scale` _(List\[Float\])_ 'output_pix/input_pix' for each dimension.
        * <a id="outputs:data_range"></a>`data_range` _(Tuple)_ Tuple `(minimum, maximum)` specifying the allowed range of the data in this tensor. If not specified, the full data range that can be expressed in `data_type` is allowed.
        * <a id="outputs:halo"></a>`halo` _(List\[Integer\])_ The halo to crop from the output tensor (for example to crop away boundary effects or for tiling). The halo should be cropped from both sides, i.e. `shape_after_crop = shape - 2 * halo`. The `halo` is not cropped by the bioimage.io model, but is left to be cropped by the consumer software. Use `shape:offset` if the model output itself is cropped and input and output shapes not fixed.
        * <a id="outputs:postprocessing"></a>`postprocessing` _(List\[Postprocessing\])_ Description of how this output should be postprocessed.
            1.  _(Postprocessing)_   is a Dict with the following keys:
                * <a id="outputs:postprocessing:name"></a>`name` _(String)_ Name of postprocessing. One of: binarize, clip, scale_linear, sigmoid, zero_mean_unit_variance, scale_range, scale_mean_variance.
                * <a id="outputs:postprocessing:kwargs"></a>`kwargs` _(Kwargs→Dict\[String, Any\])_ Key word arguments as described in [postprocessing spec](https://github.com/bioimage-io/spec-bioimage-io/blob/gh-pages/postprocessing_spec_0_4.md).
* <a id="packaged_by"></a>`packaged_by` _(optional List\[Author\])_ The persons that have packaged and uploaded this model. Only needs to be specified if different from `authors` in root or any entry in `weights`.
    1.  _(Author)_   is a Dict with the following keys:
        * <a id="packaged_by:name"></a>`name` _(Name→String)_ Full name.
        * <a id="packaged_by:affiliation"></a>`affiliation` _(String)_ Affiliation.
        * <a id="packaged_by:email"></a>`email` _(Email)_ E-Mail
        * <a id="packaged_by:github_user"></a>`github_user` _(String)_ GitHub user name.
        * <a id="packaged_by:orcid"></a>`orcid` _(String)_ [orcid](https://support.orcid.org/hc/en-us/sections/360001495313-What-is-ORCID) id in hyphenated groups of 4 digits, e.g. '0000-0001-2345-6789' (and [valid](https://support.orcid.org/hc/en-us/articles/360006897674-Structure-of-the-ORCID-Identifier) as per ISO 7064 11,2.)
* <a id="parent"></a>`parent` _(optional ModelParent)_ The model from which this model is derived, e.g. by fine-tuning the weights. ModelParent is a Dict with the following keys:
    * <a id="parent:id"></a>`id` _(optional BioImageIO_ID→String)_ ID as shown on resource card on bioimage.io
    * <a id="parent:sha256"></a>`sha256` _(optional SHA256→String)_ Hash of the parent model RDF. Note: the hash is not validated
    * <a id="parent:uri"></a>`uri` _(optional Union\[URI→String | Path→String\])_ URL or local relative path of a model RDF
* <a id="rdf_source"></a>`rdf_source` _(optional Union\[URL→URI | DOI→String\])_ url or doi to the source of the resource definition
* <a id="run_mode"></a>`run_mode` _(optional RunMode)_ Custom run mode for this model: for more complex prediction procedures like test time data augmentation that currently cannot be expressed in the specification. No standard run modes are defined yet. RunMode is a Dict with the following keys:
    * <a id="run_mode:name"></a>`name` _(required String)_ The name of the `run_mode`
    * <a id="run_mode:kwargs"></a>`kwargs` _(optional Kwargs→Dict\[String, Any\])_ Key word arguments.
* <a id="sample_inputs"></a>`sample_inputs` _(optional List\[Union\[URI→String | Path→String\]\])_ List of URIs/local relative paths to sample inputs to illustrate possible inputs for the model, for example stored as png or tif images. The model is not tested with these sample files that serve to inform a human user about an example use case.
* <a id="sample_outputs"></a>`sample_outputs` _(optional List\[Union\[URI→String | Path→String\]\])_ List of URIs/local relative paths to sample outputs corresponding to the `sample_inputs`.
* <a id="tags"></a>`tags` _(optional List\[String\])_ A list of tags.
* <a id="training_data"></a>`training_data` _(optional Union\[Dataset | LinkedDataset\])_ 
    1.  _(optional Dataset)_ in-place definition of [dataset RDF](https://github.com/bioimage-io/spec-bioimage-io/blob/gh-pages/dataset_spec_0_2.md)
    1.  _(optional LinkedDataset)_   is a Dict with the following keys:
        * <a id="training_data:id"></a>`id` _(optional String)_ dataset id
* <a id="version"></a>`version` _(optional Version→String)_ The version number of the model. The version number format must be a string in `MAJOR.MINOR.PATCH` format following the guidelines in Semantic Versioning 2.0.0 (see https://semver.org/), e.g. the initial version number should be `0.1.0`.


## Other contributions
You are welcome to submit your **models**, **datasest**, **applicaitons** and Jupyter **notebooks** to BioImage.IO.

To add an resource item to BioImage.IO, you need to provide a set of basic information about the resouce, including name, description, authors etc. and we will generate a resource card to display in the website.

For Community Partners, you can add models directly to the linked repository. If you are not part of the community partners, you can follow the instructions below to submit resource items (models, datasets etc.) to BioImage.IO.

### Submit to BioImage.IO
* Step 1, prepare a [`Resource Description File`](/bioimageio_rdf_spec)(RDF) and complete at least the mandatory fields and ideally also the recommended fields for different types of resource.

* Step 2, save the RDF file in one of the public git hosting website, it is recommended to store the RDF file in your project git repository on Github/Gitlab/Bitbucket (make sure it's a public repo). Alternatively, you can post it on [Gist](https://gist.github.com/), copy the the **raw** url to the actual file content.

* Step 3, post the url to the comment box below (if you don't see it, click [here](https://github.com/bioimage-io/bioimage-io-models/issues/26)). And the admin team will check and verify the format and incooperate to BioImage.IO if the submitted file is qualified.
