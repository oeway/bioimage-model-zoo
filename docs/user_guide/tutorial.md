# Model contribution requirements:

- The model specification configuration YAML version needs to be 0.3.0. Link: 
- Any contributed model should run on at least one consumer software.
- **Special case**: Notebook contribution + example model. This case will not  be covered in this tutorial. 

## Summary

Model contribution means that you will upload a fully-documented trained model to a public repository so anyone has access to it. 
Therefore, the trained weights together with the architecture need to be uploaded to a public repository such as Zenodo or GitHub releases. 
Additionally, you will need to provide example images and configuration specification file that describes technically your model in a way that 
consumer software can load and run the model. All this information is embedded in a specific file called `Resource Description File` (RDF). 
The RDF is then published in the [Central repo](https://github.com/bioimage-io/bioimage-io-models) through a pull request (PR). 
Once the PR is accepted, a resource card to display the model in the website will be generated.


# Step to contribute a model:
1. Check the programming language and libraries used to train your model. For the moment only TensorFlow and PyTorch are supported.
2. Check that the version of these libraries are compatible with the consumer software.
3. Export your trained model (architecture and weights) in a [supported format](https://github.com/bioimage-io/configuration/blob/master/supported_formats_and_operations.md#weight-formats).
4. Choose an input and output test images so we can check that your model can be run correctly. LINK TO MODEL RUNNERS.
5. Generate a  a [`Resource Description File`](https://github.com/bioimage-io/bioimage.io/blob/master/docs/resource-description-file.md)(RDF)

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