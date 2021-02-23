
# BioImage.IO Manifest File

## format_version: 0.2.0

## Define a resource collection

A collection config is typically used define a community partner.

It contains the following fields:

```yaml
config:
  # set an id for your collection/team/project, this will be used in the partner url
  id: awesome_collection
  # a human friendly name for the collection
  name: Awesome Collection

  # describe the collection in one sentence
  description: This is an awesome collection

  # a url for the user to get more details about the collection or your project
  # it can be a markdown file (*.md) hosted on github, you need to use the `raw` url
  # or an external link to your website
  about_url: http://details_about_my_collection

  # these tags will be used to filter items when the user select this collection
  tags:
    - awesome

  # the logo for the collection, you can use an emoji or a url to a png/jpg/gif/svg image
  logo: 🦒

  # the icon for your collection you can use an emoji or a url to a png/jpg/gif/svg image
  # note, this must be a square or contained in a square
  icon: 🦒


  # settings for the splash screen
  splash_title: Awesome Collection 
  splash_subtitle: Awesome Collection is Awesome!
  splash_feature_list:
    - Easy to use...
    - It's just awesome...
  explore_button_text: Start Awesomeness
  background_image: static/img/zoo-background.svg

  # the available resource types in your collection
  resource_types:
    - model
    - application
    - notebook
    - dataset

  # the default resource type you want to set, set to `all` if you want to show all your items by default
  default_type: all
```

## Add resources
You can now list your resource grouped by their types, each resource item follows the [`Resource Description File`](https://github.com/bioimage-io/bioimage.io/blob/master/docs/resource-description-file.md)(RDF) format. You can write all the RDF fields in the manifest or link to a standalone RDF file by setting the url as the `source` field. See the example below:

```yaml
application:
  - id: my_app_1
    type: application
    name: My Awesome App
    description: This is an awesome app
    source: https://url_to_my_awesome_app

model:
  # link to a model RDF file (with the source field)
  - id: my_model_1
    source: http://....url..to..my..model1..RDF..file.yaml
  
  # link to another model RDF file
  # you can also override or add new fields in additon to the source RDF
  - id: my_model_2
    source: http://....url..to..my..model2..RDF..file.yaml
    download_url: https://.....
    # add a link to my_app_1 defined in `application`
    links:
      - my_app_1

  # or expand the RDF fields
  - id: my_model_3
    type: model
    name: My Model 3
    description: My third model trained on a GPU
    git_repo: http://github.com/my/model3
    license: CC-BY-2.0
    tags:
      - cells
      - classification

    # link to the app and model defined previously
    links:
      - my_app_1
      - my_model_2
```

Combine all these into your `manifest.bioimage.io.yaml` file and host in your project repo.

See an example [here](https://github.com/ilastik/bioimage-io-models/blob/master/manifest.bioimage.io.yaml).

If you want to join as a community partner, please send the link to BioImage.IO by following the instructions for [joining community partners](https://github.com/bioimage-io/bioimage.io/blob/master/docs/join-partners.md).