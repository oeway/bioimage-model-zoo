# Contribute to BioImage.IO

You are welcome to submit your **models**, **datasest**, **applicaitons** and Jupyter **notebooks** to BioImage.IO.

To add an resource item to BioImage.IO, you need to provide a set of basic information about the resouce, including name, description, authors etc. and we will generate a resource card to display in the website.

## Submit to BioImage.IO
* Step 1, prepare a [`Resource Description File`](https://github.com/bioimage-io/bioimage.io/blob/master/docs/resource-description-file.md)(RDF)
    - For models (type=`model`), please refer to the extended model fields [here](https://github.com/bioimage-io/configuration/).
    
    - For applications (type=`application`), while you can use the basic RDF format to describe your software, it is recommended to build BioEngine Apps such that users can directly try and use them in BioImage.IO. See [here](https://github.com/bioimage-io/bioimage.io/blob/master/docs/build-bioengine-apps.md) for more details.

    - For datasets (type=`dataset`), notebooks (type=`notebook`) and other potential resources, you can use the [basic RDF format](https://github.com/bioimage-io/bioimage.io/blob/master/docs/resource-description-file.md).

* Step 2, save the RDF file in one of the public git hosting website, it is recommended to store the RDF file in your project git repository on Github/Gitlab/Bitbucket (make sure it's a public repo). Alternatively, you can post it on [Gist](https://gist.github.com/), copy the the **raw** url to the actual file content.

* Step 3, post the url to the comment box below (if you don't see it, click [here](https://github.com/bioimage-io/bioimage-io-models/issues/26)). And the admin team will check and verify the format and incooperate to BioImage.IO if the submitted file is qualified.

