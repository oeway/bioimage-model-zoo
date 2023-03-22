# How to contribute tests summaries

As BioImage.IO community partner may contribute test summaries. As defined in [bioimageio.core](https://github.com/bioimage-io/core-bioimage-io-python/blob/d435fcdb38c8b2152ac0d20f61ee498d88e7f1d0/bioimageio/core/common.py#L4) a test summary is a dictionary with the following keys:
 - name: str
 - source_name: str
 - bioimageio_core_version: str
 - bioimageio_spec_version: str
 - error: Union[None, str]
 - nested_errors: Optional[Dict[str, dict]]
 - source_name: str
 - status: Literal["passed", "failed"]
 - traceback: Optional[List[str]]
 - warnings: dict

In the [BioImage.IO collection template](https://github.com/bioimage-io/collection-bioimage-io/blob/main/collection_rdf_template.yaml), where a community partner is registered, the location of `test_summaries` and how to trigger them can be specified as well.
The location of partner test summaries is specified by a GitHub repository `repository`, where test summaries are hosted in `deploy_branch`/`deploy_folder`.
To update the test summaries (for new or updated resources) `workflow` specifies a GitHub Actions workflow to trigger from `workflow_ref` by @bioimageiobot. 
For the automatic trigger machanism to work the partner `repository` needs to invite @bioimageiobot as a collaborator and the `workflow` needs to run on `workflow_dispatch` with a `pending_matrix` input.

Let's take a look at an example: the [ilastik partner entry](https://github.com/bioimage-io/collection-bioimage-io/blob/aa4742d33394809e44e63ce48f9bac9ad3518122/collection_rdf_template.yaml#L63-L68
) below specifies that test summaries are hosted at [ilastik/bioimage-io-resources/tree/gh-pages/test_summaries](https://github.com/ilastik/bioimage-io-resources/tree/gh-pages/test_summaries). 
The [test_bioimageio_resources.yaml](https://github.com/ilastik/bioimage-io-resources/blob/main/.github/workflows/test_bioimageio_resources.yaml) is regularly dispatched by @bioimageiobot to keep test summaries up-to-date.

```yaml
id: ilastik
repository: ilastik/bioimage-io-resources
branch: main
collection_file_name: collection.yaml
test_summaries:
  repository: ilastik/bioimage-io-resources
  deploy_branch: gh-pages
  deploy_folder: test_summaries
  workflow: test_bioimageio_resources.yaml
  workflow_ref: refs/heads/main
```

The test summaries are expected to follow the folder/file name pattern "<resource_id>/<version_id>/test_summary_*.yaml", where * can be any string to differentiate different test settings.

## Display of partner test summaries

Once a community partner is registered to contribute test summaries with the `test_summaries` data explained above, the main [BioImage.IO CI](https://github.com/bioimage-io/collection-bioimage-io/blob/main/.github/workflows/auto_update_main.yaml) collects these summaries and triggers the partner's CI for new or updated resources.
The parter may decide at any time to rerun (some of) their tests if changes on their side (like a new version release of their software) requires additional tests or a reevaluation. 
