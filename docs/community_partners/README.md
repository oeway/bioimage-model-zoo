

# Join as a community partner

BioImage.IO is a community driven open source innitiative where models and other resources are contributed by the community members. To help us better disseminate and maintain the resources, we introduced the concepts of **community partner**. 

## What is a community partner?
A community partner is an organization, a company, a research group, or a software team who can consume, and if considered, would like to continuously and openly contribute, resources of the BioImage.IO. A typical case for a community partner is an open source consumer software of BioImage.IO (e.g. ilastik, Fiji, deepImageJ, ZeroCostDL4Mic, StarDist).

### Benefits as a community partner
By joining BioImage.IO as a community partner, you will be able to:
 - Manage your own model repository
 - Show your logo in BioImage.IO and use predefined tags
 - Customize your splash screen with a short description, highlighted features and background image
 - Generate url that bring the user directly to the filtered items
 - Participate in decision making process of the model specification
### Responsibilities
The main responsibilities of a community partner are:
 - Receiving and reviewing contributed resources from the users
 - Maintain existing models and other resources, and keep them up-to-date with the latest spec.
### Who should join as a community partner
 * A team behind a software which produces or consumes models from the BioImage.IO
 * A organization, group, company or team who contributed and will keep contributing more models to BioImage.IO
### Who should not join as a community partner
 * An individual who contributes models to BioImage.IO
 * A software which is not maintained anymore
 * A software with non [open, free or collaborative software license](https://spdx.org/licenses/)


## How does it work
Community partners can host their own Github repository for storing models and other resources that are relevant. These resources are listed in a [collection RDF](https://github.com/bioimage-io/spec-bioimage-io/blob/gh-pages/collection_spec_latest.md)–a yaml file–which will be dynamically linked to the [central repository of BioImage.IO](https://github.com/bioimage-io/bioimage-io-models). The [continuous integration (CI) service](https://github.com/bioimage-io/bioimage-io-models/actions) configured in the central repo will then pull the resources from partners' repo and compile them into items displayed in the BioImage.IO website. Each community partner is responsible for maintaining the resources that are relevant. 

![bioimage-io-community-partners](bioimage-io-community-partners.png)


