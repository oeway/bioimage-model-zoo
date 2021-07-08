# Model Runner

Model Runners implement the core logic to use a model for inference (or training) in a [consumer software](README.md). Furthermore, the model runners are used for testing the bioimage.io models independent of a specific consumer software. 
Each Model Runner supports one or more [weight formats](https://github.com/bioimage-io/spec-bioimage-io/blob/master/supported_formats_and_operations.md#weight-formats)
 [consumer software](README.md).


These Model Runners are currently used by consumer software:

| model runner | used by ilastik | used by DeepImageJ | used by Fiji |
| --- | --- | --- | --- |
| tiktorch runner: https://github.com/ilastik/tiktorch/tree/master/tiktorch/runner | yes | no | no |
