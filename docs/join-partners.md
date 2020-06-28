# Join as a community partner

By joining BioImage.IO as a community partner, you will be able to:
 * show your logo in BioImage.IO
 * associate the logo with predefined tags and content types
 * customize your splash screen with a short description, highlighted features and background image
 * generate url that bring the user directly to the filtered items.

## How to join as a community partner?
 Make a Github issue [here](https://github.com/bioimage-io/bioimage.io/issues) to describe your project and state that you are interested in joining as a community partner. The admin team of BioImage.IO will discuss and decide whether we should include your project.

 Upon approval, you will need to provide some relevant information about your project.

 Here is an example:
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

Please adpat the above example with your own content and post in the github issue. A Pull Request for the changes will be made by the admin team and you will be able to preview the result before merging into BioImage.IO website.

