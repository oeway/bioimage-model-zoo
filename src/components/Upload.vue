<template>
  <div class="upload">
    <section style="padding: 10px;">
      <b-field v-if="!rdfYaml" expanded>
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
              <p>Drop your files here or click to upload</p>
            </div>
          </section>
        </b-upload>
      </b-field>

      <section style="padding: 20px;">
        <form-json
          v-if="jsonFields && jsonFields.length > 0"
          :btnReset="{ value: 'Reset' }"
          :btnSubmit="{ value: 'Save' }"
          :camelizePayloadKeys="true"
          :formFields="jsonFields"
          :formName="'metadata'"
        >
        </form-json>
      </section>

      <b-field style="height: 400px; overflow: auto;" v-if="rdfYaml">
        <markdown
          v-if="rdfYaml"
          baseUrl=""
          :content="formatedModelYaml"
        ></markdown>
      </b-field>

      <b-button
        v-if="dropFile && client && !client.credential"
        style="text-transform:none;"
        class="button is-primary is-fullwidth"
        @click="login()"
        expanded
        >Login</b-button
      >
      <b-button
        v-if="
          !uploaded && client && client.credential && rdfYaml && !uploadProgress
        "
        @click="uploadFiles()"
        class="button is-primary is-fullwidth"
        expanded
      >
        <b-icon icon="upload"></b-icon>
        <span>Click to upload</span>
      </b-button>
      <p v-if="uploadStatus">{{ uploadStatus }}</p>
      <b-progress
        v-if="uploadProgress"
        type="is-primary"
        :value="uploadProgress"
        size="is-small"
        expanded
      >
      </b-progress>

      <b-button
        v-if="client && client.credential && uploaded"
        @click="publishDeposition()"
        class="button is-primary is-fullwidth"
        expanded
      >
        <b-icon icon="upload"></b-icon>
        <span>Publish</span>
      </b-button>
    </section>
  </div>
</template>

<script>
import yaml from "js-yaml";
import spdxIds from "spdx-license-ids";
import "vue-form-json/dist/vue-form-json.css";
import formJson from "vue-form-json/dist/vue-form-json.common.js";
import { ZenodoClient, rdfToMetadata } from "../utils";
import JSZip from "jszip";
import Markdown from "@/components/Markdown.vue";

export default {
  name: "upload",
  props: {
    clientId: {
      type: String,
      default: null
    },
    useSandbox: {
      type: Boolean,
      default: true
    }
  },
  components: { "form-json": formJson, markdown: Markdown },
  mounted() {
    this.dropFile = null;
    this.uploadStatus = "";
    this.uploadProgress = 0;
    this.client = new ZenodoClient(this.clientId, this.useSandbox);
  },
  computed: {
    formatedModelYaml() {
      return this.rdfYaml && "```yaml\n" + this.rdfYaml + "\n```\n";
    }
  },
  data() {
    return {
      client: null,
      dropFile: null,
      uploadProgress: 0,
      uploadStatus: "",
      uploaded: false,
      jsonFields: null,
      zipFiles: null,
      rdfYaml: null,
      rdf: null
    };
  },
  methods: {
    async fileSelected(file) {
      var new_zip = new JSZip();
      // more files !
      const zip = await new_zip.loadAsync(file);
      console.log(zip.files);
      this.zipFiles = zip.files;
      if (!this.zipFiles["model.yaml"]) {
        alert("Invalid file: no model.yaml found in the model package.");
        return;
      }
      this.rdfYaml = await this.zipFiles["model.yaml"].async("string");
      this.rdf = yaml.load(this.rdfYaml);

      this.jsonFields = [
        {
          label: "name",
          placeholder: "name",
          value: this.rdf.name
        },
        {
          label: "description",
          placeholder: "description",
          value: this.rdf.description
        },
        {
          label: "license",
          type: "select",
          placeholder: "Select your license",
          options: spdxIds,
          value: this.rdf.license
        }
      ];
    },
    async login() {
      try {
        await this.client.login();
        this.$forceUpdate();
      } catch (e) {
        alert(`Failed to login: ${e}`);
      }
    },
    async publishDeposition() {
      const result = await this.client.publish(this.depositId);
      console.log("Published", result);
      alert("Published successfully, DOI: " + result.doi);
      // window.open(result.doi_url);
      window.open("https://sandbox.zenodo.org/record/" + this.depositId);
    },
    async uploadFiles() {
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
        this.rdf.id = result.metadata.prereserve_doi.doi;

        const zipFiles = Object.values(this.zipFiles);
        for (let i = 0; i < zipFiles.length; i++) {
          if (zipFiles[i].dir) {
            console.warn("Skipping directory: " + zipFiles[i].name);
            continue;
          }
          let blob;
          if (zipFiles[i].name === "model.yaml") {
            //TODO: How to deal with other types?
            blob = yaml.dump(this.rdf);
          } else {
            blob = await zipFiles[i].async("blob");
          }
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
      } catch (e) {
        console.error(e);
        alert(`Failed to upload file: ${e}`);
      }
    }
  }
};
</script>
<style scoped>
.upload {
  width: 100%;
  overflow: auto;
  height: calc(100% - 48px);
  display: block;
}
</style>
