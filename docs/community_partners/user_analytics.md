# User Analytics

We provide the analytics service to help consumer software to keep track of their resource (including model, datasets etc.) downloads.

## Report resource downloads

To help us maintain the resource download statistics at BioImage.IO, please send a report to our analytics service when a resource item is downloaded.

Under the hood, we use [matomo](https://matomo.org) to track the user downloads. It provide tracking api in various programming languages and frameworks, see here: https://developer.matomo.org/api-reference/tracking-api.

The easiest way to report a model download is to send an http request to matomo.


You need to construct an URL to report the download:

`https://bioimage.matomo.cloud/matomo.php?download=https://doi.org/[MODEL DOI]&idsite=1&rec=1&r=646242&h=13&m=35&s=20&url=http://bioimage.io/#/?id=[MODEL DOI]&uadata={"brands":[{"brand":"[CONSUMER ID]","version":"[CONSUMER VERSION]"}]}`


In the above URL, you need to provide the following parameters:
 * `[MODEL DOI]`: The resource doi, it should be similar to `10.5281/zenodo.55555555`. Also note that Zenodo deposit has concept doi and version doi, we recommend to use the concept doi such that the downloads across versions can be aggregated.
 * `[CONSUMER ID]`: The id for the registered consumer software, for example: `ilastik` or `deepimagej`.
 * `[CONSUMER VERSION]`: The software version for the consumer software.


## Obtain resource usage statistics
You can get the user statistics from via the HTTP API, for example:
 * To get the global statistics of the whole website: `https://bioimage.matomo.cloud/?module=API&method=Live.getCounters&idSite=1&lastMinutes=30&format=JSON&token_auth=anonymous`
 * To get the number of downloads: `https://bioimage.matomo.cloud/?module=API&method=Actions.getDownloads&idSite=1&period=day&date=yesterday&format=JSON&token_auth=anonymous`
 * To get the number of downloads for a specific resource (via DOI): ```https://bioimage.matomo.cloud/?module=API&method=Actions.getDownload&downloadUrl=https://doi.org/`[MODEL DOI]`&idSite=1&period=day&date=yesterday&format=JSON&token_auth=anonymous```

 For more detailed API, see here: https://developer.matomo.org/api-reference/reporting-api

 

