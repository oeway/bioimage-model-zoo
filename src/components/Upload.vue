<template>
  <div
    class="upload width-limited"
    :style="{
      height: !client.credential ? 'calc(100vh - 70px)' : '',
      'background-image': !client.credential
        ? 'url(' + siteConfig.background_image + ')'
        : null,
    }"
  >
    <b-notification
      v-if="client.isSandbox"
      type="is-warning"
      has-icon
      aria-close-label="Close notification"
      role="alert"
    >
      You are using the development mode of the upload feature, this means files
      will be uploaded to the sandbox version of Zenodo
      (https://sandbox.zenodo.org). The uploaded files can be removed from
      Zenodo at any time without notice. This is temporary. In the future, the
      upload feature will connect to the main Zenodo storage and allow permanent
      storage of your data.
    </b-notification>
    <b-steps
      style="margin-top: 20px"
      position="left"
      :has-navigation="false"
      v-model="stepIndex"
      label-position="right"
    >
      <b-step-item :disabled="rdfYaml" label="Start" icon="file">
        <b-field
          v-if="!client.credential"
          label="Please login or signup to Zenodo.org"
          message="BioImage.IO uses https://zenodo.org as storage service, you will need to sign up or login to Zenodo, and allow BioImage.IO to upload files to zenodo on your behalf."
          expanded
        >
          <b-button
            style="text-transform: none"
            class="button is-fullwidth is-primary"
            @click="login()"
            expanded
            icon-left="login"
            >Login to Zenodo</b-button
          >
        </b-field>
        <b-field
          v-else
          label="You have already logged in via Zenodo"
          message="BioImage.IO uses https://zenodo.org as storage service, you will need to sign up or login to Zenodo, and allow BioImage.IO to upload files to zenodo on your behalf."
          expanded
        >
          <b-button
            style="text-transform: none"
            class="button is-small"
            @click="client.logout()"
            icon-left="logout"
            >Logout</b-button
          >
        </b-field>

        <b-field
          v-if="client.credential"
          label="Option 1: Select a local file"
          expanded
        >
          <b-upload
            v-model="dropFile"
            @input="fileSelected(dropFile)"
            drag-drop
            expanded
          >
            <section class="section">
              <div class="content has-text-centered">
                <p>
                  <b-icon icon="upload" size="is-large"></b-icon>
                </p>
                <p>
                  Please select the zip package (*.zip) or the RDF file (*.yaml)
                </p>
                <p>Drop your files here or click to upload</p>
              </div>
            </section>
          </b-upload>
        </b-field>
        <b-field
          v-if="client.credential"
          label="Option 2: Input RDF fields manually"
        >
          <b-button
            style="text-transform: none"
            class="button is-fullwidth"
            @click="initializeRdfForm()"
            expanded
            >Fill the RDF form</b-button
          >
        </b-field>
        <b-field
          v-if="client.credential"
          label="Option 3: Load from DOI or URL"
          message="A URI can be a Zenodo DOI, Zenodo URL or Github URL to the RDF file"
        >
          <b-input
            type="url"
            placeholder="Type a DOI or URL here"
            v-model="URI4Load"
          >
          </b-input>
        </b-field>

        <b-button
          v-if="client.credential"
          style="text-transform: none"
          class="button is-fullwidth"
          @click="loadRdfFromURL(URI4Load)"
          expanded
          >Load</b-button
        >
      </b-step-item>

      <b-step-item label="Edit" icon="pencil" :disabled="!rdfYaml">
        <section style="padding: 20px">
          <form-json
            v-if="jsonFields && jsonFields.length > 0"
            :btnReset="{ value: 'Reset' }"
            :btnSubmit="{ value: 'OK' }"
            :camelizePayloadKeys="false"
            :formFields="jsonFields"
            :formName="'metadata'"
            @formSubmitted="formSubmitted"
            :components="components"
          >
          </form-json>
          <br />
          <b-field
            label="Optionally, you can update the form with values from an local RDF file"
            message="Note: This operation will overwrite the values in the above RDF form, if you have further changes to make, please load the local RDF file first, then make changes in the form."
            expanded
          >
            <b-upload
              v-model="newRDFFile"
              @input="updateFormWithLocalFile(newRDFFile)"
              class="file-label"
            >
              <span class="file-cta">
                <b-icon class="file-icon" icon="upload"></b-icon>
                <span class="file-label"
                  >Load a local RDF file [{{
                    newRDFFile ? newRDFFile.name : ""
                  }}]</span
                >
              </span>
            </b-upload>
          </b-field>
        </section>
      </b-step-item>

      <b-step-item label="Review & Upload" icon="upload">
        <b-field
          label="RDF content"
          style="height: 260px; overflow: auto"
          v-if="rdfYaml"
        >
          <markdown
            v-if="rdfYaml"
            baseUrl=""
            :content="formatedModelYaml"
          ></markdown>
        </b-field>
        <b-field
          v-if="zipPackage"
          label="Files"
          message="These files will be uploaded"
        >
          <b-taglist attached rounded>
            <b-tag
              v-for="(file, name) in zipPackage.files"
              :key="name"
              rounded
              >{{ name }}</b-tag
            >
          </b-taglist>
        </b-field>
        <b-field
          v-else-if="editedFiles"
          label="Files"
          message="The following files will be updated"
        >
          <b-taglist attached rounded>
            <b-tag v-for="file in editedFiles" :key="file.name" rounded>{{
              file.name
            }}</b-tag>
          </b-taglist>
        </b-field>
        <div class="column">
          <b-button
            v-if="zipPackage || editedFiles"
            style="text-transform: none"
            class="button is-fullwidth"
            @click="exportPackage()"
            expanded
            icon-left="download"
            >Export package locally</b-button
          >
        </div>
        <br />
        <div v-if="similarDeposits && similarDeposits.length > 0">
          <label class="label">Similar Existing Items</label>
          <p>
            The following published deposit(s) are similar to yours (matched by
            name), please make sure you are using distinctive names to avoid
            confusion to the users.
          </p>
          <b-notification
            v-for="item in similarDeposits"
            :key="item.id"
            :type="item.name === rdf.name ? 'is-danger' : null"
            aria-close-label="Close notification"
          >
            <h1>
              <a :href="item.config._deposit.links.html" target="_blank">{{
                item.name
              }}</a>
            </h1>
            <p>{{ item.description.slice(0, 200) }}</p>

            <p>
              Authors:
              {{
                item.authors
                  .map((author) => author.name.split(";")[0])
                  .join(",")
              }}
            </p>
            <p>Uploaded: {{ item.config._deposit.updated }}</p>
            <br />
            <div class="columns">
              <b-button
                v-if="
                  userId &&
                  item.config._deposit &&
                  item.config._deposit.owners.includes(userId)
                "
                @click="createOrUpdateDeposit(item.config._deposit.id, false)"
                class="column button is-primary is-light is-fullwidth"
                expanded
                icon-left="autorenew"
              >
                <span>Update as a new version</span>
              </b-button>
            </div>
          </b-notification>
          <b-button
            style="text-transform: none"
            class="button is-fullwidth"
            @click="stepIndex = 1"
            expanded
            :class="{
              'is-primary': sameNameDeposits && sameNameDeposits.length > 0,
            }"
            icon-left="arrow-left"
            >Go back to rename</b-button
          >
        </div>
        <br />
        <b-field>
          <b-switch v-model="requestedJoinCommunity">
            Apply for listing in the
            <a
              :href="
                client.baseURL +
                '/communities/' +
                siteConfig.zenodo_config.community
              "
              target="_blank"
              >bioimage.io community list</a
            >
          </b-switch>
        </b-field>
        <p v-if="uploadStatus">{{ uploadStatus }}</p>
        <b-progress
          v-if="uploadProgress"
          type="is-primary"
          :value="uploadProgress"
          size="is-small"
          expanded
        >
        </b-progress>
        <div class="columns">
          <div v-if="client && (zipPackage || editedFiles)" class="column">
            <b-button
              :disabled="
                uploadProgress ||
                (sameNameDeposits && sameNameDeposits.length > 0)
              "
              @click="createOrUpdateDeposit()"
              class="button is-primary is-light is-fullwidth"
              expanded
              icon-left="plus"
            >
              <span>Upload as new deposit</span>
            </b-button>
          </div>
          <div
            v-if="client && (zipPackage || editedFiles) && depositId"
            class="column"
          >
            <b-button
              :disabled="uploadProgress"
              @click="createOrUpdateDeposit(depositId, false)"
              class="button is-primary is-light is-fullwidth"
              expanded
              icon-left="autorenew"
            >
              <span>Add new version to deposit</span>
            </b-button>
          </div>
        </div>
      </b-step-item>
      <b-step-item label="Publish" icon="share-variant" disabled>
        <b-notification
          v-if="publishedUrl"
          type="is-success"
          has-icon
          aria-close-label="Close notification"
        >
          <h1>Published on Zenodo</h1>
          <h2>DOI: {{ publishedDOI }}</h2>
          <h2>
            <a :href="publishedUrl" target="_blank">{{ publishedUrl }}</a>
          </h2>
          <p>
            Note: Newly uploaded item may not appear immediately in the resource
            list.
          </p>
          <p v-if="requestedJoinCommunity">
            To be listed as part of the verified bioimage.io community list, a
            notification will be sent to the admin team and we will review
            request soon.
          </p>
        </b-notification>
        <b-notification
          v-else-if="prereserveDOI"
          has-icon
          aria-close-label="Close notification"
        >
          <h1>Ready to publish</h1>
          <h2>Preserved DOI: {{ prereserveDOI.doi }}</h2>
          <h2>
            You can also review and add additional information on Zenodo:
            <a :href="prereserveUrl" target="_blank">{{ prereserveUrl }}</a>
          </h2>
          <p>
            Note: Please check carefully before publishing. It is generally not
            possible to remove items after they have been published. Changes
            will be added as a new version, but will not erase the previous
            version.
          </p>
        </b-notification>

        <b-notification
          v-if="notifyCIStatus"
          ref="ci_status"
          has-icon
          aria-close-label="Close notification"
        >
          <h3>
            {{ notifyCIStatus }}
          </h3>
          <b-button
            v-if="notifyCIFailed"
            style="text-transform: none"
            class="button is-fullwidth"
            @click="notifyBot()"
            expanded
            >Try Again</b-button
          >
        </b-notification>

        <b-notification
          v-if="uploadMode === 'update'"
          has-icon
          type="is-info"
          aria-close-label="Close notification"
        >
          <p>
            Note: After publishing the updated deposit, you may see the item
            disappear from the website, this is normal because Zenodo need some
            time to index the new version. It should combe back in a while.
          </p>
        </b-notification>

        <b-button
          v-if="client && client.credential && uploaded && !publishedUrl"
          @click="publishDeposition()"
          class="button is-primary is-fullwidth"
          expanded
        >
          <b-icon icon="upload"></b-icon>
          <span>Publish</span>
        </b-button>
      </b-step-item>
    </b-steps>

    <section style="padding: 10px"></section>
  </div>
</template>

<script>
import { mapState } from "vuex";
import yaml from "js-yaml";
import { saveAs } from "file-saver";
import spdxLicenseList from "spdx-license-list/full";
import "vue-form-json/dist/vue-form-json.css";
import formJson from "vue-form-json/dist/vue-form-json.common.js";
import {
  rdfToMetadata,
  resolveDOI,
  getFullRdfFromDeposit,
  compareVersions,
} from "../utils";
import JSZip from "jszip";
import Markdown from "@/components/Markdown.vue";
import TagInputField from "@/components/TagInputField.vue";
import SelectButtonField from "@/components/selectButtonField.vue";
import DropFilesField from "@/components/DropFilesField.vue";
import CitationInputField from "@/components/CitationInputField.vue";
import AuthorInputField from "@/components/AuthorInputField.vue";
import doiRegex from "doi-regex";
import marked from "marked";
import DOMPurify from "dompurify";

export default {
  name: "upload",
  props: ["updateDepositId"],
  components: {
    "form-json": formJson,
    markdown: Markdown,
    // eslint-disable-next-line vue/no-unused-components
    TagInputField,
    // eslint-disable-next-line vue/no-unused-components
    SelectButtonField,
    // eslint-disable-next-line vue/no-unused-components
    DropFilesField,
    // eslint-disable-next-line vue/no-unused-components
    AuthorInputField,
    // eslint-disable-next-line vue/no-unused-components
    CitationInputField,
  },
  mounted() {
    this.dropFile = null;
    this.uploadStatus = "";
    this.uploadProgress = 0;

    this.$root.$on("formSubmitted", this.formSubmitted);
    if (this.updateDepositId) {
      this.startFromDepositURL().catch((e) => {
        alert(`Failed to load from deposit URL: ${e}`);
      });
    }
  },
  computed: {
    sameNameDeposits() {
      return (
        this.similarDeposits &&
        this.similarDeposits.filter((item) => item.name === this.rdf.name)
      );
    },
    formatedModelYaml() {
      return this.rdfYaml && "```yaml\n" + this.rdfYaml + "\n```\n";
    },
    prereserveUrl() {
      if (this.prereserveDOI) {
        return `${this.$store.state.zenodoBaseURL}/deposit/${this.prereserveDOI.recid}`;
      } else {
        return null;
      }
    },
    userId() {
      return this.client && this.client.getUserId();
    },
    components: () => ({
      TagInputField,
      SelectButtonField,
      DropFilesField,
      AuthorInputField,
      CitationInputField,
    }),
    ...mapState({
      allTags: (state) => state.allTags,
      resourceItems: (state) => state.resourceItems,
      client: (state) => state.zenodoClient,
      zenodoBaseURL: (state) => state.zenodoBaseURL,
      siteConfig: (state) => state.siteConfig,
    }),
  },
  data() {
    return {
      dropFile: null,
      uploadProgress: 0,
      uploadStatus: "",
      uploaded: false,
      jsonFields: null,
      zipFiles: null,
      rdfYaml: null,
      rdf: null,
      stepIndex: 0,
      publishedUrl: null,
      publishedDOI: null,
      notifyCIStatus: null,
      notifyCIFailed: false,
      requestedJoinCommunity: true,
      rdfType: "model",
      zipPackage: null,
      editedFiles: null,
      prereserveDOI: null,
      URI4Load: null,
      similarDeposits: null,
      depositId: null,
      newRDFFile: null,
      uploadMode: null,
    };
  },
  methods: {
    async startFromDepositURL() {
      const loadingComponent = this.$buefy.loading.open({
        container: this.$el,
      });
      try {
        if (!this.client.credential) await this.login();
        // example: updateDepositId=10.5281/zenodo.5850574
        this.URI4Load = `${this.zenodoBaseURL}/record/${
          this.updateDepositId.split("zenodo.")[1]
        }`;
        await this.loadRdfFromURL(this.URI4Load);
      } catch (e) {
        alert("Failed to load resource: " + this.updateDepositId);
      } finally {
        loadingComponent.close();
      }
    },
    async fileSelected(file) {
      const loadingComponent = this.$buefy.loading.open({
        container: this.$el,
      });
      try {
        let configFile;
        if (file.name.endsWith(".yaml")) {
          this.rdfYaml = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function (event) {
              resolve(event.target.result);
            };
            reader.onerror = reject;
            reader.readAsText(file);
          });
          configFile = file;
          this.zipPackage = new JSZip();
          this.zipPackage.file(file.name, file);
        } else if (!file.name.endsWith(".zip")) {
          alert("Only .zip and .yaml file are supported.");
          throw new Error("Only zip and .yaml file are supported");
        } else {
          var new_zip = new JSZip();
          this.zipPackage = await new_zip.loadAsync(file);
          console.log(this.zipPackage.files);
          if (
            !this.zipPackage.files["model.yaml"] &&
            !this.zipPackage.files["rdf.yaml"]
          ) {
            alert(
              "Invalid file: no model.yaml or rdf.yaml found in the model package."
            );
            throw new Error("Invalid file: no rdf file found in the package");
          }
          configFile =
            this.zipPackage.files["rdf.yaml"] ||
            this.zipPackage.files["model.yaml"];
          this.rdfYaml = await configFile.async("string");
        }
        const rdf = yaml.load(this.rdfYaml);
        // TODO: remove this when the migration is finished
        if (configFile.name === "model.yaml") rdf.type = "model";
        if (!rdf.type) {
          alert("Invalid rdf file: type key is not found");
          throw new Error("Invalid rdf file: type key is not found");
        }
        rdf.config = rdf.config || {};
        rdf.rdf_source = "./" + configFile.name; // assuming we will add the rdf.yaml/model.yaml to the zip
        if (rdf.type === "model") {
          rdf.links = rdf.links || [];
          rdf.links.push("imjoy/BioImageIO-Packager");
        }
        this.initializeRdfForm(rdf, Object.values(this.zipPackage.files));
      } catch (e) {
        console.error(e);
      } finally {
        loadingComponent.close();
      }
    },
    async loadRdfFromURL(url) {
      try {
        const doiURLRegex = doiRegex.resolvePath();
        if (doiURLRegex.test(url)) {
          url = await resolveDOI(url.match(doiURLRegex)[4]);
        } else if (doiRegex().test(url)) {
          url = await resolveDOI(url);
        }
        const zenodoRegex = /zenodo.org\/(record|deposit)\/([0-9]+)/g;
        const m = zenodoRegex.exec(url);
        if (m) {
          this.depositId = parseInt(m[2]);
          let depositionInfo;
          if (url.includes("/record/"))
            depositionInfo = await this.client.getDeposit(this.depositId);
          else {
            await this.client.getCredential(true);
            depositionInfo = await this.client.retrieve(this.depositId);
          }
          console.log("orcid matched: " + this.depositId, depositionInfo);
          const rdf = await getFullRdfFromDeposit(depositionInfo);
          this.zipPackage = null;
          // load files
          this.initializeRdfForm(
            rdf,
            depositionInfo.files.map((item) => {
              return {
                type: "remote",
                name: item.filename || item.key, // depending on what api we use, it may be in two different format
                size: item.filesize || item.size,
                url: item.links.self,
                checksum: item.checksum,
              };
            })
          );
        }
      } catch (e) {
        alert(`Oops, failed to fetch RDF from ${url}, error: ${e}`);
      }
    },
    async updateFormWithLocalFile(file) {
      const rdfYaml = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (event) {
          resolve(event.target.result);
        };
        reader.onerror = reject;
        reader.readAsText(file);
      });
      const rdf = yaml.load(rdfYaml);
      rdf.config = rdf.config || {};
      rdf.rdf_source = "./" + file.name;
      // make sure we reset the table
      this.jsonFields = null;
      setTimeout(() => {
        this.initializeRdfForm(rdf);
      }, 10);
    },
    initializeRdfForm(rdf, files) {
      this.stepIndex = 1;
      this.rdf = rdf || {};
      delete this.rdf.id;
      this.rdf.links = this.rdf.links || [];
      files = files || this.files || [];
      const types = this.siteConfig.resource_categories.map((cat) => cat.type);
      this.rdf.tags = this.rdf.tags || [];
      this.rdf.tags = this.rdf.tags.map((tag) =>
        tag.toLowerCase().replace(/ /g, "-")
      );
      this.jsonFields = this.transformFields([
        {
          label: "Type",
          type: "select",
          placeholder: "Select resource type",
          options: types.map((opt) => {
            return {
              text: opt,
              value: opt,
              selected: this.rdf.type === opt,
            };
          }),
        },
        {
          label: "Name",
          placeholder: "name",
          value: this.rdf.name,
          help: "The name of your deposit",
        },
        {
          label: "Description",
          placeholder: "description",
          value: this.rdf.description,
        },
        {
          label: "Authors",
          type: "author",
          options: ["name", "orcid", "affiliation"],
          value: this.rdf.authors,
          help: "The authors who contributed to this resource item",
        },
        {
          label: "Maintainers",
          type: "author",
          options: ["name", "email", "github_user"],
          value: this.rdf.maintainers,
          help: "The maintainers who maintain this resource item. Importantly, the first maintainer will be contacted for the approval process to the BioImage.IO",
        },
        // {
        //   label: "Source",
        //   placeholder: "A doi or URL to the source of the item",
        //   isRequired: false,
        //   value: this.rdf.version
        // },
        {
          label: "Version",
          placeholder: "Version in MAJOR.MINOR.PATCH format(e.g. 0.1.0)",
          isRequired: false,
          value: this.rdf.version || "0.1.0",
        },
        {
          html: `<p class='label'>License<span
        class="helpLabel has-text-grey-light is-size-7 is-italic"
        style="margin-left: .5rem;font-weight: 400;"
        >Choose the license that fits you most, we recommend to use <a target="_blank" href="https://creativecommons.org/licenses/by/4.0/">CC-BY-4.0</a> (free to share and adapt under the condition of attribution). For other license options, please visit here <a target="_blank" href="https://spdx.org/licenses">https://spdx.org/licenses<a></span><sup class='has-text-grey-light is-size-7'> *</sup></p>`,
        },
        {
          label: "License",
          showLabel: false,
          type: "select",
          placeholder: "Select your license",
          options: Object.keys(spdxLicenseList).map((opt) => {
            return {
              text: opt,
              value: opt,
              selected: this.rdf.license === opt,
            };
          }),
          help: "A short description in one sentence",
        },
        {
          label: "Git repository",
          placeholder: "Git repository URL",
          value: this.rdf.git_repo,
          isRequired: false,
        },
        {
          label: "Tags",
          type: "tags",
          value: this.rdf.tags,
          help: "Tags should contain only lower case letters with numbers, or the following characters: +*#;./%@, but no space",
          placeholder:
            "Add a tag and press ENTER to confirm (lower case, numbers, or any of +*#;./%@, but no space)",
          options: this.allTags.map((tag) =>
            tag.toLowerCase().replace(/ /g, "-")
          ),
          pattern: /^[-0-9a-z+*#;./%@:]*$/,
          allow_new: true,
          icon: "label",
          isRequired: false,
        },
        {
          label: "Citation",
          type: "citation",
          value: this.rdf.cite,
          help: "How this resource item should be cited",
          isRequired: false,
        },
        {
          label: "Links",
          type: "tags",
          value: this.rdf.links,
          placeholder: "Add a link (resource item ID)",
          options: this.resourceItems.map((item) => item.id),
          allow_new: true,
          icon: "vector-link",
          isRequired: false,
        },
        {
          label: "Files",
          type: "files",
          value: files,
          isRequired: false,
        },
        {
          html: `<p class='label'>Validation<span
        class="helpLabel has-text-grey-light is-size-7 is-italic"
        style="margin-left: .5rem;font-weight: 400;"
        >Validate the RDF fields against the bioimageio RDF specification using the python module, see <a target="_blank" href="https://github.com/bioimage-io/spec-bioimage-io">Specifications for BioImage.IO</a>. <br>Note: It may take a while to load for the first time.<sup class='has-text-grey-light is-size-7'> *</sup></p>`,
        },
        {
          type: "button",
          showLabel: false,
          label: "Validate",
          callback: async () => {
            // TODO: fix attachments.files for the packager
            this.showLoader(true);
            try {
              const rdf = yaml.load(yaml.dump(this.rdf));
              delete rdf._metadata;
              if (rdf?.config?._deposit) delete rdf.config._deposit;
              console.log("RDF: ", rdf);
              const validator = await window.api.getPlugin(
                "https://raw.githubusercontent.com/bioimage-io/spec-bioimage-io/main/scripts/bio-rdf-validator.imjoy.html"
              );
              const results = await validator.validate(rdf);
              if (!results.error) return "Validation passed!";
              else {
                throw new Error(JSON.stringify(results, null, "  "));
              }
              // eslint-disable-next-line no-useless-catch
            } catch (e) {
              throw e;
            } finally {
              this.showLoader(false);
            }
          },
        },
      ]);
      this.files = files;
    },
    transformFields(fields) {
      const typeMapping = {};
      for (let k in this.components) {
        typeMapping[this.components[k].name] = k;
      }
      // mapping type to component name
      for (let field of fields) {
        if (typeMapping[field.type]) {
          field.is = typeMapping[field.type];
          delete field.type;
        }
      }
      return fields;
    },
    async formSubmitted(result) {
      const rdfNameMapping = {
        type: "Type",
        name: "Name",
        description: "Description",
        version: "Version",
        license: "License",
        // source: "Source",
        git_repo: "Git Repository",
        tags: "Tags",
        links: "Links",
        cite: "Citation",
        authors: "Authors",
      };
      const values = result.values;
      for (let k in rdfNameMapping) {
        this.rdf[k] = values[rdfNameMapping[k]];
      }
      // Fix files
      if (this.zipPackage) {
        const packageFiles = Object.values(this.zipPackage.files);
        for (let file of values["Files"]) {
          if (packageFiles.includes(file)) continue;
          if (file instanceof Blob) {
            this.zipPackage.file(file.name, file);
          } else {
            console.error("Invalid file type", file);
          }
        }
        // remove files
        for (let file of packageFiles) {
          if (!values["Files"].includes(file)) {
            delete this.zipPackage.files[file.name];
          }
        }
      } else {
        this.editedFiles = values["Files"].filter(
          (file) => file.type !== "remote"
        );
      }

      // TODO: fix attachments.files for the packager
      const rdf = yaml.load(yaml.dump(this.rdf));
      delete rdf._metadata;
      if (rdf?.config?._deposit) delete rdf.config._deposit;
      console.log("RDF: ", rdf);

      this.rdfYaml = yaml.dump(rdf);
      const blob = new Blob([this.rdfYaml], {
        type: "application/yaml",
      });
      let rdfFileName = "rdf.yaml";
      if (
        this.rdf.type === "model" &&
        compareVersions(rdf.format_version, "<", "0.3.2")
      ) {
        rdfFileName = "model.yaml";
      }
      if (this.zipPackage) {
        delete this.zipPackage.files[rdfFileName];
        this.zipPackage.file(rdfFileName, blob);
      } else {
        const file = new File([blob], rdfFileName);
        this.editedFiles = this.editedFiles.filter(
          (item) => item.name !== rdfFileName
        );
        this.editedFiles.push(file);
        this.zipPackage = new JSZip();
        this.editedFiles.push(file);
        this.editedFiles.map((file) => this.zipPackage.file(file.name, file));
      }

      this.similarDeposits = await this.client.getResourceItems({
        sort: "bestmatch",
        query: this.rdf.name,
      });
      console.log("Similar deposits:", this.similarDeposits);
      // if there is any similar items, we can try to login first
      if (this.similarDeposits.length > 0)
        await this.client.getCredential(true);
      this.stepIndex = 2;
    },
    notifyBot() {
      // debug url: `https://bioimage-6b0000.netlify.live/.netlify/functions/bioimageiobot?action=notify&source=https://zenodo.org/api/files/3f422e1b-a64e-40d3-89d1-29038d2f405d/rdf.yaml`
      const url = `https://bioimage.netlify.app/.netlify/functions/bioimageiobot?action=notify&source=${this.client.baseURL}/record/${this.depositId}/files/rdf.yaml`;
      this.notifyCIStatus =
        "⌛ Trying to notify bioimage-bot for the new item...";
      this.notifyCIFailed = false;
      const ciLoader = this.$buefy.loading.open({
        container: this.$refs.ci_status,
      });
      // trigger CI with the bioimageio bot endpoint
      fetch(url)
        .then(async (resp) => {
          if (resp.status === 200) {
            this.notifyCIStatus =
              "🎉 bioimage-bot has successfully detected the item: " +
              (await resp.json())["message"];
            this.notifyCIFailed = false;
          } else {
            this.notifyCIFailed = true;
            this.notifyCIStatus =
              "😬 bioimage-bot failed to detected the new item, please report the issue to the admin team of bioimage.io: " +
              (await resp.text());
          }
        })
        .catch((e) => {
          this.notifyCIStatus = `😬 Failed to reach to the bioimageio-bot, please report the issue to the admin team of bioimage.io: ${e}`;
          this.notifyCIFailed = true;
        })
        .finally(() => {
          ciLoader.close();
        });
    },
    async publishDeposition() {
      const loadingComponent = this.$buefy.loading.open({
        container: this.$el,
      });
      try {
        const result = await this.client.publish(this.depositId);
        console.log("Published", result);
        this.publishedDOI = result.doi;
        this.publishedUrl = `${this.$store.state.zenodoBaseURL}/record/${this.depositId}`;
        this.notifyBot();
      } catch (e) {
        console.error(e);
        alert(`Failed to publish: ${e}`);
      } finally {
        loadingComponent.close();
      }
    },
    async exportPackage() {
      let zipPackage = this.zipPackage;
      if (!zipPackage) {
        zipPackage = new JSZip();
        let i = 0;
        for (let item of this.editedFiles) {
          this.uploadProgress = (i / this.editedFiles.length) * 100;
          i++;
          if (item.type === "remote") {
            this.uploadStatus = "Download fille " + item.name;
            const response = await fetch(item.url);
            if (response.ok) {
              const blob = await response.blob();
              zipPackage.file(item.name, blob);
            } else {
              throw new Error("Failed to download file: " + item.url);
            }
          } else if (item instanceof Blob) {
            zipPackage.file(item.name, item);
          }
        }
      }
      console.log("downloading", zipPackage);
      const zipBlob = await zipPackage.generateAsync(
        {
          type: "blob",
          compression: "DEFLATE",
          compressionOptions: {
            level: 9,
          },
        },
        (mdata) => {
          this.uploadProgress = mdata.percent;
          this.uploadStatus = "Zipping package...";
        }
      );
      this.uploadStatus = "Exporting zip package...";
      saveAs(zipBlob, this.rdf.name + ".bioimage.io.zip");
      this.uploadStatus = "Done!";
    },
    showLoader(enable) {
      if (enable)
        this.loadingComponent = this.$buefy.loading.open({ canCancel: true });
      else {
        if (this.loadingComponent) {
          this.loadingComponent.close();
          this.loadingComponent = null;
        }
      }
    },
    async login() {
      try {
        await this.client.getCredential(true);
        this.$forceUpdate();
      } catch (e) {
        alert(`Failed to login: ${e}`);
      }
    },
    async createOrUpdateDeposit(depositId, skipUpload) {
      try {
        await this.client.getCredential(true);
        this.$forceUpdate();
      } catch (e) {
        alert(`Failed to login: ${e}`);
        return;
      }
      const loadingComponent = this.$buefy.loading.open({
        container: this.$el,
      });

      try {
        this.uploadProgress = 1;
        let depositionInfo;
        this.uploadMode = "new";
        if (depositId) {
          try {
            depositionInfo = await this.client.retrieve(depositId);

            // enter edit mode if submitted
            // if deposit.state == 'inprogress', the metadata can be updated
            // if deposit.submitted == false files can be updated as well.
            if (!skipUpload) {
              // The response body of this action is NOT the new version deposit, but the original resource.
              // The new version deposition can be accessed through the "latest_draft" under "links" in the response body.
              const deposit = await this.client.createNewVersion(
                depositionInfo
              );
              // e.g. https://sandbox.zenodo.org/api/deposit/depositions/868929
              const tmp = deposit.links.latest_draft.split("/");
              depositId = parseInt(tmp[tmp.length - 1]);
              depositionInfo = await this.client.retrieve(depositId);
            }
            if (
              depositionInfo.state !== "inprogress" &&
              depositionInfo.state !== "unsubmitted"
            )
              await this.client.edit(depositId);
            this.uploadMode = "update";
          } catch (e) {
            console.error(e);
            if (
              !confirm(
                `Failed to retrieve existing deposit (id: ${depositId}), would you like to create a new deposit instead?`
              )
            ) {
              return;
            }
          }
        } else depositionInfo = await this.client.createDeposition();

        this.depositId = depositionInfo.id;
        const baseUrl = `${this.client.baseURL}/record/${this.depositId}/files/`; //"file:///"; //depositionInfo.links.bucket + "/";

        let docstring = null;
        if (
          this.rdf.documentation &&
          !this.rdf.documentation.startsWith("http") &&
          this.rdf.documentation.endsWith(".md")
        ) {
          const file =
            this.zipPackage.files[this.rdf.documentation.replace("./", "")];
          if (file) {
            docstring = await file.async("string"); // get markdown
            docstring = DOMPurify.sanitize(marked(docstring));
          }
        }
        this.rdf.config = this.rdf.config || {};
        this.rdf.config._deposit = depositionInfo;
        this.rdf.rdf_source = this.rdf.rdf_source || "rdf.yaml";
        const metadata = rdfToMetadata(this.rdf, baseUrl, docstring);
        // this will send a email request to the admin of bioimgae-io team
        if (this.requestedJoinCommunity) {
          metadata.communities.push({
            identifier: this.siteConfig.zenodo_config.community,
          });
        }
        metadata.prereserve_doi = true; // we will generate the doi and store it in the model yaml file
        depositionInfo = await this.client.updateMetadata(
          depositionInfo,
          metadata
        );

        // transform the RDF here
        this.prereserveDOI = depositionInfo.metadata.prereserve_doi;
        this.rdf.id = this.prereserveDOI.doi; //doi and recid
        this.rdf.config._doi = depositionInfo.metadata.prereserve_doi.doi;
        // concept doi can be undefined for new deposition
        this.rdf.config._conceptdoi = depositionInfo.conceptdoi;
        if (skipUpload) {
          this.stepIndex = 3;
          return depositionInfo;
        }
        const zipFiles = Object.values(this.zipPackage.files);
        // sort the files so we will upload the covers in the end
        // this allows zenodo to display it as preview
        if (this.rdf.covers && this.rdf.covers.length > 0) {
          const covers = this.rdf.covers;
          zipFiles.sort((a, b) => {
            if (
              covers.includes("./" + a.name) &&
              !covers.includes("./" + b.name)
            )
              return 1;
            else if (
              !covers.includes("./" + a.name) &&
              covers.includes("./" + b.name)
            )
              return -1;
            else return 0;
          });
        }

        for (let i = 0; i < zipFiles.length; i++) {
          if (zipFiles[i].dir) {
            console.warn("Skipping directory: " + zipFiles[i].name);
            continue;
          }
          const blob = await zipFiles[i].async("blob");
          const file = new File([blob], zipFiles[i].name);
          await this.client.uploadFile(
            depositionInfo,
            file,
            file.name,
            (size) => {
              this.uploadProgress = Math.round((size / file.size) * 100);
              this.uploadStatus = `Uploading ${i + 1}/${zipFiles.length}(${
                this.uploadProgress
              }%): ${file.name.slice(0, 40)}... `;
              this.$forceUpdate();
            }
          );
        }
        this.uploadProgress = 0;
        this.uploadStatus = `Successfully uploaded ${zipFiles.length} files.`;
        this.uploaded = true;
        this.similarDeposits = null;
        this.notifyCIStatus = null;
        this.notifyCIFailed = null;
        this.stepIndex = 3;
      } catch (e) {
        console.error(e);
        alert(`Failed to upload file: ${e}`);
      } finally {
        this.uploadProgress = 0;
        loadingComponent.close();
      }
    },
  },
};
</script>
<style scoped>
.upload {
  padding: 10px;
  width: 100%;
  overflow: auto;
  display: block;
  background: white;
  background-repeat: no-repeat;
  background-position: bottom;
}
</style>
