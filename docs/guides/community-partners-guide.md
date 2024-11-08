# Community Partners Guide
BioImage.IO is a community-driven open source initiative, providing access to trained deep learning models and related resources contributed by the community members. To help us better disseminate and maintain the resources, we introduced the concepts of **community partner**. 

## Introduction to Community Partners

### What is a community partner?
Usually, a community partner is an organization, a company, a research group, or a software team (of one or more) that can consume and/or produce resources of the BioImage.Io model zoo. Additionally, most partners continuously and openly contribute resources of their own. The first community partners represent open source consumer software of BioImage.IO (e.g. ilastik, Fiji, deepImageJ, ZeroCostDL4Mic, StarDist).

### Benefits as a community partner
By joining BioImage.IO as a community partner, you will be able to:
 - Participate in decision making process of the model specification.
 - Show your logo in BioImage.IO and enable filtering models by compatibility with your software.
 - Connect CI to automatically test new model compatibility with your software and use other infrastructure features provided by BioImage.IO.
 
### Responsibilities
The main responsibilities of a community partner are:
 - Use BioImage.IO as their only primary trained model repository.
 - Review resources contributed by others that claim to be compatible with this community partner software.
 - Maintain this community partner's models and other resources in their linked repository, setup continous integration workflows to test models and keep them up-to-date with the latest spec.
 
### Who should join as a community partner?
 * A team behind a software which produces or consumes trained models compatible with the BioImage.IO spec.
 * A organization, group, company or team (of one or more) who contributed and will keep contributing more models to BioImage.IO.

### How does it work?
Community partners can host their own Github repository for storing models and other resources that are relevant. These resources are listed in a [collection RDF](https://github.com/bioimage-io/spec-bioimage-io/blob/gh-pages/collection_spec_latest.md)–a yaml file–which will be dynamically linked to the [central repository of BioImage.IO](https://github.com/bioimage-io/bioimage-io-models). The [continuous integration (CI) service](https://github.com/bioimage-io/bioimage-io-models/actions) configured in the central repo will then pull the resources from partners' repo and compile them into items displayed in the BioImage.IO website. Each community partner is responsible for maintaining the resources that are relevant. 

![bioimage-io-community-partners](./community_partners_guide/bioimage-io-community-partners.png)

## Meet our Community Partners
Below is a list of our esteemed Community Partners who actively engage with the BioImage Model Zoo project, contributing their expertise, resources, and support to enhance the bioimage analysis community.

<!-- ImJoyPlugin: {"type": "window", "hide_code_block": true, "startup_mode": "run"} -->
```html
<config lang="json">
{
  "name": "BioImageIO Community Partners",
  "type": "window",
  "tags": [],
  "ui": "",
  "version": "0.1.0",
  "cover": "",
  "description": "Create a table for the bioimage.io community partners",
  "icon": "extension",
  "inputs": null,
  "outputs": null,
  "api_version": "0.1.8",
  "env": "",
  "permissions": [],
  "requirements": ["https://cdnjs.cloudflare.com/ajax/libs/react/17.0.2/umd/react.production.min.js", "https://cdnjs.cloudflare.com/ajax/libs/react-dom/17.0.2/umd/react-dom.production.min.js", "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.26.0/babel.min.js", "https://cdn.tailwindcss.com"],
  "dependencies": [],
  "defaults": {"w": 20, "h": 10}
}
</config>

<attachment name="react-src">
// Main React App Component
const App = () => {
  const [partners, setPartners] = React.useState([]);

  // Fetch JSON data from the URL
  React.useEffect(() => {
    fetch('https://raw.githubusercontent.com/bioimage-io/collection-bioimage-io/gh-pages/collection.json')
      .then(response => response.json())
      .then(data => {
        if (data.config && data.config.partners) {
          setPartners(data.config.partners);
        } else {
          setPartners([]);
        }
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 text-gray-800 w-full">
      <div className="p-8 bg-white shadow-md rounded-lg w-full h-full">
        <h1 className="text-2xl font-bold mb-4">Community Partners</h1>
        <table className="min-w-full bg-white w-full h-full">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-2">Community Partner</th>
              <th className="py-2">Documentation</th>
              <th className="py-2">Contact</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {partners.map((partner, index) => (
              <tr key={index}>
                <td className="py-2 px-4">{partner.name || 'N/A'}</td>
                <td className="py-2 px-4">{partner.docs || 'N/A'}</td>
                <td className="py-2 px-4">
                  {partner.contact ? (
                    partner.contact.map((contact, i) => (
                      <div key={i}>
                        <div>Name: {contact.name || 'N/A'}</div>
                        <div>Github: {contact.github || 'N/A'}</div>
                        <div>Email: {contact.email || 'N/A'}</div>
                      </div>
                    ))
                  ) : (
                    'N/A'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Render the App component
ReactDOM.render(<App />, document.getElementById('root'));

</attachment>
<script lang="javascript">
async function loadBabelScript(content) {
  return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'text/babel';
      script.setAttribute('data-presets', 'react');
      script.textContent = content;
      script.onerror = function() {
        reject(new Error('Failed to load the Babel script.'));
      };
      document.head.appendChild(script);
      setTimeout(()=>{
        try{
            Babel.transformScriptTags();
            resolve('Babel script has been loaded!');
         } catch (error) {
          reject(error);
        }
      }, 0);
  });
}
    
class ImJoyPlugin {
  async setup() {
    await api.log('initialized')
  }

  async loadJsxScript(script){
      await loadBabelScript(script);
  }

  async run(ctx) {
    if(ctx.data && ctx.data.jsx_script)
      await loadBabelScript(ctx.data.jsx_script);
    else
      await loadBabelScript(await api.getAttachment('react-src'));
  }
}

api.export(new ImJoyPlugin())
</script>

<window lang="html">
<div id="root"></div>
</window>

<style lang="css">
</style>
```


## How to join as a community partner?

Note that in order to contribute resources to the BioImage.IO Model Zoo you do not need to become a community partner. How to contribute resources is described [in the developers guide](https://bioimage.io/docs/#/guides/developers-guide). The role of a community partner is described above.

If you are eligible and willing to join as a community partner, please submit a request issue [here](https://github.com/bioimage-io/collection/issues/new) with relevant information including the following:
1. Description of your software, organization, company or team.
2. Description of the resources that you plan to contribute. Please also include the url to your project repo.
3. Description of future plans on how your project will be maintained.

The admin team of BioImage.IO will discuss the request and decide whether to approve or decline. We will mainly check whether the project are beneficial for the users of BioImage.IO and the requirements for participation are met.

Upon approval, we will guide you to follow these steps in order to incorporate your contribution to BioImage.IO:

1. First, you will need to create a PR to insert relevant metadata into [bioimageio_collection_config.json](https://github.com/bioimage-io/collection/blob/4087336ad00bff0198f5de83c94aa13be357840d/bioimageio_collection_config.json) under `"partners"`. 
Checkout [ilastik partner entry](https://github.com/bioimage-io/collection/blob/4087336ad00bff0198f5de83c94aa13be357840d/bioimageio_collection_config.json#L283-L301) for an example.
2. Then, you will need to add the Community Partner Compatibility Checks. Any community partner is invited to add a GitHub Actions workflow in this repo (please make a PR) that generates reports on its software compatibility with new and updated resources in the bioimage.io collection.
See [ilastik compatibility checks worfklow](https://github.com/bioimage-io/collection/blob/main/.github/workflows/check_compatibility_ilastik.yaml) for an example.

## How to register a software or application?

A community partner can have one or multiple associated software, you can register them in the collection RDF file of your repository (see the previous section about creating a collection repository). A software is categorized as "Application" in the BioImage Model Zoo. The first thing to do is to create an application file in the [ImJoy plugin file format](https://imjoy.io/docs/#/development?id=plugin-file-format). This basically allows you define a landing page for your software with executable features such as download or test run buttons for your software. The most common use case is to create a landing page for your software. Each software will have an unique id, typically in the format of `<community partner id>/<software name>`. Every model can add links (manually when upload or automatically via the CI) to the software. For each model, the user can click the link on top of the model card, and the landing page will be loaded. Through the ImJoy plugin mechanism, the context information contains the current model information will be injected to the landing page, it's up to the developer who made the software app to decided how to use those information.

To see an example, you can find the [source for the ilastik app](https://github.com/ilastik/bioimage-io-resources/blob/main/src/ilastik-app.imjoy.html) and also the corresponding entry in the collection file [here](https://github.com/ilastik/bioimage-io-resources/blob/2d2f1b12b185b1b880bfb679ed2aa981bf88d1ed/collection.yaml#L45-L59).

## How to setup CI service for a community partners' repo?

The CI service is an useful tool to autotomize the maintenance of the model repo and ensure a high quality for all BioImage.IO resources. 
You basically need to add some testing scripts to your repo and  configure it using CI services such as Github Actions,  Travis or Circle CI etc. The testing script will be triggered by a new commit or pull request to the repo. For simplicity, we recommend Github Actions which can be triggered by adding a yaml file under the folder `.github/workflows`. For example, here is an example file [.github/workflows/compile-manifest.yml](https://github.com/deepimagej/models/blob/master/.github/workflows/compile-manifest.yml) that we used to verify the model spec in the central repo.

There are at least three steps are recommended:
 1. Run the [`compile_model_manifest.py`](https://github.com/bioimage-io/bioimage-io-models/blob/master/manifest.bioimage.io.yaml) script to make sure the manifest can be correctly compiled.
 2. Verify the yaml files according to model spec with [.github.com/bioimage-io/python-bioimage-io](https://github.com/bioimage-io/python-bioimage-io).
 3. If possible, test every models added to the repo.

As a start, you can use [.github/workflows/compile-manifest.yml](https://github.com/deepimagej/models/blob/master/.github/workflows/compile-manifest.yml) as your template.

See more information here: https://github.com/bioimage-io/collection-bioimage-io#contribute-resource-test-summaries

## Report User Analytics

We provide the analytics service to help consumer software to keep track of their resource (including model, datasets etc.) downloads.

### Report resource downloads

To help us maintain the resource download statistics at BioImage.IO, please send a report to our analytics service when a resource item is downloaded.

Under the hood, we use [matomo](https://matomo.org) to track the user downloads. It provide tracking api in various programming languages and frameworks, see here: https://developer.matomo.org/api-reference/tracking-api.

The easiest way to report a model download is to send an http request to matomo.


You need to construct an URL to report the download:

`https://bioimage.matomo.cloud/matomo.php?download=https://doi.org/[MODEL DOI]&idsite=1&rec=1&r=646242&h=13&m=35&s=20&url=http://bioimage.io/#/?id=[MODEL DOI]&uadata={"brands":[{"brand":"[CONSUMER ID]","version":"[CONSUMER VERSION]"}]}`


In the above URL, you need to provide the following parameters:
 * `[MODEL DOI]`: The resource doi, it should be similar to `10.5281/zenodo.55555555`. Also note that Zenodo deposit has concept doi and version doi, we recommend to use the concept doi such that the downloads across versions can be aggregated.
 * `[CONSUMER ID]`: The id for the registered consumer software, for example: `ilastik` or `deepimagej`.
 * `[CONSUMER VERSION]`: The software version for the consumer software.


### Obtain resource usage statistics
You can get the user statistics from via the HTTP API, for example:
 * To get the global statistics of the whole website: `https://bioimage.matomo.cloud/?module=API&method=Live.getCounters&idSite=1&lastMinutes=30&format=JSON&token_auth=anonymous`
 * To get the number of downloads: `https://bioimage.matomo.cloud/?module=API&method=Actions.getDownloads&idSite=1&period=year&date=2023-03-01&format=JSON&token_auth=anonymous`
 * To get the number of downloads for a specific resource (via DOI): ```https://bioimage.matomo.cloud/?module=API&method=Actions.getDownload&downloadUrl=https://doi.org/`[MODEL DOI]`&idSite=1&period=year&date=2023-03-01&format=JSON&token_auth=anonymous```. To see an example, click here: https://bioimage.matomo.cloud/?module=API&method=Actions.getDownload&downloadUrl=https://doi.org/test&idSite=1&idCustomReport=1&period=year&date=2023-03-01&format=JSON&token_auth=anonymous

 For more detailed API, see here: https://developer.matomo.org/api-reference/reporting-api

 
Please note that the reports are not processed in realtime, this means you won't see the statistics for your reports immediately:
 - In the report request, we need to configure the date properly. For example, we can change period to `year` and date to `2023-03-01` (see here: https://developer.matomo.org/api-reference/Piwik/Period)
 - The report will only be generated every 15 minutes: https://matomo.org/faq/general/faq_41/ so we won't see the report immediately.

## BioImage.IO Partner Collection

A BioImage.IO partner collection is a YAML file in GitHub repository of a community partner. The file adheres to the collection RDF specification described [here](https://github.com/bioimage-io/spec-bioimage-io#collection-resource-description-file-specification).

The appearance of the partner collection on the website can be customized by the `config` field as described in the next section.  

### Customizing appearance on bioimage.io

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

## How to contribute tests summaries

We provide community partners with a mechanism to contribute and update compatibiliy checks describing why a given bioimage.io resource is compatible with their tool (or why not).
Details and how to set this up are described [here](https://github.com/bioimage-io/collection?tab=readme-ov-file#add-community-partner-compatibility-checks).

### Display of partner test summaries

Once a community partner is setup to contribute test summaries, they will show up in the relevant resource card details on bioimage.io.
Currently test summaries are rendered like so:
![image](https://user-images.githubusercontent.com/15139589/226955477-6f8a8917-423f-4b9e-b08a-17bdb276aa2c.png)
