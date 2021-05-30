<template>
  <div class="upload">
    <b-steps
      position="left"
      :has-navigation="false"
      v-model="stepIndex"
      label-position="right"
      size="is-small"
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
        <b-field label="Option 2: Input manually">
          <b-button
            style="text-transform:none;"
            class="button is-fullwidth"
            @click="stepIndex = 1"
            expanded
            >I don't have a file yet</b-button
          >
        </b-field>
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
        <div class="columns">
          <div class="column">
            <b-button
              v-if="dropFile"
              style="text-transform:none;"
              class="button is-fullwidth"
              @click="exportPackage()"
              expanded
              icon-left="download"
              >Export package locally</b-button
            >
          </div>
          <div class="column">
            <b-button
              v-if="!uploaded && client && rdfYaml"
              @click="uploadFiles()"
              class="button is-primary is-fullwidth"
              expanded
              icon-left="upload"
            >
              <span>Start Uploading</span>
            </b-button>
          </div>
        </div>
        <p v-if="uploadStatus">{{ uploadStatus }}</p>
        <b-progress
          v-if="uploadProgress"
          type="is-primary"
          :value="uploadProgress"
          size="is-small"
          expanded
        >
        </b-progress>
      </b-step-item>
      <b-step-item label="Publish" icon="share" disabled>
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
            Note: Please check carefully before publish, it won't be easy to
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
import { rdfToMetadata } from "../utils";
import JSZip from "jszip";
import Markdown from "@/components/Markdown.vue";
import TagInputField from "./tagInputField.vue";
import DropFilesField from "./dropFilesField.vue";

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
      rdfType: "model",
      zipPackage: null,
      prereserveDOI: null
    };
  },
  methods: {
    async fileSelected(file) {
      var new_zip = new JSZip();
      this.zipPackage = await new_zip.loadAsync(file);
      console.log(this.zipPackage.files);
      if (!this.zipPackage.files["model.yaml"]) {
        alert("Invalid file: no model.yaml found in the model package.");
        return;
      }
      this.rdfYaml = await this.zipPackage.files["model.yaml"].async("string");
      this.rdf = yaml.load(this.rdfYaml);
      this.rdf.type = "model";
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
        {
          label: "Version",
          placeholder: "Version in MAJOR.MINOR.PATCH format",
          isRequired: false,
          value: this.rdf.version
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
          placeholder: "Git repository url",
          value: this.rdf.git_repo,
          isRequired: false
        },
        {
          label: "Tags",
          type: "tags",
          value: this.rdf.tags,
          placeholder: "Add a tag",
          icon: "label"
        },
        {
          label: "Files",
          type: "files",
          value: Object.values(this.zipPackage.files)
        }
      ]);
      this.stepIndex = 1;
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
    formSubmitted(result) {
      const rdfNameMapping = {
        type: "Type",
        name: "Name",
        description: "Description",
        version: "Version",
        license: "License",
        git_repo: "Git Repository",
        tags: "Tags"
      };
      const values = result.values;
      for (let k in rdfNameMapping) {
        this.rdf[k] = values[rdfNameMapping[k]];
      }
      // Fix files
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
      // TODO: fix attachments.files for the packager
      this.rdfYaml = yaml.dump(this.rdf);
      const blob = new Blob([this.rdfYaml], {
        type: "application/yaml"
      });
      if (this.rdf.type === "model") {
        delete this.zipPackage.files["model.yaml"];
        this.zipPackage.file("model.yaml", blob);
      } else {
        delete this.zipPackage.files["config.yaml"];
        this.zipPackage.file("config.yaml", blob);
      }

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
      console.log("downloading", this.zipPackage);
      const zipBlob = await this.zipPackage.generateAsync(
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
    async uploadFiles() {
      try {
        await this.client.getCredential(true);
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
        if (this.depositId) {
          depositionInfo = await this.client.retrieve(this.depositId);
          // enter edit mode
          await this.client.edit(this.depositId);
        } else depositionInfo = await this.client.createDeposition();
        this.depositId = depositionInfo.id;

        const baseUrl = depositionInfo.links.bucket + "/";
        const metadata = rdfToMetadata(this.rdf, baseUrl);
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
