# Join as a community partner

By joining BioImage.IO as a community partner, you will be able to:
 - show your logo in BioImage.IO
 - associate the logo with predefined tags and content types
 - customize your splash screen with a short description, highlighted features and background image
 - generate url that bring the user directly to the filtered items.

## How to join as a community partner?
First, you will need to prepare a json object to hold some information for rendering your software or project in BioImage.IO. Please adapt the following example with your own content:

```json
{
  "id": "deepimagej",
  "name": "deepImageJ",
  "tags": ["deepimagej"],
  "logo": "https://deepimagej.github.io/deepimagej/images/deepimagej_logo.png",
  "icon": "https://deepimagej.github.io/deepimagej/images/deepimagej_logo.png",
  "splash_title": "deepImageJ",
  "splash_subtitle": "A user-friendly plugin to run deep learning models in ImageJ",
  "splash_feature_list": [
    "support models in tensorflow SavedModel format",
    "support running models from macro"
  ],
  "explore_button_text": "Start Exploring",
  "background_image": "static/img/zoo-background.svg",
  "resource_types": ["model", "notebook"]
}
```
Paste the JSON string into the comment box below (if you don't see a comment box in the bottom of this page, click [here](https://github.com/bioimage-io/bioimage.io/issues)).

The admin team of BioImage.IO will discuss and decide whether we should include your project.

