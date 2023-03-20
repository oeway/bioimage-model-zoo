

# Join as a community partner

BioImage.IO is a community-driven open source initiative, providing access to trained deep learning models and related resources contributed by the community members. To help us better disseminate and maintain the resources, we introduced the concepts of **community partner**. 

## What is a community partner?
Usually, a community partner is an organization, a company, a research group, or a software team (of one or more) that can consume resources of the BioImage.Io model zoo. Additionally, most partners continuously and openly contribute resources of their own. The first community partners represent open source consumer software of BioImage.IO (e.g. ilastik, Fiji, deepImageJ, ZeroCostDL4Mic, StarDist).

### Benefits as a community partner
By joining BioImage.IO as a community partner, you will be able to:
 - Participate in decision making process of the model specification
 - Show your logo in BioImage.IO and enable filtering models by compatibility with your software
 - Connect CI to automatically test new model compatibility with your software and use other infrastructure features provided by BioImage.IO
 
### Responsibilities
The main responsibilities of a community partner are:
 - Use BioImage.IO as their only primary trained model repository
 - Review resources contributed by others that claim to be compatible with this community partner software
 - Maintain this community partner's models and other resources, and keep them up-to-date with the latest spec
 
### Who should join as a community partner
 * A team behind a software which produces or consumes trained models compatible with the BioImage.IO spec
 * A organization, group, company or team (of one or more) who contributed and will keep contributing more models to BioImage.IO

## How does it work
Community partners can host their own Github repository for storing models and other resources that are relevant. These resources are listed in a [collection RDF](https://github.com/bioimage-io/spec-bioimage-io/blob/gh-pages/collection_spec_latest.md)–a yaml file–which will be dynamically linked to the [central repository of BioImage.IO](https://github.com/bioimage-io/bioimage-io-models). The [continuous integration (CI) service](https://github.com/bioimage-io/bioimage-io-models/actions) configured in the central repo will then pull the resources from partners' repo and compile them into items displayed in the BioImage.IO website. Each community partner is responsible for maintaining the resources that are relevant. 

![bioimage-io-community-partners](bioimage-io-community-partners.png)


## Report User Analytics

Community partners can use our user analytics service to report resource downloads and access to statistics.

See [User Analytics](/community_partners/user_analytics.md) for more details.
