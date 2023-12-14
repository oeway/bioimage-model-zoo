# Uploading a Model to Zenodo for BioImage Model Zoo

**Note:** This tutorial provides a temporary solution for uploading models to the BioImage Model Zoo via Zenodo while the upload feature on the BioImage.io website is being fixed.

## Purpose
This tutorial will guide you through the process of uploading a model to the BioImage Model Zoo community on Zenodo. The BioImage Model Zoo project aims to collect and share bioimage analysis models, and your contribution is valuable. Follow the steps below to upload your model.

## Uploading a model

1. Open your web browser and navigate to the Zenodo website at [https://zenodo.org/](https://zenodo.org). You need to create a Zenodo account if you do not have one. 
   <!-- ![Zenodo initial page](contribute_models/zenodo_upload_01.png) -->
   <img src="contribute_models/zenodo_upload_01.png" alt="Zenodo initial page" align="center" width="1000"/>
   
2. On the right, close to your username, click the "New upload" button to begin the model upload process. Make sure that the repository is set as public. 
The files in the BioImage.io zip have to be uploaded one-by-one (See the example in the image below). Note that you can drag & drop all together at once.
   <!-- ![New upload](contribute_models/zenodo_upload_04.png) -->
   <img src="contribute_models/zenodo_upload_04.png" alt="New upload" align="center" width="1000"/>

3. Add `bioimage.io` on Keywords and subjects. This is crucial for us to identify your submission.
   <!-- ![Find BioImage.IO community](contribute_models/zenodo_upload_03.png) -->
   <img src="contribute_models/zenodo_upload_03.png" alt="Find BioImage.IO community" align="center" width="1000"/>
   
4. Follow the on-screen instructions to provide the required information about your model. Make sure to include a clear description, relevant tags, and any necessary documentation. See [this documentation](contribute_models/README.md) for more details on the required files and information.

5. Once finished, click on Submit.
   
6. Your model will be proposed as a new contribution to the BioImage Model Zoo automatically. If the model passes all the tests, it will be automatically displayed in the Zoo. If the model does not pass the test, the GitHub users indicated in `maintainers` in the `rdf.yaml` file will be noitified through GitHub. This process can take 12-24h.


## Conclusion
You've successfully uploaded your model to the BioImage Model Zoo community on Zenodo. Thank you for your contribution to the BioImage Model Zoo project. Remember that this is a temporary solution while the upload feature on the BioImage.io website is being fixed. We appreciate your patience and support!
