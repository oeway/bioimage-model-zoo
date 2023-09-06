# BioImage Model Zoo: Advanced AI models in one-click

The Bioimage Model Zoo is a community-driven AI model repository. The aim is to facilitate the adoption of AI methods among the bioimaging community by providing easy access to pretrained AI models. By establishing a common Model Resource Description File Specification, the model zoo serves as a distribution point for deep learning models trained to perform bioimage analysis tasks.

Several founding partners including ilastik, ImJoy, Fiji, deepImageJ and ZeroCostDL4Mic are involved in the creation of the model zool and we welcome more community partners to join the efforts. Our vision is to define a common standard which would allow all models in the model zoo to be compatible with community partner tools. Such compatibility will ensure that the models in the model zoo can be interoperable between different tools and truly be used by non-computational biologists through user-friendly interface. 

In addition to the Model Resource Description File Specification, we aim to make cutting-edge AI technology accessible to our users by providing detailed model descriptions, tagging, searching and automatic testing of all submitted models. Models can be directly executed from the site with users' own data samples, and linked to its training data and Jupyter/Colab Notebooks.

The model zoo is open for contributions from the community partners and external individuals. You are welcome to submit models to the model zoo. We will do our best to ensure you have a smooth experience contributing your work which will of course remain in your IP with all necessary attributions. 

<img src="./bioimage_description.png" align="center" width="1000"/>

# Reference publication
Wei Ouyang, Fynn Beuttenmueller, Estibaliz Gómez-de-Mariscal, Constantin Pape, Tom Burke, Carlos Garcia-López-de-Haro, Craig Russell, Lucía Moya-Sans, Cristina de-la-Torre-Gutiérrez, Deborah Schmidt, Dominik Kutra, Maksim Novikov, Martin Weigert, Uwe Schmidt, Peter Bankhead, Guillaume Jacquemet, Daniel Sage, Ricardo Henriques, Arrate Muñoz-Barrutia, Emma Lundberg, Florian Jug, Anna Kreshuk, **BioImage Model Zoo: A Community-Driven Resource for Accessible Deep Learning in BioImage Analysis**, bioRxiv 2022.06.07.495102, doi: [https://doi.org/10.1101/2022.06.07.495102](https://doi.org/10.1101/2022.06.07.495102)

<img src="./bioimage-io-paper-figure-1.png" align="center" width="1000"/>

# Glossary
In the ever-evolving field of bioimage analysis, understanding the terminology is essential. Explore our glossary to familiarize yourself with key terms and concepts used throughout the BioImage Model Zoo project.

| Term                                  | Definition                                                                                                                                                           |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Community Partner**                 | Usually, a community partner is an organization, a company, a research group, or a software team (of one or more) that can consume and/or produce resources of the BioImage Model Zoo. Additionally, most partners continuously and openly contribute resources of their own. The founders community partners represent open source consumer software of [BioImage.IO](http://BioImage.IO/) (e.g. [ilastik](https://www.ilastik.org), [Fiji](https://imagej.net/software/fiji/), [deepImageJ](https://deepimagej.github.io), [ZeroCostDL4Mic](https://github.com/HenriquesLab/ZeroCostDL4Mic), [StarDist](https://github.com/stardist/stardist)). A Community Partner can either be a team behind a software which produces or consumes trained models compatible with the [BioImage.IO](http://bioimage.io/) spec or an organization, group, company or team (of one or more) who contributed and will keep contributing more models to BioImage Model Zoo. |
| **Consumer**                          | Refers to an individual or user who engages with the project by utilizing the pre-existing models available on [BioImage.IO](http://bioimage.io/). Their primary role involves downloading these models and incorporating them into their workflow using compatible software or any specific manner that suits their needs. For example, a Life Scientist can be considered a consumer by accessing the[BioImage.io](http://bioimage.io/), selecting a Deep Learning model relevant to their research, and integrating it into their preferred software, such as deepImageJ or other compatible platforms. As a consumer, their focus lies in leveraging the existing models to enhance their bioimage analysis tasks, thereby benefiting from the diverse range of models provided by the BioImage Model Zoo. |
| **Contributor**                       | A contributor can either be an individual person or a group, entity, or software. As an individual contributor, your primary objective is to actively contribute to the project by uploading models to BioImage Model Zoo. By doing so, you expand the range of available models, enriching the repository and fostering the growth of the bioimage analysis community. As a contributor, you play a crucial role in sharing your expertise and innovative models with the broader community, contributing to advancements in bioimage analysis. Similarly, a software contributor refers to a software application or system that actively participates in the project by uploading models to [BioImage.IO](http://bioimage.io/). These software contributors enhance the available models by providing new and diverse solutions, further expanding the capabilities of the BioImage Model Zoo. Whether you contribute as an individual or a software entity, your active involvement in uploading models to [BioImage.IO](http://bioimage.io/) is instrumental in supporting the project's objectives. By sharing your models, you contribute to the collective knowledge and empower researchers in the bioimage analysis field. |
| **Consumer Software**                 | A consumer software refers to any software application or tool that utilizes the models from the BioImage Model Zoo repository. Consumer software is designed to interact with and make use of the pretrained AI models available in the BioImage Model Zoo. A consumer software is any software application or tool that utilize pretrained AI models for bioimage analysis tasks, either through integration, execution, or interaction with the models available in the BioImage Model Zoo. |
| **Model Resource Description File Specifications (RDF YAML)** | The Model Resource Description File (RDF) specifications refer to a set of guidelines that define the structure and content of a YAML file used to describe the AI models with pretrained weights in a standardized format. The model RDF serves as a metadata file that provides essential information about the model, its properties, and its intended use. The RDF file contains both mandatory and optional fields that capture relevant details about the model, such as its architecture, input/output formats, preprocessing steps, and performance metrics. By following the Model RDF specifications, developers and researchers can create consistent and interoperable descriptions of their AI models, allowing seamless integration and sharing within the [BioImage.IO](http://bioimage.io/) ecosystem. |

# FAQs

Have questions about how to participate, contribute, or engage with the BioImage Model Zoo? Check out our Frequently Asked Questions (FAQs) for detailed answers and insights into making the most of your experience with our project.

### How can I participate in the BioImage Model Zoo?

To participate, you can take on the role of a **Community Partner** or engage as a **Consumer** or **Contributor** of models from the BioImage Model Zoo.

- **Consumer**: As a Consumer, your role involves utilizing the existing models available on bioimage.io by downloading and incorporating them into your workflow using connected software or in any specific manner. For instance, a Life Scientist can be a Consumer by using a Deep Learning model downloaded from bioimage.io and integrating it into any compatible software (deepImageJ, Ilastik, ImJoy, ZeroCostDL4Mic, ...).

- **Contributor**: If your primary objective is to contribute models to bioimage.io, then you are a Contributor. As such, you play a crucial role in expanding the range of available models and supporting the bioimage analysis community.

### What is a Community Partner? Who can be a Community Partner?

Usually, a **Community Partner** is an organization, a company, a research group, or a software team (of one or more) that can consume and/or produce models from/for the BioImage.IO Model Zoo.

The first community partners represent open source consumer software of BioImage.IO (e.g. ilastik, Fiji, deepImageJ, ZeroCostDL4Mic, StarDist).

A Community Partner can either be a team behind a software which produces or consumes trained models compatible with the BioImage.IO specifications or an organization, group, company, or team (of one or more) who contributes models to BioImage.IO.


### How can I upload a model to the BioImage Model Zoo?

To contribute a model to the BioImage Model Zoo, please refer to the [Contribute Models section](https://bioimage.io/docs/#/contribute_models/README). This section provides detailed instructions on how to upload a model, including the necessary steps and required files for your contribution.

### How can I report issues or provide feedback regarding models on BioImage.IO?

If you encounter a bug or wish to share feedback, please use our [GitHub issues page](https://github.com/bioimage-io/bioimage.io/issues). We appreciate your input and kindly request that you ensure your feedback is not duplicated. Your contributions help improve the BioImage Model Zoo for the entire community.

### What is AI4Life?

AI4Life is a project whose goal is to provide sustainable, intuitive, and highest quality research services and infrastructures that will enable all life scientists to exploit machine learning to improve the utility and interpretability of image data, the key to future biomedical research.

### How is AI4Life related to the BioImage Model Zoo?

AI4Life is a project closely aligned with the BioImage Model Zoo. It plays a significant role in supporting and enhancing the BioImage Model Zoo's mission and initiatives.

### Can I use models from the BioImage Model Zoo for commercial purposes?
Yes, you are welcome to use the models from the BioImage Model Zoo for commercial purposes. However, we kindly request that you provide appropriate credits when using these models as a gesture of acknowledgment for the contributions of the model creators and the BioImage Model Zoo community.


# Contact us

If you can't find what you're looking for, there are several ways to communicate with us or get assistance. Here are some options:

- You can ask a question or post in the [Image.sc Forum](https://forum.image.sc) using the tag 'bioimageio'. This way, not only our team but also others facing similar issues can benefit from your post.

- Alternatively, you can contact us through our [contact form](https://oeway.typeform.com/to/K3j2tJt7), and someone will be available to assist with your questions.