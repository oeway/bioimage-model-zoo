# BioImage.IO Partner Collection

A BioImage.IO partner collection is a YAML file in GitHub repository of a community partner. The file adheres to the collection RDF specification described [here](https://github.com/bioimage-io/spec-bioimage-io#collection-resource-description-file-specification).

The appearance of the partner collection on the website can be customized by the `config` field as described in the next section.  

## Customizing appearance on bioimage.io

Like any RDF, a collection RDF may have a `config` field to hold non-standardized metadata. We currently use some of this metadata to customize the partner collection appearance on the bioimage.io website. The fields used here are subject to change, but as a community partner we'll keep you in the loop on any changes here and will likely formalize this part in the future.

A typical partner collection RDF `config` field may look like this:

```yaml
config:
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

You can find a complete example [here](https://github.com/ilastik/bioimage-io-models/blob/master/collection.yaml).

If you want to join as a community partner, please send the link to BioImage.IO by following the instructions for [joining community partners](https://github.com/bioimage-io/bioimage.io/blob/master/docs/community_partners/how_to_join.md).
