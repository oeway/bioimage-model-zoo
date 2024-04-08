const axios = require('axios');

// example url: https://bioimage.netlify.app/.netlify/functions/download/10.5281/zenodo.5764892/files/weights.onnx?debug=1
exports.handler = async function(event, context) {
  const queryParams = event.queryStringParameters;
  const uadata = queryParams.uadata || '{"brands":[{"brand":"unknown","version":"unknown"}]}';

  // Extracting the initial DOI from the path, assuming path format and initial parsing logic
  const pathSegments = event.path.split('/').filter(segment => segment);
  if (pathSegments.length < 7) {
    return { statusCode: 400, body: JSON.stringify({ message: "Invalid path format." }) };
  }
  const doi = `${pathSegments[3]}/${pathSegments[4]}`; // Combines "10.5281" and "zenodo.XXXXX"
  const initialDoiUrl = `https://doi.org/${doi}`;

  try {
    // Attempt to resolve the DOI URL without following redirects
    const response = await axios.get(initialDoiUrl, { maxRedirects: 0, validateStatus: status => status >= 300 && status < 400 });
    const finalZenodoUrl = response.headers.location;

    // Extract Zenodo version ID from the redirect URL
    const zenodoVersionIdMatch = finalZenodoUrl.match(/record\/(\d+)/);

    if (!zenodoVersionIdMatch || !zenodoVersionIdMatch[1]) {
      return { statusCode: 500, body: JSON.stringify({ message: "Failed to extract Zenodo version ID.", pathSegments, finalZenodoUrl, zenodoVersionIdMatch}) };
    }
    const zenodoVersionId = zenodoVersionIdMatch[1];

    // Update the DOI and construct URLs with the specific version ID
    const updatedDoi = `10.5281/zenodo.${zenodoVersionId}`;
    const filePath = pathSegments.slice(6).join('/');
    const actualFileUrl = `https://zenodo.org/api/records/${zenodoVersionId}/files/${filePath}/content`;
    const matomoReportUrl = `https://bioimage.matomo.cloud/matomo.php?download=https://doi.org/${updatedDoi}&idsite=1&rec=1&r=646242&h=13&m=35&s=20&url=http://bioimage.io/#/?id=${updatedDoi}&uadata=${encodeURIComponent(uadata)}`;

    if (queryParams.debug) {
      return { statusCode: 200, body: JSON.stringify({ actualFileUrl, matomoReportUrl }) };
    }

    // Log the download event to Matomo
    await axios.get(matomoReportUrl);

    // Redirect to the actual file URL
    return { statusCode: 302, headers: { 'Location': actualFileUrl } };
  } catch (error) {
    // Handle errors during the DOI resolution process or HTTP requests
    return { statusCode: 500, body: JSON.stringify({ message: "Error during processing.", error: error.message }) };
  }
};
