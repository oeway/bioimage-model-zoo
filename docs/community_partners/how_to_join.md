
## How to join as a community partner?

Note that in order to contribute resources to the BioImage.IO Model Zoo you do not need to become a community partner. How to contribute resources is described [here](/contribute_models/README.md). The role of a community partner is described [here](/community_partners/README.md).


If you are eligible and willing to join as a community partner, please submit a request issue [here](https://github.com/bioimage-io/collection-bioimage-io/issues/new) with relevant information including the following:
1. Description of your software, organization, company or team.
2. Description of the resources that you plan to contribute. Please also include the url to your project repo.
3. Description of future plans on how your project will be maintained.

The admin team of BioImage.IO will discuss the request and decide whether to approve or decline. We will mainly check whether the project are beneficial for the users of BioImage.IO and the requirements for participation are met.

Upon approval, we will guide you to follow these steps in order to incorporate your contribution to BioImage.IO:

1. Firstly, please create or choose a GitHub repo for hosting your resource collection that you would like to contribute. We recommend to create a dedicated repository in your organization for this purpose. As an example you might want to take a look at the [ilastik collection](https://github.com/ilastik/bioimage-io-resources/blob/main/collection.yaml).
1. Add a [collection RDF](https://github.com/bioimage-io/spec-bioimage-io/blob/gh-pages/collection_spec_latest.md) in your chosen repository, which lists all resources you would like to contribute. For this, you will also need to prepare the icons of your software or project.
1. Setup CI service for testing your collection RDF. Please refer to [how to setup CI service](/community_partners/how_to_join?id=how-to-setup-ci-service-for-a-community-partners39-repo).
1. Make a PR (or an issue) in the BioImage.IO Collection repo to link your collection to the [collection_rdf_template.yaml\:config\:partners](https://github.com/bioimage-io/collection-bioimage-io/blob/main/collection_rdf_template.yaml). We only require the link to your collection RDF here and need to agree on a partner id for you.

## How to register a software or application?

A community partner can have one or multiple associated software, you can register them in the collection RDF file of your repository (see the previous section about creating a collection repository). A software is categorized as "Application" in the BioImage Model Zoo. The first thing to do is to create an application file in the [ImJoy plugin file format](https://imjoy.io/docs/#/development?id=plugin-file-format). This basically allows you define a landing page for your software with executable features such as download or test run buttons for your software. The most common use case is to create a landing page for your software. Each software will have an unique id, typically in the format of `<community partner id>/<software name>`. Every model can add links (manually when upload or automatically via the CI) to the software. For each model, the user can click the link on top of the model card, and the landing page will be loaded. Through the ImJoy plugin mechanism, the context information contains the current model information will be injected to the landing page, it's up to the developer who made the software app to decided how to use those information.

To see an example, you can find the [source for the ilastik app](https://github.com/ilastik/bioimage-io-resources/blob/main/src/ilastik-app.imjoy.html) and also the corresponding entry in the collection file [here](https://github.com/ilastik/bioimage-io-resources/blob/2d2f1b12b185b1b880bfb679ed2aa981bf88d1ed/collection.yaml#L45-L59).

## How to setup CI service for a community partners' repo?

The CI service is an useful tool to autotomize the maintenance of the model repo and ensure a high quality for all BioImage.IO resources. 
You basically need to add some testing scripts to your repo and  configure it using CI services such as Github Actions,  Travis or Circle CI etc. The testing script will be triggered by a new commit or pull request to the repo. For simplicity, we recommend Github Actions which can be triggered by adding a yaml file under the folder `.github/workflows`. For example, here is an example file [.github/workflows/compile-manifest.yml](https://github.com/deepimagej/models/blob/master/.github/workflows/compile-manifest.yml) that we used to verify the model spec in the central repo.

There are at least three steps are recommended:
 1. Run the [`compile_model_manifest.py`](https://github.com/bioimage-io/bioimage-io-models/blob/master/manifest.bioimage.io.yaml) script to make sure the manifest can be correctly compiled.
 2. Verify the yaml files according to model spec with `https://github.com/bioimage-io/python-bioimage-io`.
 3. If possible, test every models added to the repo.

As a start, you can use [.github/workflows/compile-manifest.yml](https://github.com/deepimagej/models/blob/master/.github/workflows/compile-manifest.yml) as your template.

