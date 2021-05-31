<template>
  <div class="upload">
    <b-steps
      position="left"
      :has-navigation="false"
      v-model="stepIndex"
      label-position="right"
    >
      <b-step-item :disabled="rdfYaml" label="Select file" icon="file">
        <b-field label="Option 1: Select a local file" expanded>
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
        <b-field label="Option 2: Input RDF fields manually">
          <b-button
            style="text-transform:none;"
            class="button is-fullwidth"
            @click="initializeRdfForm()"
            expanded
            >Fill the RDF form</b-button
          >
        </b-field>
        <b-field
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
          style="text-transform:none;"
          class="button is-fullwidth"
          @click="loadRdfFromURL(URI4Load)"
          expanded
          >Load</b-button
        >
      </b-step-item>

      <b-step-item label="Edit & Review" icon="pencil" :disabled="!rdfYaml">
        <section style="padding: 20px;">
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
        </section>
      </b-step-item>

      <b-step-item label="Export & Upload" icon="upload">
        <b-field
          label="RDF content"
          style="height: 260px; overflow: auto;"
          v-if="rdfYaml"
        >
          <markdown
            v-if="rdfYaml"
            baseUrl=""
            :content="formatedModelYaml"
          ></markdown>
        </b-field>
        <b-field v-if="zipPackage" label="Files">
          <b-taglist attached rounded>
            <b-tag
              v-for="(file, name) in zipPackage.files"
              :key="name"
              rounded
              >{{ name }}</b-tag
            >
          </b-taglist>
        </b-field>
        <b-field v-else-if="editedFiles" label="Files">
          <b-taglist attached rounded>
            <b-tag v-for="file in editedFiles" :key="file.name" rounded>{{
              file.name
            }}</b-tag>
          </b-taglist>
        </b-field>
        <div class="column">
          <b-button
            v-if="zipPackage || editedFiles"
            style="text-transform:none;"
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
              <a :href="item.source" target="_blank">{{ item.name }}</a>
            </h1>
            <p>{{ item.description }}</p>
            <b-button
              v-if="userId && item._deposit.owners.includes(userId)"
              @click="uploadFiles(item._deposit.id)"
              class="button is-primary is-light is-fullwidth"
              expanded
              icon-left="autorenew"
            >
              <span>Update this deposit</span>
            </b-button>
          </b-notification>
          <b-button
            style="text-transform:none;"
            class="button is-fullwidth"
            @click="stepIndex = 1"
            expanded
            :class="{
              'is-primary': sameNameDeposits && sameNameDeposits.length > 0
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
              :href="client.baseURL + '/communities/bioimage-io/'"
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
              :disabled="sameNameDeposits && sameNameDeposits.length > 0"
              @click="uploadFiles()"
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
              @click="uploadFiles(depositId)"
              class="button is-primary is-light is-fullwidth"
              expanded
              icon-left="autorenew"
            >
              <span>Update existing deposit</span>
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
            notification will be sent to the admin team aand we will review
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
            Note: Please check carefully before publishing, it won't be easy to
            remove items after made public. New changes will be added as a new
            version.
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

    <section style="padding: 10px;"></section>
  </div>
</template>

<script>
import { mapState } from "vuex";
import yaml from "js-yaml";
import { saveAs } from "file-saver";
import spdxLicenseList from "spdx-license-list/full";
import "vue-form-json/dist/vue-form-json.css";
import formJson from "vue-form-json/dist/vue-form-json.common.js";
import { rdfToMetadata, resolveDOI, getFullRdfFromDeposit } from "../utils";
import JSZip from "jszip";
import Markdown from "@/components/Markdown.vue";
import TagInputField from "./tagInputField.vue";
import DropFilesField from "./dropFilesField.vue";
import doiRegex from "doi-regex";

export default {
  name: "upload",
  components: {
    "form-json": formJson,
    markdown: Markdown,
    // eslint-disable-next-line vue/no-unused-components
    TagInputField,
    // eslint-disable-next-line vue/no-unused-components
    DropFilesField
  },
  mounted() {
    this.dropFile = null;
    this.uploadStatus = "";
    this.uploadProgress = 0;

    this.$root.$on("formSubmitted", this.formSubmitted);
  },
  computed: {
    sameNameDeposits() {
      return (
        this.similarDeposits &&
        this.similarDeposits.filter(item => item.name === this.rdf.name)
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
    components: () => ({ TagInputField, DropFilesField }),
    ...mapState({
      resourceItems: state => state.resourceItems,
      client: state => state.zenodoClient
    })
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
      requestedJoinCommunity: true,
      rdfType: "model",
      zipPackage: null,
      editedFiles: null,
      prereserveDOI: null,
      URI4Load: null,
      similarDeposits: null,
      depositId: null,
      userId: null
    };
  },
  methods: {
    async fileSelected(file) {
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
        return;
      }
      const configFile =
        this.zipPackage.files["rdf.yaml"] ||
        this.zipPackage.files["model.yaml"];
      this.rdfYaml = await configFile.async("string");
      const rdf = yaml.load(this.rdfYaml);
      rdf.type = rdf.type || "model";
      rdf.rdf_file = "./" + configFile.name; // assuming we will add the rdf.yaml/model.yaml to the zip
      if (rdf.type === "model") {
        rdf.links = rdf.links || [];
        rdf.links.push("imjoy/BioImageIO-Packager");
      }
      this.initializeRdfForm(rdf, Object.values(this.zipPackage.files));
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
          console.log("orcid matched: " + this.depositId);
          // const credential = await this.client.getCredential(true);
          const depositionInfo = await this.client.getDeposit(this.depositId);
          const rdf = await getFullRdfFromDeposit(depositionInfo);
          this.zipPackage = null;
          // load files
          this.initializeRdfForm(
            rdf,
            depositionInfo.files.map(item => {
              return {
                type: "remote",
                name: item.filename || item.key, // depending on what api we use, it may be in two different format
                size: item.filesize || item.size,
                url: item.links.self,
                checksum: item.checksum
              };
            })
          );
        }
      } catch (e) {
        alert(`Failed to fetch RDF from ${url}, error: ${e}`);
      }
    },
    initializeRdfForm(rdf, files) {
      this.stepIndex = 1;
      this.rdf = rdf || {};
      this.rdf.links = this.rdf.links || [];
      this.jsonFields = this.transformFields([
        {
          label: "Type",
          type: "select",
          placeholder: "Select resource type",
          options: ["model", "dataset", "notebook", "application"].map(opt => {
            return {
              text: opt,
              value: opt,
              selected: this.rdf.type === opt
            };
          })
        },
        {
          label: "Name",
          placeholder: "name",
          value: this.rdf.name
        },
        {
          label: "Description",
          placeholder: "description",
          value: this.rdf.description
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
          value: this.rdf.version || "0.1.0"
        },
        {
          label: "License",
          type: "select",
          placeholder: "Select your license",
          options: Object.keys(spdxLicenseList).map(opt => {
            return {
              text: opt,
              value: opt,
              selected: this.rdf.license === opt
            };
          })
        },
        {
          label: "Git repository",
          placeholder: "Git repository URL",
          value: this.rdf.git_repo,
          isRequired: false
        },
        {
          label: "Tags",
          type: "tags",
          value: this.rdf.tags,
          placeholder: "Add a tag",
          icon: "label",
          isRequired: false
        },
        {
          label: "Links",
          type: "tags",
          value: this.rdf.links,
          placeholder: "Add a link (resource item ID)",
          options: this.resourceItems.map(item => item.id),
          allow_new: true,
          icon: "vector-link",
          isRequired: false
        },
        {
          label: "Files",
          type: "files",
          value: files,
          isRequired: false
        }
      ]);
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
        links: "Links"
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
        this.editedFiles = values["Files"];
      }

      // TODO: fix attachments.files for the packager
      const rdf = Object.assign({}, this.rdf);
      delete rdf._metadata;
      this.rdfYaml = yaml.dump(rdf);
      const blob = new Blob([this.rdfYaml], {
        type: "application/yaml"
      });
      if (this.zipPackage) {
        if (this.rdf.type === "model") {
          delete this.zipPackage.files["model.yaml"];
          this.zipPackage.file("model.yaml", blob);
        } else {
          delete this.zipPackage.files["rdf.yaml"];
          this.zipPackage.file("rdf.yaml", blob);
        }
      } else {
        if (this.rdf.type === "model") {
          const file = new File([blob], "model.yaml");
          this.editedFiles = this.editedFiles.filter(
            item => item.name !== "model.yaml"
          );
          this.editedFiles.push(file);
        } else {
          const file = new File([blob], "rdf.yaml");
          this.editedFiles = this.editedFiles.filter(
            item => item.name !== "rdf.yaml"
          );
          this.editedFiles.push(file);
        }
      }

      this.similarDeposits = await this.client.getResourceItems({
        sort: "bestmatch"
      });
      // if there is any similar items, we can try to login first
      if (this.similarDeposits.length > 0)
        await this.client.getCredential(true);
      this.stepIndex = 2;
    },
    async publishDeposition() {
      if (
        !confirm(
          "Are you sure about publish your RDF now? Please note that after publishing you won't be able to remove it and changes can only be added as new versions."
        )
      )
        return;
      const loadingComponent = this.$buefy.loading.open({
        container: this.$el
      });
      try {
        const result = await this.client.publish(this.depositId);
        console.log("Published", result);
        this.publishedDOI = result.doi;
        this.publishedUrl = `${this.$store.state.zenodoBaseURL}/record/${this.depositId}`;
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
            level: 9
          }
        },
        mdata => {
          this.uploadProgress = mdata.percent;
          this.uploadStatus = "Zipping package...";
        }
      );
      this.uploadStatus = "Exporting zip package...";
      saveAs(zipBlob, this.rdf.name + ".bioimage.io.zip");
      this.uploadStatus = "Done!";
    },
    async uploadFiles(depositId) {
      let credential;
      try {
        credential = await this.client.getCredential(true);
        this.userId = credential.user_id;
        this.$forceUpdate();
      } catch (e) {
        alert(`Failed to login: ${e}`);
        return;
      }
      const loadingComponent = this.$buefy.loading.open({
        container: this.$el
      });
      try {
        let depositionInfo;
        if (depositId) {
          try {
            depositionInfo = await this.client.retrieve(depositId);
            // enter edit mode if submitted
            if (depositionInfo.submitted) await this.client.edit(depositId);
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
        const metadata = rdfToMetadata(this.rdf, baseUrl);
        // this will send a email request to the admin of bioimgae-io team
        if (this.requestedJoinCommunity) {
          metadata.communities.push({ identifier: "bioimage-io" });
        }
        metadata.prereserve_doi = true; // we will generate the doi and store it in the model yaml file
        const result = await this.client.updateMetadata(
          depositionInfo,
          metadata
        );
        // transform the RDF here
        this.prereserveDOI = result.metadata.prereserve_doi;
        this.rdf.id = result.metadata.prereserve_doi.doi; //doi and recid

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
          await this.client.uploadFile(depositionInfo, file, size => {
            this.uploadProgress = Math.round((size / file.size) * 100);
            this.uploadStatus = `Uploading ${i + 1}/${zipFiles.length}(${
              this.uploadProgress
            }%): ${file.name.slice(0, 40)}... `;
            this.$forceUpdate();
          });
        }
        this.uploadProgress = 0;
        this.uploadStatus = `Successfully uploaded ${zipFiles.length} files.`;
        this.uploaded = true;
        this.stepIndex = 3;
      } catch (e) {
        console.error(e);
        alert(`Failed to upload file: ${e}`);
      } finally {
        loadingComponent.close();
      }
    }
  }
};
</script>
<style scoped>
.upload {
  padding: 10px;
  width: 100%;
  overflow: auto;
  height: calc(100% - 48px);
  display: block;
}
</style>
