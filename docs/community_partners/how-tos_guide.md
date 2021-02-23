
## How to join as a community partner?
If you are eligible and willing to join as a community partner, please submit a request issue [here](https://github.com/bioimage-io/bioimage-io-models/issues/27)) with relevant information including the following:
    1. Description of your software, organization, company or team.
    2. Description about the models and other resources that you plan to contribute. Please also include the url to your project repo.
    3. Description about future plans on how the project will be maintained 

The admin team of BioImage.IO will discuss on the request and decide on whether approve or decline the request. We will mainly check whether the requirements for participation are met.

Upon approval, please following these steps to connect your repo to BioImage.IO:

1. Firstly, please create a new Github Repo (if you don't have one) for hosting the models. Feel free to choose the repo name, or you can use the default name `bioimage-io-models`.
2. Add your model configuration files and other resources into the repo. A recommended organization is to create subfolders for `models`, `notebooks`, `applications` etc. And then place the yaml file and other relevant files in the corresponding folders.
3. Setup CI service for testing the models and verifying the spec in your repo. Please refer to "How to setup CI service for a community partners' repo".
3. The key step to make the github repo as a model repo is to create a manifest file named `manifest.bioimage.io.yaml` under the root of the repo. For the content of the file, please follow the instructions in the [BioImage.IO Manifest File](/community_partners/manifest-format.md).

4. Add one of the BioImage.IO admin team as a collaborator to your repo in case we need to make changes to the manifest file.

5. Upon approval,  
The admin team will discuss and decide whether we should include your project.


## How to setup CI service for a community partners' repo

The CI service is an useful tool for autotomize the maintenance tasks of the model repo. You basically need to add some testing scripts to your repo and  configure it using CI services such as Github Actions,  Travis or Circle CI etc. The testing script will be triggered by a new commit or pull request to the repo. For simplicity, we recommend Github Actions which can be triggered by adding a yaml file under the folder `.github/workflows`. For example, here is an example file [.github/workflows/compile-manifest.yml](https://github.com/deepimagej/models/blob/master/.github/workflows/compile-manifest.yml) that we used to verify the model spec in the central repo.

There are at least three steps are recommended:
 1. Run the [`compile_model_manifest.py`](https://github.com/bioimage-io/bioimage-io-models/blob/master/manifest.bioimage.io.yaml) script to make sure the manifest can be correctly compiled.
 2. Verify the yaml files according to model spec with `https://github.com/bioimage-io/python-bioimage-io`.
 3. If possible, test every models added to the repo

As a start, you can use [.github/workflows/compile-manifest.yml](https://github.com/deepimagej/models/blob/master/.github/workflows/compile-manifest.yml) as your template.