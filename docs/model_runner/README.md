# Model Runner

Model Runners implement the core logic to use a model for inference (or training) in a [consumer software](../consumer_software/README.md). Furthermore, the model runners are used for testing the bioimage.io models independent of a specific consumer software. 
Each Model Runner supports one or more [weight formats](https://github.com/bioimage-io/configuration/blob/master/supported_formats_and_operations.md#weight-formats)
 [consumer software](../consumer_software/README.md).


These Model Runners are currently used by consumer software:
 - pybio runner
   https://github.com/bioimage-io/python-bioimage-io/blob/master/pybio/runners/base.py#L29
   
   used by:
    - ilastik (tiktorch)


