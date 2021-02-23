# Model contribution requirements:

- The model specification configuration YAML version needs to be 0.3.0. Link: 
- Any contributed model should run on at least one consumer software.
- **Special case**: Notebook contribution + example model. This case will not  be covered in this tutorial. 

## Summary

Model contribution means that you will upload a fully-documented trained model to a public repository so anyone has access to it. 
Therefore, the trained weights together with the architecture need to be uploaded to a public repository such as Zenodo or GitHub releases. 
Additionally, you will need to provide example images and configuration specification file that describes technically your model in a way that 
consumer software can load and run the model. All this information is embedded in a specific file called `Resource Description File` (RDF). 
The RDF is then published in the [Central GitHub repository](https://github.com/bioimage-io/bioimage-io-models) through a pull request (PR). 
Once the PR is accepted, a resource card to display the model in the website will be generated.


# Step to contribute a model:
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
   
    <img src="https://github.com/esgomezm/bioimage.io/blob/master/docs/assets/contribute_models/enable_actions.png" align="center" width="500"/>
   
11. Place the folder `mymodel-dataXYZ` with the `model.yaml` inside the folder called `models` in the central repository:
    
    <img src="https://github.com/esgomezm/bioimage.io/blob/master/docs/assets/contribute_models/dummy_model_folder.png" align="center" width="500"/>
    
12. Open the file `manifest.bioimage.io.yaml` and edit it. You need to add a unique `id` and a relative url to your model yaml as follows:
    ```yaml
    model:
     - id: 2dunet-lstm
       source: models/mymodel-dataXYZ/bioimage.config_template.yaml       
   ```

7. Choose an input and output test images so we can check that your model runs correctly in the chose consumer software. LINK TO MODEL RUNNERS.




## Submit to BioImage.IO
* **Step 1**, prepare  and complete at least the mandatory fields and ideally also the recommended fields for different types of resource.

* **Step 2**, save the RDF file in one of the public git hosting website, it is recommended to store the RDF file in your project git repository on Github/Gitlab/Bitbucket (make sure it's a public repo). Alternatively, you can post it on [Gist](https://gist.github.com/), copy the the **raw** url to the actual file content.

* **Step 3**, post the url to the comment box below (if you don't see it, click [here](https://github.com/bioimage-io/bioimage-io-models/issues/26)). And the admin team will check and verify the format and incooperate to BioImage.IO if the submitted file is qualified.





[comment]: <> (- [Central repo]&#40;https://github.com/bioimage-io/bioimage-io-models&#41; where the developer can do a PR. There is a Bioimage Model repo. )

[comment]: <> (- How to contact:)

[comment]: <> (    - image.sc &#40;join the community partner? tag: bioimagemodelzoo?&#41;)

[comment]: <> (    - github issue)

[comment]: <> (    - gitter)

[comment]: <> (- What are the requirements in terms of compatibility with community partners to contribute a dataset, a notebook, a model, or a workflow? )

[comment]: <> (    - goto the central repo)

[comment]: <> (- What if a model cannot be loaded in any of the software? and if I provide the notebook? e.g. from https://github.com/bioimage-io/bioimage.io/blob/master/docs/resource-description-file.md#describing-ai-models, it could be assumed that almost anything can be loaded)

[comment]: <> (    - This would be a special contribution. You will always need to provide a model example with the 0.3.0 format.)

[comment]: <> (    - Models have attachments? The notebook could be in the attachment.)

[comment]: <> (- If I want to contribute with a model, should I create the spec and then ask a partner to include the model in its github with a PR? --> [Central repo]&#40;https://github.com/bioimage-io/bioimage-io-models&#41; )

[comment]: <> (- Could we provide the link to the repo of each community partner to make the RDF and manifests more accessible?)

[comment]: <> (- This info is now at https://github.com/bioimage-io/bioimage.io/blob/master/docs/contribute.md)

[comment]: <> (- Description of the RDF and the manifest. Sometimes they seem to be the same and other times, not.)
