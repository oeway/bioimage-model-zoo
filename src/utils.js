import axios from "axios";
import yaml from "js-yaml";
import spdxLicenseList from "spdx-license-list/full";

export const MAX_RDF_VERSION = "0.3.2";

export function randId() {
  return Math.random()
    .toString(36)
    .substr(2, 10);
}

export async function resolveDOI(doi) {
  const response = await fetch("https://doi.org/api/handles/" + doi);
  if (response.ok) {
    const result = await response.json();
    return result.values.filter(v => v.type === "URL")[0].data.value;
  } else {
    throw new Error("Failed to resolve DOI:" + doi);
  }
}

export async function getFullRdfFromDeposit(deposition) {
  const rdf = depositionToRdf(deposition);
  const response = await fetch(rdf.config._rdf_file);
  if (response.ok) {
    const yamlStr = await response.text();
    const fullRdf = yaml.load(yamlStr);
    fullRdf.config = fullRdf.config || {};
    // infer the rdf type for old RDFs
    if (!fullRdf.type && fullRdf.inputs && fullRdf.outputs) {
      fullRdf.type = "model";
    }
    Object.assign(fullRdf.config, rdf.config);
    return fullRdf;
  } else {
    throw new Error(`Failed to fetch RDF file.`);
  }
}

export function rdfToMetadata(rdf, baseUrl, docstring) {
  if (
    rdf.type === "model" &&
    compareVersions(rdf.format_version, ">", MAX_RDF_VERSION)
  ) {
    throw new Error(
      `Unsupported format version ${rdf.format_version} (it must <=${MAX_RDF_VERSION})`
    );
  }
  if (!spdxLicenseList[rdf.license])
    throw new Error(
      "Invalid license, the license identifier must be one from the SPDX license list (https://spdx.org/licenses/)"
    );
  if (!rdf.type) {
    throw new Error("`type` key is not defined in the RDF.");
  }
  rdf.covers = rdf.covers || [];
  const covers = rdf.covers.map(c =>
    c.startsWith("http") ? c : new URL(c, baseUrl).href
  );
  const related_identifiers = [];
  for (let c of covers) {
    if (c.includes("access_token="))
      throw new Error("Cover URL should not contain access token: " + c);
    related_identifiers.push({
      relation: "hasPart", // is part of this upload
      identifier: c,
      resource_type: "image-figure",
      scheme: "url"
    });
  }
  rdf.links = rdf.links || [];
  for (let link of rdf.links) {
    if (link.includes("access_token="))
      throw new Error("Link should not contain access token: " + link);
    related_identifiers.push({
      identifier: "https://bioimage.io/#/r/" + encodeURIComponent(link),
      relation: "references", // is referenced by this upload
      resource_type: "other",
      scheme: "url"
    });
  }
  if (rdf.config._rdf_file)
    // rdf.yaml or model.yaml
    related_identifiers.push({
      identifier: rdf.config._rdf_file.startsWith("http")
        ? rdf.config._rdf_file
        : new URL(rdf.config._rdf_file, baseUrl).href,
      relation: "isCompiledBy", // compiled/created this upload
      resource_type: "other",
      scheme: "url"
    });
  else throw new Error("`_rdf_file` key is not found in the RDF config");

  if (rdf.documentation) {
    if (rdf.documentation.includes("access_token="))
      throw new Error("Documentation URL should not contain access token");
    related_identifiers.push({
      identifier: rdf.documentation.startsWith("http")
        ? rdf.documentation
        : new URL(rdf.documentation, baseUrl).href,
      relation: "isDocumentedBy", // is referenced by this upload
      resource_type: "publication-technicalnote",
      scheme: "url"
    });
  }

  rdf.authors = rdf.authors || [];
  const creators = rdf.authors.map(author => {
    if (typeof author === "string")
      return { name: author.split(";")[0], affiliation: "" };
    else
      return {
        name: author.name.split(";")[0],
        affiliation: author.affiliation,
        orcid: author.orcid
      };
  });
  const description =
    `<a href="https://bioimage.io/#/p/zenodo:${encodeURIComponent(
      rdf.config._deposit.id
    )}"><span class="label label-success">Download RDF Package</span></a><br>` +
    (docstring || `<p>${docstring}</p>`);
  const keywords = ["bioimage.io", "bioimage.io:" + rdf.type];
  const metadata = {
    title: rdf.name,
    description,
    access_right: "open",
    license: rdf.license,
    upload_type: "other",
    creators: creators,
    publication_date: new Date().toISOString().split("T")[0],
    keywords: keywords.concat(rdf.tags),
    notes: rdf.description + " (Uploaded via https://bioimage.io)",
    related_identifiers,
    communities: []
  };
  return metadata;
}

export function depositionToRdf(deposition) {
  const metadata = deposition.metadata;
  let type = metadata.keywords.filter(k => k.startsWith("bioimage.io:"))[0];
  if (!type) {
    throw new Error(
      `deposit (${deposition.id}) does not contain a bioimage.io type keyword starts with "bioimage.io:<TYPE>"`
    );
  }
  type = type.replace("bioimage.io:", "");
  const covers = [];
  const links = [];
  let rdfFile = null;
  let documentation = null;
  // TODO: deprecate file:// format
  for (let idf of metadata.related_identifiers) {
    if (idf.relation === "isCompiledBy" && idf.scheme === "url") {
      rdfFile = idf.identifier;
      if (rdfFile.startsWith("file://")) {
        rdfFile = rdfFile.replace("file://", deposition.links.bucket + "/");
      } else if (rdfFile.includes(`${deposition.id}/files/`)) {
        const fileName = rdfFile.split("/files/")[1];
        rdfFile = `${deposition.links.bucket}/${fileName}`;
      } else {
        throw new Error("Invalid file identifier: " + idf.identifier);
      }
    } else if (
      idf.relation === "hasPart" &&
      idf.resource_type === "image-figure" &&
      idf.scheme === "url"
    ) {
      let url = idf.identifier;
      if (url.startsWith("file://")) {
        url = url.replace("file://", deposition.links.bucket + "/");
      } else if (url.includes(`${deposition.id}/files/`)) {
        const fileName = url.split("/files/")[1];
        url = `${deposition.links.bucket}/${fileName}`;
      } else {
        throw new Error("Invalid file identifier: " + idf.identifier);
      }
      covers.push(url);
    } else if (
      idf.relation === "references" &&
      idf.scheme === "url" &&
      idf.identifier.startsWith("https://bioimage.io/#/r/")
    ) {
      // links
      const id = idf.identifier.replace("https://bioimage.io/#/r/", "");
      links.push(decodeURIComponent(id));
    } else if (idf.relation === "isDocumentedBy" && idf.scheme === "url") {
      // links
      documentation = idf.identifier;
    }
  }
  // strip the html tags
  const div = document.createElement("div");
  div.innerHTML = metadata.description;
  const description = div.textContent || div.innerText || "";
  if (!rdfFile) {
    throw new Error(
      `Invalid deposit (${deposition.id}), rdf.yaml or model.yaml is not defined in the metadata (as part of the "related_identifiers")`
    );
  }
  return {
    id: metadata.doi,
    name: metadata.title,
    type,
    authors: metadata.creators,
    tags: metadata.keywords
      .filter(k => k !== "bioimage.io" || !k.startsWith("bioimage.io:"))
      .concat(["zenodo"]),
    description,
    license:
      typeof metadata.license === "string"
        ? metadata.license
        : metadata.license.id, // sometimes it doesn't contain id
    documentation,
    covers,
    source: rdfFile, //TODO: fix for other RDF types
    links,
    config: {
      _doi: metadata.doi,
      _deposit: deposition,
      _rdf_file: rdfFile
    }
  };
}

export class ZenodoClient {
  constructor(baseURL, clientId, isSandbox) {
    this.baseURL = baseURL;
    this.clientId = clientId;
    this.isSandbox = isSandbox;
    this.callbackUrl = encodeURIComponent("https://imjoy.io/login-helper");
    this.credential = null;
    try {
      let lastCredential = localStorage.getItem("zenodo_credential");
      if (lastCredential) {
        this.credential = JSON.parse(lastCredential);
        // check if it's still valid
        this.getCredential();
      }
    } catch (e) {
      console.error("Failed to reset zenodo_credential");
      localStorage.removeItem("zenodo_credential");
    }
  }

  async getCredential(login) {
    if (this.credential) {
      if (
        this.credential.create_at +
          parseInt(this.credential.expires_in) * 1000 >
        Date.now() - 10000
      ) {
        // add extra 10s to make sure
        return this.credential;
      } else {
        this.credential = null;
        try {
          localStorage.removeItem("zenodo_credential");
        } catch (e) {
          console.error("Failed to reset zenodo_credential");
        }
      }
    }
    if (login) {
      try {
        await this.login();
      } catch (e) {
        if (confirm(`Failed to login: ${e}, would you like to try again?`)) {
          return await this.getCredential(login);
        }
        throw e;
      }
    }
    return this.credential;
  }

  async getResourceItems({ page, type, keywords, query, sort, size }) {
    page = page || 1;
    type = type || "all";
    keywords = keywords || [];
    if (!keywords.includes("bioimage.io")) keywords.push("bioimage.io");
    size = size || 20;
    sort = sort || "mostviewed";
    const typeKeywords = type !== "all" ? "&keywords=bioimage.io:" + type : "";
    const additionalKeywords =
      typeKeywords +
      (keywords.length > 0
        ? "&" + keywords.map(kw => "keywords=" + kw).join("&")
        : "") +
      (query ? "&q=" + query : "");
    const url =
      `${this.baseURL}/api/records/?communities=bioimage-io&sort=${sort}&page=${page}&size=${size}` +
      additionalKeywords; //&all_versions
    const response = await fetch(url);
    const results = JSON.parse(await response.text());
    const hits = results.hits.hits;

    const resourceItems = hits.map(item => {
      try {
        return depositionToRdf(item);
      } catch (e) {
        console.warn(e);
        return null;
      }
    });
    return resourceItems.filter(item => !!item);
  }

  login() {
    return new Promise((resolve, reject) => {
      const loginWindow = window.open(
        `${this.baseURL}/oauth/authorize?scope=deposit%3Awrite+deposit%3Aactions&state=CHANGEME&redirect_uri=${this.callbackUrl}&response_type=token&client_id=${this.clientId}`,
        "Login"
      );
      try {
        loginWindow.focus();
      } catch (e) {
        reject(
          "Login window blocked. If you have a popup blocker enabled, please add bioimage.io to your exception list."
        );
        return;
      }

      let countDown = 120;
      let loggedIn = false;
      const timer = setInterval(function() {
        if (loggedIn) {
          clearInterval(timer);
          return;
        }
        if (loginWindow.closed) {
          clearInterval(timer);
          reject("User canceled login");
        } else {
          countDown--;
          if (countDown <= 0) {
            clearInterval(timer);
            loginWindow.close();
            // make sure we closed the window
            reject("Timeout error");
          }
        }
      }, 1000);
      const handleLogin = event => {
        if (loginWindow === event.source) {
          // run only once
          window.removeEventListener("message", handleLogin);
          clearInterval(timer);
          loginWindow.close();
          if (event.data.error) {
            // make sure we closed the window
            setTimeout(() => {
              reject(event.data.error);
            }, 1);
            return;
          }
          loggedIn = true;
          console.log("Successfully logged in", event.data);
          this.credential = event.data;
          this.credential.user_id = parseInt(
            /'id': u'([0-9]+)'/gm.exec(event.data.user)[1]
          );
          this.credential.create_at = Date.now();
          resolve(event.data);
          localStorage.setItem(
            "zenodo_credential",
            JSON.stringify(this.credential)
          );
        }
      };
      window.addEventListener("message", handleLogin, false);
    });
  }

  async createDeposition() {
    let response = await fetch(
      `${this.baseURL}/api/deposit/depositions?access_token=${this.credential.access_token}`
    );
    console.log(await response.json());
    const headers = { "Content-Type": "application/json" };
    // create an empty deposition
    response = await fetch(
      `${this.baseURL}/api/deposit/depositions?access_token=${this.credential.access_token}`,
      { method: "POST", body: JSON.stringify({}), headers }
    );
    const depositionInfo = await response.json();
    return depositionInfo;
  }

  async getDeposit(depositionInfo) {
    const depositionId = depositionInfo.id ? depositionInfo.id : depositionInfo;
    const response = await fetch(
      `${this.baseURL}/api/records/${depositionId}`,
      { method: "GET" }
    );
    if (response.ok) return await response.json();
    else {
      throw new Error("Failed to get deposit: " + depositionId);
    }
  }

  async retrieve(depositionInfo) {
    const depositionId = depositionInfo.id ? depositionInfo.id : depositionInfo;
    const response = await fetch(
      `${this.baseURL}/api/deposit/depositions/${depositionId}?access_token=${this.credential.access_token}`,
      { method: "GET" }
    );
    if (response.ok) return await response.json();
    else {
      throw new Error("Failed to retrieve deposit: " + depositionId);
    }
  }

  async edit(depositionInfo) {
    const depositionId = depositionInfo.id ? depositionInfo.id : depositionInfo;
    const headers = { "Content-Type": "application/json" };
    const response = await fetch(
      `${this.baseURL}/api/deposit/depositions/${depositionId}/actions/edit?access_token=${this.credential.access_token}`,
      { method: "POST", body: JSON.stringify({}), headers }
    );
    if (response.ok) return await response.json();
    else {
      throw new Error("Failed to edit deposit: " + depositionId);
    }
  }

  async discard(depositionInfo) {
    const depositionId =
      typeof depositionInfo === "string" ? depositionInfo : depositionInfo.id;
    const headers = { "Content-Type": "application/json" };
    const response = await fetch(
      `${this.baseURL}/api/deposit/depositions/${depositionId}/actions/discard?access_token=${this.credential.access_token}`,
      { method: "POST", body: JSON.stringify({}), headers }
    );
    if (response.ok) return await response.json();
    else {
      throw new Error("Failed to discard deposit: " + depositionId);
    }
  }

  async createNewVersion(depositionInfo) {
    const depositionId =
      typeof depositionInfo === "string" ? depositionInfo : depositionInfo.id;
    const headers = { "Content-Type": "application/json" };
    const response = await fetch(
      `${this.baseURL}/api/deposit/depositions/${depositionId}/actions/newversion?access_token=${this.credential.access_token}`,
      { method: "POST", body: JSON.stringify({}), headers }
    );
    if (response.ok) return await response.json();
    else {
      throw new Error(
        "Failed to create a new version for deposit: " + depositionId
      );
    }
  }

  async updateMetadata(depositionInfo, metadata) {
    const depositionId =
      typeof depositionInfo === "string" ? depositionInfo : depositionInfo.id;
    console.log(`Updating deposition metadata of ${depositionId}:`, metadata);
    const headers = { "Content-Type": "application/json" };
    const response = await fetch(
      `${this.baseURL}/api/deposit/depositions/${depositionId}?access_token=${this.credential.access_token}`,
      { method: "PUT", body: JSON.stringify({ metadata }), headers }
    );
    if (response.ok) return await response.json();
    else {
      const details = await response.json();
      throw new Error(
        "Failed to update metadata, error: " + JSON.stringify(details.errors)
      );
    }
  }

  async uploadFile(depositionInfo, file, progressCallback) {
    const bucketUrl = depositionInfo.links.bucket;
    const fileName = file.name;
    const url = `${bucketUrl}/${fileName}?access_token=${this.credential.access_token}`;
    if (typeof axios === "undefined") {
      if (progressCallback) progressCallback(0);
      const response = await fetch(url, {
        method: "PUT",
        body: file
      });
      if (progressCallback) progressCallback(file.size);
      return await response.json();
    } else {
      const options = {
        headers: { "Content-Type": file.type },
        onUploadProgress: progressEvent => {
          if (progressCallback) progressCallback(progressEvent.loaded);
          else {
            const progress = Math.round(
              ((1.0 * progressEvent.loaded) / file.size) * 100.0
            );
            console.log(
              "uploading annotation, size: " +
                Math.round(progressEvent.loaded / 1000000) +
                "MB, " +
                progress +
                "% uploaded."
            );
          }
        }
      };
      const response = await axios.put(url, file, options);
      return response.data;
    }
  }

  async publish(depositionInfo) {
    const depositionId = depositionInfo.id ? depositionInfo.id : depositionInfo;
    const headers = { "Content-Type": "application/json" };
    const response = await fetch(
      `${this.baseURL}/api/deposit/depositions/${depositionId}/actions/publish?access_token=${this.credential.access_token}`,
      { method: "POST", body: JSON.stringify({}), headers }
    );
    if (response.ok) {
      const result = await response.json();
      if (result.submitted && result.doi_url) {
        return result;
      } else {
        throw new Error("Failed to publish, error: " + JSON.stringify(result));
      }
    } else {
      const details = await response.json();
      throw new Error(
        "Failed to publish, error: " + JSON.stringify(details.errors)
      );
    }
  }
}

export function compareVersions(v1, comparator, v2) {
  comparator = comparator == "=" ? "==" : comparator;
  if (
    ["==", "===", "<", "<=", ">", ">=", "!=", "!=="].indexOf(comparator) == -1
  ) {
    throw new Error("Invalid comparator. " + comparator);
  }
  var v1parts = v1.split("."),
    v2parts = v2.split(".");
  var maxLen = Math.max(v1parts.length, v2parts.length);
  var part1, part2;
  var cmp = 0;
  for (var i = 0; i < maxLen && !cmp; i++) {
    part1 = parseInt(v1parts[i], 10) || 0;
    part2 = parseInt(v2parts[i], 10) || 0;
    if (part1 < part2) cmp = 1;
    if (part1 > part2) cmp = -1;
  }
  return eval("0" + comparator + cmp);
}

export const anonymousAnimals = [
  "Duck",
  "Rabbit",
  "Ifrit",
  "Ibex",
  "Turtle",
  "Leopard",
  "Gopher",
  "Ferret",
  "Beaver",
  "Chinchilla",
  "Auroch",
  "Dingo",
  "Kraken",
  "Rhino",
  "Python",
  "Cormorant",
  "Platypus",
  "Elephant",
  "Jackal",
  "Dolphin",
  "Capybara",
  "Camel",
  "Chupacabra",
  "Tiger",
  "Kangaroo",
  "Armadillo",
  "Sheep",
  "Panda",
  "Hippo",
  "Cheetah",
  "Manatee",
  "Raccoon",
  "Wombat",
  "Dinosaur",
  "Hyena",
  "Crow",
  "Orangutan",
  "Wolf",
  "Chameleon",
  "Shrew",
  "Penguin",
  "Nyan Cat",
  "Liger",
  "Quagga",
  "Squirrel",
  "Wolverine",
  "Axolotl",
  "Anteater",
  "Frog",
  "Narwhal",
  "Mink",
  "Chipmunk",
  "Buffalo",
  "Monkey",
  "Bat",
  "Giraffe",
  "Iguana",
  "Fox",
  "Coyote",
  "Moose",
  "Otter",
  "Grizzly",
  "Koala",
  "Alligator",
  "Pumpkin",
  "Llama",
  "Badger",
  "Walrus",
  "Skunk",
  "Lemur",
  "Hedgehog"
];

export function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this,
      args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

export function concatAndResolveUrl(url, concat) {
  const url1 = url.split("/");
  const url2 = concat.split("/");
  const url3 = [];
  for (let i = 0, l = url1.length; i < l; i++) {
    if (url1[i] == "..") {
      url3.pop();
    } else if (url1[i] == ".") {
      continue;
    } else {
      url3.push(url1[i]);
    }
  }
  for (let i = 0, l = url2.length; i < l; i++) {
    if (url2[i] == "..") {
      url3.pop();
    } else if (url2[i] == ".") {
      continue;
    } else {
      url3.push(url2[i]);
    }
  }
  return url3.join("/");
}

function rel2abs(url, base_url) {
  /* Only accept commonly trusted protocols:
   * Only data-image URLs are accepted, Exotic flavours (escaped slash,
   * html-entitied characters) are not supported to keep the function fast */
  if (
    /^(https?|file|ftps?|mailto|javascript|data:image\/[^;]{2,9};):/i.test(url)
  )
    return url; //Url is already absolute
  if (url.substring(0, 2) == "//") return location.protocol + url;
  else if (url.charAt(0) == "/") return base_url + url.slice(1);
  else if (/^\s*$/.test(url)) return ""; //Empty = Return nothing

  url = base_url + url;
  while (/\/\.\.\//.test((url = url.replace(/[^/]+\/+\.\.\//g, ""))));

  /* Escape certain characters to prevent XSS */
  url = url
    .replace(/\.$/, "")
    .replace(/\/\./g, "")
    .replace(/"/g, "%22")
    .replace(/'/g, "%27")
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E");
  return url;
}

export function replaceAllRelByAbs(html, base_url) {
  /*HTML/XML Attribute may not be prefixed by these characters (common 
     attribute chars.  This list is not complete, but will be sufficient
     for this function (see http://www.w3.org/TR/REC-xml/#NT-NameChar). */
  var att = "[^-a-z0-9:._]";
  if (!base_url.endsWith("/")) base_url = base_url + "/";

  var entityEnd = "(?:;|(?!\\d))";
  var ents = {
    " ": "(?:\\s|&nbsp;?|&#0*32" + entityEnd + "|&#x0*20" + entityEnd + ")",
    "(": "(?:\\(|&#0*40" + entityEnd + "|&#x0*28" + entityEnd + ")",
    ")": "(?:\\)|&#0*41" + entityEnd + "|&#x0*29" + entityEnd + ")",
    ".": "(?:\\.|&#0*46" + entityEnd + "|&#x0*2e" + entityEnd + ")"
  };
  /* Placeholders to filter obfuscations */
  var charMap = {};
  var s = ents[" "] + "*"; //Short-hand for common use
  var any = "(?:[^>\"']*(?:\"[^\"]*\"|'[^']*'))*?[^>]*";
  /* ^ Important: Must be pre- and postfixed by < and >.
   *   This RE should match anything within a tag!  */

  /*
    @name ae
    @description  Converts a given string in a sequence of the original
                    input and the HTML entity
    @param String string  String to convert
    */
  function ae(string) {
    var all_chars_lowercase = string.toLowerCase();
    if (ents[string]) return ents[string];
    var all_chars_uppercase = string.toUpperCase();
    var RE_res = "";
    for (var i = 0; i < string.length; i++) {
      var char_lowercase = all_chars_lowercase.charAt(i);
      if (charMap[char_lowercase]) {
        RE_res += charMap[char_lowercase];
        continue;
      }
      var char_uppercase = all_chars_uppercase.charAt(i);
      var RE_sub = [char_lowercase];
      RE_sub.push("&#0*" + char_lowercase.charCodeAt(0) + entityEnd);
      RE_sub.push(
        "&#x0*" + char_lowercase.charCodeAt(0).toString(16) + entityEnd
      );
      if (char_lowercase != char_uppercase) {
        /* Note: RE ignorecase flag has already been activated */
        RE_sub.push("&#0*" + char_uppercase.charCodeAt(0) + entityEnd);
        RE_sub.push(
          "&#x0*" + char_uppercase.charCodeAt(0).toString(16) + entityEnd
        );
      }
      RE_sub = "(?:" + RE_sub.join("|") + ")";
      RE_res += charMap[char_lowercase] = RE_sub;
    }
    return (ents[string] = RE_res);
  }

  /*
    @name by
    @description  2nd argument for replace().
    */
  function by(match, group1, group2, group3) {
    /* Note that this function can also be used to remove links:
     * return group1 + "javascript://" + group3; */
    return group1 + rel2abs(group2, base_url) + group3;
  }
  /*
    @name by2
    @description  2nd argument for replace(). Parses relevant HTML entities
    */
  var slashRE = new RegExp(ae("/"), "g");
  var dotRE = new RegExp(ae("."), "g");
  function by2(match, group1, group2, group3) {
    /*Note that this function can also be used to remove links:
     * return group1 + "javascript://" + group3; */
    group2 = group2.replace(slashRE, "/").replace(dotRE, ".");
    return group1 + rel2abs(group2, base_url) + group3;
  }
  /*
    @name cr
    @description            Selects a HTML element and performs a
                              search-and-replace on attributes
    @param String selector  HTML substring to match
    @param String attribute RegExp-escaped; HTML element attribute to match
    @param String marker    Optional RegExp-escaped; marks the prefix
    @param String delimiter Optional RegExp escaped; non-quote delimiters
    @param String end       Optional RegExp-escaped; forces the match to end
                            before an occurence of <end>
   */
  function cr(selector, attribute, marker, delimiter, end) {
    if (typeof selector == "string") selector = new RegExp(selector, "gi");
    attribute = att + attribute;
    marker = typeof marker == "string" ? marker : "\\s*=\\s*";
    delimiter = typeof delimiter == "string" ? delimiter : "";
    end = typeof end == "string" ? "?)(" + end : ")(";
    var re1 = new RegExp(
      "(" + attribute + marker + '")([^"' + delimiter + "]+" + end + ")",
      "gi"
    );
    var re2 = new RegExp(
      "(" + attribute + marker + "')([^'" + delimiter + "]+" + end + ")",
      "gi"
    );
    var re3 = new RegExp(
      "(" +
        attribute +
        marker +
        ")([^\"'][^\\s>" +
        delimiter +
        "]*" +
        end +
        ")",
      "gi"
    );
    html = html.replace(selector, function(match) {
      return match
        .replace(re1, by)
        .replace(re2, by)
        .replace(re3, by);
    });
  }
  /* 
    @name cri
    @description            Selects an attribute of a HTML element, and
                              performs a search-and-replace on certain values
    @param String selector  HTML element to match
    @param String attribute RegExp-escaped; HTML element attribute to match
    @param String front     RegExp-escaped; attribute value, prefix to match
    @param String flags     Optional RegExp flags, default "gi"
    @param String delimiter Optional RegExp-escaped; non-quote delimiters
    @param String end       Optional RegExp-escaped; forces the match to end
                              before an occurence of <end>
   */
  function cri(selector, attribute, front, flags, delimiter, end) {
    if (typeof selector == "string") selector = new RegExp(selector, "gi");
    attribute = att + attribute;
    flags = typeof flags == "string" ? flags : "gi";
    var re1 = new RegExp("(" + attribute + '\\s*=\\s*")([^"]*)', "gi");
    var re2 = new RegExp("(" + attribute + "\\s*=\\s*')([^']+)", "gi");
    var at1 = new RegExp("(" + front + ')([^"]+)(")', flags);
    var at2 = new RegExp("(" + front + ")([^']+)(')", flags);
    let handleAttr;
    if (typeof delimiter == "string") {
      end = typeof end == "string" ? end : "";
      var at3 = new RegExp(
        "(" +
          front +
          ")([^\"'][^" +
          delimiter +
          "]*" +
          (end ? "?)(" + end + ")" : ")()"),
        flags
      );
      handleAttr = function(match, g1, g2) {
        return (
          g1 +
          g2
            .replace(at1, by2)
            .replace(at2, by2)
            .replace(at3, by2)
        );
      };
    } else {
      handleAttr = function(match, g1, g2) {
        return g1 + g2.replace(at1, by2).replace(at2, by2);
      };
    }
    html = html.replace(selector, function(match) {
      return match.replace(re1, handleAttr).replace(re2, handleAttr);
    });
  }

  /* <meta http-equiv=refresh content="  ; url= " > */
  cri(
    "<meta" +
      any +
      att +
      'http-equiv\\s*=\\s*(?:"' +
      ae("refresh") +
      '"' +
      any +
      ">|'" +
      ae("refresh") +
      "'" +
      any +
      ">|" +
      ae("refresh") +
      "(?:" +
      ae(" ") +
      any +
      ">|>))",
    "content",
    ae("url") + s + ae("=") + s,
    "i"
  );

  cr("<" + any + att + "href\\s*=" + any + ">", "href"); /* Linked elements */
  cr("<" + any + att + "src\\s*=" + any + ">", "src"); /* Embedded elements */

  cr(
    "<object" + any + att + "data\\s*=" + any + ">",
    "data"
  ); /* <object data= > */
  cr(
    "<applet" + any + att + "codebase\\s*=" + any + ">",
    "codebase"
  ); /* <applet codebase= > */

  /* <param name=movie value= >*/
  cr(
    "<param" +
      any +
      att +
      'name\\s*=\\s*(?:"' +
      ae("movie") +
      '"' +
      any +
      ">|'" +
      ae("movie") +
      "'" +
      any +
      ">|" +
      ae("movie") +
      "(?:" +
      ae(" ") +
      any +
      ">|>))",
    "value"
  );

  cr(
    /<style[^>]*>(?:[^"']*(?:"[^"]*"|'[^']*'))*?[^'"]*(?:<\/style|$)/gi,
    "url",
    "\\s*\\(\\s*",
    "",
    "\\s*\\)"
  ); /* <style> */
  cri(
    "<" + any + att + "style\\s*=" + any + ">",
    "style",
    ae("url") + s + ae("(") + s,
    0,
    s + ae(")"),
    ae(")")
  ); /*< style=" url(...) " > */
  return html;
}
